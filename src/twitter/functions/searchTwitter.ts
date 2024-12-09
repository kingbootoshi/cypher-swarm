import { scraper } from '../twitterClient';
import { SearchMode } from 'goat-x';
import type { Tweet } from 'goat-x';
import { formatTimestamp } from '../../utils/formatTimestamps';
import { hasInteractedWithTweet, debugTweetInteractions } from '../../supabase/functions/twitter/tweetInteractionChecks';
import { isUserFollowedByBot } from '../../supabase/functions/twitter/followEntries';
import { Logger } from '../../utils/logger';

/**
 * Searches Twitter for tweets matching a query
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Array of formatted tweet strings
 */
export async function searchTwitter(query: string, maxResults: number = 20): Promise<string[]> {
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

    // Filter out already interacted tweets and check following status
    const unhandledTweets = await Promise.all(
      rawTweets.map(async (tweet) => {
        const hasInteracted = await hasInteractedWithTweet(tweet.id!);
        if (hasInteracted) {
          await debugTweetInteractions(tweet.id!);
          Logger.log(`Filtering out tweet ${tweet.id} - already interacted with`);
          return null;
        }
        
        // Check if we're following the user
        const isFollowing = await isUserFollowedByBot(tweet.username || '');
        return { ...tweet, isFollowing };
      })
    );

    const validTweets = unhandledTweets.filter((tweet): tweet is (Tweet & { isFollowing: boolean }) => tweet !== null);
    
    if (validTweets.length === 0) {
      return [];
    }

    // Format remaining tweets
    const formattedTweets = validTweets
      .map(tweet => {
        const timestamp = tweet.timeParsed ? 
          formatTimestamp(new Date(tweet.timeParsed)) :
          'Unknown time';
        
        const followStatus = tweet.isFollowing ? '(FOLLOWING)' : '(NOT FOLLOWING)';
        
        return `- [${tweet.id}] @${tweet.username || 'unknown_user'} ${followStatus} (${timestamp}): ${tweet.text}`;
      });

    Logger.log(`Returning ${formattedTweets.length} formatted tweets after filtering`);
    return formattedTweets;

  } catch (error) {
    Logger.log('Error searching tweets:', error);
    return [];
  }
} 