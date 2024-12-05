import { supabase } from '../../supabaseClient';
import { Logger } from '../../../utils/logger';

// Types for our learning data
interface LearningEntry {
  id: number;
  session_id: string | null;
  user_id: string | null;
  learning_type: 'world_knowledge' | 'crypto_ecosystem_knowledge' | 'satoshi_self' | 'user_specific';
  content: string;
  created_at?: string;
}

export class Learnings {
  // Save a learning entry
  static async saveLearning(
    learningType: 'world_knowledge' | 'crypto_ecosystem_knowledge' | 'satoshi_self' | 'user_specific',
    content: string,
    sessionId: string | null,
    userId: string | null = null
  ): Promise<void> {
    try {
      await supabase
        .from('learnings')
        .insert({
          learning_type: learningType,
          content,
          session_id: sessionId,
          user_id: userId,
        });
      Logger.log(`Successfully saved learning of type: ${learningType}`);
    } catch (error) {
      Logger.log('Error saving learning:', error);
    }
  }

  // Retrieve learnings by type
  static async getLearningsByType(
    learningType: 'world_knowledge' | 'crypto_ecosystem_knowledge' | 'satoshi_self' | 'user_specific',
    sessionId: string | null = null
  ): Promise<LearningEntry[]> {
    try {
      let query = supabase
        .from('learnings')
        .select('*')
        .eq('learning_type', learningType);

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        Logger.log('Error retrieving learnings:', error);
        return [];
      }

      return data as LearningEntry[];
    } catch (error) {
      Logger.log('Error retrieving learnings:', error);
      return [];
    }
  }

  // Add additional methods as needed
}
