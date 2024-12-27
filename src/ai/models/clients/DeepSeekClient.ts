import OpenAI from 'openai';
import { ModelClient, ModelType } from '../../types/agentSystem';

export class DeepSeekClient implements ModelClient {
  private client: OpenAI;
  private model: string;
  private defaultParams: any;
  modelType: ModelType = 'deepseek';

  constructor(
    model: string = 'deepseek-chat',
    params: any = {}
  ) {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: 'https://api.deepseek.com'
    });

    this.model = model;
    this.defaultParams = {
      temperature: 0.7,
      max_tokens: 1000,
      ...params
    };
  }

  async chatCompletion(params: any): Promise<any> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        ...this.defaultParams,
        ...params
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
} 