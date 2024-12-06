import { MemorySummaries } from '../supabase/functions/memory/summaries';
import { getRecentMainTweets } from '../supabase/functions/twitter/tweetEntries';

export const activeSummaries = await MemorySummaries.getFormattedActiveSummaries();
export const recentMainTweets = await getRecentMainTweets();