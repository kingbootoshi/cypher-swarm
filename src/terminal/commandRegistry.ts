// Command registry for terminal commands

import fs from 'fs';
import path from 'path';
import { Command } from './types/commands';
/**
 * Registry mapping command names to their command objects.
 */
const commandRegistry: Map<string, Command> = new Map();

/**
 * Dynamically loads all command modules from the 'commands' directory.
 */
function loadCommands() {
  const commandsPath = path.resolve(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts'));

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

// Initialize the command registry
loadCommands();

/**
 * Retrieves a command by its name.
 * @param commandName - The name of the command.
 * @returns The command object or undefined if not found.
 */
export function getCommand(commandName: string): Command | undefined {
  return commandRegistry.get(commandName);
}

/**
 * Retrieves all registered commands.
 * @returns An array of command objects.
 */
export function getAllCommands(): Command[] {
  return Array.from(commandRegistry.values());
}