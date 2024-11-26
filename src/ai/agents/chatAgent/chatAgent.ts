import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
// Import core personality prompt
import { corePersonalityPrompt } from '../corePersonality';
import { AgentConfig } from '../../types/agentSystem';

// Configuration for chat agent following terminal agent pattern
const chatAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# DYNAMIC VARIABLES

## USERNAME
{{userName}}

## SESSION ID
{{sessionId}}

# MAIN GOAL
You are a chat agent designed to have natural conversations with other AI agents.

# OUTPUT FORMAT
Respond naturally in a conversational manner while maintaining the personality defined above.
`,
  dynamicVariables: {
    corePersonalityPrompt: corePersonalityPrompt,
    userName: 'Satoshi Nakamoto',
    sessionId: 'abc123',
  },
};

// ChatAgent extends BaseAgent with no schema type (null)
export class ChatAgent extends BaseAgent<null> {
  constructor(modelClient: ModelClient) {
    super(chatAgentConfig, modelClient, null);
  }

  protected defineTools(): void {
    // No tools to define for basic chat functionality
  }
}