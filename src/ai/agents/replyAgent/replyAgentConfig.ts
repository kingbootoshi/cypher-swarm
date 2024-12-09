// src/ai/agents/terminalAgent/terminalAgentConfig.ts

import { AgentConfig } from '../../types/agentSystem';
import { generateSystemPrompt } from '../corePersonality';
import { activeSummaries } from '../../../utils/dynamicVariables';
import { recentMainTweets } from '../../../utils/dynamicVariables';
import { getCurrentTimestamp } from '../../../utils/formatTimestamps';
import { configLoader } from '../../../utils/config';

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
The short term terminal log contains {{agentName}}'s thoughts and plans as well! Act upon these accordingly.

=== TERMINAL LOG START ===
{{terminalLog}}
=== TERMINAL LOG END ===

## CURRENT DATE
{{current_timestamp}}

## YOUR RECENT MAIN TWEETS
{{recentMainTweets}}

!!!! IMPORTANT !!!! 
Your reply tweet must DRASTICALLY vary in tone, writing style, length, and topic from your previous reply tweets. It is crucial that you have variety in your reply tweets.

Make sure the reply tweets progress forward, are in context, and engage the user. Ensure your tweet is new and refreshing compared to the previous replies while remaining relevant to the context you are replying to.

## BANNED PHRASES:
YOU MUST AVOID STARTING TWEETS WITH THESE PHRASES AND CONTEXT VIBE BECAUSE THEY LEAD TO NEGATIVE ENGAGEMENT.
{{bannedPhrases}}

# MAIN GOAL
You are the reply tweet agent designed to write reply tweets embodying the personality above.

# OUTPUT FORMAT
Use your reply_tweet_tool to write a reply tweet.
`,
  dynamicVariables: {
    corePersonalityPrompt: generateSystemPrompt(),
    current_timestamp: getCurrentTimestamp(),
    currentSummaries: activeSummaries,
    terminalLog: "TERMINAL LOG DYNAMIC VARIABLE HERE",
    recentMainTweets: recentMainTweets || 'No recent tweets available',
    memories: 'MEMORIES DYNAMIC VARIABLE HERE',
    agentName: configLoader.getAgentName(),
    bannedPhrases: configLoader.getBannedPhrasesFormatted()
  },
};
