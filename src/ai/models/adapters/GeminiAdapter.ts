import { ModelAdapter } from './ModelAdapter';
import { Message, Tool } from '../../types/agentSystem';
import { Logger } from '../../../utils/logger';

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export class GeminiAdapter implements ModelAdapter {
  supportsImages = true;

  buildToolChoice(tools: Tool[]): any {
    return tools.length > 0 ? "ALWAYS" : "NONE";
  }

  formatTools(tools: Tool[]): any {
    return {
      tools: [{
        functionDeclarations: tools.map(tool => ({
          name: tool.function.name,
          description: tool.function.description,
          parameters: {
            type: "OBJECT",
            properties: this.convertParameterTypes(tool.function.parameters.properties),
            required: tool.function.parameters.required || []
          }
        }))
      }]
    };
  }

  buildParams(
    messageHistory: Message[],
    formattedTools: any[],
    toolChoice: any,
    systemPrompt: string
  ): any {
    try {
      return {
        contents: [{
          role: 'user',
          parts: [{
            text: messageHistory[messageHistory.length - 1].content || ''
          }]
        }],
        ...formattedTools
      };
    } catch (error) {
      console.error('Error in GeminiAdapter.buildParams:', error);
      throw error;
    }
  }

  processResponse(response: any): { aiMessage: any; functionCall?: any } {
    const candidate = response.choices[0]?.message;

    // Handle function calls
    if (candidate?.function_call) {
      return {
        aiMessage: {
          role: 'assistant',
          content: null
        },
        functionCall: {
          functionName: candidate.function_call.name,
          functionArgs: JSON.parse(candidate.function_call.arguments)
        }
      };
    }

    // Handle normal responses
    return {
      aiMessage: {
        role: 'assistant',
        content: candidate?.content || ''
      }
    };
  }

  private convertParameterTypes(properties: any): any {
    // Convert JSON Schema types to Gemini types
    const typeMapping: { [key: string]: string } = {
      'string': 'STRING',
      'number': 'NUMBER',
      'integer': 'INTEGER',
      'boolean': 'BOOLEAN',
      'array': 'ARRAY',
      'object': 'OBJECT'
    };

    const convertedProperties: any = {};

    for (const [key, value] of Object.entries(properties)) {
      const property: any = value;
      convertedProperties[key] = {
        type: typeMapping[property.type] || property.type,
        description: property.description
      };

      // Handle special properties
      if (property.enum) {
        convertedProperties[key].enum = property.enum;
      }
      if (property.items) {
        convertedProperties[key].items = this.convertParameterTypes({ temp: property.items }).temp;
      }
    }

    return convertedProperties;
  }
} 