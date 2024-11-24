import { Command } from '../types/commands';
import { likeTweet } from '../../twitter/twitterFunctions/likeTweet';

/**
 * @command twitter-like
 * @description Likes a specified tweet
 */
export const twitterLike: Command = {
  name: 'like-tweet',
  description: 'Likes a specified tweet',
  parameters: [
    {
      name: 'tweetId',
      description: 'ID of the tweet to like',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      const success = await likeTweet(args.tweetId);
      return {
        output: success 
          ? `✅ Action: Like Tweet\nTweet ID: ${args.tweetId}\nStatus: Success\nDetails: Successfully liked tweet`
          : `❌ Action: Like Tweet\nTweet ID: ${args.tweetId}\nStatus: Failed\nDetails: Unable to like tweet`
      };
    } catch (error) {
      return {
        output: `❌ Action: Like Tweet\nTweet ID: ${args.tweetId}\nStatus: Error\nDetails: ${error.message}`
      };
    }
  }
}; 