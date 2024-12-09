import { Command } from '../types/commands';
import { getHomepage } from '../../twitter/functions/getHomepage';
import { Logger } from '../../utils/logger';

/**
 * @command get-homepage
 * @description Get and process the homepage timeline
 */
export const twitterGetHomepage: Command = {
  name: 'get-homepage',
  description: 'Get and process the homepage timeline',
  parameters: [],
  handler: async (args) => {
    try {
      const { processTimeline, TimelineType } = await import('../../pipelines/processTimeline');
      
      const tweets = await getHomepage(30);
      const timelineData = tweets.length === 0 ? '' : tweets.join('\n');
      
      // Process timeline using existing pipeline
      const processedResult = await processTimeline(timelineData, TimelineType.HOMEPAGE);

      return {
        output: processedResult, // Return the formatted string directly
        data: { tweets: timelineData, processed: processedResult }
      };
    } catch (error) {
      Logger.log('Error in twitter-get-homepage:', error);
      return {
        output: `❌ Error: ${error.message}`,
        data: { error: error.message }
      };
    }
  }
}; 