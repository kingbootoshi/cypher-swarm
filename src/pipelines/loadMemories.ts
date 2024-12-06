import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { MemoryAgent } from '../ai/agents/memoryAgent/memoryAgent';
import {
    searchWorldKnowledge,
    searchCryptoKnowledge,
    searchSelfKnowledge,
    searchUserSpecificKnowledge,
    formatMemoryResults,
    searchMainTweet
} from '../memory/searchMemories';
import { getUserIDsFromUsernames } from '../utils/getUserIDfromUsername';
import { getShortTermHistory } from '../supabase/functions/terminal/terminalHistory';

// Enable logging for detailed output
Logger.enable();

/**
 * Loads and formats memories from various knowledge bases based on input text
 * @param textContent - The main text content to generate memory queries from
 * @param usernames - Array of usernames to fetch specific memories for
 * @returns Formatted string containing all memory results with markdown headers
 */
export async function loadMemories(textContent: string, usernames?: string[]): Promise<string> {
    try {
        const openAIClient = new OpenAIClient("gpt-4o");
        const memoryAgent = new MemoryAgent(openAIClient);
        
        // Generate memory query from content
        const memoryQuery = await memoryAgent.run("LOAD IN MEMORIES BASED ON THIS INPUT:" + textContent);
        const query = memoryQuery.output.memory_query;
        Logger.log("Generated memory query:", query);

        // Initialize result string with formatted sections
        let formattedMemories = '';

        // Add World Knowledge section
        const worldKnowledgeResults = await searchWorldKnowledge(query);
        Logger.log("World Knowledge Results:", worldKnowledgeResults);
        formattedMemories += `### WORLD KNOWLEDGE\n${formatMemoryResults(worldKnowledgeResults)}\n\n`;

        // Add Crypto Knowledge section
        const cryptoKnowledgeResults = await searchCryptoKnowledge(query);
        Logger.log("Crypto Knowledge Results:", cryptoKnowledgeResults);
        formattedMemories += `### CRYPTO KNOWLEDGE\n${formatMemoryResults(cryptoKnowledgeResults)}\n\n`;

        // Add Self Knowledge section
        const selfKnowledgeResults = await searchSelfKnowledge(query);
        Logger.log("Self Knowledge Results:", selfKnowledgeResults);
        formattedMemories += `### MY OPINIONS/FEELINGS\n${formatMemoryResults(selfKnowledgeResults)}\n\n`;

        // Add Main Tweet Knowledge section
        const mainTweetKnowledgeResults = await searchMainTweet(query);
        Logger.log("Main Tweet Knowledge Results:", mainTweetKnowledgeResults);
        formattedMemories += `### POTENTIALLY RELEVANT TWEETS I MADE\n${formatMemoryResults(mainTweetKnowledgeResults)}\n\n`;

        // Proceed with user-specific memory search only if usernames are provided
        if (usernames && usernames.length > 0) {
            // Fetch user IDs based on provided usernames
            const userIds = await getUserIDsFromUsernames(usernames);
            
            // Iterate over each username to retrieve and format their specific memories
            for (const username of usernames) {
                const userId = userIds[username];
                if (userId) {
                    const userSpecificResults = await searchUserSpecificKnowledge(query, userId);
                    Logger.log(`User-Specific Knowledge Results for @${username}:`, userSpecificResults);
                    formattedMemories += `### MEMORIES FOR @${username}\n${formatMemoryResults(userSpecificResults)}\n\n`;
                } else {
                    Logger.log(`User ID not found for username: ${username}`);
                }
            }
        }

        return formattedMemories.trim();

    } catch (error) {
        Logger.log("An error occurred during memory retrieval:", error);
        throw error; // Re-throw to allow handling by caller
    }
} 