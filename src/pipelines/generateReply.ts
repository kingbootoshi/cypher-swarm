import { assembleTwitterInterface } from '../twitter/utils/imageUtils';
import { ReplyAgent } from '../ai/agents/replyAgent/replyAgent';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { replyToTweet } from '../twitter/functions/replyToTweet';

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
    const { textContent, imageContents } = await assembleTwitterInterface(".", tweetId);
    
    // Generate AI reply
    const replyText = await generateTweetReply(tweetId, prompt, textContent, imageContents);
    
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
  imageContents?: any[]
): Promise<string> {
  Logger.enable();

  // Use preassembled interface data if provided
  if (!textContent || !imageContents) {
    // Assemble Twitter interface if not provided
    const interfaceData = await assembleTwitterInterface(".", tweetId);
    textContent = interfaceData.textContent;
    imageContents = interfaceData.imageContents;
  }

  // Configure agent with runtime variables
  const runtimeVariables = {
    twitterInterface: textContent,
  };

  // Initialize OpenAI client and reply agent
  const openAIClient = new OpenAIClient("gpt-4o");
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
  const response = await replyAgent.run(prompt, runtimeVariables);
  
  return response.output;
}