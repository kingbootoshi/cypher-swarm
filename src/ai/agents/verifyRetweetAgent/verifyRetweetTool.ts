// Define tool for verifying whether to retweet a tweet
// Simplified to focus on decision-making process and confirmation

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const verifyRetweetToolSchema = z.object({
  internal_thought: z.string().describe('Your internal thought process about whether to retweet'),
  confirm_retweet: z.boolean().describe('Whether you want to retweet')
});

export const VerifyRetweetTool: Tool = {
  type: 'function',
  function: {
    "name": "verify_retweet_tool",
    "description": "Evaluate whether to retweet a tweet. The full context of the tweet is provided to you below.",
    "strict": true,
    "parameters": {
      "type": "object",
      "required": [
        "internal_thought",
        "confirm_retweet"
      ],
      "properties": {
        "internal_thought": {
          "type": "string",
          "description": "Your internal thought process about whether to retweet"
        },
        "confirm_retweet": {
          "type": "boolean",
          "description": "Whether you want to retweet the tweet"
        }
      }
    }
  }
};