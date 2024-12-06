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