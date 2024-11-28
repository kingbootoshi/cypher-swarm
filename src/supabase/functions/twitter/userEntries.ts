import { supabase } from '../../supabaseClient';
import { Logger } from '../../../utils/logger';
import { Profile } from 'goat-x';

function sanitizeProfileForJson(profile: Partial<Profile>): Record<string, any> {
  return {
    ...profile,
    // Convert Date to ISO string
    joined: profile.joined?.toISOString(),
    // Add any other Date field conversions here
  };
}

type TwitterUserResult = {
  userAccountId: number;
  userId: string | null;
} | null;

/**
 * Finds a Twitter user in our database by Twitter ID
 */
export async function findTwitterUserByTwitterId(
  twitterId: string
): Promise<TwitterUserResult> {
  try {
    const { data: existingAccount } = await supabase
      .from('user_accounts')
      .select('id, user_id')
      .eq('platform', 'twitter')
      .eq('platform_user_id', twitterId)
      .single();

    if (!existingAccount) {
      return null;
    }

    return {
      userAccountId: existingAccount.id,
      userId: existingAccount.user_id
    };
  } catch (error) {
    Logger.log('Error in findTwitterUser:', error);
    return null;
  }
}

/**
 * Finds a Twitter user in our database by username
 */
export async function findTwitterUserByUsername(
  username: string
): Promise<TwitterUserResult> {
  try {
    const { data: existingAccount } = await supabase
      .from('user_accounts')
      .select('id, user_id')
      .eq('platform', 'twitter')
      .eq('username', username)
      .single();

    if (!existingAccount) {
      return null;
    }

    return {
      userAccountId: existingAccount.id,
      userId: existingAccount.user_id
    };
  } catch (error) {
    Logger.log('Error in findTwitterUserByUsername:', error);
    return null;
  }
}

/**
 * Updates a Twitter user's profile data
 */
export async function updateTwitterUserProfile(
  userAccountId: number,
  profileData: Partial<Profile>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('twitter_user_accounts')
      .update({ 
        profile_data: sanitizeProfileForJson(profileData),
        last_profile_update: new Date().toISOString()
      })
      .eq('user_account_id', userAccountId);

    return !error;
  } catch (error) {
    Logger.log('Error updating Twitter user profile:', error);
    return false;
  }
}

/**
 * Creates a new Twitter user in our database
 */
export async function createTwitterUser(
  username: string,
  twitterId: string,
  profileData?: Partial<Profile>
): Promise<TwitterUserResult> {
  try {
    // Create new user
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (!newUser) {
      Logger.log('Failed to create new user');
      return null;
    }

    // Create user_account entry
    const { data: newAccount } = await supabase
      .from('user_accounts')
      .insert({
        user_id: newUser.id,
        platform: 'twitter',
        platform_user_id: twitterId,
        username: username,
        connected_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (!newAccount) {
      Logger.log('Failed to create user account');
      return null;
    }

    // Create twitter_user_account entry
    const { error: twitterError } = await supabase
      .from('twitter_user_accounts')
      .insert({
        user_account_id: newAccount.id,
        is_followed_by_bot: null,
        profile_data: profileData ? sanitizeProfileForJson(profileData) : null,
        last_profile_update: new Date().toISOString()
      });

    if (twitterError) {
      Logger.log('Error creating twitter user account:', twitterError);
      return null;
    }

    return {
      userAccountId: newAccount.id,
      userId: newUser.id
    };
  } catch (error) {
    Logger.log('Error in createTwitterUser:', error);
    return null;
  }
}
