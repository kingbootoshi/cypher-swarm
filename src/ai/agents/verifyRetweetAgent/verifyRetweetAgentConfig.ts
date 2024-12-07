// src/ai/agents/terminalAgent/terminalAgentConfig.ts

import { AgentConfig } from '../../types/agentSystem';
import { generateSystemPrompt } from '../corePersonality';

// Configuration for chat agent following terminal agent pattern
export const verifyRetweetAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

## SHORT TERM TERMINAL LOG INFORMATION
This is the short term terminal log. The terminal log results give contextually relevant information about the current state of the Crypto timeline and the internet.
The short term terminal log contains Satoshi's thoughts and plans as well! Act upon these accordingly.

{{shortTermTerminalLog}}

# MAIN GOAL
You are evaluating whether to retweet a tweet. The full context of the tweet is provided to you below.
Consider if this tweet aligns with your values, interests, and if it would be valuable to share with your followers.
Do NOT retweet un-important tweets, scams, or links.

# OUTPUT FORMAT
Use your verify_retweet_tool to verify whether to retweet the tweet.
`,
  dynamicVariables: {
    corePersonalityPrompt: generateSystemPrompt(),
    terminalLog: `SHORT TERM TERMINAL LOG DYNAMIC VARIABLE`,
  },
};