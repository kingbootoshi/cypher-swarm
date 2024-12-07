import { BaseAgent } from '../baseAgent';
import { ModelClient } from '../../types/agentSystem';
import { verifyRetweetAgentConfig } from './verifyRetweetAgentConfig';
import { VerifyRetweetTool, verifyRetweetToolSchema } from './verifyRetweetTool';

// ChatAgent extends BaseAgent with no schema type (null)
export class VerifyRetweetAgent extends BaseAgent<typeof verifyRetweetToolSchema> {
  constructor(modelClient: ModelClient) {
    super(verifyRetweetAgentConfig, modelClient, verifyRetweetToolSchema);
  }

  protected defineTools(): void {
    this.tools = [VerifyRetweetTool];
  } 
}