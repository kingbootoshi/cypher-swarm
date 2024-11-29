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
      systemPromptTemplate: config.systemPromptTemplate?.slice(0, 100) + '...',
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

    // Initialize with empty system message - will be populated in first run
    this.messageHistory.push({
      role: 'system',
      content: '',
    });
  }

  public addMessage(message: Message) {
    this.messageHistory.push(message);
  }

  // Helper method to add user messages with optional image content
  public addUserMessage(content?: string, image?: Message['image']) {
    this.messageHistory.push({
      role: 'user',
      content,
      image,
    });
  }

  // Helper method to add AI responses with optional image content
  public addAgentMessage(content?: string, image?: Message['image']) {
    this.messageHistory.push({
      role: 'assistant',
      content,
      image,
    });
  }

  public getLastAgentMessage(): Message | null {
    for (let i = this.messageHistory.length - 1; i >= 0; i--) {
      if (this.messageHistory[i].role === 'assistant') {
        return this.messageHistory[i];
      }
    }
    return null;
  }

  public getLastUserMessage(): Message | null {
    for (let i = this.messageHistory.length - 1; i >= 0; i--) {
      if (this.messageHistory[i].role === 'user') {
        return this.messageHistory[i];
      }
    }
    return null;
  }

  /**
   * Loads chat history into the agent's message history
   * Preserves the system message and appends the new history
   */
  public loadChatHistory(messages: Message[]): void {
    // Preserve system message if it exists
    const systemMessage = this.messageHistory.find(msg => msg.role === 'system');
    
    // Reset message history
    this.messageHistory = systemMessage ? [systemMessage] : [];
    
    // Add new messages
    this.messageHistory.push(...messages);
    
    Logger.log(`Loaded ${messages.length} messages into chat history`);
  }

  protected compileSystemPrompt(
    dynamicVariables?: { [key: string]: string }
  ): string {
    const { systemPromptTemplate } = this.config;
    
    // Log the variables we're working with
    Logger.log('\n🔍 Compiling System Prompt:', {
      configVariables: this.config.dynamicVariables,
      runtimeVariables: dynamicVariables,
    });

    let prompt = systemPromptTemplate;

    // Merge config dynamic variables with those passed in
    const mergedVariables = {
      ...this.config.dynamicVariables,
      ...dynamicVariables,
    };

    Logger.log('\n🔄 Merged Variables:', {
      total: Object.keys(mergedVariables).length,
      keys: Object.keys(mergedVariables),
    });

    // Replace placeholders with their corresponding values
    for (const [key, value] of Object.entries(mergedVariables)) {
      const placeholder = `{{${key}}}`;
      const regex = new RegExp(placeholder, 'g');
      const matches = prompt.match(regex);
      
      if (matches) {
        Logger.log(`\n🔎 Found ${matches.length} instances of ${placeholder}`);
        prompt = prompt.replace(regex, value);
      }
    }

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

  public async run(
    inputMessage?: string,
    dynamicVariables?: { [key: string]: string }
  ): Promise<AgentRunResult<T>> {
    try {
      // Log incoming dynamic variables
      Logger.log('\n📥 Run Called With Dynamic Variables:', {
        inputMessage,
        dynamicVariables,
      });

      // Recompile the system prompt with dynamic variables from the run call
      const updatedSystemPrompt = this.compileSystemPrompt(dynamicVariables);

      // Log the system prompt before and after compilation
      Logger.log('\n🔄 System Prompt Compilation:', {
        original: this.messageHistory.find(msg => msg.role === 'system')?.content?.slice(0, 100) + '...',
        updated: updatedSystemPrompt.slice(0, 100) + '...',
      });

      // Update the system message in message history
      const systemMessageIndex = this.messageHistory.findIndex(msg => msg.role === 'system');
      if (systemMessageIndex !== -1) {
        this.messageHistory[systemMessageIndex].content = updatedSystemPrompt;
        Logger.log('\n✅ Updated system message in history');
      }

      this.defineTools();
      this.buildToolChoice();

      if (inputMessage) {
        this.addUserMessage(inputMessage);
      }

      const params = this.modelAdapter.buildParams(
        this.messageHistory,
        this.formatTools(),
        this.toolChoice,
        updatedSystemPrompt  // Always pass the updated system prompt
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

  /**
   * Adds one or more images to the conversation history
   * @param images Single image or array of images to be added
   * @param content Optional text content to accompany the images
   * @param role Message role (defaults to 'user')
   */
  public addImage(
    images: Message['image'] | Message['image'][],
    content?: string,
    role: 'user' | 'assistant' = 'user'
  ) {
    // Check if model supports images
    if (!this.modelAdapter.supportsImages) {
      Logger.log('❌ Current model does not support image input');
      return;
    }

    // Convert single image to array for consistent handling
    const imageArray = Array.isArray(images) ? images : [images];

    // Validate all images
    const invalidImages = imageArray.filter(img => !img || !img.data || !img.mime);
    if (invalidImages.length > 0) {
      Logger.log('❌ Invalid image data provided to addImage');
      return;
    }

    // Add each image to message history
    imageArray.forEach((image, index) => {
      this.messageHistory.push({
        role,
        // Only add content with first image if multiple images
        content: index === 0 ? content : undefined,
        image,
      });
    });

    Logger.log(`✅ Added ${imageArray.length} ${role} image message(s)${content ? ' with text' : ''}`);
  }
}