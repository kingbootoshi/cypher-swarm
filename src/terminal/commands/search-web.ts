import { Command } from '../types/commands';
import { Logger } from '../../utils/logger';
import { queryPerplexity } from '../../utils/internetTool';

/**
 * Terminal command that searches the web using Perplexity AI
 * Usage: @search-web "What is the latest news about AI?"
 */
export const searchWeb: Command = {
  name: 'search-web',
  description: 'Search the web for information and get a summary of your query back. MUST wrap your query in quotes.',
  parameters: [
    {
      name: 'query',
      description: 'Search query (wrap in quotes)',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      Logger.log('Searching web for:', args.query);
      const result = await queryPerplexity(args.query);
      return {
        output: result
      };
    } catch (error) {
      Logger.log('Search web command failed:', error);
      return {
        output: `Error searching web: ${error.message}`
      };
    }
  }
}; 