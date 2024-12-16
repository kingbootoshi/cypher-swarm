import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { MemoryAgent } from '../ai/agents/memoryAgent/memoryAgent';
import {
    searchWorldKnowledge,
    searchCryptoKnowledge,
    searchSelfKnowledge,
    searchUserSpecificKnowledge,
    formatMemoryResults,
    searchMainTweet,
    searchReplyTweet,
    searchImagePrompt,
    searchQuoteTweet
} from '../memory/searchMemories';
import { getUserIDsFromUsernames } from '../utils/getUserIDfromUsername';

// Define memory types that can be loaded
export interface MemoryOptions {
    worldKnowledge?: boolean;
    cryptoKnowledge?: boolean;
    selfKnowledge?: boolean;
    mainTweets?: boolean;
    replyTweets?: boolean;
    quoteTweets?: boolean;
    userTweets?: boolean;
    imagePrompts?: boolean;
}

// Default options when none specified
const DEFAULT_MEMORY_OPTIONS: MemoryOptions = {
    worldKnowledge: true,
    cryptoKnowledge: true,
    selfKnowledge: true,
    mainTweets: true,
    replyTweets: true,
    quoteTweets: true,
    userTweets: true,
    imagePrompts: false
};

/**
 * Loads and formats memories from various knowledge bases based on input text and specified options
 * @param textContent - The main text content to generate memory queries from
 * @param options - Configuration object to specify which types of memories to load
 * @param usernames - Array of usernames to fetch specific memories for
 * @returns Formatted string containing selected memory results with markdown headers
 */
export async function loadMemories(
    textContent: string, 
    options: MemoryOptions = DEFAULT_MEMORY_OPTIONS,
    usernames?: string[]
): Promise<string> {
    try {
        const openAIClient = new OpenAIClient("gpt-4o-mini");
        const memoryAgent = new MemoryAgent(openAIClient);
        
        // Generate memory query from content
        const memoryQuery = await memoryAgent.run("LOAD IN MEMORIES BASED ON THIS INPUT:" + textContent);
        const query = memoryQuery.output.memory_query;
        Logger.log("Generated memory query:", query);

        // Initialize result string
        let formattedMemories = '';

        // Conditionally add each memory section based on options
        if (options.worldKnowledge) {
            const worldKnowledgeResults = await searchWorldKnowledge(query);
            Logger.log("World Knowledge Results:", worldKnowledgeResults);
            formattedMemories += `### WORLD KNOWLEDGE\n${formatMemoryResults(worldKnowledgeResults)}\n\n`;
        }

        if (options.cryptoKnowledge) {
            const cryptoKnowledgeResults = await searchCryptoKnowledge(query);
            Logger.log("Crypto Knowledge Results:", cryptoKnowledgeResults);
            formattedMemories += `### CRYPTO KNOWLEDGE\n${formatMemoryResults(cryptoKnowledgeResults)}\n\n`;
        }

        if (options.selfKnowledge) {
            const selfKnowledgeResults = await searchSelfKnowledge(query);
            Logger.log("Self Knowledge Results:", selfKnowledgeResults);
            formattedMemories += `### MY OPINIONS/FEELINGS\n${formatMemoryResults(selfKnowledgeResults)}\n\n`;
        }

        if (options.mainTweets) {
            const mainTweetKnowledgeResults = await searchMainTweet(query);
            Logger.log("Main Tweet Knowledge Results:", mainTweetKnowledgeResults);
            formattedMemories += `### POTENTIALLY RELEVANT TWEETS I MADE\nWARNING: DO NOT REPEAT THESE TWEETS. YOU ALREADY MADE THESE TWEETS. YOU MUST MAKE NEW DRASTICALLY DIFFERENT TWEETS.\n${formatMemoryResults(mainTweetKnowledgeResults)}\n\n`;
        }

        if (options.replyTweets) {
            const replyTweetResults = await searchReplyTweet(query);
            Logger.log("Reply Tweet Knowledge Results:", replyTweetResults);
            formattedMemories += `### POTENTIALLY RELEVANT REPLY TWEETS I MADE\nWARNING: DO NOT REPEAT THESE TWEETS. YOU ALREADY MADE THESE TWEETS. YOU MUST MAKE NEW DRASTICALLY DIFFERENT TWEETS.\n${formatMemoryResults(replyTweetResults)}\n\n`;
        }

        if (options.quoteTweets) {
            const quoteTweetResults = await searchQuoteTweet(query);
            Logger.log("Quote Tweet Knowledge Results:", quoteTweetResults);
            formattedMemories += `### POTENTIALLY RELEVANT QUOTE TWEETS I MADE\n${formatMemoryResults(quoteTweetResults)}\n\n`;
        }

        if (options.imagePrompts) {
            const imagePromptResults = await searchImagePrompt(query);
            Logger.log("Image Prompt Results:", imagePromptResults);
            formattedMemories += `### RELEVANT IMAGE PROMPTS\n${formatMemoryResults(imagePromptResults)}\n\n`;
        }

        if (options.userTweets && usernames && usernames.length > 0) {
            const userIds = await getUserIDsFromUsernames(usernames);
            
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
        throw error;
    }
} 