import { Profile, Tweet } from 'goat-x';
import { Logger } from '../../utils/logger';
import { scraper } from '../twitterClient';
import { findTwitterUserByTwitterId, createTwitterUser } from '../../supabase/functions/twitter/userEntries';

/**
 * Converts Twitter Profile data to JSON-safe format
 * Handles Date conversions and any other non-JSON-safe types
 */
export function sanitizeProfileForJson(profile: Partial<Profile>): Record<string, any> {
    return {
      ...profile,
      // Convert Date to ISO string
      joined: profile.joined?.toISOString(),
      // Add any other Date field conversions here
    };
  }

  /**
 * Gets comprehensive Twitter user info including full profile
 */
export async function getTwitterUserInfo(username: string): Promise<{
    userId: string;
    username: string;
    profile: Partial<Profile>;
  } | null> {
    try {
      const userId = await scraper.getUserIdByScreenName(username);
      const profile = await scraper.getProfile(username);
      
      return {
        userId,
        username: profile.username || username,
        profile: {
          avatar: profile.avatar,
          banner: profile.banner,
          biography: profile.biography,
          birthday: profile.birthday,
          followersCount: profile.followersCount,
          followingCount: profile.followingCount,
          friendsCount: profile.friendsCount,
          mediaCount: profile.mediaCount,
          statusesCount: profile.statusesCount,
          isPrivate: profile.isPrivate,
          isVerified: profile.isVerified,
          isBlueVerified: profile.isBlueVerified,
          joined: profile.joined,
          likesCount: profile.likesCount,
          listedCount: profile.listedCount,
          location: profile.location,
          name: profile.name,
          pinnedTweetIds: profile.pinnedTweetIds,
          tweetsCount: profile.tweetsCount,
          url: profile.url,
          website: profile.website,
          canDm: profile.canDm
        }
      };
    } catch (error) {
      Logger.log('Error getting Twitter user info:', error);
      return null;
    }
  } 

/**
 * Utility function to find or create a user from a tweet
 * Returns user account info if successful, null if failed
 */
export async function findOrCreateUserFromTweet(tweet: Tweet): Promise<{
  userAccountId: number;
  userId: string | null;
} | null> {
  if (!tweet.username || !tweet.userId) {
    Logger.log('Tweet missing required user information');
    return null;
  }

  // First check if user exists in database
  let userAccounts = await findTwitterUserByTwitterId(tweet.userId);

  if (userAccounts) {
    Logger.log(`Found existing user in database: @${tweet.username} (${tweet.userId})`);
    return userAccounts;
  }

  Logger.log(`New user detected: @${tweet.username} (${tweet.userId}). Fetching profile info...`);
  
  // If user not found, get their profile info and create them
  const userInfo = await getTwitterUserInfo(tweet.username);
  if (!userInfo) {
    Logger.log(`Failed to get Twitter profile info for new user: @${tweet.username}`);
    return null;
  }

  userAccounts = await createTwitterUser(
    userInfo.username,
    userInfo.userId,
    userInfo.profile
  );

  if (!userAccounts) {
    Logger.log(`Failed to create new user account for: @${tweet.username}`);
    return null;
  }

  Logger.log(`Successfully created new user account for: @${tweet.username} (${tweet.userId})`);
  return userAccounts;
}