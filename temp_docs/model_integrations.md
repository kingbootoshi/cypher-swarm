# Model Integration Documentation

## Overview

This document details the integration of DeepSeek and Gemini models into the existing agent system, following the established adapter pattern.

## Core Components

### 1. DeepSeek Integration

- **Location**: `src/ai/models/deepseek/`
- **Purpose**: Provides OpenAI-compatible interface for DeepSeek models
- **Key Files**:
  - `DeepSeekClient.ts`: Core client implementation
  - `DeepSeekAdapter.ts`: Model-specific adapter

### 2. Gemini Integration

- **Location**: `src/ai/models/gemini/`
- **Purpose**: Integrates Google's Gemini models with support for images
- **Key Files**:
  - `GeminiClient.ts`: Core client using official API
  - `GeminiAdapter.ts`: Model-specific adapter

## Implementation Details

### DeepSeek Adapter
```typescript
interface DeepSeekConfig {
  baseURL: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}
```
- Uses OpenAI-compatible endpoints
- Supports function calling through standard schema
- Maintains compatibility with existing ModelClient interface

### Gemini Adapter
```typescript
interface GeminiConfig {
  model: string;
  temperature: number;
  supportsImages: boolean;
}
```
- Implements image support via `supportsImages = true`
- Converts OpenAI function schemas to Gemini format
- Handles Gemini-specific response processing

## Best Practices

1. **Model Configuration**
   - Use environment variables for API endpoints
   - Set reasonable defaults for temperature and tokens
   - Document model-specific limitations

2. **Error Handling**
   - Implement comprehensive error catching
   - Convert provider-specific errors to standard format
   - Log meaningful error messages

3. **Response Processing**
   - Normalize responses to match existing system
   - Handle model-specific output formats
   - Validate function call responses

## Integration Testing

```typescript
describe('Model Integration', () => {
  it('should handle function calls consistently', async () => {
    const models = [
      new DeepSeekClient(),
      new GeminiClient()
    ];
    // Test function calling across models
  });
});
```

## Notes

- Both integrations maintain full compatibility with BaseAgent
- Function calling schemas are standardized across models
- Image support is model-dependent
- Error handling follows system-wide patterns 