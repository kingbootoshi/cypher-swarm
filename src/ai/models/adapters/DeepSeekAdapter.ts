import { ModelAdapter } from './ModelAdapter';
import { Message, Tool } from '../../types/agentSystem';

// Adapter for DeepSeek models
export class DeepSeekAdapter implements ModelAdapter {
  supportsImages = false;  // DeepSeek doesn't support images yet

  // Build tool choice specific to DeepSeek
  buildToolChoice(tools: Tool[]): any {
    // DeepSeek ne nécessite pas de tool_choice explicite
    return undefined;
  }

  // Format tools according to DeepSeek's requirements
  formatTools(tools: Tool[]): any[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters
      }
    }));
  }

  // Build parameters for the DeepSeek chat completion method
  buildParams(
    messageHistory: Message[],
    formattedTools: any[],
    toolChoice: any,
    systemPrompt: string
  ): any {
    // Filter out messages with images since DeepSeek doesn't support them
    const filteredMessages = messageHistory.filter(msg => !msg.image);
    
    // Replace or update the system message in the message history
    const updatedMessageHistory = filteredMessages.map(msg =>
      msg.role === 'system'
        ? { ...msg, content: systemPrompt }
        : {
            role: msg.role,
            content: msg.content,
            name: msg.name
          }
    );

    const params: any = {
      messages: updatedMessageHistory
    };

    // DeepSeek utilise 'tools' au lieu de 'functions'
    if (formattedTools.length > 0) {
      params.tools = formattedTools;
    }

    return params;
  }

  // Process the DeepSeek response to extract AI message and function call
  processResponse(response: any): { aiMessage: any; functionCall?: any } {
    const aiMessage = response.choices[0]?.message;
    
    if (aiMessage?.tool_calls?.[0]) {
      const toolCall = aiMessage.tool_calls[0];
      return {
        aiMessage,
        functionCall: {
          functionName: toolCall.function.name,
          functionArgs: JSON.parse(toolCall.function.arguments)
        }
      };
    }

    return { aiMessage };
  }
} 