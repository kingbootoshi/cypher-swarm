import { Command } from '../types/commands';
import { getMentions } from '../../twitter/functions/getMentions';
import { Logger } from '../../utils/logger';

/**
 * @command get-mentions
 * @description Get and process recent mentions of your account
 */
export const twitterGetMentions: Command = {
  name: 'get-mentions',
  description: 'Get and process recent mentions',
  parameters: [],
  handler: async (args) => {
    try {
      const { processTimeline, TimelineType } = await import('../../pipelines/processTimeline');

      const mentions = await getMentions(20);
      const timelineData = mentions.length === 0 ? '' : mentions.join('\n');
      
      // Process mentions using the timeline pipeline
      const processedResult = await processTimeline(timelineData, TimelineType.MENTIONS);

      return {
        output: processedResult,
        data: { tweets: timelineData, processed: processedResult }
      };
    } catch (error) {
      Logger.log('Error in twitter-get-mentions:', error);
      return {
        output: `❌ Error: ${error.message}`,
        data: { error: error.message }
      };
    }
  }
}; 