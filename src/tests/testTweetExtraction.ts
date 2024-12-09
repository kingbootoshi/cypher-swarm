// This test file replicates how extractLearnings.ts processes the short-term terminal history,
// extracts actions, finds interactions based on tweet IDs, and assembles interaction tables.

import { getShortTermHistory } from '../supabase/functions/terminal/terminalHistory';
import { Logger } from '../utils/logger';
import { getFormattedInteractionSummary } from '../utils/extractTweetActions';

// Enable logging
Logger.enable();

/**
 * Test function to replicate the extraction process from extractLearnings.ts
 */
async function testTweetExtraction() {
  try {
    Logger.log('Starting testTweetExtraction...');
    
    // Generate a test session ID
    const testSessionId = 'test-session-' + Date.now();

    // Fetch the short-term terminal history
    const shortTermHistory = await getShortTermHistory(100);
    Logger.log('Short-term history fetched:', shortTermHistory);

    // Get formatted user tweet interactions based on tweet IDs
    const userTweetInteractions = await getFormattedInteractionSummary();
    Logger.log('User tweet interactions:', userTweetInteractions);

    Logger.log('testTweetExtraction completed successfully');
  } catch (error) {
    Logger.log('Error in testTweetExtraction:', error);
    throw error;
  }
}

// Execute the test function if this file is run directly
if (require.main === module) {
  testTweetExtraction()
    .then(() => {
      Logger.log('Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      Logger.log('Test failed:', error);
      process.exit(1);
    });
}
