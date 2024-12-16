import { ContentManagerAgent } from "../ai/agents/contentManagerAgent/contentManagerAgent";
import { OpenAIClient } from "../ai/models/clients/OpenAiClient";
import { FireworkClient } from "../ai/models/clients/FireworkClient";
import { Logger } from "../utils/logger";

Logger.enable();

const openAIClient = new OpenAIClient("gpt-4o-mini");
const fireworksClient = new FireworkClient("accounts/fireworks/models/llama-v3p3-70b-instruct");
const contentManagerAgent = new ContentManagerAgent(openAIClient);

// Helper function to format the agent's response into a readable string
const formatAgentResponse = (response: any): string => {
    try {
        // Handle the new response structure
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        
        // Format the recommended actions
        const formattedActions = data.recommended_actions
            .map((action: any) => {
                switch (action.type) {
                    case 'reply':
                        return `- Reply to tweet ${action.tweet_id}\n  Reason: ${action.reasoning}`;
                    case 'follow':
                        return `- Follow @${action.username}\n  Reason: ${action.reasoning}`;
                    case 'quote':
                        return `- Quote tweet ${action.tweet_id}\n  Reason: ${action.reasoning}`;
                    case 'retweet':
                        return `- Retweet tweet ${action.tweet_id}\n  Reason: ${action.reasoning}`;
                    default:
                        return `- ${action.type}: ${action.reasoning}`;
                }
            })
            .join('\n\n');

        // Construct the formatted output
        return `SUMMARY OF HOMEPAGE:\n${data.summary_of_tweets}\n\nRECOMMENDED ACTIONS:\n${formattedActions}`;
    } catch (error) {
        Logger.log('Error formatting agent response:', error);
        return `Error formatting response: ${error.message}`;
    }
}

// Add enum for timeline types to maintain consistency
export enum TimelineType {
    HOMEPAGE = 'HOMEPAGE',
    MENTIONS = 'MENTIONS',
    SEARCH = 'SEARCH',
    USER_PROFILE = 'USER_PROFILE'
}

// Update function signature to include timeline type
export const processTimeline = async (timeline: string, type: TimelineType, context?: string) => {
    Logger.log(`Processing ${type} timeline data through ContentManagerAgent...`);
    
    // Construct prompt based on timeline type
    let prompt = `PROCESS THE FOLLOWING TWEET DATA OF THE ${type} TIMELINE`;
    if (context) {
        prompt += ` FOR ${context}`;
    }
    prompt += `:\n\n${timeline}`;
    
    const response = await contentManagerAgent.run(prompt);
    Logger.log('Raw response:', response);
    return formatAgentResponse(response.output);
}