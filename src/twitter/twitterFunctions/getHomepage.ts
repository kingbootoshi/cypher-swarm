import { scraper } from '../twitterClient';
import { formatTimestamp } from '../../utils/formatTimestamps';
/**
 * Gets tweets from the homepage timeline
 * @param maxTweets - Maximum number of tweets to fetch (default: 20)
 * @returns Array of formatted tweet strings
 */
export async function getHomepage(maxTweets: number = 20): Promise<string[]> {
  try {
    const listId = '1621164352186327041'; // ID of the Twitter list
    const response = await scraper.fetchListTweets(listId, maxTweets);

    if (!response || !response.tweets || response.tweets.length === 0) {
      return [];
    }
    // Format tweets into strings and convert timestamps to UTC format
    const formattedTweets = response.tweets.slice(0, maxTweets).map(tweet => {
      const timestamp = tweet.timeParsed ? 
        formatTimestamp(new Date(tweet.timeParsed)) :
        'Unknown time';
      
      return `- [${tweet.id}] @${tweet.username || 'unknown_user'} (${timestamp}): ${tweet.text}`;
    });

    return formattedTweets;
  } catch (error) {
    console.error('Error fetching homepage tweets:', error);
    return [];
  }
} 