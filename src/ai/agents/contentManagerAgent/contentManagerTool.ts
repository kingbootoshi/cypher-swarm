// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const planMainTweetSchema = z.object({
  internal_thought: z.string().describe('Think about what topic would be the most engaging for Satoshi to tweet about'),
  main_tweet_topic: z.string().describe('The most engaging topic for Satoshi to tweet about')
});

export const PlanMainTweetTool: Tool = {
  type: 'function',
  function: {
    "name": "plan_main_tweet",
    "description": "Think of the most engaging topic for Satoshi to tweet about, based on the recent main tweets and the short term terminal log.",
    "strict": true,
    "parameters": {
      "type": "object",
      "required": [
        "internal_thought",
        "main_tweet_topic"
      ],
      "properties": {
        "internal_thought": {
          "type": "string",
          "description": "Think about what topic would be the most engaging for Satoshi to tweet about."
        },
        "main_tweet_topic": {
          "type": "string",
          "description": "The most engaging topic for Satoshi to tweet about."
        }
      }
    }
  }
};