import { supabase } from '../supabaseClient';
import { Logger } from '../../utils/logger';
import { Profile } from 'goat-x';

function sanitizeProfileForJson(profile: Partial<Profile>): Record<string, any> {
  return {
    ...profile,
    // Convert Date to ISO string
    joined: profile.joined?.toISOString(),
    // Add any other Date field conversions here
  };
}

/**
 * Finds or creates Twitter user records in our database
 */
export async function findOrCreateTwitterUser(
  username: string,
  twitterId: string,
  profileData?: Partial<Profile>
): Promise<{
  userAccountId: number;
  userId: string | null;
} | null> {
  try {
    // Check if user already exists
    const { data: existingAccount } = await supabase
      .from('user_accounts')
      .select('id, user_id')
      .eq('platform', 'twitter')
      .eq('platform_user_id', twitterId)
      .single();

    if (existingAccount) {
      // Update profile data if provided
      if (profileData) {
        await supabase
          .from('twitter_user_accounts')
          .update({ 
            profile_data: sanitizeProfileForJson(profileData),
            last_profile_update: new Date().toISOString()
          })
          .eq('user_account_id', existingAccount.id);
      }
      
      return {
        userAccountId: existingAccount.id,
        userId: existingAccount.user_id
      };
    }

    // Create new user and accounts
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

    // Create twitter_user_account entry with sanitized profile data
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
    Logger.log('Error in findOrCreateTwitterUser:', error);
    return null;
  }
} 