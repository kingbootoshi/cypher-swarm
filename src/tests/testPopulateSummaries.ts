import { supabase } from '../supabase/supabaseClient';
import { Logger } from '../utils/logger';
import { MemorySummaries } from '../supabase/functions/memory/summaries';
import { summarizeSummaries } from '../pipelines/summarizeSummaries';

// Enable logging for debugging
Logger.enable();

/**
 * Inserts test summaries into the memory_summaries table.
 * @param count Number of summaries to insert.
 * @param type The type of summaries ('short', 'mid', 'long').
 * @param sessionId Session ID for the summaries.
 */
async function insertTestSummaries(count: number, type: 'short' | 'mid' | 'long', sessionId: string | null) {
  for (let i = 0; i < count; i++) {
    const summaryContent = `Test ${type}-term summary ${i + 1}`;
    // For long-term summaries, sessionId should be null
    const summarySessionId = type === 'long' ? null : sessionId;
    await MemorySummaries.saveSummary(type, summaryContent, summarySessionId);
    Logger.log(`Inserted ${type}-term summary ${i + 1}`);
  }
}

/**
 * Main function to populate summaries and run tests.
 */
async function runTest() {
  try {
    Logger.log('Starting test to populate summaries...');

    // Generate a unique session ID for testing
    const testSessionId = 'test-session-' + Date.now();

    // Insert 6 short-term summaries to trigger summarization
    await insertTestSummaries(6, 'short', testSessionId);

    // Run the summarization pipeline
    Logger.log('Running summarization pipeline...');
    await summarizeSummaries(testSessionId);

    // Fetch and log the active memories after summarization
    const activeMemories = await MemorySummaries.getActiveMemories();
    Logger.log('Active Memories after summarization:', JSON.stringify(activeMemories, null, 2));

    // Insert additional short-term summaries to test repeated summarization
    await insertTestSummaries(5, 'short', testSessionId);

    // Run the summarization pipeline again
    Logger.log('Running summarization pipeline...');
    await summarizeSummaries(testSessionId);

    // Fetch and log the active memories after second summarization
    const updatedMemories = await MemorySummaries.getActiveMemories();
    Logger.log('Active Memories after second summarization:', JSON.stringify(updatedMemories, null, 2));

    // Insert mid-term summaries to trigger mid-to-long-term summarization
    await insertTestSummaries(3, 'mid', testSessionId);

    // Run the summarization pipeline again
    Logger.log('Running summarization pipeline for mid-term summaries...');
    await summarizeSummaries(testSessionId);

    // Fetch and log the active memories after mid-term summarization
    const finalMemories = await MemorySummaries.getActiveMemories();
    Logger.log('Active Memories after mid-term summarization:', JSON.stringify(finalMemories, null, 2));

    // Insert a long-term summary to test long-term summarization
    await insertTestSummaries(1, 'long', null);

    // Run the summarization pipeline again
    Logger.log('Running summarization pipeline for long-term summaries...');
    await summarizeSummaries(testSessionId);

    // Fetch and log the active memories after long-term summarization
    const longTermMemories = await MemorySummaries.getActiveMemories();
    Logger.log('Active Memories after long-term summarization:', JSON.stringify(longTermMemories, null, 2));

    // Optionally, clean up the test data after verification
    // await cleanupTestSummaries(testSessionId);

  } catch (error) {
    Logger.log('Error during testing:', error);
  }
}

/**
 * Cleans up test summaries from the database.
 * @param sessionId Session ID used during the test.
 */
async function cleanupTestSummaries(sessionId: string) {
  try {
    const { error } = await supabase
      .from('memory_summaries')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      Logger.log('Error during cleanup:', error);
    } else {
      Logger.log('Test summaries cleaned up successfully.');
    }
  } catch (error) {
    Logger.log('Error during cleanup:', error);
  }
}

// Execute the test
runTest();