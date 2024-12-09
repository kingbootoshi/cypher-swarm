// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

// Define tweet length options as a const array for type safety and reusability
const TWEET_LENGTH_OPTIONS = [
  'one word',
  'very short',
  'short',
  'medium',
  'long',
  'very long'
] as const;

export const mainTweetToolSchema = z.object({
  internal_thoughts: z.string().describe('Your internal thoughts about what you want to tweet.'),
  // Use z.enum to restrict tweet_length to specific options
  tweet_length: z.enum(TWEET_LENGTH_OPTIONS).describe('The length of the tweet you want to send.'),
  main_tweet: z.string().describe('The main tweet.'),
  media_included: z.boolean().describe('Whether or not to include generated media in the tweet.')
});

export const MainTweetTool: Tool = {
  type: 'function',
  function: {
    "name": "main_tweet_tool",
    "description": "Send a main tweet of what you feel like. You have the option to include media, which another agent will handle.",
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
          "description": "Your internal thoughts about HOW to make new unique tweet that varies from your recent tweets & existing tweets based on your current summaries, learnings, and recent short term terminal history log."
        },
        "tweet_length": {
          "type": "string",
          "enum": TWEET_LENGTH_OPTIONS,
          "description": "The length of the tweet you want to send. Make sure to vary these, so if your recent tweets are short, make them long and vice versa."
        },
        "main_tweet": {
          "type": "string",
          "description": "The main tweet."
        },
        "media_included": {
          "type": "boolean",
          "description": "Whether or not to include generated media in the tweet."
        }
      }
    }
  }
};