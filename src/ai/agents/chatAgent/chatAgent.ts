import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';

// Example config for a simple chat agent
const chatAgentConfig = {
  personalityPrompt: `You are an AI agent.`,
  mainGoal: `You will be talking to another AI agent.`,
  outputFormat: `Respond naturally in a conversational manner.`,
  dynamicVariables: {
    'UserName': 'User',
  },
};

// ChatAgent extends BaseAgent with no schema type (null)
export class ChatAgent extends BaseAgent<null> {
  constructor(modelClient: ModelClient) {
    super(chatAgentConfig, modelClient, null);
  }

  protected defineTools(): void {
    // No tools to define
  }
}