import { Command } from '../types/commands';
import { isCooldownActive } from '../../supabase/functions/twitter/cooldowns';

/**
 * @command twitter-tweet
 * @description Generates and posts a new media tweet with required topic input
 */
export const twitterTweet: Command = {
  name: 'post-media-tweet',
  description: 'Generates and posts a new media tweet. Requires a topic parameter in quotes (e.g., "Share a $CYPHER chart analysis")',
  parameters: [
    {
      name: 'topic',
      description: 'The topic to generate the media tweet about',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    // Check if topic was provided
    if (!args.topic) {
      return {
        output: '❌ Action: Post Media Tweet\n' +
                'Status: Failed\n' +
                'Reason: Topic parameter is required. Please provide a topic in quotes.'
      };
    }

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
      // Proceed with generating and posting the tweet with the provided topic
      const result = await generateAndPostMediaTweet(args.topic);

      return {
        output: `${result.success ? '✅' : '❌'} Action: Post Media Tweet\n` +
               `${result.tweetId ? `Tweet ID: ${result.tweetId}\n` : ''}` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Topic: ${args.topic}\n` +
               `Text: ${result.tweetText}\n` +
               `Media: ${result.mediaUrls ? result.mediaUrls.join(', ') : 'None'}\n` +
               `Details: ${result.message}`
      };
    } catch (error) {
      return {
        output: `❌ Action: Post Media Tweet\n` +
               `Status: Error\n` +
               `Details: ${error.message}`
      };
    }
  }
}; 