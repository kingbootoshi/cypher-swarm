import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
// Import core personality prompt
import { corePersonalityPrompt } from '../corePersonality';
import { AgentConfig } from '../../types/agentSystem';

// Configuration for chat agent following terminal agent pattern
const quoteAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# TWITTER INTERFACE
{{twitterInterface}}

# MAIN GOAL
You are a twitter quote agent designed to quote tweets.

# OUTPUT FORMAT
Respond naturally in a conversational manner while maintaining the personality defined above. Use loaded context to inform your response.
`,
  dynamicVariables: {
    corePersonalityPrompt: corePersonalityPrompt,
    twitterInterface: 'TWITTER INTERFACE DYNAMIC VARIABLE HERE',
  },
};

// ChatAgent extends BaseAgent with no schema type (null)
export class QuoteAgent extends BaseAgent<null> {
  constructor(modelClient: ModelClient) {
    super(quoteAgentConfig, modelClient, null);
  }

  protected defineTools(): void {
    // No tools to define for basic chat functionality
  }
}