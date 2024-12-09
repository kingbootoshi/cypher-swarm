import { supabase } from '../../supabaseClient';
import { ToolOutputFromSchema } from '../../../ai/types/agentSystem';
import { terminalToolSchema } from '../../../ai/agents/terminalAgent/terminalTool';

type TerminalToolOutput = ToolOutputFromSchema<typeof terminalToolSchema>;

/**
 * Creates a new terminal entry in the database
 * @param sessionId - The current session ID
 * @param output - The terminal tool output containing thoughts, plan, and commands
 * @returns The ID of the created entry
 */
export async function createTerminalEntry(
  sessionId: string,
  output: TerminalToolOutput
) {
  try {
    // Convert commands array to string for storage
    const commandsString = output.terminal_commands
      .map(cmd => cmd.command)
      .join('\n');

    const { data: entry } = await supabase
      .from('terminal_history')
      .insert({
        session_id: sessionId,
        internal_thought: output.internal_thought,
        plan: output.plan,
        command: commandsString, // Store all commands as a newline-separated string
        terminal_log: null // Will be updated when we get response
      })
      .select('id')
      .single();

    return entry?.id;
  } catch (error) {
    console.error('Error creating terminal entry:', error);
    return null;
  }
}

/**
 * Updates the terminal entry with the command response
 */
export async function updateTerminalResponse(
  entryId: number,
  response: string
) {
  try {
    const { data } = await supabase
      .from('terminal_history')
      .update({ terminal_log: response })
      .eq('id', entryId)
      .select()
      .single();

    return data?.id;
  } catch (error) {
    console.error('Error updating terminal response:', error);
    return null;
  }
}

/**
 * Updates the terminal's active status
 */
export async function updateTerminalStatus(isActive: boolean) {
  try {
    const { data } = await supabase
      .from('terminal_status')
      .update({ 
        is_active: isActive,
        last_updated: new Date().toISOString()
      })
      .eq('id', true)
      .select()
      .single();

    return data?.is_active;
  } catch (error) {
    console.error('Error updating terminal status:', error);
    return null;
  }
}

/**
 * Gets the current terminal status
 */
export async function getTerminalStatus() {
  try {
    const { data } = await supabase
      .from('terminal_status')
      .select('is_active, last_updated')
      .eq('id', true)
      .single();

    return data;
  } catch (error) {
    console.error('Error getting terminal status:', error);
    return null;
  }
} 