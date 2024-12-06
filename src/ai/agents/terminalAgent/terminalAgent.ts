// src/ai/agents/TerminalAgent/TerminalAgent.ts
import { BaseAgent } from '../BaseAgent';
import { terminalAgentConfig } from './terminalAgentConfig';
import { ModelClient } from '../../types/agentSystem';
import { terminalToolSchema, TerminalTool } from './TerminalTool';  

export class TerminalAgent extends BaseAgent<typeof terminalToolSchema> {
  constructor(modelClient: ModelClient) {
    super(terminalAgentConfig, modelClient, terminalToolSchema);
  }

  protected defineTools(): void {
    this.tools = [TerminalTool];
  }
}