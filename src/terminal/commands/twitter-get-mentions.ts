import { Command } from '../types/commands';
import { getMentions } from '../../twitter/functions/getMentions';

/**
 * @command get-mentions
 * @description Get recent mentions of your account
 */
export const twitterGetMentions: Command = {
  name: 'get-mentions',
  description: 'Get recent mentions',
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
      const mentions = await getMentions(10);
      if (mentions.length === 0) {
        return {
          output: '📭 No unhandled mentions found.'
        };
      }
      return {
        output: `📫 Found ${mentions.length} unhandled mention${mentions.length === 1 ? '' : 's'}:\n${mentions.join('\n')}`
      };
    } catch (error) {
      return {
        output: `❌ Error fetching mentions: ${error.message}`
      };
    }
  }
}; 