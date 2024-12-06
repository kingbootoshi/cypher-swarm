// tools/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

// Condense summaries tool
export const summaryToolSchema = z.object({
  condensed_summary: z.string().describe('A 3-4 sentence narrative-focused summary that combines and condenses the provided summaries.')
});

export const summaryTool: Tool = {
  type: 'function',
  function: {
    "name": "condense_summaries",
    "description": "Condenses multiple summaries into a single, coherent summary that captures the key information and narrative progression.",
    "parameters": {
        "type": "object",
        "properties": {
            "condensed_summary": {
                "type": "string",
                "description": "A 3-4 sentence narrative-focused summary that combines and condenses the provided summaries. The long term summary could be up to 6 sentences."
            }
        },
        "required": ["condensed_summary"]
    }
  },
};