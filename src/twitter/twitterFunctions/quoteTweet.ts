import { scraper } from '../twitterClient';
import { prepareMediaData } from '../utils/mediaUtils';
import { likeTweet } from './likeTweet';
import { analyzeTweetContext } from '../utils/tweetUtils';
import { findOrCreateUserFromTweet } from '../utils/profileUtils';
import { Logger } from '../../utils/logger';
import { logTweet } from '../../supabase/functions/tweetEntries';
import { logTwitterInteraction } from '../../supabase/functions/interactionEntries';

/**
 * Sends a quote tweet with optional media attachments
 * @param quotedTweetId - The ID of the tweet being quoted
 * @param text - The text content of the quote tweet
 * @param mediaUrls - Optional array of media URLs (images, GIFs, or videos)
 * @returns The ID of the sent quote tweet, or null if failed
 */
export async function quoteTweet(
  quotedTweetId: string,
  text: string,
  mediaUrls?: string[]
): Promise<string | null> {
  try {
    // Fetch the tweet we're quoting
    const targetTweet = await scraper.getTweet(quotedTweetId);
    if (!targetTweet || !targetTweet.username) {
      Logger.log('Failed to fetch target tweet');
      return null;
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
      return null;
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
      return null;
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
    return tweetId;

  } catch (error) {
    Logger.log('Error sending quote tweet:', error);
    return null;
  }
} 