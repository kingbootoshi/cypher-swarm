import { ModelAdapter } from './ModelAdapter';
import { Message, Tool } from '../../types/agentSystem';

// Adapter for OpenAI models
export class OpenAIAdapter implements ModelAdapter {
  supportsImages = true;

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

  // Format tools according to OpenAI's requirements (do not include 'strict' parameter)
  formatTools(tools: Tool[]): any[] {
    return tools.map((tool) => ({
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters,
    }));
  }

  // Build parameters for the OpenAI chat completion method
  buildParams(
    messageHistory: Message[],
    formattedTools: any[],
    toolChoice: any,
    systemPrompt: string
  ): any {
    const updatedMessageHistory = messageHistory.map((msg) => {
      if (msg.role === 'system') {
        return { ...msg, content: systemPrompt };
      }

      // Format messages with image data for OpenAI
      if (msg.image) {
        return {
          role: msg.role,
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${msg.image.mime};base64,${msg.image.data.toString('base64')}`
              }
            },
            ...(msg.content ? [{ type: 'text', text: msg.content }] : [])
          ]
        };
      }

      return {
        role: msg.role,
        content: msg.content
      };
    });

    const params: any = {
      messages: updatedMessageHistory
    };

    if (formattedTools.length > 0) {
      params.functions = formattedTools;
      if (toolChoice) {
        params.function_call = toolChoice.function;
      }
    }

    return params;
  }

  // Process the OpenAI response to extract AI message and function call
  processResponse(response: any): { aiMessage: any; functionCall?: any } {
    const aiMessage = response.choices[0]?.message;
    if (aiMessage?.function_call) {
      const functionCall = aiMessage.function_call;
      return {
        aiMessage,
        functionCall: {
          functionName: functionCall.name,
          functionArgs: JSON.parse(functionCall.arguments),
        },
      };
    }
    return { aiMessage };
  }
} 