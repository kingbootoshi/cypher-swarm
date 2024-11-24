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

  // Build parameters for the Anthropic chat completion method
  buildParams(
    messageHistory: Message[],
    formattedTools: any[],
    toolChoice: any
  ): any {
    return {
      system: messageHistory.find((msg) => msg.role === 'system')?.content || '',
      messages: messageHistory
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role,
          content: [{ type: 'text', text: msg.content }],
          name: msg.name,
        })),
      tools: formattedTools,
      ...(toolChoice && { tool_choice: toolChoice }),
    };
  }

  // Process the Anthropic response to extract AI message and function call
  processResponse(response: any): { aiMessage: any; functionCall?: any } {
    const aiMessage = response;
    if (response.content?.[0]?.type === 'tool_use') {
      const toolCall = response.content[0];
      return {
        aiMessage,
        functionCall: {
          functionName: toolCall.name,
          functionArgs: toolCall.input,
        },
      };
    }
    return { aiMessage };
  }
} 