import { client } from "./client";
import { Logger } from '../utils/logger';

// Define types for our message template and function responses
export type MessageTemplate = Array<{ role: string; content: string }>;
export type MemoryResponse = Promise<any>; // Replace 'any' with actual response type from mem0ai if available

/**
 * Base function to handle common memory addition logic and error handling
 * @param category Memory category (user_id in mem0)
 * @param msgTemplate Array of message objects
 * @param metadata Optional additional metadata
 */
async function addMemoryBase(
    category: string,
    msgTemplate: MessageTemplate,
    metadata: Record<string, any> = {}
): MemoryResponse {
    try {
        // Always include UTC timestamp
        const timestamp = new Date().toISOString();
        
        const response = await client.add(msgTemplate, {
            agent_id: "satoshi",
            user_id: category,
            metadata: { ...metadata, timestamp }
        });
        
        Logger.log(`Memory added to category: ${category}`);
        return response;
    } catch (error) {
        Logger.log(`Error adding memory to ${category}: ${error}`);
        throw error;
    }
}

/**
 * Add world knowledge to Satoshi's memory
 */
export function addWorldKnowledge(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("world_knowledge", msgTemplate);
}

/**
 * Add crypto ecosystem knowledge to Satoshi's memory
 */
export function addCryptoKnowledge(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("crypto_ecosystem_knowledge", msgTemplate);
}

/**
 * Add self-knowledge to Satoshi's memory
 */
export function addSelfKnowledge(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("satoshi_self", msgTemplate);
}

/**
 * Add user-specific knowledge to Satoshi's memory
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
 * Add main tweets to Satoshi's memory
 */
export function addMainTweet(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("main_tweets", msgTemplate);
}

/**
 * Add image prompts to Satoshi's memory
 */
export function addImagePrompt(msgTemplate: MessageTemplate): MemoryResponse {
    return addMemoryBase("image_prompts", msgTemplate);
}