// src/ai/index.ts

import { TerminalAgent } from './ai/agents/terminalAgent/terminalAgent';
import { AnthropicClient } from './ai/models/clients/AnthropicClient';
import { executeCommand, executeMultipleCommands } from './terminal/executeCommand';
import { ensureAuthenticated } from './twitter/twitterClient';
import { ModelType, Message } from './ai/types/agentSystem';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './utils/logger';
import { createTerminalEntry, updateTerminalResponse, updateTerminalStatus } from './supabase/functions/terminal/terminalEntries';
import { 
  storeTerminalMessage, 
  getShortTermHistory, 
  clearShortTermHistory 
} from './supabase/functions/terminal/terminalHistory';
import { extractAndSaveLearnings } from './pipelines/extractLearnings';
import { getCurrentTimestamp } from './utils/formatTimestamps';
import { OpenAIClient } from './ai/models/clients/OpenAiClient';
import { getCooldownStatus } from './supabase/functions/twitter/cooldowns';
import { missionSystem } from './missions/systems/missionSystem';

Logger.enable();

dotenv.config();

/**
 * Returns a random number between min and max (inclusive)
 */
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Starts the AI system, which will run indefinitely with idle periods.
 */ 

export async function startAISystem() {
  try {
    const sessionId = uuidv4();
    await ensureAuthenticated();
    
    // const modelClient = new AnthropicClient("claude-3-5-haiku-20241022", { temperature: 1 });
    const modelClient = new OpenAIClient("gpt-4o-mini");

    // Set initial active status
    await updateTerminalStatus(true);
    Logger.log('Terminal status set to active');

    while (true) { // Run indefinitely with idle periods
      try {
        let actionCount = 0;
        const MAX_ACTIONS = 20; // Reduced for testing

        // Active period
        while (actionCount < MAX_ACTIONS) {
          // Start a new TerminalAgent instance
          const terminalAgent = new TerminalAgent(modelClient);

          // Load the latest short-term history into the new agent
          try {
            const shortTermHistory = await getShortTermHistory(10);
            if (shortTermHistory.length > 0) {
              Logger.log('Loading existing short-term history...');
              terminalAgent.loadChatHistory(shortTermHistory);
            }
          } catch (error) {
            Logger.log('Error loading short-term history:', error);
          }

          // Get current mission
          const currentMission = missionSystem.getCurrentMission();

          const functionResult = await terminalAgent.run(
            `REMEMBER YOUR PRIORITIES! 
             ${await getCooldownStatus()}
             ${await missionSystem.getMissionStatus()}`
          );

          if (!functionResult.success) {
            throw new Error(functionResult.error);
          }

          // Create initial terminal entry
          const entryId = await createTerminalEntry(sessionId, {
            internal_thought: functionResult.output.internal_thought,
            plan: functionResult.output.plan,
            terminal_commands: functionResult.output.terminal_commands
          });

          if (!entryId) {
            throw new Error('Failed to create terminal entry');
          }

          // Execute commands and get bundled output
          const commandOutput = await executeMultipleCommands(functionResult.output.terminal_commands);

          // Update the same entry with the bundled response
          await updateTerminalResponse(entryId, commandOutput.output);

          // Retrieve the last assistant message from the agent's message history
          const lastAssistantMessage = terminalAgent.getLastAgentMessage();

          if (lastAssistantMessage) {
            // Store agent's response in short-term history
            await storeTerminalMessage(lastAssistantMessage, sessionId);
          }

          // Store terminal output in short-term history and update agent's message history
          const terminalOutputMessage: Message = {
            role: 'user',
            content: `TERMINAL OUTPUT ${getCurrentTimestamp()}: ${
              typeof commandOutput.output === 'object' 
                ? JSON.stringify(commandOutput.output, null, 2)
                : commandOutput.output
            }`,
          };
          terminalAgent.addMessage(terminalOutputMessage);
          await storeTerminalMessage(terminalOutputMessage, sessionId);

          // Check mission every 5 cycles
          if (actionCount % 5 === 0) {
            Logger.log('🎯 Scheduled mission check...');
            await executeCommand(`get-mission-status ${currentMission?.id || ''}`);
          }

          await new Promise((resolve) => setTimeout(resolve, 120000));
          actionCount++;
        }

        // Before entering idle mode, initiate the memory process, and wipe the short term history
        try {
          Logger.log('Initiating memory processing...');
          await extractAndSaveLearnings(sessionId);
          await clearShortTermHistory();
          Logger.log('Memory processing complete, short-term history cleared');
        } catch (error) {
          Logger.log('Error during memory processing:', error);
        }

        // Enter idle mode
        const idleMinutes = getRandomInt(30, 60);
        Logger.log(`Entering idle mode for ${idleMinutes} minutes`);
        await updateTerminalStatus(false);

        // Idle period
        await new Promise((resolve) => setTimeout(resolve, idleMinutes * 60 * 1000));

        // Resume active mode
        Logger.log('Resuming active mode');
        await updateTerminalStatus(true);

      } catch (error) {
        console.error('Error in AI system loop:', error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    console.error('Error in AI system:', error);
  }
}

startAISystem();