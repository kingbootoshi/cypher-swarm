// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

// Reuse the same tweet length options for consistency across tools
const TWEET_LENGTH_OPTIONS = [
  'one word',
  'very short',
  'short',
  'medium',
  'long',
  'very long'
] as const;

export const replyTweetToolSchema = z.object({
  internal_thoughts: z.string().describe('Your internal thoughts about what you want to reply to the tweet.'),
  // Use z.enum to restrict tweet_length to specific options
  tweet_length: z.enum(TWEET_LENGTH_OPTIONS).describe('The length of the tweet you want to send.'),
  reply_tweet: z.string().describe('The reply to the tweet.'),
  media_included: z.boolean().describe('Whether or not to include generated media in the tweet.')
});

export const ReplyTweetTool: Tool = {
  type: 'function',
  function: {
    "name": "reply_tweet_tool",
    "description": "Send a reply tweet of what you feel like. You have the option to include media, which another agent will handle.",
    "strict": true,
    "parameters": {
      "type": "object",
      "required": [
        "internal_thoughts",
        "tweet_length",
        "reply_tweet",
        "media_included"
      ],
      "properties": {
        "internal_thoughts": {
          "type": "string",
          "description": "Your internal thoughts about what unique reply to make that varies from your recent replies based on the current tweet context and memories."
        },
        "tweet_length": {
          "type": "string",
          "enum": TWEET_LENGTH_OPTIONS,
          "description": "The length of the reply you want to send. Make sure to vary these, so if your recent replies are short, make them long and vice versa."
        },
        "reply_tweet": {
          "type": "string",
          "description": "The reply to the tweet. Make it engaging and contextual to the conversation."
        },
        "media_included": {
          "type": "boolean",
          "description": "Whether or not to include generated media in the tweet."
        }
      }
    }
  }
};