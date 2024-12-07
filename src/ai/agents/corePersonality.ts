// src/ai/agentConfigs/corePersonality.ts

import { configLoader } from '../../utils/config';

// Get the raw personality from config
export const CORE_PERSONALITY = configLoader.getRawPersonality();

// Export the agent name for consistency across the application
export const AGENT_NAME = configLoader.getAgentName();

/**
 * Generates the system prompt for the AI agent
 * @returns The complete system prompt including the core personality
 */
export function generateSystemPrompt(): string {
    return `${CORE_PERSONALITY}`;
}
