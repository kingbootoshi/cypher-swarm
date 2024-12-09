import { Command } from '../types/commands';
import { isCooldownActive } from '../../supabase/functions/twitter/cooldowns';

/**
 * @command twitter-tweet
 * @description Generates and posts a new main tweet with required topic input
 */
export const twitterTweet: Command = {
  name: 'post-main-tweet',
  description: 'Generates and posts a new main tweet. Requires a topic parameter in quotes (e.g., "Tweet a long $CYPHER bull post")',
  parameters: [
    {
      name: 'topic',
      description: 'The topic to generate the tweet about',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    // Check if topic was provided
    if (!args.topic) {
      return {
        output: '❌ Action: Post Main Tweet\n' +
                'Status: Failed\n' +
                'Reason: Topic parameter is required. Please provide a topic in quotes.'
      };
    }

    // Lazy import generateAndPostMainTweet to avoid initialization issues
    const { generateAndPostMainTweet } = await import('../../pipelines/generateMainTweet');

    // Check for main tweet cooldown
    const cooldownInfo = await isCooldownActive('main');

    if (cooldownInfo.isActive) {
      return {
        output: '❌ Action: Post Main Tweet\n' +
                'Status: Failed\n' +
                `Reason: Main tweet cooldown is active. Please wait ${cooldownInfo.remainingTime} minutes before tweeting again.`
      };
    }

    try {
      // Proceed with generating and posting the tweet with the provided topic
      const result = await generateAndPostMainTweet(args.topic);

      return {
        output: `${result.success ? '✅' : '❌'} Action: Post Main Tweet\n` +
               `${result.tweetId ? `Tweet ID: ${result.tweetId}\n` : ''}` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Topic: ${args.topic}\n` +
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