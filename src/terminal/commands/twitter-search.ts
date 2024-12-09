import { Command } from '../types/commands';
import { searchTwitter } from '../../twitter/functions/searchTwitter';
import { Logger } from '../../utils/logger';

/**
 * @command search-twitter
 * @description Search for and process tweets with a specific query
 */
export const twitterSearch: Command = {
  name: 'search-twitter',
  description: 'Search for and process tweets with a specific query',
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
      const { processTimeline, TimelineType } = await import('../../pipelines/processTimeline');

      const tweets = await searchTwitter(args.query, 10);
      
      const timelineData = tweets.length === 0 ? '' : tweets.join('\n');
      
      // Process search results using the timeline pipeline with search context
      const processedResult = await processTimeline(
        timelineData, 
        TimelineType.SEARCH, 
        `query: "${args.query}"`
      );

      return {
        output: processedResult,
        data: { tweets: timelineData, processed: processedResult }
      };
    } catch (error) {
      Logger.log('Error in twitter-search:', error);
      return {
        output: `❌ Error: ${error.message}`,
        data: { error: error.message }
      };
    }
  }
}; 