import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

// Interface for agent configuration
export interface AgentConfig {
  name: string;
  raw_personality: string;
}

// Interface for the entire configuration
interface Config {
  agent: AgentConfig;
}

class ConfigLoader {
  private static instance: ConfigLoader;
  private config: Config;

  private constructor() {
    try {
      // Load the YAML file
      const configPath = path.join(__dirname, '..', 'config', 'agent.yaml');
      const fileContents = fs.readFileSync(configPath, 'utf8');
      this.config = yaml.load(fileContents) as Config;
      Logger.log('Configuration loaded successfully');
    } catch (error) {
      Logger.log(`Error loading configuration: ${error}`);
      throw error;
    }
  }

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  public getAgentConfig(): AgentConfig {
    return this.config.agent;
  }

  public getAgentName(): string {
    return this.config.agent.name;
  }

  public getRawPersonality(): string {
    return this.config.agent.raw_personality.trim();
  }
}

export const configLoader = ConfigLoader.getInstance(); 