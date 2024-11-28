// Command to display help information in a concise format with parameter details

import { Command } from '../types/commands';
import { generateHelpText } from '../commandRegistry';

/**
 * @command help
 * @description Displays available commands and usage information
 */
export const help: Command = {
  name: 'help',
  description: 'Displays available commands and usage information',
  handler: async () => {
    return { 
      output: generateHelpText()
    };
  },
};