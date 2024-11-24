import { scraper } from '../twitterClient';
import { prepareMediaData } from '../utils/mediaUtils';

/**
 * Sends a tweet with optional media attachments
 * @param text - The text content of the tweet
 * @param mediaUrls - Optional array of media URLs (images, GIFs, or videos)
 * @param replyToTweetId - Optional tweet ID to reply to
 * @returns The ID of the sent tweet, or null if failed
 */
export async function sendTweet(
  text: string,
  mediaUrls?: string[],
  replyToTweetId?: string
): Promise<string | null> {
  try {
    const mediaData = mediaUrls ? await prepareMediaData(mediaUrls) : undefined;

    const response = await scraper.sendTweet(text, replyToTweetId, mediaData);
    const responseData = await response.json();
    const tweetId = responseData?.data?.create_tweet?.tweet_results?.result?.rest_id;

    if (tweetId) {
      console.log(`Tweet sent successfully (ID: ${tweetId})`);
      return tweetId;
    }
    
    return null;
  } catch (error) {
    console.error('Error sending tweet:', error);
    return null;
  }
}
