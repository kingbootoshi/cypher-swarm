import { scraper } from '../twitterClient';
import type { Tweet } from 'goat-x';
import { formatTimestamp } from '../../utils/formatTimestamps';

/**
 * Gets recent tweets from a specific user
 * @param username - Twitter username (without @ symbol)
 * @param maxTweets - Maximum number of tweets to fetch
 * @returns Formatted string of user's tweets
 */
export async function getTweets(username: string, maxTweets: number): Promise<string> {
  try {
    const tweets: Tweet[] = [];
    for await (const tweet of scraper.getTweets(username, maxTweets)) {
      tweets.push(tweet);
    }

    // Format the fetched tweets with timestamps
    const formattedTweets = tweets
      .map(tweet => {
        const timestamp = tweet.timeParsed ? 
          formatTimestamp(new Date(tweet.timeParsed)) :
          'Unknown time';
          
        return `- [${tweet.id}] (${timestamp}) ${tweet.text}`;
      })
      .join('\n');

    return `Fetched ${tweets.length} tweets from @${username}:\n${formattedTweets}`;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return `Error fetching tweets: ${error}`;
  }
} 