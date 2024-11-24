import { Command } from '../types/commands';
import { getHomepage } from '../../twitter/twitterFunctions';

/**
 * @command get-homepage
 * @description Get the homepage of your timeline
 */
export const twitterGetHomepage: Command = {
  name: 'get-homepage',
  description: 'Get the homepage of your timeline',
  parameters: [
    {
      name: 'limit',
      description: 'Maximum number of tweets to fetch',
      required: false,
      type: 'number',
      defaultValue: '20'
    }
  ],
  handler: async (args) => {
    try {
      const tweets = await getHomepage(args.limit);
      if (tweets.length === 0) {
        return {
          output: 'No tweets found in your homepage timeline.'
        };
      }
      return {
        output: `📱 Homepage Timeline:\n${tweets.join('\n')}`
      };
    } catch (error) {
      return {
        output: `Error fetching homepage: ${error.message}`
      };
    }
  }
}; 