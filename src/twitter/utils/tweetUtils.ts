import { Profile, Tweet } from 'goat-x';
import { Logger } from '../../utils/logger';
import { scraper } from '../twitterClient';

/**
 * Analyzes a tweet to determine how it relates to the bot
 */
export async function analyzeTweetContext(tweet: Tweet): Promise<{
  type: 'mention' | 'reply_to_bot' | 'reply_to_others' | null;
  parentTweetId?: string;
  parentTweetAuthor?: string;
}> {
  try {
    const botUsername = process.env.TWITTER_USERNAME;
    Logger.log('Analyzing tweet context:', {
      isReply: tweet.isReply,
      inReplyToStatusId: tweet.inReplyToStatusId,
      mentions: tweet.mentions,
      botUsername
    });
    
    // First check if it's a reply
    if (tweet.isReply && tweet.inReplyToStatusId) {
      Logger.log('Getting parent tweet:', tweet.inReplyToStatusId);
      const parentTweet = await scraper.getTweet(tweet.inReplyToStatusId);
      Logger.log('Parent tweet:', {
        found: !!parentTweet,
        username: parentTweet?.username,
        text: parentTweet?.text
      });

      if (parentTweet?.username) {
        const isReplyToBot = parentTweet.username.toLowerCase() === botUsername?.toLowerCase();
        const mentionsBot = tweet.mentions?.some(m => 
          m.username?.toLowerCase() === botUsername?.toLowerCase()
        );

        Logger.log('Context analysis:', {
          isReplyToBot,
          mentionsBot,
          parentUsername: parentTweet.username
        });

        // If replying to bot's tweet
        if (isReplyToBot) {
          return {
            type: 'reply_to_bot',
            parentTweetId: tweet.inReplyToStatusId,
            parentTweetAuthor: parentTweet.username
          };
        }

        // If it's a reply and mentions bot
        if (mentionsBot) {
          return {
            type: 'mention',
            parentTweetId: tweet.inReplyToStatusId,
            parentTweetAuthor: parentTweet.username
          };
        }

        // Regular reply to someone else
        return {
          type: 'reply_to_others',
          parentTweetId: tweet.inReplyToStatusId,
          parentTweetAuthor: parentTweet.username
        };
      }
    }

    // Not a reply but mentions bot
    const mentionsBot = tweet.mentions?.some(m => 
      m.username?.toLowerCase() === botUsername?.toLowerCase()
    );
    if (mentionsBot) {
      Logger.log('Tweet is a direct mention');
      return { type: 'mention' };
    }

    // Main tweet with no bot mention
    Logger.log('Tweet is a main tweet with no bot context');
    return { type: null };
  } catch (error) {
    Logger.log('Error analyzing tweet context:', error);
    return { type: null };
  }
}
