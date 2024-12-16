import { assembleTwitterInterface } from '../twitter/utils/imageUtils';
import { ReplyAgent } from '../ai/agents/replyAgent/replyAgent';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { FireworkClient } from '../ai/models/clients/FireworkClient';
import { replyToTweet } from '../twitter/functions/replyToTweet';
import { loadMemories } from './loadMemories';
import { getFormattedRecentHistory } from '../supabase/functions/terminal/terminalHistory';

// Type for the reply result
interface ReplyResult {
  success: boolean;
  tweetId?: string;
  message: string;
  replyText: string;
  mediaUrls?: string[];
}

/**
 * Enhanced pipeline that handles the entire reply process including:
 * - Interface assembly
 * - Reply generation
 * - Tweet posting
 * - Result formatting
 */
export async function generateAndPostTweetReply(
  tweetId: string,
  mediaUrls?: string[],
  prompt = "What would you reply to this tweet?"
): Promise<ReplyResult> {
  Logger.enable();
  try {
    // Assemble Twitter interface
    const { textContent, imageContents, usernames } = await assembleTwitterInterface(tweetId);
    
    // Generate AI reply
    const replyText = await generateTweetReply(tweetId, prompt, textContent, imageContents, usernames);
    
    // Post the reply
    const result = await replyToTweet(tweetId, replyText, mediaUrls, textContent);
    
    return {
      success: result.success,
      tweetId: result.tweetId,
      message: result.message,
      replyText,
      mediaUrls
    };
  } catch (error) {
    Logger.log('Failed to generate and post reply:', error);
    throw error;
  }
}

// Original function now focused solely on AI generation
async function generateTweetReply(
  tweetId: string,
  prompt: string,
  textContent?: string,
  imageContents?: any[],
  usernames?: string[]
): Promise<string> {
  Logger.enable();

  // Use preassembled interface data if provided
  if (!textContent || !imageContents) {
    // Assemble Twitter interface if not provided
    const interfaceData = await assembleTwitterInterface(tweetId);
    textContent = interfaceData.textContent;
    imageContents = interfaceData.imageContents;
    usernames = interfaceData.usernames;
  }

  const formattedHistory = await getFormattedRecentHistory();

  // Load memories with empty array fallback for undefined usernames
  const memories = await loadMemories(`What memories should we load in to reply to this tweet? TWEET:\n\n${textContent}`, {
    worldKnowledge: true,
    cryptoKnowledge: true,
    selfKnowledge: true,
    mainTweets: false,
    replyTweets: true,
    userTweets: true,
    imagePrompts: false,
    quoteTweets: false
}, usernames);
  Logger.log('Active memories fetched:', memories);

  // Configure agent with runtime variables
  const runtimeVariables = {
    twitterInterface: textContent,
    terminalLog: formattedHistory,
    memories: memories
  };

  // Initialize OpenAI client and reply agent
  const openAIClient = new OpenAIClient("gpt-4o-mini");
  const fireworksClient = new FireworkClient("accounts/fireworks/models/llama-v3p3-70b-instruct");
  const replyAgent = new ReplyAgent(openAIClient);

  // Add images to the agent's context if available
  if (imageContents && imageContents.length > 0) {
    replyAgent.addImage(
      imageContents.map(img => ({
        name: img.sender,
        mime: img.media_type,
        data: img.data,
      }))
    );
  }

  // Generate reply using the agent
  const response = await replyAgent.run(`GENERATE A REPLY FOR THE FOLLOWING TWEET:\n\n${textContent}`, runtimeVariables);
  
  return response.output.reply_tweet;
}