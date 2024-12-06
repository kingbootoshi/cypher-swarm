import { Command } from '../types/commands';
import { generateAndPostMainTweet } from '../../pipelines/generateMainTweet';

/**
 * @command twitter-tweet
 * @description Generates and posts a new main tweet with optional media
 */
export const twitterTweet: Command = {
  name: 'send-tweet',
  description: 'Generates and posts a new main tweet with optional media attachments',
  parameters: [],
  handler: async () => {
    try {
      // Use the enhanced pipeline
      const result = await generateAndPostMainTweet();

      return {
        output: `${result.success ? '✅' : '❌'} Action: Post Main Tweet\n` +
               `${result.tweetId ? `Tweet ID: ${result.tweetId}\n` : ''}` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Text: ${result.tweetText}\n` +
               `Media: ${result.mediaUrls ? result.mediaUrls.join(', ') : 'None'}\n` +
               `Details: ${result.message}`
      };
    } catch (error) {
      return {
        output: `❌ Action: Post Main Tweet\n` +
               `Status: Error\n` +
               `Details: ${error.message}`
      };
    }
  }
}; 