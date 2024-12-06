// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const quoteTweetToolSchema = z.object({
  internal_thoughts: z.string().describe('Your internal thoughts about what you want to quote.'),
  tweet_length: z.string().describe('The length of the quote tweet you want to send. one word, very short, short, medium, long, very long.'),
  quote_tweet: z.string().describe('The quote tweet.'),
  media_included: z.boolean().describe('Whether or not to include generated media in the tweet.')
});

export const QuoteTweetTool: Tool = {
  type: 'function',
  function: {
    "name": "quote_tweet_tool",
    "description": "Send a quote tweet of what you feel like. You have the option to include media, which another agent will handle.",
    "strict": true,
    "parameters": {
      "type": "object",
      "required": [
        "internal_thoughts",
        "tweet_length",
        "main_tweet",
        "media_included"
      ],
      "properties": {
        "internal_thoughts": {
          "type": "string",
          "description": "Your internal thoughts about what you want to quote."
        },
        "tweet_length": {
          "type": "string",
          "description": "The length of the quote tweet you want to send. one word, very short, short, medium, long, very long."
        },
        "quote_tweet": {
          "type": "string",
          "description": "The quote tweet."
        },
        "media_included": {
          "type": "boolean",
          "description": "Whether or not to include generated media in the tweet."
        }
      }
    }
  }
};