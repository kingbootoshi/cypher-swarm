import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { MemorySummaries } from '../supabase/functions/memory/summaries';
import { SummaryAgent } from '../ai/agents/summaryAgent/summaryAgent';

// Enable logging for debugging purposes
Logger.enable();

// Initialize the OpenAI client with the desired model
const openAIClient = new OpenAIClient("gpt-4o");
const summaryAgent = new SummaryAgent(openAIClient);

/**
 * Fetches summaries from the database based on type and limit.
 * @param type The type of summaries to fetch ('short', 'mid', 'long').
 * @param limit The maximum number of summaries to fetch.
 */
async function fetchSummaries(type: 'short' | 'mid' | 'long', limit: number) {
  // Retrieve unprocessed summaries of the specified type from the database
  const summaries = await MemorySummaries.getUnprocessedSummaries(type, limit);
  return summaries;
}

/**
 * Condenses an array of summaries into a single summary using the SummaryAgent.
 * @param summaries Array of summary strings to condense.
 */
async function condenseSummaries(summaries: string[], summaryType: 'short' | 'mid' | 'long') {
  // Prepare the input for the summary agent
  const input = summaries.join('\n\n');

  // Create a summary context message based on the summaryType
  let summaryContext = '';
  if (summaryType === 'short') {
    summaryContext = '### YOU ARE CURRENTLY SUMMARIZING 5 SHORT TERM SUMMARIES INTO 1 MID TERM SUMMARY\n\n';
  } else if (summaryType === 'mid') {
    summaryContext = '### YOU ARE CURRENTLY SUMMARIZING 3 MID TERM SUMMARIES INTO 1 LONG TERM SUMMARY\n\n';
  } else if (summaryType === 'long') {
    summaryContext = '### YOU ARE CURRENTLY CONDENSING A NEW LONG TERM SUMMARY INTO THE EXISTING ONE\n\n';
  }

  // Run the summary agent to condense the summaries
  const condensedSummaries = await summaryAgent.run(
    summaryContext + "[CURRENT SUMMARIES TO CONDENSE]\n\n" + input
  );

  // Adjusted property access based on the agent's output structure
  return condensedSummaries.output.condensed_summary;
}

/**
 * Processes short-term summaries into a mid-term summary if needed.
 */
async function processShortTermSummaries(sessionId: string) {
  // Fetch up to 6 unprocessed short-term summaries
  const shortSummaries = await fetchSummaries('short', 6);

  // Check if we have 6 or more summaries
  if (shortSummaries.length >= 6) {
    // Condense the first 5 summaries into one mid-term summary
    const summariesToCondense = shortSummaries.slice(0, 5).map(s => s.summary);
    const condensedSummary = await condenseSummaries(summariesToCondense, 'short');

    // Save the new mid-term summary to the database
    await MemorySummaries.saveSummary('mid', condensedSummary, sessionId);
    Logger.log("New mid-term summary saved to the database.");

    // Mark the processed short-term summaries
    const idsToMark = shortSummaries.slice(0, 5).map(s => s.id);
    await MemorySummaries.markSummariesAsProcessed(idsToMark);
    Logger.log("Short-term summaries marked as processed.");
  }
}

/**
 * Processes mid-term summaries into a long-term summary if needed.
 */
async function processMidTermSummaries(sessionId: string) {
  // Fetch up to 3 unprocessed mid-term summaries
  const midSummaries = await fetchSummaries('mid', 3);

  // Check if we have 3 or more summaries
  if (midSummaries.length >= 3) {
    // Condense the first 3 summaries into one long-term summary
    const summariesToCondense = midSummaries.slice(0, 3).map(s => s.summary);
    const condensedSummary = await condenseSummaries(summariesToCondense, 'mid');

    // Mark the processed mid-term summaries
    const idsToMark = midSummaries.slice(0, 3).map(s => s.id);
    await MemorySummaries.markSummariesAsProcessed(idsToMark);
    Logger.log("Mid-term summaries marked as processed.");

    // Condense with existing long-term summary if it exists
    await processLongTermSummaries(sessionId, condensedSummary);
  }
}

/**
 * Condenses a new long-term summary with the existing one.
 * @param sessionId The current session ID.
 * @param newLongTermSummary The new long-term summary to condense.
 */
async function processLongTermSummaries(sessionId: string, newLongTermSummary: string) {
  // Fetch existing unprocessed long-term summaries
  const existingLongTermSummaries = await fetchSummaries('long', 1);

  if (existingLongTermSummaries.length > 0) {
    // Condense the existing and new long-term summaries
    const summariesToCondense = [
      existingLongTermSummaries[0].summary,
      newLongTermSummary,
    ];
    const condensedSummary = await condenseSummaries(summariesToCondense, 'long');

    // Mark the existing long-term summary as processed
    await MemorySummaries.markSummariesAsProcessed([existingLongTermSummaries[0].id]);
    Logger.log("Existing long-term summary marked as processed.");

    // Save the new condensed long-term summary
    Logger.log("Saving new condensed long-term summary...");
    await MemorySummaries.saveSummary('long', condensedSummary, sessionId);
    Logger.log("New long-term summary saved to the database.");
  } else {
    // No existing long-term summary
    Logger.log("No existing long-term summary. Saving new one...");
    await MemorySummaries.saveSummary('long', newLongTermSummary, sessionId);
    Logger.log("Long-term summary saved to the database.");
  }
}

/**
 * Main function to handle the summary condensation process.
 */
export async function summarizeSummaries(sessionId: string) {
  try {
    Logger.log("Starting the summary condensation process...");

    // Process short-term summaries into mid-term summaries if needed
    await processShortTermSummaries(sessionId);

    // Process mid-term summaries into long-term summaries if needed
    await processMidTermSummaries(sessionId);

    Logger.log("Summary condensation process completed.");
  } catch (error) {
    Logger.log("Error in summarizeSummaries:", error);
    throw error;
  }
}

// Test function to run the summary condensation process
async function testSummarizeSummaries() {
  try {
    Logger.log("Starting test of summarizeSummaries...");

    // Generate a test sessionId
    const testSessionId = 'test-session-' + Date.now();

    // Run the summary condensation process
    await summarizeSummaries(testSessionId);

    Logger.log("Test of summarizeSummaries completed successfully.");
    process.exit(0);
  } catch (error) {
    Logger.log("Test failed:", error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSummarizeSummaries();
}