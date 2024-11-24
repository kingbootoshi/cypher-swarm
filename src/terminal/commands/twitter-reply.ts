import { Command } from '../types/commands';
import { replyToTweet } from '../../twitter/twitterFunctions/replyToTweet';

/**
 * @command twitter-reply
 * @description Replies to a specified tweet
 */
export const twitterReply: Command = {
  name: 'reply-to-tweet',
  description: 'Replies to a specified tweet with optional media attachments',
  parameters: [
    {
      name: 'tweetId',
      description: 'ID of the tweet to reply to',
      required: true,
      type: 'string'
    },
    {
      name: 'text',
      description: 'Text content of your reply',
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
      const replyId = await replyToTweet(args.tweetId, args.text, mediaUrls);
      
      return {
        output: replyId 
          ? `✅ Action: Reply Tweet\nParent Tweet ID: ${args.tweetId}\nReply Tweet ID: ${replyId}\nStatus: Success\nText: ${args.text}\nMedia: ${mediaUrls ? mediaUrls.join(', ') : 'None'}\nDetails: Successfully sent reply`
          : `❌ Action: Reply Tweet\nParent Tweet ID: ${args.tweetId}\nStatus: Failed\nDetails: Unable to send reply`
      };
    } catch (error) {
      return {
        output: `❌ Action: Reply Tweet\nParent Tweet ID: ${args.tweetId}\nStatus: Error\nDetails: ${error.message}`
      };
    }
  }
}; 