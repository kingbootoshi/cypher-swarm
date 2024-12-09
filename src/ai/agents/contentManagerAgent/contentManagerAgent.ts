import { BaseAgent } from '../baseAgent';
import { ModelClient } from '../../types/agentSystem';
import { contentManagerAgentConfig } from './contentManagerConfig';
import { ContentManagerTool, contentManagerToolSchema } from './contentManagerTool';

// ChatAgent extends BaseAgent with no schema type (null)
export class ContentManagerAgent extends BaseAgent<typeof contentManagerToolSchema> {
  constructor(modelClient: ModelClient) {
    super(contentManagerAgentConfig, modelClient, contentManagerToolSchema);
  }

  protected defineTools(): void {
    this.tools = [ContentManagerTool];
  }
}