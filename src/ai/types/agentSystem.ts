// types/index.ts

import { z } from 'zod';

export interface Message {
  role: 'system' | 'assistant' | 'user' | 'function';
  content?: string;
  name?: string;
  image?: {
    name: string;
    mime: string;
    data: Buffer | string;
  };
}

export interface AgentConfig {
  systemPromptTemplate: string;
  dynamicVariables?: {
    [key: string]: string | (() => string);
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    strict?: boolean;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export type ModelType = 'openai' | 'fireworks' | 'anthropic';

export interface ModelClient {
  modelType: ModelType;
  chatCompletion(params: any): Promise<any>;
}

// Base interface for all tool outputs
export type BaseToolOutput = Record<string, unknown>;

// Type to extract Zod schema type
export type ZodSchemaType<T extends z.ZodTypeAny> = z.infer<T>;

// Type to get tool output type from schema
export type ToolOutputFromSchema<T extends z.ZodTypeAny> = z.infer<T>;

// Generic type for agent run results
export interface AgentRunResult<T extends z.ZodTypeAny | null = null> {
  success: boolean;
  output: T extends z.ZodTypeAny ? ToolOutputFromSchema<T> : string;
  error?: string;
}
