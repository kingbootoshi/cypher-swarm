import { Profile, Tweet } from 'goat-x';
import { Logger } from '../../utils/logger';
import { scraper } from '../twitterClient';
import { getImageAsBase64 } from './imageUtils';

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

// Update assembleTwitterInterface to handle undefined sender and empty history better
export async function assembleTwitterInterface(
    recentMainTweetsContent: string,
    tweetId: string
  ): Promise<{
    textContent: string;
    imageContents: Array<{
      sender: string;
      media_type: string;
      data: string;
    }>;
  }> {
    const tweetMemoryResult = await fetchAndFormatTweetMemory(tweetId);
    const tweetMemory = tweetMemoryResult?.memory || '';
    const imageContents: Array<{
      sender: string;
      media_type: string;
      data: string;
    }> = [];
  
    // Process images if they exist
    if (tweetMemoryResult) {
      // Process focus tweet images and quote tweet images if they exist
      if (tweetMemoryResult.focusTweet) {
        // Process focus tweet images
        if (tweetMemoryResult.focusTweet.photos?.length) {
          for (const photoUrl of tweetMemoryResult.focusTweet.photos) {
            const imageData = await getImageAsBase64(photoUrl);
            if (imageData) {
              imageContents.push({
                sender: tweetMemoryResult.focusTweet.sender,
                ...imageData
              });
            }
          }
        }
  
        // Process quote tweet images if they exist
        if (tweetMemoryResult.focusTweet.quoteContext?.photos?.length) {
          for (const photoUrl of tweetMemoryResult.focusTweet.quoteContext.photos) {
            const imageData = await getImageAsBase64(photoUrl);
            if (imageData) {
              imageContents.push({
                sender: tweetMemoryResult.focusTweet.quoteContext.sender,
                ...imageData
              });
            }
          }
        }
      }
  
      // Process current tweet images
      if (tweetMemoryResult.photos?.length) {
        for (const photoUrl of tweetMemoryResult.photos) {
          const imageData = await getImageAsBase64(photoUrl);
          if (imageData) {
            imageContents.push({
              sender: tweetMemoryResult.username,
              ...imageData
            });
          }
        }
      }
    }
  
    // Create the text content with enhanced quote tweet context and proper sender handling
    const focusTweetSection = tweetMemoryResult?.focusTweet ? `
  ## THIS IS THE CURRENT TWEET YOU ARE REPLYING TO. GIVE YOUR FULL FOCUS TO REPLYING TO THIS TWEET.
  Sender: ${tweetMemoryResult.focusTweet.sender || 'Unknown User'}
  Time: ${tweetMemoryResult.focusTweet.timestamp}
  Content: ${tweetMemoryResult.focusTweet.text}
  ${tweetMemoryResult.focusTweet.quoteContext ? `
  Quote Tweet Context:
    Sender: ${tweetMemoryResult.focusTweet.quoteContext.sender || 'Unknown User'}
    Time: ${tweetMemoryResult.focusTweet.quoteContext.timestamp}
    Content: ${tweetMemoryResult.focusTweet.quoteContext.text}
    ${tweetMemoryResult.focusTweet.quoteContext.photos?.length ? 
      `  Images: Contains ${tweetMemoryResult.focusTweet.quoteContext.photos.length} image(s)` : 
      ''}` : ''}` : '';
  
    const textContent = `
  # TWITTER INTERFACE
  This section contains your LIVE twitter interface featuring context you need to reply to the current tweet.
  
  ## RECENT CHAT HISTORY BETWEEN YOU AND ${tweetMemoryResult?.focusTweet?.sender || 'THE USER'}
  ${tweetMemory}
  
  ${focusTweetSection}
  
  ${imageContents.length > 0 ? `\n## IMAGES IN CONVERSATION\nThe following messages contain ${imageContents.length} images that provide additional context.\n` : ''}
  `;
  
    return { textContent, imageContents };
  }