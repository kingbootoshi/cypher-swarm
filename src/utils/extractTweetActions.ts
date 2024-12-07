// scripts/extractTweetActions.ts

import { linkTwitterInteractions, TwitterInteractionResult } from '../supabase/functions/twitter/linkInteractions';
import { getShortTermHistory } from '../supabase/functions/terminal/terminalHistory';
import { Logger } from '../utils/logger';

Logger.enable();

interface TweetAction {
  sessionId: string;
  role: string;
  action: string;
  tweetId: string;
  status: string;
  details: string;
  textContent?: string;
  mediaUrls?: string[];
  timestamp?: string;
}

/**
 * Extracts successful tweet actions from the short-term terminal history.
 * Only returns tweets that have a valid tweet ID.
 */
async function extractTweetActions(): Promise<TweetAction[]> {
  try {
    // Use the existing getShortTermHistory function instead of direct DB query
    const messages = await getShortTermHistory(100);
    // Log the number of messages retrieved from short-term history for debugging
    Logger.log(`Retrieved ${messages.length} messages from short-term history`);
    
    const tweetActions: TweetAction[] = [];
    let currentSessionId: string | null = null;

    // Iterate over the messages to extract actions
    for (const message of messages) {
      // Skip non-user messages or messages without content
      if (message.role !== 'user' || !message.content) {
        continue;
      }

      // Extract timestamp if present
      const timestampMatch = message.content.match(/\[(\d{2}\/\d{2}\/\d{2} - \d{1,2}:\d{2} [AP]M [A-Z]+)\]/);
      const timestamp = timestampMatch ? timestampMatch[1] : null;

      // Clean the output by removing timestamp and TERMINAL OUTPUT prefix
      const output = message.content
        .replace(/TERMINAL OUTPUT:?\s*(\[\d{2}\/\d{2}\/\d{2} - \d{1,2}:\d{2} [AP]M [A-Z]+\]:?)?\s*/, '')
        .trim();

      const lines = output.split('\n');

      // Extract details from the terminal output
      const actionLine = lines.find(line => line.includes('Action:'));
      const tweetIdLine = lines.find(line => line.includes('Tweet ID:') || line.includes('Reply Tweet ID:'));
      const statusLine = lines.find(line => line.startsWith('Status:'));
      const detailsLine = lines.find(line => line.startsWith('Details:'));
      const textLine = lines.find(line => line.startsWith('Text:'));
      const mediaLine = lines.find(line => line.startsWith('Media:'));

      // Only process if we have a tweet ID
      if (tweetIdLine) {
        const tweetId = tweetIdLine.split(':')[1].trim();
        
        // Only add to results if we have a valid tweet ID
        if (tweetId) {
          tweetActions.push({
            sessionId: currentSessionId || 'unknown',
            role: message.role,
            action: actionLine ? actionLine.replace('Action:', '').replace('✅', '').trim() : '',
            tweetId,
            status: statusLine ? statusLine.replace('Status:', '').trim() : '',
            details: detailsLine ? detailsLine.replace('Details:', '').trim() : '',
            textContent: textLine ? textLine.replace('Text:', '').trim() : undefined,
            mediaUrls: mediaLine && mediaLine !== 'Media: None'
              ? mediaLine.replace('Media:', '').trim().split(', ')
              : [],
            timestamp: timestamp || undefined
          });
        }
      }
    }

    Logger.log('Extracted Tweet Actions:', tweetActions);
    return tweetActions;

  } catch (error) {
    Logger.log('Error in extractTweetActions:', error);
    return [];
  }
}

/**
 * Gathers all unique user interactions based on tweet actions.
 * Groups interactions by user ID to facilitate learning extraction.
 */
export async function gatherUserInteractions(): Promise<Map<string, TwitterInteractionResult[]>> {
  // Extract tweet actions from the short-term history
  const tweetActions = await extractTweetActions();

  // Collect unique tweet IDs from the actions
  const uniqueTweetIds = new Set<string>();
  for (const action of tweetActions) {
    uniqueTweetIds.add(action.tweetId);
  }

  // Map to group interactions by user ID
  const userInteractionsMap = new Map<string, TwitterInteractionResult[]>();

  // Iterate over each unique tweet ID
  for (const tweetId of uniqueTweetIds) {
    // Retrieve interaction summary and user ID for the tweet
    const interactionResult = await linkTwitterInteractions(tweetId);

    if (interactionResult) {
      const userId = interactionResult.userId;

      // Initialize array if user ID is encountered for the first time
      if (!userInteractionsMap.has(userId)) {
        userInteractionsMap.set(userId, []);
      }

      // Add the interaction to the user's array of interactions
      userInteractionsMap.get(userId)?.push(interactionResult);
    } else {
      // Log if no interaction is found for the tweet ID
      Logger.log(`No interaction found for tweet ID: ${tweetId}`);
    }
  }

  // Log the grouped user interactions
  Logger.log('User Interactions Map:', userInteractionsMap);

  // Return the map containing user interactions grouped by user ID
  return userInteractionsMap;
}

/**
 * Formats user interactions into a single comprehensive summary string
 * Returns a single string containing all user interactions
 */
export function formatUserInteractions(userInteractionsMap: Map<string, TwitterInteractionResult[]>): string {
  // Array to store formatted summaries that we'll join later
  const formattedSummaries: string[] = [];

  // Iterate through each user's interactions
  userInteractionsMap.forEach((interactions, userId) => {
    let userSummary = `[USER ID: ${userId}]\n\n`;

    // Add each interaction for this user as a numbered tweet
    interactions.forEach((interaction, index) => {
      userSummary += `[TWEET ${index + 1}]\n${interaction.formattedString}\n\n`;
    });

    formattedSummaries.push(userSummary);
  });

  // Join all summaries with double newlines between them
  return formattedSummaries.join('\n');
}

// Usage example:
export async function getFormattedInteractionSummary(): Promise<string> {
  const interactions = await gatherUserInteractions();
  return formatUserInteractions(interactions);
}