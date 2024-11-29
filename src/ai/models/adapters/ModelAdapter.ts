// src/ai/models/ModelAdapter.ts

import { Tool, Message } from '../../types/agentSystem';

// Define an interface for model-specific adapters
export interface ModelAdapter {
  // Add capability check for images
  supportsImages?: boolean;

  // Build tool choice based on the provided tools
  buildToolChoice(tools: Tool[]): any;

  // Format tools according to the model's requirements
  formatTools(tools: Tool[]): any[];

  // Build parameters for the model's chat completion method
  buildParams(
    messageHistory: Message[],
    formattedTools: any[],
    toolChoice: any,
    systemPrompt: string
  ): any;

  // Process the model's response to extract AI message and function call
  processResponse(response: any): { aiMessage: any; functionCall?: any };

  // Additional methods as needed
} 