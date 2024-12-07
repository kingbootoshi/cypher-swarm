// src/ai/agents/TerminalAgent/TerminalAgent.ts
import { BaseAgent } from '../baseAgent';
import { extractorAgentConfig } from './extractorAgentConfig';
import { ModelClient } from '../../types/agentSystem';
import { extractorToolSchema, ExtractorTool } from './extractorTool';

export class ExtractorAgent extends BaseAgent<typeof extractorToolSchema> {
  constructor(modelClient: ModelClient) {
    super(extractorAgentConfig, modelClient, extractorToolSchema);
  }

  protected defineTools(): void {
    this.tools = [ExtractorTool];
  }
}