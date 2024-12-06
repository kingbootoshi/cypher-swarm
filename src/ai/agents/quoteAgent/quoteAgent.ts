import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
import { quoteAgentConfig } from './quoteAgentConfig';
import { QuoteTweetTool, quoteTweetToolSchema } from './quoteTool';

// ChatAgent extends BaseAgent with no schema type (null)
export class QuoteAgent extends BaseAgent<typeof quoteTweetToolSchema> {
  constructor(modelClient: ModelClient) {
    super(quoteAgentConfig, modelClient, quoteTweetToolSchema);
  }

  protected defineTools(): void {
    this.tools = [QuoteTweetTool];
  } 
}