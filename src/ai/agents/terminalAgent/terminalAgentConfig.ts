// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';
import agentConfig from '../../../config/agent.yaml';

// Schema for individual terminal command
export const terminalCommandSchema = z.object({
  command: z.string(),
});

export const terminalToolSchema = z.object({
  internal_thought: z.string(),
  plan: z.string(),
  terminal_commands: z.array(terminalCommandSchema), // Array of commands to execute
});

export const TerminalTool: Tool = {
  type: 'function',
  function: {
    name: 'use_terminal',
    description: `
      Executes one or multiple terminal commands in sequence based on internal thoughts and plans.

      **IMPORTANT**:
      - Only the parameters \`internal_thought\`, \`plan\`, and \`terminal_command\` are accepted.
      - **Do NOT include any additional parameters**.
      - All command arguments and options **must be included within the \`terminal_command\` string**.
      - The \`terminal_command\` should be the full command as you would type it in the terminal, including any flags and arguments.
      - Commands will be executed in the order they appear in the array
      - Each command object must include the full command string
      - All command arguments and options must be included within each command string
      - Commands will be executed sequentially, waiting for each to complete before moving to the next
    `,
    parameters: {
      type: 'object',
      required: ['internal_thought', 'plan', 'terminal_commands'],
      properties: {
        internal_thought: {
          type: 'string',
          description: `${agentConfig.agent.name}'s internal reasoning process about what terminal commands to run next and why.`,
        },
        plan: {
          type: 'string',
          description: 'A short plan of what you are going to do next. If planning to respond to a tweet, include the tweet ID in the plan.',
        },
        terminal_commands: {
          type: 'array',
          description: 'Array of terminal commands to execute in sequence. Can be one or multiple commands. You must execute ALL reccommended actions returned to you post get-homepage/mentions',
          items: {
            type: 'object',
            required: ['command'],
            properties: {
              command: {
                type: 'string',
                description: 'The full terminal command to execute, including all arguments and options.',
              },
            },
          },
        },
      },
      additionalProperties: false,
    },
  },
};
