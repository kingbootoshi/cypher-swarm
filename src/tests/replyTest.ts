import { assembleTwitterInterface } from '../twitter/utils/imageUtils';
import { ReplyAgent } from '../ai/agents/replyAgent/replyAgent';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';

// Function to generate AI reply to a tweet
export async function generateTweetReply(
  tweetId: string,
  prompt = "What would you reply to this tweet?",
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