import { Command } from '../types/commands';
import { isCooldownActive } from '../../supabase/functions/twitter/cooldowns';

/**
 * @command twitter-quote
 * @description Creates a quote tweet
 */
export const twitterQuote: Command = {
  name: 'quote-tweet',
  description: 'Quote tweet with text. Only input the tweet ID number, raw digits. An agent will handle the rest.',
  parameters: [
    {
      name: 'tweetId',
      description: 'ID of the tweet to quote',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    // Lazy import generateAndPostQuoteTweet to avoid initialization issues
    const { generateAndPostQuoteTweet } = await import('../../pipelines/generateQuote');

    // Check for quote tweet cooldown
    const cooldownInfo = await isCooldownActive('quote');

    if (cooldownInfo.isActive) {
      return {
        output: `❌ Action: Quote Tweet\n` +
                `Quoted Tweet ID: ${args.tweetId}\n` +
                'Status: Failed\n' +
                `Reason: Quote tweet cooldown is active. Please wait ${cooldownInfo.remainingTime} minutes before quoting again.`
      };
    }

    try {
      // Proceed with generating and posting the quote tweet
      const mediaUrls = args.mediaUrls ? args.mediaUrls.split(',').map(url => url.trim()) : undefined;
      const result = await generateAndPostQuoteTweet(args.tweetId, mediaUrls);

      return {
        output: `${result.success ? '✅' : '❌'} Action: Quote Tweet\n` +
               `Quoted Tweet ID: ${args.tweetId}\n` +
               `${result.tweetId ? `New Tweet ID: ${result.tweetId}\n` : ''}` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Text: ${result.quoteText}\n` +
               `Media: ${result.mediaUrls ? result.mediaUrls.join(', ') : 'None'}\n` +
               `Details: ${result.message}`
      };
    } catch (error) {
      return {
        output: `❌ Action: Quote Tweet\n` +
               `Quoted Tweet ID: ${args.tweetId}\n` +
               `Status: Error\n` +
               `Details: ${error.message}`
      };
    }
  }
}; 