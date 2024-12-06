import { Command } from '../types/commands';
import { getHomepage } from '../../twitter/functions/getHomepage';

/**
 * @command get-homepage
 * @description Get the homepage of your timeline
 */
export const twitterGetHomepage: Command = {
  name: 'get-homepage',
  description: 'Get the homepage of your timeline',
  parameters: [],
  handler: async (args) => {
    try {
      const tweets = await getHomepage(20);
      if (tweets.length === 0) {
        return {
          output: '📭 No unhandled tweets found in your homepage timeline.'
        };
      }
      return {
        output: `📱 Found ${tweets.length} unhandled tweet${tweets.length === 1 ? '' : 's'} in timeline:\n${tweets.join('\n')}`
      };
    } catch (error) {
      return {
        output: `❌ Error fetching homepage: ${error.message}`
      };
    }
  }
}; 