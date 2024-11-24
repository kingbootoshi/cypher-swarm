# Agent-X Framework

A modular AI agent framework designed for building intelligent agents that can interact with various interfaces, starting with Twitter integration. The framework provides a robust foundation for creating AI agents with customizable personalities, tools, and interaction capabilities.

## Core Features

- **Modular Agent System**: Extensible BaseAgent class for creating specialized AI agents
- **Multi-Model Support**: Compatible with OpenAI, Anthropic, and Fireworks AI models
- **Terminal Interface**: Custom terminal system for agent-world interactions
- **Twitter Integration**: Built-in Twitter functionality with database persistence
- **Sub-Agent Pipelines**: Support for complex task delegation between agents
- **Memory Management**: Efficient handling of conversation history and context

## Quick Start

```bash
# Clone the repository
git clone https://github.com/kingbootoshi/agent-x.git

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Start the system
npm start
```

## Architecture Overview

### Core Components

1. **Agent System**
   - `BaseAgent`: Foundation class for all agents
   - Model adapters for OpenAI, Anthropic, and Fireworks
   - Tool system matching OpenAI's function calling format

2. **Terminal System**
   - Command execution environment
   - Dynamic command registration
   - Extensible command handlers

3. **Twitter Integration**
   - Twitter interaction layer
   - Full agent functionality to post, reply, and engage with other users

4. **Database Structure**
   - User management across platforms
   - Interaction history tracking
   - Tweet and media storage
   - Memory persistence

## Creating a New Agent

```typescript
// Import required dependencies
import { BaseAgent } from '../baseAgent';
import { ModelClient } from '../../types/agentSystem';
import { customToolSchema, CustomTool } from './customTool';
import { customAgentConfig } from './customAgentConfig';

export class CustomAgent extends BaseAgent {
  constructor(modelClient: ModelClient) {
    console.log('\n🤖 Initializing CustomAgent:');
    console.log('⚙️ Custom Agent Config:', {
      dynamicVars: customAgentConfig.dynamicVariables,
      mainGoal: customAgentConfig.mainGoal
    });
    
    // Pass config, model client and tool schema to parent
    super(customAgentConfig, modelClient, customToolSchema);
    
    console.log('✅ CustomAgent initialized');
  }

  protected defineTools(): void {
    this.tools = [CustomTool];
    console.log('🛠️ Custom Tools Defined:', this.tools.map(t => t.function.name));
  }
}
```

### Agent Configuration

```typescript
// customAgentConfig.ts
import { AgentConfig } from '../../types/agentSystem';
import { corePersonalityPrompt } from '../corePersonality';

export const customAgentConfig: AgentConfig = {
  personalityPrompt: corePersonalityPrompt,
  mainGoal: `
    # CURRENT GOAL
    Define the agent's main objective and operating parameters...
  `,
  outputFormat: `
    # OUTPUT STYLE
    Define expected output format and rules...
  `,
  dynamicVariables: {
    'Variable1': 'value1',
    'Variable2': 'value2',
    // Add any dynamic variables needed
  },
};
```

### Agent Tools

```typescript
// customTool.ts
import { z } from 'zod';
import { Tool } from '../../types/agentSystem';

export const customToolSchema = z.object({
  // Define your Zod schema for tool validation
  field1: z.string(),
  field2: z.string(),
});

export const CustomTool: Tool = {
  type: 'function',
  function: {
    name: 'custom_tool_name',
    strict: true,
    description: 'Description of what the tool does',
    parameters: {
      type: 'object',
      required: ['field1', 'field2'],
      properties: {
        field1: {
          type: 'string',
          description: 'Description of field1',
        },
        field2: {
          type: 'string',
          description: 'Description of field2',
        },
      },
      additionalProperties: false,
    },
  },
};
```

## Initializing Your Agent

```typescript
import { CustomAgent } from './agents/CustomAgent';
import { OpenAIClient } from './models/clients/OpenAiClient';
// import { FireworkClient } from './models/clients/FireworkClient';
// import { AnthropicClient } from './models/clients/AnthropicClient';

async function initializeAgent() {
  // Initialize OpenAI client (other clients commented for reference)
  const modelClient = new OpenAIClient('gpt-4o');
  // const modelClient = new FireworkClient("accounts/fireworks/models/llama-v3p1-405b-instruct");
  // const modelClient = new AnthropicClient("claude-3.5-sonnet");

  // Create agent instance
  const agent = new CustomAgent(modelClient);

  // Add initial message to start the conversation
  agent.addMessage({
    role: 'user',
    content: 'Hello Agent!',
  });

  // Run the agent and get response
  const response = await agent.run();
  console.log('Agent Response:', response);
}

initializeAgent();
```

## Database Integration

The framework uses Supabase for data persistence with the following main tables:

- `users`: Core user management
- `user_accounts`: Platform-specific user data
- `twitter_tweets`: Bot's tweet storage
- `twitter_interactions`: Interaction tracking

## Documentation Structure

- `docs/agents.md`: Agent system implementation details
- `docs/architecture.md`: System architecture overview
- `docs/database.md`: Database schema and usage
- `docs/development_log.md`: Development history and decisions
- `docs/guidelines.md`: Contribution guidelines
- `docs/terminal_commands.md`: Terminal command system
- `docs/to-do.md`: Current development roadmap

## System Loop

The framework uses a main loop system that:
1. Initializes the selected AI model client
2. Creates a terminal agent instance that acts as the world interface
3. Processes agent actions and terminal commands
4. Manages Twitter authentication and interactions
5. Maintains conversation history and context

## Current Development Focus

- Implementing advanced memory system
- Adding vision capabilities adapted for each model to process images
- Enhancing main tweet pipelines like text/media generation to be more robust & engaging
- Adding sub-agent task visualization to display on site terminal