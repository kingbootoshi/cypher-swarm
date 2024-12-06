import { MemorySummaries } from '../supabase/functions/memory/summaries';
import { getRecentMainTweets } from '../supabase/functions/twitter/tweetEntries';

// Initialize variables with default values
export let activeSummaries: string = 'Loading summaries...';
export let recentMainTweets: string = 'Loading recent tweets...';

/**
 * Initialize dynamic variables asynchronously
 * This should be called before starting the agent system
 */
export async function initializeDynamicVariables() {
  try {
    // Load summaries and tweets in parallel
    const [summaries, tweets] = await Promise.all([
      MemorySummaries.getFormattedActiveSummaries(),
      getRecentMainTweets()
    ]);
    
    // Update the variables
    activeSummaries = summaries;
    recentMainTweets = tweets;
    
    return { activeSummaries, recentMainTweets };
  } catch (error) {
    console.error('Error initializing dynamic variables:', error);
    throw error;
  }
}

// Export function to update variables individually if needed
export async function updateActiveSummaries() {
  activeSummaries = await MemorySummaries.getFormattedActiveSummaries();
  return activeSummaries;
}

export async function updateRecentMainTweets() {
  recentMainTweets = await getRecentMainTweets();
  return recentMainTweets;
}