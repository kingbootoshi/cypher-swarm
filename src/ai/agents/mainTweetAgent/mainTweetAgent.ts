import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
import { mainTweetAgentConfig } from './mainTweetAgentConfig';
import { MainTweetTool, mainTweetToolSchema } from './mainTweetTool';

// ChatAgent extends BaseAgent with no schema type (null)
export class MainTweetAgent extends BaseAgent<typeof mainTweetToolSchema> {
  constructor(modelClient: ModelClient) {
    super(mainTweetAgentConfig, modelClient, mainTweetToolSchema);
  }

  protected defineTools(): void {
    this.tools = [MainTweetTool];
  } 
}