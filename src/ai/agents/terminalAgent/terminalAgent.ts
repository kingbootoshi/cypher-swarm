// src/ai/agents/TerminalAgent/TerminalAgent.ts
import { BaseAgent } from '../baseAgent';
import { terminalAgentConfig } from './terminalAgentConfig';
import { ModelClient } from '../../types/agentSystem';
import { terminalToolSchema, TerminalTool } from './terminalTool';

export class TerminalAgent extends BaseAgent {
  constructor(modelClient: ModelClient) {
    console.log('\n🤖 Initializing TerminalAgent:');
    console.log('⚙️ Terminal Agent Config:', {
      dynamicVars: terminalAgentConfig.dynamicVariables,
      mainGoal: terminalAgentConfig.mainGoal
    });
    
    super(terminalAgentConfig, modelClient, terminalToolSchema);
    
    console.log('✅ TerminalAgent initialized');
  }

  protected defineTools(): void {
    this.tools = [TerminalTool];
    console.log('🛠️ Terminal Tools Defined:', this.tools.map(t => t.function.name));
  }
}