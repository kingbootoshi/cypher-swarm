import Anthropic from '@anthropic-ai/sdk';
import { ModelClient, ModelType } from '../../types/agentSystem';

export class AnthropicClient implements ModelClient {
  private anthropic: Anthropic;
  private modelName: string;
  private defaultParams: any;
  modelType: ModelType = 'anthropic';

  constructor(
    modelName: string,
    params: any = {}
  ) {
    const apiKey = process.env.ANTHROPIC_API_KEY!;
    this.anthropic = new Anthropic({ apiKey });

    this.modelName = modelName;
    this.defaultParams = {
      temperature: 1,
      max_tokens: 1000,
      ...params, // Override defaults with provided params
    };
  }

  async chatCompletion(params: any): Promise<any> {
    try {
      const requestParams = {
        model: this.modelName,
        ...this.defaultParams,
        ...params,
      };

      const response = await this.anthropic.messages.create(requestParams);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
