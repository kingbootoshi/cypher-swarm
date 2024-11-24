// Command to display help information

import { Command } from '../types/commands';
import { getAllCommands } from '../commandRegistry';

/**
 * @command help
 * @description Displays available commands and usage information
 */
export const help: Command = {
  name: 'help',
  description: 'Displays available commands and usage information',
  handler: async () => {
    const commands = getAllCommands();
    
    // Create formatted help text
    const helpText = [
      '🤖 Available Commands:',
      '===================='
    ];

    commands.forEach(cmd => {
      // Add command name and description
      helpText.push(
        `\n@${cmd.name}`,
        `  ${cmd.description}`
      );

      // Add parameters if they exist
      if (cmd.parameters?.length) {
        helpText.push('  Parameters:');
        cmd.parameters.forEach(p => {
          const required = p.required ? '(required)' : `(default: ${p.defaultValue})`;
          helpText.push(`    ${p.name} - ${p.description} ${required}`);
        });
      }
    });

    return { 
      output: helpText.join('\n')
    };
  },
};