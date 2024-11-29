// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const extractorToolSchema = z.object({
  summary: z.string().describe('A concise paragraph summarizing the entire terminal log'),
  world_knowledge: z.array(z.string()).describe('Knowledge learned about the world, excluding crypto'),
  crypto_ecosystem_knowledge: z.array(z.string()).describe('Knowledge about the crypto ecosystem'),
  satoshi_self: z.array(z.string()).describe('AI agent\'s personal growth and perspectives'),
});

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
        "satoshi_self",
        "summary"
      ],
      "properties": {
        "summary": {
          "type": "string",
          "description": "A concise paragraph summarizing the entire terminal log, focusing on key actions and events"
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
          "description": "A list of knowledge learned about the crypto ecosystem it's culture. can be about specific projects, people, events, or other facts and concepts learned from the terminal logs"
        },
        "satoshi_self": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "AI agent's personal growth, new perspectives, feelings, or opinions developed from the current terminal log"
        },
      }
    }
  },
};