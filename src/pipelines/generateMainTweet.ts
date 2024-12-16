import { MainTweetAgent } from "../ai/agents/mainTweetAgent/mainTweetAgent";
import { MediaAgent } from "../ai/agents/mediaAgent/mediaAgent";
import { OpenAIClient } from "../ai/models/clients/OpenAiClient";
import { sendTweet } from "../twitter/functions/sendTweet";
import { loadMemories } from "./loadMemories";
import { getFormattedRecentHistory } from '../supabase/functions/terminal/terminalHistory';
import { generateImage } from './mediaGeneration/imageGen';
import { generateImageToVideo } from './mediaGeneration/combinedGeneration';
import { Logger } from '../utils/logger';
import { FireworkClient } from "../ai/models/clients/FireworkClient";

// Type for the main tweet result
interface MainTweetResult {
  success: boolean;
  tweetId?: string;
  message: string;
  tweetText: string;
  mediaUrls?: string[];
}

/**
 * Enhanced pipeline that handles the entire main tweet process including:
 * - Tweet generation
 * - Media generation (if any)
 * - Tweet posting
 * - Result formatting
 */
export async function generateAndPostMainTweet(
  topic = "Generate a main tweet based on your recent activities."
): Promise<MainTweetResult> {
  Logger.enable();
  try {
    // Initialize AI clients and agents
    const openAIClient = new OpenAIClient("gpt-4o-mini");
    const mainTweetAgent = new MainTweetAgent(openAIClient);

    // Load memories and terminal history
    const formattedHistory = await getFormattedRecentHistory();

    // Load memories
    const relevantMemories = await loadMemories(`Load in memories based on this following topic: ${topic}`, {
      worldKnowledge: true,
      cryptoKnowledge: true,
      selfKnowledge: true,
      mainTweets: true,
      replyTweets: false,
      userTweets: false,
      imagePrompts: false,
      quoteTweets: false
    });

    // Set up runtime variables
    const runtimeVariables = {
      memories: relevantMemories,
      terminalLog: formattedHistory,
    };

    // Generate main tweet
    const mainTweetResponse = await mainTweetAgent.run(`GENERATE A MAIN TWEET ABOUT ${topic}`, runtimeVariables);
    const tweetText = mainTweetResponse.output.main_tweet;

    // Send the tweet using sendTweet function
    const tweetId = await sendTweet(tweetText);

    if (tweetId) {
      Logger.log(`Tweet sent successfully (ID: ${tweetId})`);
      return {
        success: true,
        tweetId,
        message: 'Successfully posted the main tweet.',
        tweetText,
      };
    } else {
      Logger.log('Failed to send the tweet.');
      return {
        success: false,
        message: 'Failed to post the main tweet.',
        tweetText,
      };
    }
  } catch (error) {
    Logger.log('Error generating and posting main tweet:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      tweetText: '',
    };
  }
}