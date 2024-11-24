import { Command } from '../types/commands';
import { getMentions } from '../../twitter/twitterFunctions';

/**
 * @command get-mentions
 * @description Get recent mentions of your account
 */
export const twitterGetMentions: Command = {
  name: 'get-mentions',
  description: 'Get recent mentions of your account',
  parameters: [
    {
      name: 'limit',
      description: 'Maximum number of mentions to fetch',
      required: false,
      type: 'number',
      defaultValue: '20'
    }
  ],
  handler: async (args) => {
    try {
      const mentions = await getMentions(args.limit);
      if (mentions.length === 0) {
        return {
          output: 'No recent mentions found.'
        };
      }
      return {
        output: `📫 Recent Mentions:\n${mentions.join('\n')}`
      };
    } catch (error) {
      return {
        output: `Error fetching mentions: ${error.message}`
      };
    }
  }
}; 