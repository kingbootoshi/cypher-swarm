// src/ai/agents/TerminalAgent/TerminalAgent.ts
import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
import { memoryAgentConfig } from './memoryAgentConfig';
import { memoryToolSchema, MemoryTool } from './memoryTool';

export class MemoryAgent extends BaseAgent<typeof memoryToolSchema> {
  constructor(modelClient: ModelClient) {
    super(memoryAgentConfig, modelClient, memoryToolSchema);
  }

  protected defineTools(): void {
    this.tools = [MemoryTool];
  }
}