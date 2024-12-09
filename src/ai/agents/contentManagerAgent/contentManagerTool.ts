import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

/**
 * Define the schema for a single action.
 * Each action must have a type and additional fields depending on the action type:
 * - "reply": needs a tweet_id and a message
 * - "quote": needs a tweet_id and a message
 * - "retweet": needs a tweet_id
 * - "follow": needs a username (without @)
 *
 * Include a reasoning field to explain why the action is chosen.
 */

const actionSchema = z.union([
  z.object({
    reasoning: z.string().describe('Reason why we should reply to this tweet'),
    type: z.literal('reply'),
    tweet_id: z.string().describe('The tweet ID to reply to')
  }),
  z.object({
    reasoning: z.string().describe('Reason why we should quote this tweet'),
    type: z.literal('quote'), 
    tweet_id: z.string().describe('The tweet ID to quote tweet')
  }),
  z.object({
    reasoning: z.string().describe('Reason why we should retweet this tweet'),
    type: z.literal('retweet'),
    tweet_id: z.string().describe('The tweet ID to retweet')
  }),
  z.object({
    reasoning: z.string().describe('Reason why we should follow this user'),
    type: z.literal('follow'),
    username: z.string().describe('Username of the account to follow, no @ symbol')
  })
]);

/**
 * The main schema for the content manager tool.
 * It includes:
 * - internal_thought: The agent's reasoning about the timeline and what to do
 * - summary_of_tweets: A concise summary of the tweet data analyzed
 * - recommended_actions: An array of zero or more actions decided by the agent
 */
export const contentManagerToolSchema = z.object({
  summary_of_tweets: z.string().describe('A concise summary of the key discussions, trends, and interesting tweets from the provided data'),
  recommended_actions: z.array(actionSchema).describe('A list of actions to reccommend to the terminal agent, can be empty or multiple')
});

export const ContentManagerTool: Tool = {
  type: 'function',
  function: {
    name: "manage_twitter_content",
    description: `
      Analyze and summarize provided tweet data. Then, decide on a set of actions (reply, quote, retweet, follow) to execute.
      Output reasoning for why these actions are chosen. 
      The agent can choose zero or multiple actions.
    `,
    strict: true,
    parameters: {
      type: "object",
      required: ["summary_of_tweets", "recommended_actions"],
      properties: {
        summary_of_tweets: {
          type: "string",
          description: "A concise summary of the current tweet data, highlighting key points and trends."
        },
        recommended_actions: {
          type: "array",
          description: "A list of actions to reccommend to the terminal agent, can be empty or multiple. Try to generate as many actions as possible that will benefit growth.",
          items: {
            oneOf: [
              {
                type: "object",
                required: ["reasoning", "type", "tweet_id"],
                properties: {
                  reasoning: {
                    type: "string", 
                    description: "Reason why we should reply to this tweet"
                  },
                  type: {
                    type: "string",
                    enum: ["reply"]
                  },
                  tweet_id: {
                    type: "string",
                    description: "The tweet ID to reply to"
                  }
                }
              },
              {
                type: "object",
                required: ["reasoning", "type", "tweet_id"],
                properties: {
                  reasoning: {
                    type: "string",
                    description: "Reason why we should quote this tweet"
                  },
                  type: {
                    type: "string",
                    enum: ["quote"]
                  },
                  tweet_id: {
                    type: "string",
                    description: "The tweet ID to quote tweet"
                  }
                }
              },
              {
                type: "object",
                required: ["reasoning", "type", "tweet_id"],
                properties: {
                  reasoning: {
                    type: "string",
                    description: "Reason why we should retweet this tweet"
                  },
                  type: {
                    type: "string",
                    enum: ["retweet"]
                  },
                  tweet_id: {
                    type: "string",
                    description: "The tweet ID to retweet"
                  }
                }
              },
              {
                type: "object",
                required: ["reasoning", "type", "username"],
                properties: {
                  reasoning: {
                    type: "string",
                    description: "Reason why we should follow this user"
                  },
                  type: {
                    type: "string",
                    enum: ["follow"]
                  },
                  username: {
                    type: "string",
                    description: "Username of the account to follow (no @)"
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
};