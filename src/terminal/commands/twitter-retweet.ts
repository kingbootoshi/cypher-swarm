import { Command } from '../types/commands';
import { retweet } from '../../twitter/functions/retweet';

/**
 * @command twitter-retweet
 * @description Retweets a specified tweet
 */
export const twitterRetweet: Command = {
  name: 're-tweet',
  description: 'Retweets a specified tweet',
  parameters: [
    {
      name: 'tweetId',
      description: 'ID of the tweet to retweet',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      const result = await retweet(args.tweetId);
      
      return {
        output: `${result.success ? '✅' : '❌'} Action: Retweet\n` +
               `Tweet ID: ${args.tweetId}\n` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Details: ${result.message}`
      };
    } catch (error) {
      return {
        output: `❌ Action: Retweet\n` +
               `Tweet ID: ${args.tweetId}\n` +
               `Status: Error\n` +
               `Details: ${error.message}`
      };
    }
  }
}; 