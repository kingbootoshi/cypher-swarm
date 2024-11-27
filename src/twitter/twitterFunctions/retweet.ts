import { scraper } from '../twitterClient';
import { likeTweet } from './likeTweet';
import { analyzeTweetContext, getTwitterUserInfo } from '../utils/tweetUtils';
import { findOrCreateTwitterUser } from '../../supabase/functions/userEntries';
import { logTwitterInteraction } from '../../supabase/functions/interactionEntries';
import { Logger } from '../../utils/logger';
import { logTweet } from '../../supabase/functions/tweetEntries';

/**
 * Retweets a specific tweet
 * @param tweetId - The ID of the tweet to retweet
 * @returns Promise<boolean> indicating success or failure
 */
export async function retweet(tweetId: string): Promise<boolean> {
  try {
    // Like the tweet before retweeting
    await likeTweet(tweetId);

    // Fetch the tweet we're retweeting
    const targetTweet = await scraper.getTweet(tweetId);
    if (!targetTweet || !targetTweet.username) {
      Logger.log('Failed to fetch target tweet');
      return false;
    }

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

    // Get information about the user who posted the original tweet
    const userInfo = await getTwitterUserInfo(targetTweet.username);
    if (!userInfo) {
      Logger.log('Failed to get Twitter user info:', targetTweet.username);
      return false;
    }

    // Find or create the user in the database
    const userAccounts = await findOrCreateTwitterUser(
      userInfo.username,
      userInfo.userId,
      userInfo.profile
    );

    if (!userAccounts) {
      Logger.log('Failed to process user accounts');
      return false;
    }

    // Analyze the context of the tweet for logging
    // Analyze tweet context
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