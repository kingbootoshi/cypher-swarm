// Command registry for terminal commands

import fs from 'fs';
import path from 'path';
import { Command } from './types/commands';

/**
 * Registry mapping command names to their command objects.
 */
const commandRegistry: Map<string, Command> = new Map();

/**
 * Loads command modules dynamically using ES modules import
 */
export async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      // Use dynamic import instead of require
      const commandModule = await import(filePath);
      
      // Assume each module exports a single command
      const command = Object.values(commandModule)[0] as Command;

      if (command && command.name) {
        commandRegistry.set(command.name, command);
      } else {
        console.warn(`Invalid command module: ${file}`);
      }
    } catch (error) {
      console.error(`Error loading command from ${file}:`, error);
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
    let cmdStr = cmd.name;
    
    if (cmd.parameters?.length) {
      cmdStr += ' ' + cmd.parameters
        .map(p => `<${p.name}>`)
        .join(' ');
    }
    
    const paddedCmd = cmdStr.padEnd(25, ' ');
    return `${paddedCmd} - ${cmd.description}`;
  };

  commands.forEach(cmd => {
    helpText.push(formatCommand(cmd));
  });

  return helpText.join('\n');
}

// Initialize commands asynchronously
loadCommands().catch(error => {
  console.error('Failed to load commands:', error);
});