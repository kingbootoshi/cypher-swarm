import { client } from "./client";
import { Logger } from '../utils/logger';
import { configLoader } from '../utils/config';

// Define types for our message template and function responses
export type MessageTemplate = Array<{ role: string; content: string }>;
export type MemoryResponse = Promise<any>; // Replace 'any' with actual response type from mem0ai if available

// Get the agent name from config
const AGENT_NAME = configLoader.getAgentName();

/**
 * Base function to handle common memory addition logic and error handling
 * @param category Memory category (user_id in mem0)
 * @param msgTemplate Array of message objects
 * @param metadata Optional additional metadata
 * @param infer Optional flag to control memory inference (defaults to true)
 */
async function addMemoryBase(
    category: string,
    msgTemplate: MessageTemplate,
    metadata: Record<string, any> = {},
    infer: boolean = true
): MemoryResponse {
    try {
        // Always include UTC timestamp
        const timestamp = new Date().toISOString();
        
        const response = await client.add(msgTemplate, {
            agent_id: AGENT_NAME,
            user_id: category,
            metadata: { ...metadata, timestamp },
            infer
        });
        
        Logger.log(`Memory added to category: ${category}`);
        return response;
    } catch (error) {
        Logger.log(`Error adding memory to ${category}: ${error}`);
        throw error;
    }
}

/**
 * Add world knowledge to agent's memory
 */
export function addWorldKnowledge(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("world_knowledge", msgTemplate);
}

/**
 * Add crypto ecosystem knowledge to agent's memory
 */
export function addCryptoKnowledge(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("crypto_ecosystem_knowledge", msgTemplate);
}

/**
 * Add self-knowledge to agent's memory
 */
export function addSelfKnowledge(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase(`${AGENT_NAME}_self`, msgTemplate);
}

/**
 * Add user-specific knowledge to agent's memory
 * @param msgTemplate Array of message objects
 * @param userId Supabase user ID for the specific user
 */
export function addUserSpecificKnowledge(
    msgTemplate: MessageTemplate,
    userId: string
): MemoryResponse {
    return addMemoryBase(`user_${userId}`, msgTemplate);
}

/**
 * Add main tweets to agent's memory
 * Stores exact tweet content without inference to maintain original message integrity
 */
export function addMainTweet(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("main_tweets", msgTemplate, {}, false);
}

/**
 * Add image prompts to agent's memory
 */
export function addImagePrompt(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("image_prompts", msgTemplate);
}