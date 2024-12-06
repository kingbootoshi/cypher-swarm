import { BaseAgent } from '../BaseAgent';
import { ModelClient } from '../../types/agentSystem';
import { corePersonalityPrompt } from '../corePersonality';
import { AgentConfig } from '../../types/agentSystem';
import { activeSummaries } from '../../../utils/dynamicVariables';

// Configuration for chat agent following terminal agent pattern
const replyAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# CURRENT SUMMARIES
{{currentSummaries}}

# TWITTER INTERFACE
{{twitterInterface}}

# MAIN GOAL
You are a twitter reply agent designed to reply to tweets.

# OUTPUT FORMAT
Respond naturally in a conversational manner while maintaining the personality defined above. Use loaded context to inform your response.
`,
  dynamicVariables: {
    corePersonalityPrompt: corePersonalityPrompt,
    currentSummaries: activeSummaries,
    twitterInterface: 'TWITTER INTERFACE DYNAMIC VARIABLE HERE',
  },
};

// ChatAgent extends BaseAgent with no schema type (null)
export class ReplyAgent extends BaseAgent<null> {
  constructor(modelClient: ModelClient) {
    super(replyAgentConfig, modelClient, null);
  }

  protected defineTools(): void {
    // No tools to define for basic chat functionality
  }
}