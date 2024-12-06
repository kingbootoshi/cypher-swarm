import { MainTweetAgent } from "../ai/agents/mainTweetAgent/mainTweetAgent";
import { MediaAgent } from "../ai/agents/mediaAgent/mediaAgent";
import { OpenAIClient } from "../ai/models/clients/OpenAiClient";
import { AnthropicClient } from "../ai/models/clients/AnthropicClient";
import { sendTweet } from "../twitter/functions/sendTweet";
import { loadMemories } from "./loadMemories";
import { getFormattedRecentHistory } from '../supabase/functions/terminal/terminalHistory';
import { generateImage } from './mediaGeneration/imageGen';
import { generateImageToVideo } from './mediaGeneration/combinedGeneration';
import { Logger } from '../utils/logger';

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
  prompt = "Generate a main tweet based on your recent activities."
): Promise<MainTweetResult> {
  Logger.enable();
  try {
    // Initialize AI clients and agents
    const openAIClient = new OpenAIClient("gpt-4o");
    const anthropicClient = new AnthropicClient("claude-3-5-sonnet-20241022");
    const mainTweetAgent = new MainTweetAgent(anthropicClient);
    const mediaAgent = new MediaAgent(anthropicClient);

    // Load memories and terminal history
    const formattedHistory = await getFormattedRecentHistory();
    const relevantMemories = await loadMemories(`[SHORT TERM TERMINAL LOGS]\n\n${formattedHistory}`);

    // Set up runtime variables
    const runtimeVariables = {
      memories: relevantMemories,
      terminalLog: formattedHistory,
    };

    // Generate main tweet
    const mainTweetResponse = await mainTweetAgent.run(prompt, runtimeVariables);
    const tweetText = mainTweetResponse.output.main_tweet;
    const mediaIncluded = mainTweetResponse.output.media_included;

    // Generate media if included
    let mediaUrls: string[] | undefined;
    if (mediaIncluded) {
      const mediaResponse = await mediaAgent.run(`[MAIN TWEET]\n\n${tweetText}`, runtimeVariables);
      const contentType = mediaResponse.output.content_type;
      const mediaPrompt = mediaResponse.output.media_prompt;

      // Generate media and obtain media URLs
      if (contentType === 'image') {
        const mediaUrl = await generateImage(mediaPrompt);
        mediaUrls = [mediaUrl];
        Logger.log("Generated Image URL:", mediaUrl);
      } else if (contentType === 'video') {
        const mediaUrl = await generateImageToVideo(mediaPrompt);
        mediaUrls = [mediaUrl];
        Logger.log("Generated Video URL:", mediaUrl);
      }
    }

    // Send the tweet using sendTweet function
    const tweetId = await sendTweet(tweetText, mediaUrls);

    if (tweetId) {
      Logger.log(`Tweet sent successfully (ID: ${tweetId})`);
      return {
        success: true,
        tweetId,
        message: 'Successfully posted the main tweet.',
        tweetText,
        mediaUrls,
      };
    } else {
      Logger.log('Failed to send the tweet.');
      return {
        success: false,
        message: 'Failed to post the main tweet.',
        tweetText,
        mediaUrls,
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