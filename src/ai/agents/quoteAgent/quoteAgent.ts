import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
import { corePersonalityPrompt } from '../corePersonality';
import { AgentConfig } from '../../types/agentSystem';
import { activeSummaries } from '../../../utils/dynamicVariables';

// Configuration for chat agent following terminal agent pattern
const quoteAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# CURRENT SUMMARIES
{{currentSummaries}}

# MEMORIES
{{memories}}

# TWITTER INTERFACE
{{twitterInterface}}

# MAIN GOAL
You are a twitter quote agent designed to quote tweets.

# OUTPUT FORMAT
Respond naturally in a conversational manner while maintaining the personality defined above. Use loaded context to inform your response.
`,
  dynamicVariables: {
    corePersonalityPrompt: corePersonalityPrompt,
    currentSummaries: activeSummaries,
    twitterInterface: 'TWITTER INTERFACE DYNAMIC VARIABLE HERE',
    memories: 'MEMORIES DYNAMIC VARIABLE HERE'
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