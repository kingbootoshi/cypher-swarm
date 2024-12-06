import { MemorySummaries } from '../supabase/functions/memory/summaries';
import { Logger } from '../utils/logger';

Logger.enable();

async function testSummaries() {
  try {
    // First, let's check what raw memories we have
    const rawMemories = await MemorySummaries.getActiveMemories();
    Logger.log('Raw active memories:', rawMemories);

    // Then get the formatted version
    const activeSummaries = await MemorySummaries.getFormattedActiveSummaries();
    Logger.log('Formatted summaries:', activeSummaries);
  } catch (error) {
    Logger.log('Error in test:', error);
  }
}

// Run the test
testSummaries();