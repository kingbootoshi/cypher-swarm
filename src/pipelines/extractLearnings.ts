// this file is responsible for in-taking short term chat history, extracting learnings from it, & summarizing it into a short term summary
// it is also responsible for checking if we have enough short term summaries to process into a mid term summary
// and if we have enough mid term summaries to process into a long term summary

import { ExtractorAgent } from '../ai/agents/extractorAgent/extractorAgent';
import { getShortTermHistory } from '../supabase/functions/terminal/terminalHistory';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { getFormattedInteractionSummary } from '../utils/extractTweetActions';
import { addWorldKnowledge, addCryptoKnowledge, addSelfKnowledge, addUserSpecificKnowledge, MessageTemplate } from '../memory/addMemories';
import { MemorySummaries } from '../supabase/functions/memory/summaries';
import { Learnings } from '../supabase/functions/memory/learnings';
import { summarizeSummaries } from './summarizeSummaries';

// turn on logging
Logger.enable();

// initialize an openAI extractor agent
const openAIClient = new OpenAIClient("gpt-4o");
const extractorAgent = new ExtractorAgent(openAIClient);

/**
 * Converts an array of learning strings into message template format
 * @param learnings Array of learning strings
 */
function formatLearningsToTemplate(learnings: string[]): MessageTemplate {
    // Convert each learning into a message object
    return learnings.map(learning => ({
        role: "user",
        content: learning
    }));
}

export async function extractAndSaveLearnings(sessionId: string) {
  try {
    // get the short term history and user tweet interactions
    const shortTermHistory = await getShortTermHistory(100);
    const userTweetInteractions = await getFormattedInteractionSummary();

    // load the short term history and user tweet interactions into the extractor agent
    extractorAgent.loadChatHistory(shortTermHistory);
    extractorAgent.addUserMessage("[SPECIFIC USER INTERACTIONS]\n" + userTweetInteractions);

    // run the extractor agent and get the learnings
    const learnings = await extractorAgent.run();
    Logger.log("LEARNINGS:", learnings);

    if (learnings?.output) {
        // Add world knowledge
        if (learnings.output.world_knowledge?.length > 0) {
            const worldTemplate = formatLearningsToTemplate(learnings.output.world_knowledge);
            await addWorldKnowledge(worldTemplate);
            Logger.log("Added world knowledge memories");

            // Save world knowledge learnings to database
            for (const learning of learnings.output.world_knowledge) {
                await Learnings.saveLearning('world_knowledge', learning, sessionId);
            }
        }

        // Add crypto ecosystem knowledge
        if (learnings.output.crypto_ecosystem_knowledge?.length > 0) {
            const cryptoTemplate = formatLearningsToTemplate(learnings.output.crypto_ecosystem_knowledge);
            await addCryptoKnowledge(cryptoTemplate);
            Logger.log("Added crypto ecosystem memories");

            // Save crypto ecosystem learnings to database
            for (const learning of learnings.output.crypto_ecosystem_knowledge) {
                await Learnings.saveLearning('crypto_ecosystem_knowledge', learning, sessionId);
            }
        }

        // Add self knowledge
        if (learnings.output.satoshi_self?.length > 0) {
            const selfTemplate = formatLearningsToTemplate(learnings.output.satoshi_self);
            await addSelfKnowledge(selfTemplate);
            Logger.log("Added self knowledge memories");

            // Save self knowledge learnings to database
            for (const learning of learnings.output.satoshi_self) {
                await Learnings.saveLearning('satoshi_self', learning, sessionId);
            }
        }

        // Add user-specific knowledge
        const userSpecific = learnings.output.user_specific;
        if (Array.isArray(userSpecific) && userSpecific.length > 0) {
            // Iterate through each user's learnings
            for (const userLearning of userSpecific) {
                const learningsList = userLearning?.learnings;
                if (Array.isArray(learningsList) && learningsList.length > 0) {
                    const userTemplate = formatLearningsToTemplate(learningsList);
                    await addUserSpecificKnowledge(userTemplate, userLearning.user_id);
                    Logger.log(`Added memories for user: ${userLearning.user_id}`);

                    // Save user-specific learnings to database
                    for (const learning of learningsList) {
                        await Learnings.saveLearning('user_specific', learning, sessionId, userLearning.user_id);
                    }
                }
            }
        }

        // Continue with existing summary saving logic
        if (learnings.output.summary) {
            await MemorySummaries.saveSummary('short', learnings.output.summary, sessionId);
            Logger.log("Successfully saved short-term summary to database");

            Logger.log("Triggering summary condensation process...");
            await summarizeSummaries(sessionId);
        }
    }

    return learnings;
  } catch (error) {
    Logger.log("Error in extractAndSaveLearnings:", error);
    throw error;
  }
}

// Test function to run the extraction process
async function testExtraction() {
    try {
      Logger.log('Starting test extraction...');
      
      // Generate a test sessionId
      const testSessionId = 'test-session-' + Date.now();
      
      // Run the extraction process
      const result = await extractAndSaveLearnings(testSessionId);
      
      Logger.log('Extraction completed successfully');
      Logger.log('Test session ID:', testSessionId);
      Logger.log('Extraction result:', JSON.stringify(result, null, 2));
      
      // Check if any short-term summaries need processing
      const needsProcessing = await MemorySummaries.checkAndProcessShortTermSummaries();
      Logger.log('Needs processing:', needsProcessing);
      
      return result;
    } catch (error) {
      Logger.log('Error in test extraction:', error);
      throw error;
    }
  }
  
  // Run the test if this file is executed directly
  if (require.main === module) {
    testExtraction()
      .then(() => {
        Logger.log('Test completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        Logger.log('Test failed:', error);
        process.exit(1);
      });
  }