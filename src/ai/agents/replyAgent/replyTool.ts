// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const replyTweetToolSchema = z.object({
  internal_thoughts: z.string().describe('Your internal thoughts about what you want to reply to the tweet.'),
  tweet_length: z.string().describe('The length of the tweet you want to send. one word, very short, short, medium, long, very long.'),
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
          "description": "Your internal thoughts about what you want to reply to the tweet."
        },
        "tweet_length": {
          "type": "string",
          "description": "The length of the tweet you want to send. one word, very short, short, medium, long, very long."
        },
        "reply_tweet": {
          "type": "string",
          "description": "The reply to the tweet."
        },
        "media_included": {
          "type": "boolean",
          "description": "Whether or not to include generated media in the tweet."
        }
      }
    }
  }
};