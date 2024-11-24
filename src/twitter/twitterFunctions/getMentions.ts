import { scraper } from '../twitterClient';
import type { Tweet } from 'goat-x';
import { formatTimestamp } from '../../utils/formatTimestamps';

interface ExtendedTweet extends Tweet {
  originalTweetText?: string;
  originalTweetAuthor?: string;
  originalTweetId?: string;
}

/**
 * Gets recent mentions of the bot's account
 * @param maxTweets - Maximum number of mentions to fetch (default: 20)
 * @returns Array of formatted mention strings
 */
export async function getMentions(maxTweets: number = 20): Promise<string[]> {
  try {
    const mentions: ExtendedTweet[] = [];
    const query = `@${process.env.TWITTER_USERNAME}`;
    const searchMode = 1; // SearchMode.Latest

    // Fetch mentions
    for await (const tweet of scraper.searchTweets(query, maxTweets, searchMode)) {
      if (tweet.username !== process.env.TWITTER_USERNAME && tweet.id) {
        const extendedTweet = tweet as ExtendedTweet;

        // Fetch original tweet if it's a reply
        if (extendedTweet.inReplyToStatusId) {
          try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const originalTweet = await scraper.getTweet(extendedTweet.inReplyToStatusId);
            if (originalTweet && originalTweet.text) {
              extendedTweet.originalTweetText = originalTweet.text;
              extendedTweet.originalTweetAuthor = originalTweet.username;
              extendedTweet.originalTweetId = originalTweet.id;
            }
          } catch (error) {
            // Silently continue if fetch fails
          }
        }

        mentions.push(extendedTweet);
      }
    }

    // Format mentions with timestamps
    return mentions.map(mention => {
      const timestamp = mention.timeParsed ? 
        formatTimestamp(new Date(mention.timeParsed)) :
        'Unknown time';
        
      let output = `- [${mention.id}] @${mention.username} (${timestamp}): ${mention.text}`;
      
      if (mention.originalTweetText && mention.originalTweetAuthor) {
        const isBot = mention.originalTweetAuthor === process.env.TWITTER_USERNAME;
        const authorDisplay = isBot ? `@${mention.originalTweetAuthor} (YOU)` : `@${mention.originalTweetAuthor}`;
        const tweetIdDisplay = mention.originalTweetId ? `[${mention.originalTweetId}]` : '';
        
        output += `\n  ↳ In reply to ${authorDisplay} ${tweetIdDisplay}: "${mention.originalTweetText}"`;
      }
      
      return output;
    });
  } catch (error) {
    console.error('Error fetching mentions:', error);
    return [];
  }
} 