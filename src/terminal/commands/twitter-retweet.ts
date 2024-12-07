import { Command } from '../types/commands';
import { isCooldownActive } from '../../supabase/functions/twitter/cooldowns';
import { confirmRetweet } from '../../pipelines/verifyRetweet';

/**
 * @command twitter-retweet
 * @description Retweets a specified tweet
 */
export const twitterRetweet: Command = {
  name: 're-tweet',
  description: 'Retweet a tweet. Only input the tweet ID number, raw digits. An agent will handle the rest.',
  parameters: [
    {
      name: 'tweetId',
      description: 'ID of the tweet to retweet',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    // Check for retweet cooldown
    const cooldownInfo = await isCooldownActive('retweet');

    if (cooldownInfo.isActive) {
      return {
        output: `❌ Action: Retweet\n` +
                `Tweet ID: ${args.tweetId}\n` +
                'Status: Failed\n' +
                `Reason: Retweet cooldown is active. Please wait ${cooldownInfo.remainingTime} minutes before retweeting again.`
      };
    }

    try {
      // Proceed with retweeting
      const result = await confirmRetweet(args.tweetId);

      return {
        output: `${result.success ? '✅' : '❌'} Action: Retweet\n` +
               `Tweet ID: ${args.tweetId}\n` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Details: ${result.message}`
      };
    } catch (error) {
      return {
        output: `❌ Action: Retweet\n` +
               `Tweet ID: ${args.tweetId}\n` +
               `Status: Error\n` +
               `Details: ${error.message}`
      };
    }
  }
}; 