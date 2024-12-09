// src/ai/agents/terminalAgent/terminalAgentConfig.ts

import { AgentConfig } from '../../types/agentSystem';
import { generateSystemPrompt } from '../corePersonality';
import { activeSummaries } from '../../../utils/dynamicVariables';
import { getCurrentTimestamp } from '../../../utils/formatTimestamps';
import { configLoader } from '../../../utils/config';

// Configuration for chat agent following terminal agent pattern
export const quoteAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# CURRENT SUMMARIES
{{currentSummaries}}

## SHORT TERM TERMINAL LOG INFORMATION
This is the short term terminal log. The terminal log results give contextually relevant information about the current state of the Crypto timeline and the internet.
The short term terminal log contains {{agentName}}'s thoughts and plans as well! Act upon these accordingly.

=== TERMINAL LOG START ===
{{terminalLog}}
=== TERMINAL LOG END ===

## CURRENT DATE
{{current_timestamp}}

# POTENTIALLY RELEVANT MEMORIES
{{memories}}

!!!! IMPORTANT !!!! 
Your quote tweet must DRASTICALLY vary in tone, writing style, length, and topic from your previous quote tweets. It is crucial that you have variety in your quote tweets.

Make sure the quote tweets progress forward, are in context, and engage the user. Ensure your tweet is new and refreshing compared to the previous quote tweets while remaining relevant to the context you are quoting.

## BANNED PHRASES:
YOU MUST AVOID STARTING TWEETS WITH THESE PHRASES AND CONTEXT VIBE BECAUSE THEY LEAD TO NEGATIVE ENGAGEMENT.
{{bannedPhrases}}

# MAIN GOAL
You are the quote tweet agent designed to write quote tweets embodying the personality above.

# OUTPUT FORMAT
Use your quote_tweet_tool to write a quote tweet.
`,
  dynamicVariables: {
    corePersonalityPrompt: generateSystemPrompt(),
    current_timestamp: getCurrentTimestamp(),
    currentSummaries: activeSummaries,
    terminalLog: "TERMINAL LOG DYNAMIC VARIABLE HERE",
    memories: 'MEMORIES DYNAMIC VARIABLE HERE',
    agentName: configLoader.getAgentName(),
    bannedPhrases: configLoader.getBannedPhrasesFormatted()
  },
};
