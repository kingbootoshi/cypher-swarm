# Terminal Command System Documentation

## Command Template

```typescript
import { Command } from '../../types/CommandType';

/**
 * @command your-command-name
 * @description A clear description of what your command does
 */
export const yourCommand: Command = {
  name: 'your-command-name',
  description: 'A clear description of what your command does',
  parameters: [
    {
      name: 'parameterName',
      description: 'Description of what this parameter does',
      required: true,
      type: 'string', // 'string' | 'number' | 'boolean'
      defaultValue: 'optional default value',
    },
  ],
  handler: async (args) => {
    try {
      // Command implementation
      return {
        output: 'Success message or result',
      };
    } catch (error) {
      return {
        output: `Error: ${error.message}`,
      };
    }
  },
};
```

## Implementation Steps

1. Create your command file in `src/terminal/commands/`
2. Define the command using the template above
3. Add command to `src/terminal/commands/index.ts`
4. Test using the terminal: `@your-command-name [parameters]`

## Best Practices

- Use kebab-case for command names (e.g., `get-user`, `create-post`)
- Write clear, concise descriptions
- Include parameter validation in the handler
- Return meaningful success/error messages
- Document any side effects or important notes
