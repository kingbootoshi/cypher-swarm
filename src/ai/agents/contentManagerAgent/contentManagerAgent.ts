import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
import { contentManagerAgentConfig } from './contentManagerConfig';
import { PlanMainTweetTool, planMainTweetSchema } from './contentManagerTool';

// ChatAgent extends BaseAgent with no schema type (null)
export class ContentManagerAgent extends BaseAgent<typeof planMainTweetSchema> {
  constructor(modelClient: ModelClient) {
    super(contentManagerAgentConfig, modelClient, planMainTweetSchema);
  }

  protected defineTools(): void {
    this.tools = [PlanMainTweetTool];
  }
}