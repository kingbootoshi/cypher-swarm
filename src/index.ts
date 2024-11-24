// src/ai/index.ts

import { TerminalAgent } from './ai/agents/TerminalAgent/TerminalAgent';
import { FireworkClient } from './ai/models/clients/FireworkClient';
import { OpenAIClient } from './ai/models/clients/OpenAiClient';
import { AnthropicClient } from './ai/models/clients/AnthropicClient';
import { executeCommand } from './terminal/executeCommand';
import { ensureAuthenticated } from './twitter/twitterClient';
import { ModelType } from './ai/types/agentSystem';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Starts the AI system, which will run indefinitely until the maximum number of actions is reached.
 */ 

// Helper function to get model client based on user selection, for initial testing.
function getModelClient(modelType: ModelType) {
  switch(modelType.toLowerCase()) {
    case 'openai':
      return new OpenAIClient('gpt-4o', { temperature: 1 });
    case 'firework':
      return new FireworkClient("accounts/fireworks/models/llama-v3p1-405b-instruct", { temperature: 1 });
    case 'anthropic':
      return new AnthropicClient("claude-3-5-haiku-20241022", { temperature: 1 });
    default:
      throw new Error('Invalid model type. Please choose "openai", "firework", or "anthropic"');
  }
}

export async function startAISystem() {
  // Prompt user for model type if not provided via command line or env var
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Helper to get model type via CLI prompt
  const getModelTypeFromUser = (): Promise<ModelType> => {
    return new Promise((resolve, reject) => {
      readline.question('Which model would you like to use? (openai/firework/anthropic): ', (answer: string) => {
        const normalizedAnswer = answer.toLowerCase().trim() as ModelType;
        
        if (['openai', 'firework', 'anthropic'].includes(normalizedAnswer)) {
          readline.close();
          resolve(normalizedAnswer);
        } else {
          readline.close();
          reject(new Error('Invalid model type. Please choose "openai", "firework", or "anthropic"'));
        }
      });
    });
  };

  const modelType = await getModelTypeFromUser();
  console.log(`Using ${modelType} model client...`);
  const modelClient = getModelClient(modelType);
  const terminalAgent = new TerminalAgent(modelClient);

  // Add a default user message to initialize the conversation
  terminalAgent.addMessage({
    role: 'user',
    content: 'TERMINAL ONLINE',
  });

  let actionCount = 0;
  const MAX_ACTIONS = 30;

  while (actionCount < MAX_ACTIONS) {
    try {
      // Ensure Twitter authentication before starting
      console.log('Initializing Twitter authentication...');
      await ensureAuthenticated();

      const functionResult = await terminalAgent.run();

      // Extract the terminal command
      const terminalCommand = functionResult.terminal_command;

      // Execute the terminal command
      const commandOutput = await executeCommand(terminalCommand);

      // Format the output properly before adding to message history
      const formattedOutput = typeof commandOutput === 'object' 
        ? JSON.stringify(commandOutput.output || commandOutput, null, 2)
        : commandOutput;

      // Add the command output to the agent's message history
      terminalAgent.addMessage({
        role: 'user',
        content: `TERMINAL OUTPUT: ${formattedOutput}`,
      });

      // Optionally, sleep between actions
      await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 seconds

      actionCount++;
    } catch (error) {
      console.error('Error in AI system loop:', error);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait before retrying
    }
  }
}

startAISystem();