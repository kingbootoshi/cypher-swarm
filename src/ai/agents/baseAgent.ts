// src/ai/agents/BaseAgent.ts

import { Message, AgentConfig, ModelClient, ModelType, Tool } from '../types/agentSystem';
import { ModelAdapter } from '../models/adapters/ModelAdapter';
import { OpenAIAdapter } from '../models/adapters/OpenAIAdapter';
import { AnthropicAdapter } from '../models/adapters/AnthropicAdapter';
import { FireworksAdapter } from '../models/adapters/FireworksAdapter';
import { z } from 'zod';

export abstract class BaseAgent {
  protected messageHistory: Message[] = [];
  protected tools: Tool[] = [];
  protected outputSchema: z.ZodType<any>;
  protected modelClient: ModelClient;
  protected modelType: ModelType;
  protected toolChoice: any;
  private modelAdapter: ModelAdapter;

  constructor(
    protected config: AgentConfig,
    modelClient: ModelClient,
    outputSchema: z.ZodType<any>
  ) {
    this.modelClient = modelClient;
    this.outputSchema = outputSchema;
    this.modelType = modelClient.modelType;

    // Enhanced config logging
    console.log('\n🔍 Initializing BaseAgent:');
    console.log('📋 Full Config:', {
      personalityPrompt: config.personalityPrompt?.slice(0, 100) + '...',
      mainGoal: config.mainGoal,
      dynamicVariables: config.dynamicVariables,
    });

    // Initialize modelAdapter based on modelType
    switch (this.modelType) {
      case 'openai':
        this.modelAdapter = new OpenAIAdapter();
        break;
      case 'anthropic':
        this.modelAdapter = new AnthropicAdapter();
        break;
      case 'fireworks':
        this.modelAdapter = new FireworksAdapter();
        break;
      default:
        throw new Error(`Unsupported model type: ${this.modelType}`);
    }

    const systemPrompt = this.buildSystemPrompt();
    this.messageHistory.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  public addMessage(message: Message) {
    this.messageHistory.push(message);
  }

  protected buildSystemPrompt(): string {
    const { personalityPrompt, dynamicVariables, mainGoal, outputFormat } = this.config;

    // Enhanced dynamic variables logging
    console.log('\n🔄 Building System Prompt:');
    console.log('📦 Dynamic Variables:', {
      exists: !!dynamicVariables,
      keys: dynamicVariables ? Object.keys(dynamicVariables) : 'none',
      values: dynamicVariables || 'none'
    });

    // Construct the dynamic variables section with logging
    let dynamicVariablesSection = '';
    if (dynamicVariables && Object.keys(dynamicVariables).length > 0) {
      console.log('🏗️ Constructing dynamic variables section');
      dynamicVariablesSection = '\n# IMPORTANT INFORMATION\n';
      for (const [key, value] of Object.entries(dynamicVariables)) {
        console.log(`  ↪ Adding ${key}`);
        dynamicVariablesSection += `\n## ${key}\n${value}`;
      }
      dynamicVariablesSection += '\n';
    }

    // Log final prompt construction
    const prompt = `${personalityPrompt}${dynamicVariablesSection}\n${mainGoal}\n${outputFormat}`;
    console.log('\n📝 Final System Prompt Length:', prompt.length);
    console.log('📝 Dynamic Variables Section:', dynamicVariablesSection);

    return prompt;
  }

  protected async handleFunctionCall(args: any): Promise<any> {
    return args;
  }

  protected abstract defineTools(): void;

  protected buildToolChoice() {
    // Use modelAdapter to build toolChoice
    this.toolChoice = this.modelAdapter.buildToolChoice(this.tools);
  }

  protected formatTools(): any[] {
    // Use modelAdapter to format tools
    return this.modelAdapter.formatTools(this.tools);
  }

  public async run(): Promise<any> {
    this.defineTools();
    this.buildToolChoice();

    // Build parameters using the modelAdapter
    const params = this.modelAdapter.buildParams(
      this.messageHistory,
      this.formatTools(),
      this.toolChoice
    );

    console.log(
      '\n🤖 Current Message History:',
      JSON.stringify(this.messageHistory, null, 2)
    );

    const response = await this.modelClient.chatCompletion(params);

    console.log('\n🤖 Response:', JSON.stringify(response, null, 2));

    // Process the response using the modelAdapter
    const { aiMessage, functionCall } = this.modelAdapter.processResponse(
      response
    );

    if (functionCall) {
      // We only care about the args since we define the function names
      const parsedArgs = this.outputSchema.parse(functionCall.functionArgs);

      console.log('\n🤖 Function Call:', parsedArgs);

      // Add function call and result to message history
      this.messageHistory.push({
        role: 'assistant',
        content: JSON.stringify(parsedArgs),
      });

      return parsedArgs;
    } else {
      // Handle assistant's direct response if needed
      console.log('\n💬 Direct AI Response:', aiMessage?.content);
      return aiMessage?.content;
    }
  }
}