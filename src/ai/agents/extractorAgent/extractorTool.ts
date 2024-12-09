// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';
import { configLoader } from '../../../utils/config';

// Get agent name for dynamic field name
const agentName = configLoader.getAgentName().toLowerCase();
const selfFieldName = `${agentName}_self` as const;

// Define the user-specific learning schema
const userLearningSchema = z.object({
  user_id: z.string().describe('The unique identifier of the user'),
  learnings: z.array(z.string()).describe('Specific learnings and observations about this user')
});

// Create dynamic schema with computed property name
const extractorSchemaFields = {
  summary: z.string().describe('A concise paragraph summarizing the entire terminal log'),
  world_knowledge: z.array(z.string()).describe('Knowledge learned about the world, excluding crypto'),
  crypto_ecosystem_knowledge: z.array(z.string()).describe('Knowledge about the crypto ecosystem'),
  user_specific: z.array(userLearningSchema).optional().describe('Learnings about specific users encountered in the conversation'),
} as const;

// Add the dynamic self field
extractorSchemaFields[selfFieldName] = z.array(z.string()).describe(`AI agent's personal growth and perspectives`);

export const extractorToolSchema = z.object(extractorSchemaFields);

export const ExtractorTool: Tool = {
  type: 'function',
  function: {
    "name": "extract_log_knowledge",
    "description": "Analyze chat logs to extract knowledge, learnings, and generate a summary of the conversation",
    "strict": true,
    "parameters": {
      "type": "object",
      "required": [
        "world_knowledge",
        "crypto_ecosystem_knowledge",
        selfFieldName,
        "summary"
      ],
      "properties": {
        "summary": {
          "type": "string",
          "description": "A detailed 3-4 sentences paragraph summarizing the current events (such as what happened on the twitter timeline), focusing on key actions and specific details. Don't log your own generic actions of interacting with users. Focus on timeline learnings, internet learnings, and world events. This acts as your sense of time in the present."
        },
        "world_knowledge": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "A list of knowledge learned about the world, facts or concepts learned from the terminal logs. NOT related to crypto ecosystem"
        },
        "crypto_ecosystem_knowledge": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "A list of knowledge learned about the crypto ecosystem and its culture."
        },
        [selfFieldName]: {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": `learnings about your personal growth, new perspectives, feelings, or opinions developed from the current terminal log`
        },
        "user_specific": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["user_id", "learnings"],
            "properties": {
              "user_id": {
                "type": "string",
                "description": "The unique identifier of the user. Labeled as 'USER ID:' in the [SPECIFIC USER INTERACTIONS] section of the terminal logs"
              },
              "learnings": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Specific learnings and observations about this user. Leave empty array if nothing. Please use the platform's username of the user when writing learnings about them. "
              }
            }
          },
          "description": "Array of user-specific learnings and observations"
        }
      }
    }
  },
};