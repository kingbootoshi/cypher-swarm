// Core terminal command execution logic with parameter parsing

import { parse } from 'shell-quote';
import { getAllCommands, getCommand } from './commandRegistry';
import { logTerminalOutput } from '../utils/terminalLogger';
import type { CommandParameter } from './types/commands';

/**
 * Parses argument tokens into named parameters based on parameter definitions.
 * @param tokens - The array of argument tokens.
 * @param parameters - The command's parameter definitions.
 * @returns An object mapping parameter names to their values.
 */
function parseArguments(
  tokens: string[],
  parameters: CommandParameter[]
): { [key: string]: any } {
  const args: { [key: string]: any } = {};
  let tokenIndex = 0;

  for (const param of parameters) {
    let value: any;

    if (tokenIndex < tokens.length) {
      value = tokens[tokenIndex++];
    } else if (param.required) {
      throw new Error(`Missing required parameter: ${param.name}`);
    } else if (param.defaultValue !== undefined) {
      value = param.defaultValue;
    }

    // Type conversion
    if (param.type && value !== undefined) {
      switch (param.type) {
        case 'number':
          value = Number(value);
          if (isNaN(value)) {
            throw new Error(`Parameter '${param.name}' must be a number.`);
          }
          break;
        case 'boolean':
          value = value === 'true' || value === true;
          break;
        // Additional types can be added as needed
      }
    }

    args[param.name] = value;
  }

  return args;
}

/**
 * Pre-processes the command line to escape special characters in quoted strings
 * @param commandLine - Raw command line input
 * @returns Processed command line with escaped special characters
 */
function preprocessCommandLine(commandLine: string): string {
  // Match quoted strings (both single and double quotes)
  return commandLine.replace(/(["'])(.*?)\1/g, (match, quote, content) => {
    // Escape $ symbols within quoted strings
    const escaped = content.replace(/\$/g, '\\$');
    return `${quote}${escaped}${quote}`;
  });
}

/**
 * Executes multiple terminal commands sequentially and bundles their outputs
 * @param commands - Array of command objects containing the commands to execute
 * @returns Combined execution result with all outputs
 */
export async function executeMultipleCommands(
  commands: { command: string }[]
): Promise<{
  commands: string[];
  output: string;
}> {
  const outputs: string[] = [];
  const executedCommands: string[] = [];

  for (const cmd of commands) {
    const result = await executeCommand(cmd.command);
    outputs.push(result.output);
    executedCommands.push(result.command);
  }

  // Bundle all outputs together with command prefixes
  const bundledOutput = executedCommands.map((cmd, index) => 
    `$ ${cmd}\n${outputs[index]}`
  ).join('\n\n');

  return {
    commands: executedCommands,
    output: bundledOutput
  };
}

/**
 * Executes a single terminal command and returns the result.
 * @param commandLine - The command line input as a string.
 * @returns The command execution result.
 */
export async function executeCommand(
  commandLine: string
): Promise<{
  command: string;
  output: string;
}> {
  if (!commandLine) {
    const output = 'Error: No command provided';
    logTerminalOutput(commandLine, output);
    return {
      command: '',
      output,
    };
  }

  // Preprocess the command line before parsing
  const processedCommand = preprocessCommandLine(commandLine.trim());
  const tokens = parse(processedCommand);
  
  // Unescape the tokens after parsing
  const unescapedTokens = tokens.map(token => 
    typeof token === 'string' ? token.replace(/\\\$/g, '$') : token
  );

  const [commandName, ...argsTokens] = unescapedTokens;

  const command = getCommand(commandName);

  if (command) {
    try {
      let args: { [key: string]: any } = {};

      if (command.parameters && command.parameters.length > 0) {
        args = parseArguments(argsTokens as string[], command.parameters);
      }

      const result = await command.handler(args);
      logTerminalOutput(commandLine, result.output);
      return {
        command: commandLine,
        output: result.output,
      };
    } catch (error) {
      const output = `Error executing command '${commandName}': ${error.message || error}`;
      logTerminalOutput(commandLine, output);
      return {
        command: commandLine,
        output,
      };
    }
  } else {
    const output = `Unknown command: ${commandName}`;
    logTerminalOutput(commandLine, output);
    return {
      command: commandLine,
      output,
    };
  }
}