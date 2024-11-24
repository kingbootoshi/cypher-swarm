import { sendTweet } from './sendTweet';

/**
 * Replies to a specific tweet
 * @param tweetId - The ID of the tweet to reply to
 * @param text - The text content of the reply
 * @param mediaUrls - Optional array of media URLs (images, GIFs, or videos)
 * @returns The ID of the reply tweet, or null if failed
 */
export async function replyToTweet(
  tweetId: string, 
  text: string,
  mediaUrls?: string[]
): Promise<string | null> {
  try {
    return await sendTweet(text, mediaUrls, tweetId);
  } catch (error) {
    console.error('Error sending reply:', error);
    return null;
  }
} 