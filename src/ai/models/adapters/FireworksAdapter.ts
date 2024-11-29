import { ModelAdapter } from './ModelAdapter';
import { Message, Tool } from '../../types/agentSystem';

// Adapter for Fireworks models
export class FireworksAdapter implements ModelAdapter {
  supportsImages = false;  // Fireworks doesn't support images

  // Build tool choice specific to Fireworks
  buildToolChoice(tools: Tool[]): any {
    if (tools.length > 0) {
      return {
        type: 'function',
        function: { name: tools[0].function.name },
      };
    }
    return undefined;
  }

  // Format tools for Fireworks (remove 'strict' parameter if it exists)
  formatTools(tools: Tool[]): any[] {
    return tools.map((tool) => {
      // Destructure 'strict' from tool.function to exclude it
      const { strict, ...functionWithoutStrict } = tool.function;
      return {
        // Return the tool with the modified function object
        ...tool,
        function: functionWithoutStrict,
      };
    });
  }

  // Build parameters for the Fireworks chat completion method
  buildParams(
    messageHistory: Message[],
    formattedTools: any[],
    toolChoice: any,
    systemPrompt: string
  ): any {
    // Filter out messages with images since Fireworks doesn't support them
    const filteredMessages = messageHistory.filter(msg => !msg.image);
    
    // Replace or update the system message in the message history
    const updatedMessageHistory = filteredMessages.map(msg =>
      msg.role === 'system'
        ? { ...msg, content: systemPrompt }
        : msg
    );

    const params: any = {
      messages: updatedMessageHistory.map((msg) => ({
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

  // Process the Fireworks response to extract AI message and function call
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