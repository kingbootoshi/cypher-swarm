import { Command } from '../types/commands';
import { retweet } from '../../twitter/twitterFunctions/retweet';

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
      const success = await retweet(args.tweetId);
      return {
        output: success 
          ? `✅ Action: Retweet\nTweet ID: ${args.tweetId}\nStatus: Success\nDetails: Successfully retweeted`
          : `❌ Action: Retweet\nTweet ID: ${args.tweetId}\nStatus: Failed\nDetails: Unable to retweet`
      };
    } catch (error) {
      return {
        output: `❌ Action: Retweet\nTweet ID: ${args.tweetId}\nStatus: Error\nDetails: ${error.message}`
      };
    }
  }
}; 