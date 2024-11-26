// src/ai/agents/BaseAgent.ts

import { Message, AgentConfig, ModelClient, ModelType, Tool, AgentRunResult, ToolOutputFromSchema } from '../types/agentSystem';
import { Logger } from '../../utils/logger';
import { ModelAdapter } from '../models/adapters/ModelAdapter';
import { OpenAIAdapter } from '../models/adapters/OpenAIAdapter';
import { AnthropicAdapter } from '../models/adapters/AnthropicAdapter';
import { FireworksAdapter } from '../models/adapters/FireworksAdapter';
import { z } from 'zod';

export abstract class BaseAgent<T extends z.ZodTypeAny | null = null> {
  protected messageHistory: Message[] = [];
  protected tools: Tool[] = [];
  protected outputSchema: T | null;
  protected modelClient: ModelClient;
  protected modelType: ModelType;
  protected toolChoice: any;
  private modelAdapter: ModelAdapter;
  protected config: AgentConfig;

  constructor(
    config: AgentConfig,
    modelClient: ModelClient,
    outputSchema: T | null = null
  ) {
    this.config = config;
    this.modelClient = modelClient;
    this.outputSchema = outputSchema;
    this.modelType = modelClient.modelType;

    // Enhanced config logging
    Logger.log('\n🔍 Initializing BaseAgent:');
    Logger.log('📋 Full Config:', {
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

    // Helper method to add user messages with correct role
    public addUserMessage(content: string) {
      this.messageHistory.push({
        role: 'user',
        content: content
      });
    }
  
    // Helper method to add AI responses with correct role 
    public addAgentMessage(content: string) {
      this.messageHistory.push({
        role: 'assistant', 
        content: content
      });
    }

  protected buildSystemPrompt(): string {
    const { personalityPrompt, dynamicVariables, mainGoal, outputFormat } = this.config;

    // Enhanced dynamic variables logging
    Logger.log('\n🔄 Building System Prompt:');
    Logger.log('📦 Dynamic Variables:', {
      exists: !!dynamicVariables,
      keys: dynamicVariables ? Object.keys(dynamicVariables) : 'none',
      values: dynamicVariables || 'none'
    });

    // Construct the dynamic variables section with logging
    let dynamicVariablesSection = '';
    if (dynamicVariables && Object.keys(dynamicVariables).length > 0) {
      Logger.log('🏗️ Constructing dynamic variables section');
      dynamicVariablesSection = '\n# IMPORTANT INFORMATION\n';
      for (const [key, value] of Object.entries(dynamicVariables)) {
        Logger.log(`  ↪ Adding ${key}`);
        dynamicVariablesSection += `\n## ${key}\n${value}`;
      }
      dynamicVariablesSection += '\n';
    }

    // Log final prompt construction
    const prompt = `# PERSONALITY\n${personalityPrompt}\n${dynamicVariablesSection}\n# MAIN GOAL\n${mainGoal}\n# OUTPUT FORMAT\n${outputFormat}`;
    Logger.log('\n📝 Final System Prompt Length:', prompt.length);
    Logger.log('📝 Dynamic Variables Section:', dynamicVariablesSection);

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

  public async run(inputMessage?: string): Promise<AgentRunResult<T>> {
    try {
      this.defineTools();
      this.buildToolChoice();

      if (inputMessage) {
        this.addUserMessage(inputMessage);
      }

      const params = this.modelAdapter.buildParams(
        this.messageHistory,
        this.formatTools(),
        this.toolChoice
      );

      Logger.log('\n🤖 Params Sent to Model:', JSON.stringify(params, null, 2));

      const response = await this.modelClient.chatCompletion(params);

      Logger.log('\n🤖 Response from Model Client:', JSON.stringify(response, null, 2));

      const { aiMessage, functionCall } = this.modelAdapter.processResponse(response);

      Logger.log('\n🤖 Processed AI Message:', aiMessage);
      Logger.log('\n🤖 Processed Function Call:', functionCall);

      // Format the complete response including both AI message and function call if present
      let formattedResponse = '';
      
      // Add AI message content if it exists
      if (aiMessage?.content) {
        formattedResponse += aiMessage.content + '\n\n';
      }

      // Add formatted function call if it exists
      if (functionCall) {
        formattedResponse += `## USED TOOL: ${functionCall.functionName}\n`;
        
        // Format each argument in the function call
        for (const [key, value] of Object.entries(functionCall.functionArgs)) {
          // Convert key to uppercase and replace underscores with spaces
          const formattedKey = key.toUpperCase().replace(/_/g, '_');
          // Handle string values with proper quoting
          const formattedValue = typeof value === 'string' ? `"${value}"` : value;
          formattedResponse += `${formattedKey}: ${formattedValue}\n`;
        }
      }

      // Log the formatted response
      Logger.log('\n📝 Formatted Response:', formattedResponse);

      // Add the formatted response to message history
      if (formattedResponse) {
        this.addAgentMessage(formattedResponse.trim());
      }

      // Return the appropriate result based on whether we have a function call with schema
      if (functionCall && this.outputSchema) {
        const parsedArgs = this.outputSchema.parse(functionCall.functionArgs);
        return {
          success: true,
          output: parsedArgs,
        };
      } else {
        return {
          success: true,
          output: formattedResponse as any,
        };
      }
    } catch (error) {
      return {
        success: false,
        output: (this.outputSchema ? {} : '') as (T extends z.ZodTypeAny ? ToolOutputFromSchema<T> : string),
        error: (error as Error).message,
      };
    }
  }
}