// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const terminalToolSchema = z.object({
  internal_thought: z.string(),
  plan: z.string(),
  terminal_command: z.string(),
});

export const TerminalTool: Tool = {
  type: 'function',
  function: {
    name: 'use_terminal',
    strict: true,
    description: 'Executes a terminal command based on internal thoughts & plans.',
    parameters: {
      type: 'object',
      required: ['internal_thought', 'plan', 'terminal_command'],
      properties: {
        internal_thought: {
          type: 'string',
          description: 'My internal reasoning process about what terminal command to run next and why',
        },
        plan: {
          type: 'string',
          description: 'A short plan of what I am going to do next. If planning to respond to a tweet, I must include the tweet ID in the plan.',
        },
        terminal_command: {
          type: 'string',
          description: 'The FULL terminal command I want to run, based on my previous internal thought processes & plan. ONLY ONE COMMAND AT A TIME.',
        },
      },
      additionalProperties: false,
    },
  },
};