import { MemorySummaries } from '../supabase/functions/memory/summaries';

export const activeSummaries = await MemorySummaries.getFormattedActiveSummaries();