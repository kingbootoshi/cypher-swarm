import { Command } from '../types/commands';
import { isCooldownActive } from '../../supabase/functions/twitter/cooldowns';

/**
 * @command twitter-tweet
 * @description Generates and posts a new main tweet with optional media
 */
export const twitterTweet: Command = {
  name: 'post-media-tweet',
  description: 'Generates and posts a new main tweet with optional media attachments. An agent will handle the rest.',
  parameters: [],
  handler: async () => {
    // Lazy import generateAndPostMediaTweet to avoid initialization issues
    const { generateAndPostMediaTweet } = await import('../../pipelines/generateMediaTweet');

    // Check for main tweet cooldown
    const cooldownInfo = await isCooldownActive('media');

    if (cooldownInfo.isActive) {
      return {
        output: '❌ Action: Post Media Tweet\n' +
                'Status: Failed\n' +
                `Reason: Media tweet cooldown is active. Please wait ${cooldownInfo.remainingTime} minutes before tweeting again.`
      };
    }

    try {
      // Proceed with generating and posting the tweet
      const result = await generateAndPostMediaTweet();

      return {
        output: `${result.success ? '✅' : '❌'} Action: Post Media Tweet\n` +
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