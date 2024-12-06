// src/ai/agents/TerminalAgent/TerminalAgent.ts
import { BaseAgent } from '../BaseAgent';
import { summaryAgentConfig } from './summaryAgentConfig';
import { ModelClient } from '../../types/agentSystem';
import { summaryTool, summaryToolSchema } from './summaryTool';

export class SummaryAgent extends BaseAgent<typeof summaryToolSchema> {
  constructor(modelClient: ModelClient) {
    super(summaryAgentConfig, modelClient, summaryToolSchema);
  }

  protected defineTools(): void {
    this.tools = [summaryTool];
  }
}