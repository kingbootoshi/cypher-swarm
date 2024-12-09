import { client } from "./client";
import { Logger } from '../utils/logger';
import { configLoader } from '../utils/config';

// Get the agent name from config
const AGENT_NAME = configLoader.getAgentName();

// Helper function to format search results into bullet points
export const formatMemoryResults = (results: any[]) => {
    return results
        .map(result => `• ${result.memory}`)
        .join('\n');
};

// Define types for query function inputs and responses
export type MemoryResponse = Promise<any>; // Replace 'any' with the actual response type from mem0ai if available

/**
 * Base function to handle common memory search logic and error handling
 * @param category Memory category to search within
 * @param query The search query string
 * @param limit Optional parameter to specify number of results (defaults to 10)
 */
async function searchMemoryBase(
    category: string,
    query: string,
    limit: number = 10, // Default limit of 10 if not specified
): MemoryResponse {
    try {
        Logger.log(`Executing search in category: ${category} with limit: ${limit}`);
        Logger.log(`Query: "${query}"`);

        // Construct filters based on category and agent_id
        const filters = {
            AND: [
                { user_id: category },
                { agent_id: { in: [AGENT_NAME] } },
            ]
        };

        // Perform the search using the client.search method
        const response = await client.search(query, {
            filters: filters,
            api_version: "v2",
            limit: limit, // Use the passed limit parameter
        });

        Logger.log(`Search response from category: ${category}`, response);

        // Format the search results
        const formattedResults = formatMemoryResults(response);
        Logger.log(`Formatted Results:\n${formattedResults}`);

        return response;
    } catch (error) {
        Logger.log(`Error searching memory in category "${category}" with query "${query}":`, error);
        throw new Error(`Failed to search memory in category "${category}": ${error.message}`);
    }
}

/**
 * Search world knowledge in Satoshi's memory
 * @param query The search query string
 */
export async function searchWorldKnowledge(query: string): MemoryResponse {
    // Search within the 'world_knowledge' category
    return searchMemoryBase("world_knowledge", query);
}

/**
 * Search crypto ecosystem knowledge in Satoshi's memory
 * @param query The search query string
 */
export async function searchCryptoKnowledge(query: string): MemoryResponse {
    // Search within the 'crypto_ecosystem_knowledge' category
    return searchMemoryBase("crypto_ecosystem_knowledge", query);
}

/**
 * Search self-knowledge in agent's memory
 * @param query The search query string
 */
export async function searchSelfKnowledge(query: string): MemoryResponse {
    // Search within the '{agent_name}_self' category
    return searchMemoryBase(`${AGENT_NAME}_self`, query);
}

/**
 * Search user-specific knowledge in Satoshi's memory
 * @param query The search query string
 * @param userId Supabase user ID for the specific user
 */
export async function searchUserSpecificKnowledge(
    query: string,
    userId: string
): MemoryResponse {
    // Use 'user_{id}' as the category to search within the specific user's memories
    return searchMemoryBase(`user_${userId}`, query);
}

/**
 * Search main tweets in Satoshi's memory with a limit of 5 results
 * @param query The search query string
 */
export async function searchMainTweet(query: string): MemoryResponse {
    // Search within the 'main_tweets' category with specific limit of 5
    return searchMemoryBase("main_tweets", query, 5);
}

/**
 * Search image prompts in Satoshi's memory
 * @param query The search query string
 */
export async function searchImagePrompt(query: string): MemoryResponse {
    // Search within the 'image_prompts' category
    return searchMemoryBase("image_prompts", query, 5);
}

/**
 * Search reply tweets in agent's memory with a limit of 5 results
 * @param query The search query string
 */
export async function searchReplyTweet(query: string): MemoryResponse {
    // Search within the 'reply_tweets' category with specific limit of 5
    return searchMemoryBase("reply_tweets", query, 5);
}

/**
 * Search quote tweets in agent's memory with a limit of 5 results
 * @param query The search query string
 */
export async function searchQuoteTweet(query: string): MemoryResponse {
    // Search within the 'quote_tweets' category with specific limit of 5
    return searchMemoryBase("quote_tweets", query, 5);
}