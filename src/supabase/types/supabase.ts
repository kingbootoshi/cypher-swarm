export type EntryType = 'thought' | 'command' | 'response';

export interface TerminalHistoryEntry {
  id: number;
  session_id: string;
  entry_type: EntryType;
  content: string;
  parent_id?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CreateTerminalEntry {
  session_id: string;
  entry_type: EntryType;
  content: string;
  parent_id?: number;
  metadata?: Record<string, any>;
}