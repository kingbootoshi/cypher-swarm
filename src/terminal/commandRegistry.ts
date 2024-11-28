// Command registry for terminal commands

import fs from 'fs';
import path from 'path';
import { Command } from './types/commands';

/**
 * Registry mapping command names to their command objects.
 */
const commandRegistry: Map<string, Command> = new Map();

export function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = require(filePath) as { [key: string]: Command };

    // Assume each module exports a single command
    const command = Object.values(commandModule)[0];

    if (command && command.name) {
      commandRegistry.set(command.name, command);
    } else {
      console.warn(`Invalid command module: ${file}`);
    }
  }
}

export function getCommand(commandName: string): Command | undefined {
  return commandRegistry.get(commandName);
}

export function getAllCommands(): Command[] {
  return Array.from(commandRegistry.values());
}

// Export function to generate help text that can be used in config
export function generateHelpText(): string {
  const commands = getAllCommands();
  const helpText: string[] = ['Available commands:'];

  const formatCommand = (cmd: Command) => {
    const lines: string[] = [];
    let cmdStr = cmd.name;

    if (cmd.parameters?.length) {
      cmdStr += ' ' + cmd.parameters
        .map(p => `<${p.name}>`)
        .join(' ');
    }

    const paddedCmd = cmdStr.padEnd(25, ' ');
    lines.push(`${paddedCmd} - ${cmd.description.split('.')[0]}.`);

    if (cmd.parameters?.length) {
      lines.push('  Parameters:');
      cmd.parameters.forEach(p => {
        const status = p.required ? '(required)' :
          p.defaultValue !== undefined ? `(optional, default: ${p.defaultValue})` :
          '(optional)';
        const paramDesc = `    ${p.name.padEnd(15, ' ')} - ${p.description} ${status}`;
        lines.push(paramDesc);
      });
      lines.push(''); // Add empty line between commands
    }

    return lines.join('\n');
  };

  commands.forEach(cmd => {
    helpText.push(formatCommand(cmd));
  });

  return helpText.join('\n');
}

loadCommands();