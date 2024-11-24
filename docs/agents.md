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

```typescript
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