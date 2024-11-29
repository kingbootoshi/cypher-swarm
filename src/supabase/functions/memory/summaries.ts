import { supabase } from '../../supabaseClient';
import { Logger } from '../../../utils/logger';

// Types for our summary data
interface MemorySummary {
  id: number;
  summary_type: 'short' | 'mid' | 'long';
  summary: string;
  processed: boolean;
  session_id: string | null;
  created_at?: string;
  last_updated?: string;
}

export class MemorySummaries {
  // Save any type of summary
  static async saveSummary(
    summaryType: 'short' | 'mid' | 'long',
    summary: string,
    sessionId: string | null
  ): Promise<void> {
    try {
      await supabase
        .from('memory_summaries')
        .insert({
          summary_type: summaryType,
          summary,
          session_id: sessionId,
          processed: false
        });
    } catch (error) {
      Logger.log('Error saving summary:', error);
    }
  }


  // Mark summaries as processed after AI has processed them
  static async markSummariesAsProcessed(summaryIds: number[]): Promise<void> {
    try {
      await supabase
        .from('memory_summaries')
        .update({ processed: true })
        .in('id', summaryIds);
    } catch (error) {
      Logger.log('Error marking summaries as processed:', error);
    }
  }

  // Update or create long-term summary
  static async updateLongTermSummary(summary: string): Promise<void> {
    try {
      // Get the current active (unprocessed) long-term summary if it exists
      const { data: currentLongTerm } = await supabase
        .from('memory_summaries')
        .select('*')
        .eq('summary_type', 'long')
        .eq('processed', false)
        .single();

      // If there's an existing unprocessed long-term summary, mark it as processed
      if (currentLongTerm) {
        await supabase
          .from('memory_summaries')
          .update({ processed: true })
          .eq('id', currentLongTerm.id);
      }

      // Create new long-term summary
      await supabase
        .from('memory_summaries')
        .insert({
          summary_type: 'long',
          summary,
          session_id: null,
          processed: false
        });
    } catch (error) {
      Logger.log('Error updating long-term summary:', error);
    }
  }

  // Get active memories for the AI
  static async getActiveMemories(): Promise<{
    short: MemorySummary[];
    mid: MemorySummary[];
    long: MemorySummary | null;
  }> {
    try {
      // Get latest unprocessed short-term summaries (up to 5)
      const { data: shortTerm = [] } = await supabase
        .from('memory_summaries')
        .select('*')
        .eq('summary_type', 'short')
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get latest unprocessed mid-term summaries (up to 3)
      const { data: midTerm = [] } = await supabase
        .from('memory_summaries')
        .select('*')
        .eq('summary_type', 'mid')
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(3);

      // Get the latest unprocessed long-term summary
      const { data: longTerm } = await supabase
        .from('memory_summaries')
        .select('*')
        .eq('summary_type', 'long')
        .eq('processed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        short: shortTerm as MemorySummary[],
        mid: midTerm as MemorySummary[],
        long: longTerm as MemorySummary
      };
    } catch (error) {
      Logger.log('Error getting active memories:', error);
      return {
        short: [],
        mid: [],
        long: null
      };
    }
  }

  // New function to check if we need to process short-term summaries
  static async checkAndProcessShortTermSummaries(): Promise<boolean> {
    try {
      // Get all unprocessed short-term summaries
      const shortTerms = await this.getUnprocessedSummaries('short', 6);
      
      // If we have 6 or more, we should process them
      return shortTerms.length >= 6;
    } catch (error) {
      Logger.log('Error checking short-term summaries:', error);
      return false;
    }
  }

  // New function to check if we need to process mid-term summaries
  static async checkAndProcessMidTermSummaries(): Promise<boolean> {
    try {
      // Get all unprocessed mid-term summaries
      const midTerms = await this.getUnprocessedSummaries('mid', 3);
      
      // If we have 3 or more, we should process them
      return midTerms.length >= 3;
    } catch (error) {
      Logger.log('Error checking mid-term summaries:', error);
      return false;
    }
  }

  // Modified to get oldest unprocessed summaries first
  static async getUnprocessedSummaries(
    summaryType: 'short' | 'mid' | 'long',
    limit: number
  ): Promise<MemorySummary[]> {
    try {
      const { data } = await supabase
        .from('memory_summaries')
        .select('*')
        .eq('summary_type', summaryType)
        .eq('processed', false)
        .order('created_at', { ascending: true }) // Get oldest first
        .limit(limit);

      return (data || []) as MemorySummary[];
    } catch (error) {
      Logger.log('Error getting unprocessed summaries:', error);
      return [];
    }
  }
}
