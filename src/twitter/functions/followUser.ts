import { scraper } from '../twitterClient';
import { Logger } from '../../utils/logger';
import { isUserFollowedByBot, updateUserFollowStatus } from '../../supabase/functions/twitter/followEntries';

// Define possible follow result statuses
export type FollowResultStatus = 'success' | 'already_following' | 'user_not_found' | 'error';

// Define the follow result type
export interface FollowResult {
  status: FollowResultStatus;
  message: string;
  error?: any;
}

/**
 * Follows a specific user if not already followed
 * @param username - The username of the account to follow
 * @returns Promise<FollowResult> with detailed status information
 */
export async function followUser(username: string): Promise<FollowResult> {
  try {
    // Check if user is already followed
    const isFollowed = await isUserFollowedByBot(username);
    if (isFollowed) {
      return {
        status: 'already_following',
        message: `Bot is already following @${username}`
      };
    }

    // Get basic user info first
    const userId = await scraper.getUserIdByScreenName(username);
    if (!userId) {
      return {
        status: 'user_not_found',
        message: `Could not find user @${username} on Twitter`
      };
    }

    // Attempt to follow the user
    try {
      await scraper.followUser(username);
      Logger.log(`Successfully followed user @${username}`);
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to follow @${username} on Twitter`,
        error
      };
    }

    // Update follow status in database (this will create the user if they don't exist)
    const success = await updateUserFollowStatus(username, userId);
    if (!success) {
      Logger.log(`Failed to update follow status for @${username} in database`);
      return {
        status: 'error',
        message: `Failed to update follow status for @${username} in database`
      };
    }

    return {
      status: 'success',
      message: `Successfully followed user @${username}`
    };
  } catch (error) {
    Logger.log('Error following user:', error);
    return {
      status: 'error',
      message: `Error following user @${username}`,
      error
    };
  }
}

/**
 * Gets the Twitter user ID for a username
 * @param username - The username to look up
 * @returns Promise<string | null> The user's Twitter ID or null if not found
 */
export async function getUserID(username: string): Promise<string | null> {
  try {
    const userID = await scraper.getUserIdByScreenName(username);
    return userID || null;
  } catch (error) {
    Logger.log('Error getting user ID:', error);
    return null;
  }
}