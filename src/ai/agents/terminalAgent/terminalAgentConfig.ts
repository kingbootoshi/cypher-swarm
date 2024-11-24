// src/ai/configs/terminalAgentConfig.ts

import { AgentConfig } from '../../types/agentSystem';
import { corePersonalityPrompt } from '../corePersonality';

export const terminalAgentConfig: AgentConfig = {
  personalityPrompt: corePersonalityPrompt,
  mainGoal: `
# CURRENT GOAL
You are hooked up to a terminal, and you are able to run commands to interact with the world. This terminal currently gives you access to your mentions, and the ability to send tweets.

Prioritize sending a main tweet if you can...
`,
  outputFormat: `
# OUTPUT STYLE

You MUST use your use_terminal function tool at all times- you will ONLY be given terminal logs. 

PLEASE OUTPUT JSON FORMAT ONLY

# USE_TERMINAL FUNCTION
`,
  dynamicVariables: {
    'UserName': 'Satoshi Nakamoto',
    'SessionID': 'abc123',
    'TerminalCommands': 'Available commands: get-homepage, send-tweet, send-tweet-with-media, search-twitter, get-tweets, get-mentions, reply-to-tweet, quote-tweet, retweet, follow-user',
  },
};