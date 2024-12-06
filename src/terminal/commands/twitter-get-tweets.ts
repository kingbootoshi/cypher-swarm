import { Command } from '../types/commands';
import { getTweets } from '../../twitter/functions/getTweets';

/**
 * @command get-tweets
 * @description Get recent tweets from a specified user
 */
export const twitterGetTweets: Command = {
  name: 'get-tweets',
  description: 'Get recent tweets from a specified user. Do not include the @ symbol.',
  parameters: [
    {
      name: 'username',
      description: 'Twitter username (without @ symbol)',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      const result = await getTweets(args.username, args.limit);
      return {
        output: result.startsWith('Error') ? `❌ ${result}` : `📝 ${result}`
      };
    } catch (error) {
      return {
        output: `❌ Error fetching tweets: ${error.message}`
      };
    }
  }
}; 