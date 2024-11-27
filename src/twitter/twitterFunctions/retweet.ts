import { scraper } from '../twitterClient';
import { likeTweet } from './likeTweet';
import { analyzeTweetContext } from '../utils/tweetUtils';
import { findOrCreateUserFromTweet } from '../utils/profileUtils';
import { Logger } from '../../utils/logger';
import { logTweet } from '../../supabase/functions/tweetEntries';
import { logTwitterInteraction } from '../../supabase/functions/interactionEntries';

/**
 * Retweets a specific tweet
 * @param tweetId - The ID of the tweet to retweet
 * @returns Promise<boolean> indicating success or failure
 */
export async function retweet(tweetId: string): Promise<boolean> {
  try {
    // Fetch the tweet we're retweeting
    const targetTweet = await scraper.getTweet(tweetId);
    if (!targetTweet || !targetTweet.username) {
      Logger.log('Failed to fetch target tweet');
      return false;
    }

    // Like the tweet before retweeting
    await likeTweet(tweetId);

    // Retweet the tweet
    await scraper.retweet(tweetId);
    Logger.log(`Successfully retweeted tweet ${tweetId}`);

    // Log the bot's retweet in the database
    await logTweet({
      tweet_id: null,
      text: targetTweet.text || '',
      tweet_type: 'retweet',
      retweeted_tweet_id: tweetId,
      created_at: new Date().toISOString(),
    });

    // Find or create user account
    const userAccounts = await findOrCreateUserFromTweet(targetTweet);
    if (!userAccounts) {
      Logger.log('Failed to process user account');
      return false;
    }

    // Analyze the context of the tweet for logging
    const context = await analyzeTweetContext(targetTweet);

    // Log the interaction with the user
    await logTwitterInteraction({
      tweetId: tweetId,
      userTweetText: targetTweet.text || '',
      userTweetTimestamp: targetTweet.timeParsed?.toISOString() || new Date().toISOString(),
      userId: userAccounts.userId || '',
      context,
    });

    return true;
  } catch (error) {
    Logger.log('Error retweeting tweet:', error);
    return false;
  }
} 