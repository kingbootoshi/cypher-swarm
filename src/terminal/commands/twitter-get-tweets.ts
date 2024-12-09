import { Command } from '../types/commands';
import { getTweets } from '../../twitter/functions/getTweets';
import { Logger } from '../../utils/logger';

/**
 * @command get-tweets
 * @description Get and process recent tweets from a specified user
 */
export const twitterGetTweets: Command = {
  name: 'get-tweets',
  description: 'Get and process recent tweets from a specified user. Do not include the @ symbol.',
  parameters: [
    {
      name: 'username',
      description: 'Twitter username (without @ symbol)',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {

      const { processTimeline, TimelineType } = await import('../../pipelines/processTimeline');

      const tweets = await getTweets(args.username, 10);
      
      const timelineData = tweets.length === 0 ? '' : tweets.join('\n');
      
      // Process tweets using the timeline pipeline
      const processedResult = await processTimeline(
        timelineData, 
        TimelineType.USER_PROFILE, 
        `@${args.username}`
      );

      return {
        output: processedResult,
        data: { tweets: timelineData, processed: processedResult }
      };
    } catch (error) {
      Logger.log('Error in twitter-get-tweets:', error);
      return {
        output: `❌ Error: ${error.message}`,
        data: { error: error.message }
      };
    }
  }
}; 