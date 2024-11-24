import { scraper } from '../twitterClient';

/**
 * Retweets a specific tweet
 * @param tweetId - The ID of the tweet to retweet
 * @returns Promise<boolean> indicating success or failure
 */
export async function retweet(tweetId: string): Promise<boolean> {
  try {
    await scraper.retweet(tweetId);
    console.log(`Successfully retweeted tweet ${tweetId}`);
    return true;
  } catch (error) {
    console.error('Error retweeting tweet:', error);
    return false;
  }
} 