import { Command } from '../types/commands';
import { quoteTweet } from '../../twitter/twitterFunctions/quoteTweet';

/**
 * @command twitter-quote
 * @description Creates a quote tweet
 */
export const twitterQuote: Command = {
  name: 'quote-tweet',
  description: 'Creates a quote tweet with optional media attachments',
  parameters: [
    {
      name: 'tweetId',
      description: 'ID of the tweet to quote',
      required: true,
      type: 'string'
    },
    {
      name: 'text',
      description: 'Text content of your quote tweet',
      required: true,
      type: 'string'
    },
    {
      name: 'mediaUrls',
      description: 'Comma-separated list of media URLs (images, GIFs, or videos)',
      required: false,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      const mediaUrls = args.mediaUrls ? args.mediaUrls.split(',').map(url => url.trim()) : undefined;
      const tweetId = await quoteTweet(args.tweetId, args.text, mediaUrls);
      
      return {
        output: tweetId 
          ? `✅ Action: Quote Tweet\nQuoted Tweet ID: ${args.tweetId}\nNew Tweet ID: ${tweetId}\nStatus: Success\nText: ${args.text}\nMedia: ${mediaUrls ? mediaUrls.join(', ') : 'None'}\nDetails: Successfully created quote tweet`
          : `❌ Action: Quote Tweet\nQuoted Tweet ID: ${args.tweetId}\nStatus: Failed\nDetails: Unable to create quote tweet`
      };
    } catch (error) {
      return {
        output: `❌ Action: Quote Tweet\nQuoted Tweet ID: ${args.tweetId}\nStatus: Error\nDetails: ${error.message}`
      };
    }
  }
}; 