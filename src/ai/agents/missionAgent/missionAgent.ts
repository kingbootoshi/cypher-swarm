import { BaseAgent } from '../baseAgent';
import { missionAgentConfig } from './missionAgentConfig';
import { ModelClient } from '../../types/agentSystem';
import { MissionTool, missionToolSchema } from './missionTool';
import { Logger } from '../../../utils/logger';

export class MissionAgent extends BaseAgent<typeof missionToolSchema> {
  constructor(modelClient: ModelClient) {
    super(missionAgentConfig, modelClient, missionToolSchema);
    Logger.log('🎯 Mission Agent initialized');
  }

  protected defineTools(): void {
    this.tools = [MissionTool];
    Logger.log('🛠️ Mission Tools Defined:', this.tools.map(t => t.function.name));
  }
} 