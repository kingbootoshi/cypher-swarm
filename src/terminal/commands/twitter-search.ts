import { Command } from '../types/commands';
import { searchTwitter } from '../../twitter/functions/searchTwitter';

/**
 * @command search-twitter
 * @description Search for tweets with a specific query
 */
export const twitterSearch: Command = {
  name: 'search-twitter',
  description: 'Search for tweets with a specific query',
  parameters: [
    {
      name: 'query',
      description: 'Search query string',
      required: true,
      type: 'string'
    },
    {
      name: 'limit',
      description: 'Maximum number of results to return',
      required: false,
      type: 'number',
      defaultValue: '20'
    }
  ],
  handler: async (args) => {
    try {
      const results = await searchTwitter(args.query, args.limit);
      return {
        output: results.startsWith('Error') ? `❌ ${results}` : `🔍 ${results}`
      };
    } catch (error) {
      return {
        output: `❌ Error searching tweets: ${error.message}`
      };
    }
  }
}; 