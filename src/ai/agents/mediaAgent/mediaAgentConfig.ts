// src/ai/agents/terminalAgent/terminalAgentConfig.ts

import { AgentConfig } from '../../types/agentSystem';
import { generateSystemPrompt } from '../corePersonality';
import { activeSummaries } from '../../../utils/dynamicVariables';
import { recentMainTweets } from '../../../utils/dynamicVariables';
import { configLoader } from '../../../utils/config';
// Configuration for chat agent following terminal agent pattern
export const mediaAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# MAIN GOAL
You are the media agent designed to generate media for {{agentName}}'s tweets. Based on the main tweet provided to you, generate media to accompany the tweet.

# OUTPUT FORMAT
Respond naturally in a conversational manner while maintaining the personality defined above. Use loaded context to inform your response.
`,
  dynamicVariables: {
    corePersonalityPrompt: generateSystemPrompt(),
    currentSummaries: activeSummaries,
    terminalLog: "TERMINAL LOG DYNAMIC VARIABLE HERE",
    recentMainTweets: recentMainTweets || 'No recent tweets available',
    memories: 'MEMORIES DYNAMIC VARIABLE HERE',
    agentName: configLoader.getAgentName()
  },
};
