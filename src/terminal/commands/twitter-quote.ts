import { Command } from '../types/commands';
import { generateAndPostQuoteTweet } from '../../pipelines/generateQuote';

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
    }
  ],
  handler: async (args) => {
    try {
      const mediaUrls = args.mediaUrls ? args.mediaUrls.split(',').map(url => url.trim()) : undefined;
      
      // Use the enhanced pipeline
      const result = await generateAndPostQuoteTweet(args.tweetId, mediaUrls);
      
      return {
        output: `${result.success ? '✅' : '❌'} Action: Quote Tweet\n` +
               `Quoted Tweet ID: ${args.tweetId}\n` +
               `${result.tweetId ? `New Tweet ID: ${result.tweetId}\n` : ''}` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Text: ${result.quoteText}\n` +
               `Media: ${result.mediaUrls ? result.mediaUrls.join(', ') : 'None'}\n` +
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