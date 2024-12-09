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

export const quoteTweetToolSchema = z.object({
  internal_thoughts: z.string().describe('Your internal thoughts about what you want to quote.'),
  // Use z.enum to restrict tweet_length to specific options
  tweet_length: z.enum(TWEET_LENGTH_OPTIONS).describe('The length of the tweet you want to send.'),
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
        "quote_tweet",
        "media_included"
      ],
      "properties": {
        "internal_thoughts": {
          "type": "string",
          "description": "Your internal thoughts about how to make a unique quote tweet that adds value or showcases your opinion to the original tweet based on your current summaries and memories."
        },
        "tweet_length": {
          "type": "string",
          "enum": TWEET_LENGTH_OPTIONS,
          "description": "The length of the quote tweet you want to send."
        },
        "quote_tweet": {
          "type": "string",
          "description": "The quote tweet. Max 280 characters."
        },
        "media_included": {
          "type": "boolean",
          "description": "Whether or not to include generated media in the tweet."
        }
      }
    }
  }
};