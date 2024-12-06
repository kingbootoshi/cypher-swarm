import { Command } from '../types/commands';
/**
 * @command twitter-reply
 * @description Replies to a specified tweet
 */
export const twitterReply: Command = {
  name: 'reply-to-tweet',
  description: 'Reply to a tweet. Only input the tweet ID number, raw digits. An agent will handle the rest.',
  parameters: [
    {
      name: 'tweetId',
      description: 'ID of the tweet to reply to',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      const mediaUrls = args.mediaUrls ? args.mediaUrls.split(',').map(url => url.trim()) : undefined;

      // Lazy import generateAndPostTweetReply to avoid initialization issues
      const { generateAndPostTweetReply } = await import('../../pipelines/generateReply');
      
      // Use the enhanced pipeline
      const result = await generateAndPostTweetReply(args.tweetId, mediaUrls);
      
      return {
        output: `${result.success ? '✅' : '❌'} Action: Reply Tweet\n` +
               `Parent Tweet ID: ${args.tweetId}\n` +
               `${result.tweetId ? `Reply Tweet ID: ${result.tweetId}\n` : ''}` +
               `Status: ${result.success ? 'Success' : 'Failed'}\n` +
               `Text: ${result.replyText}\n` +
               `Media: ${result.mediaUrls ? result.mediaUrls.join(', ') : 'None'}\n` +
               `Details: ${result.message}`
      };
    } catch (error) {
      return {
        output: `❌ Action: Reply Tweet\n` +
               `Parent Tweet ID: ${args.tweetId}\n` +
               `Status: Error\n` +
               `Details: ${error.message}`
      };
    }
  }
}; 