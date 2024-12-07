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

** NOTE: I noticed Anthropic was making up new parameters in a tool call, because the additionalProperties: false parameter is not used by Claude at all. You have to reinforce the tool config to NOT make new properties in claude!
 
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

### 1. Define Tool Schema & Type
```typescript
// agentTool.ts
import { z } from 'zod';

// Define the schema for your tool's output
export const toolSchema = z.object({
  // Define expected parameters
});

// Optional: Create a type from the schema
type ToolOutput = z.infer<typeof toolSchema>;

// Define the tool itself
export const Tool = {
  type: 'function',
  function: {
    name: 'tool_name',
    description: 'Tool description',
    parameters: {
      // Tool parameters schema matching the Zod schema
    }
  }
};
```

### 2. Define Configuration
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

### 3. Implement Agent Class
```typescript
export class MyAgent extends BaseAgent<typeof toolSchema> {
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

// Run agent - now returns typed results
const result = await agent.run();
if (result.success) {
  // TypeScript knows the shape of result.output
  console.log('Tool output:', result.output);
} else {
  console.error('Error:', result.error);
}
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
  systemPromptTemplate: `
# PERSONALITY
{{corePersonalityPrompt}}

## DYNAMIC VARIABLES
{{userName}}
{{sessionId}}

# MAIN GOAL
You are hooked up to a terminal, and you are able to run commands to interact with the world. This terminal currently gives you access to your mentions, and the ability to send tweets. Prioritize sending a main tweet if you can...

# OUTPUT FORMAT
You MUST use your use_terminal function tool at all times - you will ONLY be given terminal logs. PLEASE OUTPUT JSON FORMAT ONLY\nPLEASE OUTPUT JSON FORMAT ONLY\n# USE_TERMINAL FUNCTION
`,
  dynamicVariables: {
    corePersonalityPrompt: corePersonalityPrompt,
    userName: 'Satoshi Nakamoto',
    sessionId: 'abc123',
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

Then we bring it together in the agent class by extending BaseAgent with proper typing:
```typescript
// src/ai/agents/TerminalAgent/TerminalAgent.ts
import { BaseAgent } from '../BaseAgent';
import { terminalAgentConfig } from './terminalAgentConfig';
import { ModelClient } from '../../types/agentSystem';
import { terminalToolSchema, TerminalTool } from './terminalTool';

// Now properly typed with the schema
export class TerminalAgent extends BaseAgent<typeof terminalToolSchema> {
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
const result = await terminalAgent.run();

if (result.success) {
  // TypeScript knows the exact shape of the output
  console.log('Command:', result.output.terminal_command);
  console.log('Thought:', result.output.internal_thought);
  console.log('Plan:', result.output.plan);
} else {
  console.error('Error:', result.error);
}
```

which outputs something like:

```json
{
  "success": true,
  "output": {
    "internal_thought": "Should check mentions",
    "plan": "Review recent interactions",
    "terminal_command": "get-mentions"
  }
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

4. **Type Safety**
   - Always extend BaseAgent with proper schema typing
   - Use Zod for runtime validation
   - Handle both success and error cases in run() results
   - Leverage TypeScript's type inference with tool schemas

## Notes

- Agents maintain their own message history
- Each run processes one interaction cycle
- Tools should be stateless and reusable
- Configurations can be updated at runtime

## Logging System

The agent system includes a toggleable logging system for debugging and monitoring:

```typescript
import { Logger } from './utils/logger';

// Enable logging
Logger.enable();

// Disable logging
Logger.disable();
```

Logged information includes:
- Agent initialization and configuration
- System prompt construction
- Message history
- Model parameters and responses
- Function calls and direct responses
- Error states

## Agent Types

### 1. Tool-based Agents
Agents that use function calling to perform specific actions:

```typescript
export class TerminalAgent extends BaseAgent<typeof terminalToolSchema> {
  constructor(modelClient: ModelClient) {
    super(terminalAgentConfig, modelClient, terminalToolSchema);
  }

  protected defineTools(): void {
    this.tools = [TerminalTool];
  }
}
```

### 2. Direct Response Agents
Agents that provide natural language responses without tools:

```typescript
export class ChatAgent extends BaseAgent<null> {
  constructor(modelClient: ModelClient) {
    super(chatAgentConfig, modelClient, null);
  }

  protected defineTools(): void {
    // No tools to define
  }
}
```

## Model Adapters

The system includes adapters for different AI providers that handle both tool-based and direct response scenarios:

- **OpenAI Adapter**: Handles GPT models
- **Anthropic Adapter**: Handles Claude models
- **Fireworks Adapter**: Handles Fireworks AI models

Each adapter normalizes the provider-specific formats into a consistent interface:

```typescript
interface ModelAdapter {
  buildToolChoice(tools: Tool[]): any;
  formatTools(tools: Tool[]): any[];
  buildParams(messageHistory: Message[], formattedTools: any[], toolChoice: any): any;
  processResponse(response: any): { aiMessage: any; functionCall?: any };
}
```

## Best Practices

1. **Choosing Agent Type**
   - Use tool-based agents when specific actions are needed
   - Use direct response agents for conversational interfaces
   - Consider mixing both approaches when needed

2. **Logging**
   - Enable logging during development and debugging
   - Use Logger.enable() selectively to avoid noise
   - Monitor both success and error states

3. **Error Handling**
   - Check success state in agent responses
   - Handle both tool outputs and direct responses appropriately
   - Provide meaningful error messages