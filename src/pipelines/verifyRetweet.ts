import { assembleTwitterInterface } from '../twitter/utils/imageUtils';
import { VerifyRetweetAgent } from '../ai/agents/verifyRetweetAgent/verifyRetweetAgent';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { retweet } from '../twitter/functions/retweet';

// Type for the reply result
type ReplyResult = {
  success: boolean;
  message: string;
}

/**
 * Enhanced pipeline that handles verifying re-tweets because this AI is a fucking menace and so are people:
 */

export async function confirmRetweet(
  tweetId: string,
): Promise<ReplyResult> {
  Logger.enable();
  try {
    // Assemble Twitter interface
    const { textContent, imageContents } = await assembleTwitterInterface(tweetId);
    
    // Generate AI reply with reason
    const { shouldRetweet, reason } = await verifyRetweet(textContent, imageContents);
    
    if (shouldRetweet) {
      await retweet(tweetId);
      return {
        success: true,
        message: "Successfully retweeted tweet"
      };
    } else {
      return {
        success: false,
        message: `Retweet denied: ${reason}`
      };
    }
  } catch (error) {
    Logger.log('Failed to confirm retweet:', error);
    throw error;
  }
}

// Original function now focused solely on AI generation
async function verifyRetweet(
  textContent?: string,
  imageContents?: any[],
): Promise<{ shouldRetweet: boolean; reason: string }> {
  Logger.enable();

  // Initialize OpenAI client and reply agent
  const openAIClient = new OpenAIClient("gpt-4o-mini");
  const verifyAgent = new VerifyRetweetAgent(openAIClient);

  // Add images to the agent's context if available
  if (imageContents && imageContents.length > 0) {
    verifyAgent.addImage(
      imageContents.map(img => ({
        name: img.sender,
        mime: img.media_type,
        data: img.data,
      }))
    );
  }

  // Generate reply using the agent
  const response = await verifyAgent.run(`VERIFY IF WE SHOULD RETWEET THE FOLLOWING TWEET:\n\n${textContent}`);

  const reason = response.output.internal_thought;
  
  return {
    shouldRetweet: response.output.confirm_retweet,
    reason
  };
}