// types/index.ts

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string; // For function calls
}

export interface AgentConfig {
  personalityPrompt: string;
  mainGoal: string;
  outputFormat: string;
  dynamicVariables?: Record<string, any>;
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any; // JSON Schema
    strict?: boolean;
  };
}

export type ModelType = 'openai' | 'fireworks' | 'anthropic';

export interface ModelClient {
  modelType: ModelType;
  chatCompletion(params: any): Promise<any>;
}
