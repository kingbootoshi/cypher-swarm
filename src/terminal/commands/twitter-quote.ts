import { Command } from '../types/commands';
import { quoteTweet } from '../../twitter/functions/quoteTweet';
import { assembleTwitterInterface } from '../../twitter/utils/imageUtils';
import { generateQuoteTweet } from '../../tests/quoteTest';
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
      // Assemble Twitter interface once
      const { textContent, imageContents } = await assembleTwitterInterface(".", args.tweetId);

      // Generate reply using the preassembled interface
      const quote = await generateQuoteTweet(args.tweetId, "What would you quote this tweet?", textContent, imageContents);
      
      const result = await quoteTweet(args.tweetId, quote, mediaUrls, textContent);
      
      return {
        output: `${result.success ? '✅' : '❌'} Action: Quote Tweet\n` +
               `Quoted Tweet ID: ${args.tweetId}\n` +
               `${result.tweetId ? `New Tweet ID: ${result.tweetId}\n` : ''}` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Text: ${quote}\n` +
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