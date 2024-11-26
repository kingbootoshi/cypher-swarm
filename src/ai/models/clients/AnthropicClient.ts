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
      temperature: 0.8,
      max_tokens: 1000,
      ...params,
    };
  }

  async chatCompletion(params: any): Promise<any> {
    try {
      const messages = params.messages?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      const requestParams = {
        model: this.modelName,
        ...this.defaultParams,
        ...params,
        messages: messages || params.messages,
      };

      const response = await this.anthropic.messages.create(requestParams);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
