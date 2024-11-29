import { assembleTwitterInterface } from '../twitter/utils/imageUtils';
import { ReplyAgent } from '../ai/agents/replyAgent/replyAgent';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';

// Function to generate AI reply to a tweet
export async function generateTweetReply(tweetId: string, prompt = "What would you reply to this tweet?"): Promise<string> {
  Logger.enable();

  // Assemble Twitter interface with tweet content and images
  const { textContent, imageContents } = await assembleTwitterInterface(".", tweetId);

  // Configure agent with pirate personality
  const runtimeVariables = {
    twitterInterface: textContent,
  };

  // Initialize OpenAI client and reply agent
  const openAIClient = new OpenAIClient("gpt-4o");
  const replyAgent = new ReplyAgent(openAIClient);

  // Add any images from the tweet to the agent's context
  if (imageContents && imageContents.length > 0) {
    replyAgent.addImage(
      imageContents.map(img => ({
        name: img.sender,
        mime: img.media_type,
        data: img.data,
      })),
    );
  }

  // Generate reply using the agent
  const response = await replyAgent.run(prompt, runtimeVariables);
  
  return response.output;
}