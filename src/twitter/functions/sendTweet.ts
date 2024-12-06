import { scraper } from '../twitterClient';
import { prepareMediaData } from '../utils/mediaUtils';
import { logTweet } from '../../supabase/functions/twitter/tweetEntries';
import { Logger } from '../../utils/logger';
import { addMainTweet } from '../../memory/addMemories';

/**
 * Sends a main tweet with optional media and logs it to the database.
 * @param text - The text content of the tweet
 * @param mediaUrls - Optional array of media URLs
 * @returns The ID of the sent tweet, or null if failed
 */
export async function sendTweet(
  text: string,
  mediaUrls?: string[]
): Promise<string | null> {
  try {
    // Prepare media data for Twitter API
    const mediaData = mediaUrls ? await prepareMediaData(mediaUrls) : undefined;

    // Send the tweet using the Twitter client
    const response = await scraper.sendTweet(text, undefined, mediaData);
    const responseData = await response.json();
    const tweetId = responseData?.data?.create_tweet?.tweet_results?.result?.rest_id;

    if (tweetId) {
      Logger.log(`Tweet sent successfully (ID: ${tweetId})`);

      // Log the tweet to the database with prepared media data
      const logResult = await logTweet({
        tweet_id: tweetId,
        text: text,
        tweet_type: 'main',
        has_media: !!mediaData,
        created_at: new Date().toISOString()
      }, mediaData);

      if (logResult) {
        Logger.log(`Tweet logged with ID: ${logResult}`);
      } else {
        Logger.log('Failed to log tweet to Supabase.');
      }

      // Add the main tweet text to memory
      await addMainTweet([{ role: 'user', content: text }]);
      Logger.log('Main tweet text added to memory.');

      return tweetId;
    } else {
      Logger.log('Failed to retrieve tweet ID from response:', responseData);
      return null;
    }
  } catch (error) {
    Logger.log('Error sending tweet:', error);
    return null;
  }
}
