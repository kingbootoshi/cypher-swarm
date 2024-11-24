// Type definitions for command parameters and commands

/**
 * Represents a command parameter.
 */
export interface CommandParameter {
    /**
     * The name of the parameter.
     */
    name: string;
  
    /**
     * A description of the parameter.
     */
    description: string;
  
    /**
     * Whether the parameter is required.
     */
    required: boolean;
  
    /**
     * The default value of the parameter (if any).
     */
    defaultValue?: string;
  
    /**
     * The expected type of the parameter.
     */
    type?: 'string' | 'number' | 'boolean';
  }
  
  /**
   * Defines the structure of a command.
   */
  export interface Command {
    /**
     * The name of the command.
     */
    name: string;
  
    /**
     * A description of what the command does.
     */
    description: string;
  
    /**
     * The parameters that the command accepts.
     */
    parameters?: CommandParameter[];
  
    /**
     * The function that handles the command execution.
     */
    handler: CommandHandler;
  }
  
  /**
   * Defines the command handler function type.
   */
  export type CommandHandler = (
    args: { [key: string]: any }
  ) => Promise<{
    /**
     * The output of the command execution.
     */
    output: string;
  }>;