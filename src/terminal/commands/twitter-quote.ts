import { Command } from '../types/commands';
import { quoteTweet } from '../../twitter/functions/quoteTweet';

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
      const result = await quoteTweet(args.tweetId, args.text, mediaUrls);
      
      return {
        output: `${result.success ? '✅' : '❌'} Action: Quote Tweet\n` +
               `Quoted Tweet ID: ${args.tweetId}\n` +
               `${result.tweetId ? `New Tweet ID: ${result.tweetId}\n` : ''}` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Text: ${args.text}\n` +
               `Media: ${mediaUrls ? mediaUrls.join(', ') : 'None'}\n` +
               `Details: ${result.message}`
      };
    } catch (error) {
      return {
        output: `❌ Action: Quote Tweet\n` +
               `Quoted Tweet ID: ${args.tweetId}\n` +
               `Status: Error\n` +
               `Details: ${error.message}`
      };
    }
  }
}; 