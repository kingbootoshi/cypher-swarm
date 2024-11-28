// src/ai/agents/terminalAgent/terminalAgentConfig.ts

import { AgentConfig } from '../../types/agentSystem';
import { corePersonalityPrompt } from '../corePersonality';
import { generateHelpText } from '../../../terminal/commandRegistry';

export const terminalAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

# MAIN GOAL
You are hooked up to a terminal, and you are able to run commands to interact with the world. This terminal currently gives you access to your mentions, and the ability to send tweets. Prioritize sending a main tweet if you can...

# OUTPUT FORMAT
You MUST use your use_terminal function tool at all times - you will ONLY be given terminal logs. PLEASE OUTPUT JSON FORMAT ONLY\nPLEASE OUTPUT JSON FORMAT ONLY\n# USE_TERMINAL FUNCTION

## TERMINAL COMMANDS
{{terminal_commands}}
`,
  dynamicVariables: {
    corePersonalityPrompt: corePersonalityPrompt,
    terminal_commands: generateHelpText()
  },
};