// this function is used to store the short term chat history of the terminal agent in supabase, and also to load the chat history into the terminal agent

import { Message } from '../../../ai/types/agentSystem';
import { Logger } from '../../../utils/logger';
import { supabase } from '../../supabaseClient';

type ValidRole = 'user' | 'assistant' | 'system';

/**
 * Stores a new message in the short term history buffer
 */
export async function storeTerminalMessage(
  message: Message,
  sessionId: string
): Promise<void> {
  try {
    // Validate role before inserting
    if (message.role === 'function') {
      Logger.log('Skipping function message, not storing in history');
      return;
    }

    const { error } = await supabase
      .from('short_term_terminal_history')
      .insert({
        role: message.role as ValidRole,
        content: message.content,
        session_id: sessionId
      });

    if (error) {
      Logger.log('Error storing terminal message:', error);
      throw error;
    }
  } catch (error) {
    Logger.log('Failed to store terminal message:', error);
    throw error;
  }
}

/**
 * Retrieves all messages from the short term history buffer
 * @returns Array of Message objects ordered by creation time
 */
export async function getShortTermHistory(): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('short_term_terminal_history')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      Logger.log('Error loading short term history:', error);
      throw error;
    }

    return data.map(entry => ({
      role: entry.role,
      content: entry.content
    }));
  } catch (error) {
    Logger.log('Failed to load short term history:', error);
    throw error;
  }
}

/**
 * Clears the entire short term history buffer
 */
export async function clearShortTermHistory(): Promise<void> {
  try {
    const { error } = await supabase
      .from('short_term_terminal_history')
      .delete()
      .gte('id', 0); // Delete all entries

    if (error) {
      Logger.log('Error clearing short term history:', error);
      throw error;
    }
  } catch (error) {
    Logger.log('Failed to clear short term history:', error);
    throw error;
  }
}