import { ModelAdapter } from './ModelAdapter';
import { Message, Tool } from '../../types/agentSystem';

// Adapter for OpenAI models
export class OpenAIAdapter implements ModelAdapter {
  // Build tool choice specific to OpenAI
  buildToolChoice(tools: Tool[]): any {
    if (tools.length > 0) {
      return {
        type: 'function',
        function: { name: tools[0].function.name },
      };
    }
    return undefined;
  }

  // Format tools including the 'strict' parameter
  formatTools(tools: Tool[]): any[] {
    return tools.map((tool) => ({
      ...tool,
      function: {
        ...tool.function,
        strict: tool.function.strict ?? true, // Default 'strict' to true if not set
      },
    }));
  }

  // Build parameters for the OpenAI chat completion method
  buildParams(
    messageHistory: Message[],
    formattedTools: any[],
    toolChoice: any
  ): any {
    const params: any = {
      messages: messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
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

  // Process the OpenAI response to extract AI message and function call
  processResponse(response: any): { aiMessage: any; functionCall?: any } {
    const aiMessage = response.choices[0]?.message;
    if (aiMessage?.tool_calls?.[0]) {
      const toolCall = aiMessage.tool_calls[0];
      return {
        aiMessage,
        functionCall: {
          functionName: toolCall.function.name,
          functionArgs: JSON.parse(toolCall.function.arguments),
        },
      };
    }
    return { aiMessage };
  }
} 