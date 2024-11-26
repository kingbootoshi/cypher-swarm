import { supabase } from '../supabaseClient';
import { ToolOutputFromSchema } from '../../ai/types/agentSystem';
import { terminalToolSchema } from '../../ai/agents/TerminalAgent/terminalTool';

type TerminalToolOutput = ToolOutputFromSchema<typeof terminalToolSchema>;

/**
 * Logs a terminal interaction with its related entries
 */
export async function logTerminalInteraction(
  sessionId: string,
  output: TerminalToolOutput
) {
  try {
    // Log thought and get its ID
    const { data: thoughtEntry } = await supabase
      .from('terminal_history')
      .insert({
        session_id: sessionId,
        entry_type: 'thought',
        content: output.internal_thought,
        metadata: { plan: output.plan }
      })
      .select('id')
      .single();

    // Log command with thought as parent
    const { data: commandEntry } = await supabase
      .from('terminal_history')
      .insert({
        session_id: sessionId,
        entry_type: 'command',
        content: output.terminal_command,
        parent_id: thoughtEntry?.id
      })
      .select('id')
      .single();

    return commandEntry?.id;
  } catch (error) {
    console.error('Error logging terminal interaction:', error);
    return null;
  }
}

/**
 * Logs a command response
 */
export async function logCommandResponse(
  sessionId: string,
  response: string,
  parentId?: number
) {
  try {
    const { data } = await supabase
      .from('terminal_history')
      .insert({
        session_id: sessionId,
        entry_type: 'response',
        content: response,
        parent_id: parentId
      })
      .select('id')
      .single();

    return data?.id;
  } catch (error) {
    console.error('Error logging command response:', error);
    return null;
  }
} 