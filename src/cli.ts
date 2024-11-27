// Simple CLI interface to accept user input

import readline from 'readline';
import { executeCommand } from './terminal/executeCommand';
import { ensureAuthenticated } from './twitter/twitterClient';
import { Logger } from './utils/logger';

Logger.enable();

/**
 * Initializes the CLI application for manual use to test AI functions
 * - Ensures Twitter authentication
 * - Sets up readline interface
 * - Starts accepting commands
 */

async function initializeCLI() {
  try {
    // Ensure Twitter authentication before starting
    console.log('Initializing Twitter authentication...');
    await ensureAuthenticated();
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\nWelcome to the Terminal. Use "help" to view available commands. Type commands below:');

    rl.on('line', async (input) => {
      const terminalOutput = await executeCommand(input.trim());
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