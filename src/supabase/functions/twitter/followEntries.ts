import { supabase } from '../../supabaseClient';
import { Logger } from '../../../utils/logger';
import { findTwitterUserByTwitterId, createTwitterUser } from './userEntries';
import { getTwitterUserInfo } from '../../../twitter/utils/profileUtils';

/**
 * Checks if a user is already being followed by the bot
 * @param username Twitter username without @
 * @returns Promise<boolean> indicating if user is already followed
 */
export async function isUserFollowedByBot(username: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_accounts')
      .select(`
        id,
        twitter_user_accounts!inner (
          is_followed_by_bot
        )
      `)
      .eq('platform', 'twitter')
      .eq('username', username)
      .maybeSingle();

    return data?.twitter_user_accounts?.is_followed_by_bot || false;
  } catch (error) {
    Logger.log('Error checking if user is followed:', error);
    return false;
  }
}

/**
 * Updates the follow status for a user in the database
 * @param username Twitter username without @
 * @param twitterId Twitter user ID
 * @returns Promise<boolean> indicating success
 */
export async function updateUserFollowStatus(
  username: string,
  twitterId: string
): Promise<boolean> {
  try {
    // First try to find the user
    let userResult = await findTwitterUserByTwitterId(twitterId);

    // If user doesn't exist, create them with profile info
    if (!userResult) {
      Logger.log(`New user detected: @${username}. Fetching profile info...`);
      const userInfo = await getTwitterUserInfo(username);
      
      if (!userInfo) {
        Logger.log('Failed to get Twitter profile info');
        return false;
      }

      userResult = await createTwitterUser(username, twitterId, userInfo.profile);
      if (!userResult) {
        Logger.log('Failed to create user record');
        return false;
      }
    }

    // Update the follow status
    const { error } = await supabase
      .from('twitter_user_accounts')
      .update({ 
        is_followed_by_bot: true,
        last_followed_at: new Date().toISOString()
      })
      .eq('user_account_id', userResult.userAccountId);

    if (error) {
      Logger.log('Error updating follow status:', error);
      return false;
    }

    return true;
  } catch (error) {
    Logger.log('Error in updateUserFollowStatus:', error);
    return false;
  }
}

