import { scraper } from '../twitterClient';
import { likeTweet } from './likeTweet';
import { analyzeTweetContext } from '../utils/tweetUtils';
import { findOrCreateUserFromTweet } from '../utils/profileUtils';
import { Logger } from '../../utils/logger';
import { logTweet } from '../../supabase/functions/twitter/tweetEntries';
import { logTwitterInteraction } from '../../supabase/functions/twitter/interactionEntries';
import { hasAlreadyActioned } from '../../supabase/functions/twitter/tweetInteractionChecks';
import { RetweetResult } from '../types/tweetResults';

/**
 * Retweets a specific tweet
 * @param tweetId - The ID of the tweet to retweet
 * @returns Promise<RetweetResult> with status and details
 */
export async function retweet(tweetId: string): Promise<RetweetResult> {
  try {
    // Check if already retweeted
    Logger.log(`Checking if tweet ${tweetId} was already retweeted...`);
    const hasRetweeted = await hasAlreadyActioned(tweetId, 'retweet');
    
    if (hasRetweeted) {
      const message = `Already retweeted tweet ${tweetId}`;
      Logger.log(message);
      return {
        success: false,
        message
      };
    }

    // Fetch the tweet we're retweeting
    const targetTweet = await scraper.getTweet(tweetId);
    if (!targetTweet || !targetTweet.username) {
      const message = 'Failed to fetch target tweet';
      Logger.log(message);
      return {
        success: false,
        message
      };
    }

    // Like the tweet before retweeting
    await likeTweet(tweetId);

    try {
      // Attempt to retweet
      await scraper.retweet(tweetId);
    } catch (error) {
      const message = `Failed to retweet: ${error.message}`;
      Logger.log(message);
      return {
        success: false,
        message
      };
    }

    Logger.log(`Successfully retweeted tweet ${tweetId}`);

    // Log the bot's retweet in the database
    const logResult = await logTweet({
      tweet_id: null, // Retweets don't have their own tweet ID
      text: targetTweet.text || '',
      tweet_type: 'retweet',
      retweeted_tweet_id: tweetId,
      created_at: new Date().toISOString(),
    });

    if (!logResult) {
      Logger.log('Warning: Failed to log retweet in database');
    }

    // Find or create user account
    const userAccounts = await findOrCreateUserFromTweet(targetTweet);
    if (!userAccounts) {
      const message = 'Failed to process user account';
      Logger.log(message);
      return {
        success: false,
        message
      };
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

    return {
      success: true,
      message: 'Successfully retweeted tweet'
    };

  } catch (error) {
    const message = `Error retweeting tweet: ${error.message}`;
    Logger.log(message);
    return {
      success: false,
      message
    };
  }
} 