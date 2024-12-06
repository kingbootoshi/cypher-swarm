import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
import { replyAgentConfig } from './replyAgentConfig';
import { ReplyTweetTool, replyTweetToolSchema } from './replyTool';

// ChatAgent extends BaseAgent with no schema type (null)
export class ReplyAgent extends BaseAgent<typeof replyTweetToolSchema> {
  constructor(modelClient: ModelClient) {
    super(replyAgentConfig, modelClient, replyTweetToolSchema);
  }

  protected defineTools(): void {
    this.tools = [ReplyTweetTool];
  } 
}