import { ModelAdapter } from './ModelAdapter';
import { Message, Tool } from '../../types/agentSystem';

// Adapter for Anthropic models
export class AnthropicAdapter implements ModelAdapter {
  // Build tool choice specific to Anthropic
  buildToolChoice(tools: Tool[]): any {
    if (tools.length > 0) {
      return {
        type: 'tool',
        name: tools[0].function.name,
      };
    }
    return undefined;
  }

  // Format tools according to Anthropic's requirements
  formatTools(tools: Tool[]): any[] {
    return tools.map((tool) => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: tool.function.parameters,
    }));
  }

  // Updated buildParams method to handle empty message history
  buildParams(
    messageHistory: Message[],
    formattedTools: any[],
    toolChoice: any,
    systemPrompt: string
  ): any {
    // Filter out system messages and check if we have any user/assistant messages
    const nonSystemMessages = messageHistory.filter((msg) => msg.role !== 'system');
    
    // If no messages exist, add a blank user message
    if (nonSystemMessages.length === 0) {
      nonSystemMessages.push({
        role: 'user',
        content: ' ', // Anthropic requires at least one character
      });
    }

    const params: any = {
      system: systemPrompt,
      messages: nonSystemMessages.map((msg) => ({
        role: msg.role,
        content: [{ type: 'text', text: msg.content }],
        name: msg.name,
      })),
    };

    // Include tools and tool_choice only if tools are provided
    if (formattedTools.length > 0) {
      params.tools = formattedTools;
      if (toolChoice) {
        params.tool_choice = toolChoice;
      }
    }

    return params;
  }

  // Updated processResponse method to normalize the output format
  processResponse(response: any): { aiMessage: any; functionCall?: any } {
    // Extract the text content from the first content item
    const messageText = response.content?.[0]?.text || '';
    
    // Create a normalized message format matching OpenAI/Fireworks structure
    const normalizedMessage = {
      role: 'assistant',
      content: messageText
    };

    // Handle tool calls if present
    if (response.content?.[0]?.type === 'tool_use') {
      const toolCall = response.content[0];
      return {
        aiMessage: normalizedMessage,
        functionCall: {
          functionName: toolCall.name,
          functionArgs: toolCall.input,
        },
      };
    }

    return { aiMessage: normalizedMessage };
  }
} 