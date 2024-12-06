// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const memoryToolSchema = z.object({
  internal_thought: z.string().describe('Think about what query would be the most efficient to pull the most relevant memories'),
  memory_query: z.string().describe('A query to pull the most relevant memories from the vector database of memories')
});

export const MemoryTool: Tool = {
  type: 'function',
  function: {
    "name": "memory_tool",
    "description": "Analyze chat logs to generate a query to pull the most relevant memories from the vector database of memories",
    "strict": true,
    "parameters": {
      "type": "object",
      "required": [
        "internal_thought",
        "memory_query"
      ],
      "properties": {
        "internal_thought": {
          "type": "string",
          "description": "Think about what query would be the most efficient to pull the most relevant memories."
        },
        "memory_query": {
          "type": "string",
          "description": "A query of keywords to pull the most relevant memories from the vector database of memories. This should be a short list of keywords, seperated by commas. Max 5 words"
        }
      }
    }
  }
};