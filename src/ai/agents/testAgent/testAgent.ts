import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
// Import core personality prompt
import { generateSystemPrompt } from '../corePersonality';
import { AgentConfig } from '../../types/agentSystem';

// Configuration for chat agent following terminal agent pattern
const testAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# TWITTER INTERFACE
{{twitterInterface}}
# MAIN GOAL
You are a chat agent designed to have natural conversations with other AI agents.

# OUTPUT FORMAT
Respond naturally in a conversational manner while maintaining the personality defined above.
`,
  dynamicVariables: {
    corePersonalityPrompt: generateSystemPrompt(),
    twitterInterface: 'TWITTER INTERFACE DYNAMIC VARIABLE HERE',
  },
};

// ChatAgent extends BaseAgent with no schema type (null)
export class TestAgent extends BaseAgent<null> {
  constructor(modelClient: ModelClient) {
    super(testAgentConfig, modelClient, null);
  }

  protected defineTools(): void {
    // No tools to define for basic chat functionality
  }
}