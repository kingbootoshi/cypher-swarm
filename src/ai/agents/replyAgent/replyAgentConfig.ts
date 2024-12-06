// src/ai/agents/terminalAgent/terminalAgentConfig.ts

import { AgentConfig } from '../../types/agentSystem';
import { corePersonalityPrompt } from '../corePersonality';
import { activeSummaries } from '../../../utils/dynamicVariables';
import { recentMainTweets } from '../../../utils/dynamicVariables';
import { getCurrentTimestamp } from '../../../utils/formatTimestamps';

// Configuration for chat agent following terminal agent pattern
export const replyAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# CURRENT SUMMARIES
{{currentSummaries}}

# POTENTIALLY RELEVANT MEMORIES
{{memories}}

## SHORT TERM TERMINAL LOG INFORMATION
This is the short term terminal log. The terminal log results give contextually relevant information about the current state of the Crypto timeline and the internet.
The short term terminal log contains Satoshi's thoughts and plans as well! Act upon these accordingly.

=== TERMINAL LOG START ===
{{terminalLog}}
=== TERMINAL LOG END ===

## CURRENT DATE
{{current_timestamp}}

## YOUR RECENT MAIN TWEETS
{{recentMainTweets}}

# MAIN GOAL
You are the reply tweet agent designed to write reply tweets embodying the personality above.

# OUTPUT FORMAT
Use your reply_tweet_tool to write a reply tweet.
`,
  dynamicVariables: {
    corePersonalityPrompt: corePersonalityPrompt,
    current_timestamp: getCurrentTimestamp(),
    currentSummaries: activeSummaries,
    terminalLog: "TERMINAL LOG DYNAMIC VARIABLE HERE",
    recentMainTweets: recentMainTweets || 'No recent tweets available',
    memories: 'MEMORIES DYNAMIC VARIABLE HERE',
  },
};
