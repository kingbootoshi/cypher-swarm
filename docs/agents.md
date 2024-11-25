# Agent System Documentation

## Overview

The agent system provides a framework for creating AI agents that can interact with various interfaces, starting with a Twitter-connected terminal. Each agent inherits from BaseAgent and implements specific behaviors through tools and configurations.

## Core Components

### 1. BaseAgent
The foundation class that handles:
- Message history management
- Model interactions (OpenAI, Anthropic, Fireworks)
- Tool execution
- Response processing

### 2. Model Adapters
Handles model-specific formatting for:
- OpenAI
- Anthropic
- Fireworks

### 3. Tools

All tool schemas are made to match OpenAI's: https://platform.openai.com/docs/guides/function-calling
Function definitions that agents can use to interact with external systems:
```typescript
const ExampleTool = {
  type: 'function',
  function: {
    name: 'tool_name',
    description: 'Tool description',
    parameters: {
      // Tool parameters schema
    }
  }
};
```

## Creating an Agent

### 1. Define Configuration
```typescript
// agentConfig.ts
export const myAgentConfig = {
  personalityPrompt: "Agent's core personality...",
  mainGoal: "Agent's main objective...",
  outputFormat: "Expected output format...",
  dynamicVariables: {
    // Runtime variables
  }
};
```

### 2. Create Tool Schema
```typescript
// agentTool.ts
export const toolSchema = z.object({
  // Define expected parameters
});

export const Tool = {
  type: 'function',
  function: {
    // Tool definition
  }
};
```

### 3. Implement Agent Class
```typescript
export class MyAgent extends BaseAgent {
  constructor(modelClient: ModelClient) {
    super(myAgentConfig, modelClient, toolSchema);
  }

  protected defineTools(): void {
    this.tools = [MyTool];
  }
}
```

## Using an Agent

```typescript
// Initialize agent
const modelClient = new OpenAIClient('gpt-4o');
const agent = new MyAgent(modelClient);

// Run agent
const result = await agent.run();
```

## Example: Terminal Agent

The TerminalAgent is the primary implementation that:
- Connects to Twitter via terminal commands
- Processes mentions and interactions
- Generates responses based on Satoshi's personality
- Executes commands through a terminal interface

First, we define the configuration:
```typescript
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
```

Next, we define the tool & its schema:
```typescript
// src/ai/agents/TerminalAgent/TerminalTool.ts

import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const terminalToolSchema = z.object({
  internal_thought: z.string(),
  plan: z.string(),
  terminal_command: z.string(),
});

export const TerminalTool: Tool = {
  type: 'function',
  function: {
    name: 'use_terminal',
    strict: true,
    description: 'Executes a terminal command based on internal thoughts & plans.',
    parameters: {
      type: 'object',
      required: ['internal_thought', 'plan', 'terminal_command'],
      properties: {
        internal_thought: {
          type: 'string',
          description: 'My internal reasoning process about what terminal command to run next and why',
        },
        plan: {
          type: 'string',
          description: 'A short plan of what I am going to do next. If planning to respond to a tweet, I must include the tweet ID in the plan.',
        },
        terminal_command: {
          type: 'string',
          description: 'The FULL terminal command I want to run, based on my previous internal thought processes & plan. ONLY ONE COMMAND AT A TIME.',
        },
      },
      additionalProperties: false,
    },
  },
};
```

Then we bring it together in the agent class by extending BaseAgent:
```typescript
// src/ai/agents/TerminalAgent/TerminalAgent.ts
import { BaseAgent } from '../BaseAgent';
import { terminalAgentConfig } from './terminalAgentConfig';
import { ModelClient } from '../../types/agentSystem';
import { terminalToolSchema, TerminalTool } from './terminalTool';

export class TerminalAgent extends BaseAgent {
  constructor(modelClient: ModelClient) {
    super(terminalAgentConfig, modelClient, terminalToolSchema);
  }

  protected defineTools(): void {
    this.tools = [TerminalTool];
    console.log('🛠️ Terminal Tools Defined:', this.tools.map(t => t.function.name));
  }
}
```

Finally, we can see an example of a terminal command execution:

```typescript
import { TerminalAgent } from './ai/agents/TerminalAgent/TerminalAgent';
import { OpenAIClient } from './ai/models/clients/OpenAiClient';

  const modelClient = new OpenAIClient('gpt-4o'); // or FireworksClient, or AnthropicClient
  const terminalAgent = new TerminalAgent(modelClient);
  const functionResult = await terminalAgent.run();
  ```

which functionResult outputs:

```json
// Example terminal command execution
{
  "internal_thought": "Should check mentions",
  "plan": "Review recent interactions",
  "terminal_command": "get-mentions"
}
```

## Best Practices

1. **Tool Design**
   - Keep tools focused and single-purpose
   - Use clear parameter schemas
   - Include comprehensive descriptions

2. **Agent Configuration**
   - Separate personality from functionality
   - Use dynamic variables for runtime data
   - Define clear output formats

3. **Error Handling**
   - Validate tool inputs with Zod schemas
   - Implement graceful fallbacks
   - Log important state changes

## Notes

- Agents maintain their own message history
- Each run processes one interaction cycle
- Tools should be stateless and reusable
- Configurations can be updated at runtime