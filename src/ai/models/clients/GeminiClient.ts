import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ModelClient, ModelType } from '../../types/agentSystem';
import { Logger } from '../../../utils/logger';

export class GeminiClient implements ModelClient {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  modelType: ModelType = 'gemini';

  constructor(
    modelName: string = 'gemini-1.5-pro',
    params: any = {}
  ) {
    const apiKey = process.env.GEMINI_API_KEY!;
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ 
      model: modelName,
      ...params
    });
  }

  async chatCompletion(params: any): Promise<any> {
    try {
      console.log('🤖 Gemini Input:', params);
      
      const result = await this.model.generateContent(params);
      const response = await result.response;
      console.log('🤖 Gemini Raw Response:', response);

      const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;
      if (functionCall) {
        const cleanArgs = Object.fromEntries(
          Object.entries(functionCall.args || {}).map(([key, value]) => [
            key,
            typeof value === 'string' ? value.replace(/\\'/g, "'") : value
          ])
        );

        return {
          choices: [{
            message: {
              role: 'assistant',
              content: null,
              function_call: {
                name: functionCall.name,
                arguments: JSON.stringify(cleanArgs)
              }
            }
          }]
        };
      }

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: response.text()?.replace(/\\'/g, "'") || ''
          }
        }]
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }
} 