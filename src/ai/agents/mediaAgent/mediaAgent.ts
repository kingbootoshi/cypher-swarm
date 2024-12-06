import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
import { mediaAgentConfig } from './mediaAgentConfig';
import { MediaTool, mediaToolSchema } from './mediaTool';

// ChatAgent extends BaseAgent with no schema type (null)
export class MediaAgent extends BaseAgent<typeof mediaToolSchema> {
  constructor(modelClient: ModelClient) {
    super(mediaAgentConfig, modelClient, mediaToolSchema);
  }

  protected defineTools(): void {
    this.tools = [MediaTool];
  } 
}
