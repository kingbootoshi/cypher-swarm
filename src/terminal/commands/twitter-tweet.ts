import { Command } from '../types/commands';
import { sendTweet } from '../../twitter/twitterFunctions/sendTweet';

/**
 * @command twitter-tweet
 * @description Sends a new tweet
 */
export const twitterTweet: Command = {
  name: 'send-tweet',
  description: 'Sends a new tweet with optional media attachments',
  parameters: [
    {
      name: 'text',
      description: 'Text content of your tweet',
      required: true,
      type: 'string'
    },
    {
      name: 'mediaUrls',
      description: 'Comma-separated list of media URLs (images, GIFs, or videos)',
      required: false,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      const mediaUrls = args.mediaUrls ? args.mediaUrls.split(',').map(url => url.trim()) : undefined;
      const tweetId = await sendTweet(args.text, mediaUrls);
      
      return {
        output: tweetId 
          ? `✅ Action: Send Tweet\nTweet ID: ${tweetId}\nStatus: Success\nText: ${args.text}\nMedia: ${mediaUrls ? mediaUrls.join(', ') : 'None'}\nDetails: Successfully sent tweet`
          : `❌ Action: Send Tweet\nStatus: Failed\nDetails: Unable to send tweet`
      };
    } catch (error) {
      return {
        output: `❌ Action: Send Tweet\nStatus: Error\nDetails: ${error.message}`
      };
    }
  }
}; 