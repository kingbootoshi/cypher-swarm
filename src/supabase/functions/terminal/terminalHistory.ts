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
        content: message.content || '',
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
      role: entry.role as Message['role'],
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

/**
 * Gets the most recent terminal history formatted as a single string
 * @param limit Number of recent messages to retrieve (defaults to 10)
 * @returns Formatted string containing the recent terminal history
 */
export async function getFormattedRecentHistory(limit: number = 10): Promise<string> {
  try {
    // Get recent messages from supabase
    const { data, error } = await supabase
      .from('short_term_terminal_history')
      .select('*')
      .order('created_at', { ascending: false }) // Get most recent first
      .limit(limit);

    if (error) {
      Logger.log('Error loading recent history:', error);
      throw error;
    }

    // Reverse the array to show oldest first
    const recentHistory = data.reverse();

    // Format the history into a string
    return recentHistory
      .map((entry, index) => {
        const separator = index === 0 ? '' : '\n-------------------\n';
        return `${separator}[${entry.role.toUpperCase()}]:\n${entry.content}`;
      })
      .join('');
  } catch (error) {
    Logger.log('Failed to load formatted recent history:', error);
    throw error;
  }
}