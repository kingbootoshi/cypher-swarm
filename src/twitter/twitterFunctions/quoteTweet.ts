import { scraper } from '../twitterClient';
import { prepareMediaData } from '../utils/mediaUtils';

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
    // Initialize mediaData as an empty array by default
    const mediaData = await prepareMediaData(mediaUrls || []);

    // Use the dedicated quote tweet function
    const response = await scraper.sendQuoteTweet(text, quotedTweetId, {
      mediaData: mediaData || [], // Ensure mediaData is always an array
    });

    const responseData = await response.json();
    const tweetId = responseData?.data?.create_tweet?.tweet_results?.result?.rest_id;

    if (tweetId) {
      console.log(`Quote tweet sent successfully! (ID: ${tweetId})`);
      return tweetId;
    }

    console.error('Tweet ID not found in response.');
    return null;
  } catch (error) {
    console.error('Error sending quote tweet:', error);
    return null;
  }
} 