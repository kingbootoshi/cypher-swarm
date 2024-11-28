import { scraper } from '../twitterClient';
import { prepareMediaData } from '../utils/mediaUtils';
import { likeTweet } from './likeTweet';
import { analyzeTweetContext } from '../utils/tweetUtils';
import { findOrCreateUserFromTweet } from '../utils/profileUtils';
import { Logger } from '../../utils/logger';
import { logTweet } from '../../supabase/functions/tweetEntries';
import { logTwitterInteraction } from '../../supabase/functions/interactionEntries';
import { hasAlreadyActioned } from '../../supabase/functions/tweetInteractionChecks';
import { QuoteResult } from '../types/tweetResults';

/**
 * Sends a quote tweet with optional media attachments
 * @param quotedTweetId - The ID of the tweet being quoted
 * @param text - The text content of the quote tweet
 * @param mediaUrls - Optional array of media URLs (images, GIFs, or videos)
 * @returns Promise<QuoteResult> with status and tweet ID if successful
 */
export async function quoteTweet(
  quotedTweetId: string,
  text: string,
  mediaUrls?: string[]
): Promise<QuoteResult> {
  try {
    // Check if already quoted this tweet
    const hasQuoted = await hasAlreadyActioned(quotedTweetId, 'quote');
    if (hasQuoted) {
      Logger.log(`Already quote tweeted ${quotedTweetId}`);
      return {
        success: false,
        message: 'Already quote tweeted this tweet'
      };
    }

    // Fetch the tweet we're quoting
    const targetTweet = await scraper.getTweet(quotedTweetId);
    if (!targetTweet || !targetTweet.username) {
      Logger.log('Failed to fetch target tweet');
      return {
        success: false,
        message: 'Failed to fetch target tweet'
      };
    }

    // Prepare media data if any
    const mediaData = mediaUrls ? await prepareMediaData(mediaUrls) : undefined;

    // Like the tweet before quoting it
    await likeTweet(quotedTweetId);

    // Send the quote tweet
    const response = await scraper.sendQuoteTweet(text, quotedTweetId, {
      mediaData: mediaData || [],
    });

    const responseData = await response.json();
    const tweetId = responseData?.data?.create_tweet?.tweet_results?.result?.rest_id;

    if (!tweetId) {
      Logger.log('Failed to retrieve tweet ID from response:', responseData);
      return {
        success: false,
        message: 'Failed to retrieve tweet ID from response'
      };
    }

    // Log the bot's quote tweet in the database
    await logTweet({
      tweet_id: tweetId,
      text: text,
      tweet_type: 'quote',
      has_media: !!mediaData,
      quoted_tweet_id: quotedTweetId,
      created_at: new Date().toISOString(),
    }, mediaData);

    // Find or create user account
    const userAccounts = await findOrCreateUserFromTweet(targetTweet);
    if (!userAccounts) {
      Logger.log('Failed to process user account');
      return {
        success: false,
        message: 'Failed to process user account'
      };
    }

    // Analyze tweet context
    const context = await analyzeTweetContext(targetTweet);

    // Log the interaction with the user
    await logTwitterInteraction({
      tweetId: quotedTweetId,
      userTweetText: targetTweet.text || '',
      userTweetTimestamp: targetTweet.timeParsed?.toISOString() || new Date().toISOString(),
      userId: userAccounts.userId || '',
      context,
    });

    Logger.log(`Quote tweet sent successfully (ID: ${tweetId})`);
    return {
      success: true,
      message: 'Successfully quote tweeted',
      tweetId: tweetId
    };

  } catch (error) {
    Logger.log('Error sending quote tweet:', error);
    return {
      success: false,
      message: `Failed to quote tweet: ${error.message}`
    };
  }
} 