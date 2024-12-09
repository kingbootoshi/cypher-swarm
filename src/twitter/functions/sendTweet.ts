import { scraper } from '../twitterClient';
import { prepareMediaData } from '../utils/mediaUtils';
import { logTweet } from '../../supabase/functions/twitter/tweetEntries';
import { Logger } from '../../utils/logger';
import { addMainTweet } from '../../memory/addMemories';

/**
 * Extracts tweet ID from response based on tweet type
 * @param responseData - API response data
 * @param isLongTweet - Whether this was a long tweet
 * @returns Tweet ID or null
 */
function extractTweetId(responseData: any, isLongTweet: boolean): string | null {
  try {
    if (isLongTweet) {
      // Path for long tweets (notetweets)
      return responseData?.data?.notetweet_create?.tweet_results?.result?.rest_id;
    } else {
      // Path for regular tweets
      return responseData?.data?.create_tweet?.tweet_results?.result?.rest_id;
    }
  } catch (error) {
    Logger.log('Error extracting tweet ID:', error);
    return null;
  }
}

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

    // Check if tweet exceeds standard character limit
    const isLongTweet = text.length > 279;
    
    // Send tweet using appropriate method based on length
    const response = isLongTweet 
      ? await scraper.sendLongTweet(text, undefined, mediaData)
      : await scraper.sendTweet(text, undefined, mediaData);
      
    Logger.log("RAW RESPONSE", response);
    const responseData = await response.json();
    const tweetId = extractTweetId(responseData, isLongTweet);

    if (tweetId) {
      Logger.log(`${isLongTweet ? 'Long tweet' : 'Tweet'} sent successfully (ID: ${tweetId})`);

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
