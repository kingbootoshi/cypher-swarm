import { scraper } from '../twitterClient';
import { SearchMode } from 'goat-x';
import type { Tweet } from 'goat-x';
import { formatTimestamp } from '../../utils/formatTimestamps';
import { hasInteractedWithTweet, debugTweetInteractions } from '../../supabase/functions/twitter/tweetInteractionChecks';
import { Logger } from '../../utils/logger';

/**
 * Searches Twitter for tweets matching a query
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Formatted string of search results
 */
export async function searchTwitter(query: string, maxResults: number = 20): Promise<string> {
  try {
    Logger.log(`Searching Twitter for: "${query}"...`);
    const rawTweets: Tweet[] = [];
    const searchMode = SearchMode.Latest;

    // First collect all raw tweets
    for await (const tweet of scraper.searchTweets(query, maxResults, searchMode)) {
      // Skip tweets from the bot itself
      if (tweet.username === process.env.TWITTER_USERNAME) continue;
      rawTweets.push(tweet);
    }

    Logger.log(`Found ${rawTweets.length} total results, checking for previous interactions...`);

    // Filter out already interacted tweets
    const unhandledTweets = await Promise.all(
      rawTweets.map(async (tweet) => {
        const hasInteracted = await hasInteractedWithTweet(tweet.id!);
        if (hasInteracted) {
          await debugTweetInteractions(tweet.id!);
          Logger.log(`Filtering out tweet ${tweet.id} - already interacted with`);
          return null;
        }
        return tweet;
      })
    );

    const validTweets = unhandledTweets.filter((tweet): tweet is Tweet => tweet !== null);
    
    if (validTweets.length === 0) {
      return `No unhandled tweets found for query: "${query}"`;
    }

    // Format remaining tweets
    const formattedTweets = validTweets
      .map(tweet => {
        const timestamp = tweet.timeParsed ? 
          formatTimestamp(new Date(tweet.timeParsed)) :
          'Unknown time';
        
        return `- [${tweet.id}] @${tweet.username || 'unknown_user'} (${timestamp}): ${tweet.text}`;
      })
      .join('\n');

    return `Found ${validTweets.length} unhandled tweets matching "${query}":\n${formattedTweets}`;

  } catch (error) {
    Logger.log('Error searching tweets:', error);
    return `Error searching tweets: ${error}`;
  }
} 