import { scraper } from '../twitterClient';
import { SearchMode } from 'goat-x';
import type { Tweet } from 'goat-x';
import { formatTimestamp } from '../../utils/formatTimestamps';

/**
 * Searches Twitter for tweets matching a query
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Formatted string of search results
 */
export async function searchTwitter(query: string, maxResults: number = 20): Promise<string> {
  try {
    const tweets: Tweet[] = [];
    const searchMode = SearchMode.Latest;

    for await (const tweet of scraper.searchTweets(query, maxResults, searchMode)) {
      // Skip tweets from the bot itself
      if (tweet.username === process.env.TWITTER_USERNAME) continue;
      tweets.push(tweet);
    }

    if (tweets.length === 0) {
      return `No tweets found for query: "${query}"`;
    }

    // Format tweets into strings using UTC timestamps
    const formattedTweets = tweets.map(tweet => {
      const timestamp = tweet.timeParsed ? 
        formatTimestamp(new Date(tweet.timeParsed)) :
        'Unknown time';
      
      return `- [${tweet.id}] @${tweet.username || 'unknown_user'} (${timestamp}): ${tweet.text}`;
    });

    return `Found ${formattedTweets.length} tweets matching "${query}":\n${formattedTweets.join('\n')}`;
  } catch (error) {
    console.error('Error searching tweets:', error);
    return `Error searching tweets: ${error}`;
  }
} 