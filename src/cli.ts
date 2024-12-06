// Simple CLI interface to accept user input

import readline from 'readline';
import { executeCommand } from './terminal/executeCommand';
import { ensureAuthenticated } from './twitter/twitterClient';
import { Logger } from './utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './ai/types/agentSystem';
import { storeTerminalMessage } from './supabase/functions/terminal/terminalHistory';
import { createTerminalEntry, updateTerminalResponse } from './supabase/functions/terminal/terminalEntries';
import { initializeDynamicVariables } from './utils/dynamicVariables';

Logger.enable();

/**
 * Initializes the CLI application for manual use to test AI functions
 * - Ensures Twitter authentication
 * - Sets up readline interface
 * - Starts accepting commands
 * - Logs terminal history similar to AI system
 */

async function initializeCLI() {
  try {
    // Initialize dynamic variables first
    console.log('Initializing dynamic variables...');
    await initializeDynamicVariables();
    console.log('Dynamic variables initialized successfully');

    const sessionId = uuidv4(); // Generate unique session ID for this CLI session
    
    // Ensure Twitter authentication before starting
    console.log('Initializing Twitter authentication...');
    await ensureAuthenticated();
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nWelcome to the Terminal. Use "help" to view available commands. Type commands below:');

    rl.on('line', async (input) => {
      const trimmedInput = input.trim();
      
      // Create initial terminal entry for manual command
      const entryId = await createTerminalEntry(sessionId, {
        internal_thought: 'MANUAL CLI INPUT',
        plan: 'MANUAL CLI EXECUTION',
        terminal_command: trimmedInput
      });

      // Execute the command
      const terminalOutput = await executeCommand(trimmedInput);
      
      // Update terminal entry with response
      if (entryId) {
        await updateTerminalResponse(entryId, terminalOutput.output);
      }

      // Store the manual command as an assistant message
      const manualCommandMessage: Message = {
        role: 'assistant',
        content: 'MANUAL: ' + trimmedInput
      };
      await storeTerminalMessage(manualCommandMessage, sessionId);

      // Store the terminal output as a user message
      const terminalOutputMessage: Message = {
        role: 'user',
        content: `TERMINAL OUTPUT: ${terminalOutput.output}`
      };
      await storeTerminalMessage(terminalOutputMessage, sessionId);

      console.log("TERMINAL OUTPUT: ", terminalOutput);
    });

    // Handle CLI shutdown
    rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to initialize CLI:', error);
    process.exit(1);
  }
}

// Start the CLI
initializeCLI();