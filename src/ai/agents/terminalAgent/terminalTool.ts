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
    description: `
      Executes a terminal command based on internal thoughts and plans.
      **IMPORTANT**:
      - Only the parameters \`internal_thought\`, \`plan\`, and \`terminal_command\` are accepted.
      - **Do NOT include any additional parameters**.
      - All command arguments and options **must be included within the \`terminal_command\` string**.
      - The \`terminal_command\` should be the full command as you would type it in the terminal, including any flags and arguments.
    `,
    parameters: {
      type: 'object',
      required: ['internal_thought', 'plan', 'terminal_command'],
      properties: {
        internal_thought: {
          type: 'string',
          description: "Satoshi's internal reasoning process about what terminal command to run next and why.",
        },
        plan: {
          type: 'string',
          description: 'A short plan of what you are going to do next. If planning to respond to a tweet, include the tweet ID in the plan.',
        },
        terminal_command: {
          type: 'string',
          description: `
            The full terminal command you want to execute, including all arguments and options.
            **Only one command at a time**.
          `,
        },
      },
      additionalProperties: false,
    },
  },
};