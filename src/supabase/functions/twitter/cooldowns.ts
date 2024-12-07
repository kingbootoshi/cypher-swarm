import { supabase } from '../../../supabase/supabaseClient';
import { Logger } from '../../../utils/logger';

type TweetType = 'main' | 'quote' | 'retweet' | 'media';

// Cooldown duration in minutes for each tweet type
const COOLDOWN_DURATION = 60; // 1 hour cooldown for all tweet types

/**
 * Parses a timestamp string from the database and returns a Date object in UTC.
 * @param timestamp - The timestamp string from the database.
 * @returns Date object representing the given timestamp in UTC.
 */
function parseTimestampToUTC(timestamp: string): Date {
  // Replace space with 'T' and append 'Z' to indicate UTC time
  const formattedTimestamp = timestamp.replace(' ', 'T') + 'Z';
  return new Date(formattedTimestamp);
}

/**
 * Retrieves the timestamp and text of the last tweet of a specific type.
 * @param tweetType - The type of tweet ('main', 'quote', 'retweet')
 * @returns An object containing the timestamp and text of the last tweet, or null if none found.
 */
interface TweetRecord {
  created_at: Date;
  text: string;
}

async function getLastTweetDetails(tweetType: TweetType): Promise<TweetRecord | null> {
  const { data, error } = await supabase
    .from('twitter_tweets')
    .select('created_at, text')
    .eq('tweet_type', tweetType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    Logger.log(`Error fetching last tweet details for type ${tweetType}:`, error.message);
    return null;
  }

  if (data && data.created_at) {
    const createdAtUTC = parseTimestampToUTC(data.created_at);
    return {
      created_at: createdAtUTC,
      text: data.text || ''
    };
  } else {
    // No tweets of this type found or created_at is null
    return null;
  }
}

/**
 * Checks if the cooldown is active for a specific tweet type.
 * @param tweetType - The type of tweet to check.
 * @returns True if cooldown is active, false otherwise.
 */
export async function isCooldownActive(tweetType: TweetType): Promise<{ isActive: boolean; remainingTime: number | null }> {
  const lastTweetDetails = await getLastTweetDetails(tweetType);

  if (!lastTweetDetails) {
    Logger.log(`No previous tweets of type ${tweetType}. Cooldown not active.`);
    return {
      isActive: false,
      remainingTime: null
    };
  }

  const lastTweetTime = lastTweetDetails.created_at;
  const currentTime = new Date();
  let timeSinceLastTweet = currentTime.getTime() - lastTweetTime.getTime();
  const cooldownPeriod = COOLDOWN_DURATION * 60 * 1000;

  // Log detailed cooldown computation
  Logger.log(`Cooldown Check for tweet type: ${tweetType}`);
  Logger.log(`Last Tweet Time (UTC): ${lastTweetTime.toISOString()}`);
  Logger.log(`Current Time (UTC): ${currentTime.toISOString()}`);
  Logger.log(`Time Since Last Tweet (ms): ${timeSinceLastTweet}`);
  Logger.log(`Cooldown Period (ms): ${cooldownPeriod}`);
  Logger.log(`Last Tweet Text: ${lastTweetDetails.text}`);

  // Handle future lastTweetTime
  if (timeSinceLastTweet < 0) {
    Logger.log(`Warning: Last tweet time is in the future. Adjusting timeSinceLastTweet to 0.`);
    timeSinceLastTweet = 0;
  }

  // Determine if cooldown is active
  const isActive = timeSinceLastTweet < cooldownPeriod;

  // Calculate remaining cooldown time in minutes
  const remainingTime = isActive ? Math.ceil((cooldownPeriod - timeSinceLastTweet) / (60 * 1000)) : null;

  Logger.log(`Cooldown Active: ${isActive}`);
  if (isActive) {
    Logger.log(`Remaining Cooldown Time (minutes): ${remainingTime}`);
  }

  return {
    isActive,
    remainingTime
  };
}

/**
 * Retrieves the cooldown status for all tweet types.
 * @returns A formatted string indicating the cooldown status of each tweet type.
 */
export async function getCooldownStatus(): Promise<string> {
  const [mainCooldown, quoteCooldown, retweetCooldown, mediaCooldown] = await Promise.all([
    isCooldownActive('main'),
    isCooldownActive('quote'),
    isCooldownActive('retweet'),
    isCooldownActive('media'),
  ]);

  return `Tweet Cooldown Status:
  Main Tweet: ${mainCooldown.isActive ? `CANNOT SEND A MAIN TWEET. COOLDOWN IS ACTIVE (${mainCooldown.remainingTime} minutes remaining)` : 'CAN SEND A MAIN TWEET. COOLDOWN IS INACTIVE'}
  Quote Tweet: ${quoteCooldown.isActive ? `CANNOT SEND A QUOTE TWEET. COOLDOWN IS ACTIVE (${quoteCooldown.remainingTime} minutes remaining)` : 'CAN SEND A QUOTE TWEET. COOLDOWN IS INACTIVE'}
  Retweet: ${retweetCooldown.isActive ? `CANNOT RETWEET. COOLDOWN IS ACTIVE (${retweetCooldown.remainingTime} minutes remaining)` : 'CAN RETWEET. COOLDOWN IS INACTIVE'}
  Media Tweet: ${mediaCooldown.isActive ? `CANNOT SEND A MEDIA TWEET. COOLDOWN IS ACTIVE (${mediaCooldown.remainingTime} minutes remaining)` : 'CAN SEND A MEDIA TWEET. COOLDOWN IS INACTIVE'}`;
}
