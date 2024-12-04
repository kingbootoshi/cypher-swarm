// scripts/extractTweetActions.ts

import { linkTwitterInteractions, TwitterInteractionResult } from '../supabase/functions/twitter/linkInteractions';
import { supabase } from '../supabase/supabaseClient';
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
}

/**
 * Extracts successful tweet actions from the short-term terminal history.
 * Only returns tweets that have a valid tweet ID.
 */
async function extractTweetActions(): Promise<TweetAction[]> {
  try {
    // Fetch messages from the short_term_terminal_history table
    const { data, error } = await supabase
      .from('short_term_terminal_history')
      .select('session_id, role, content')
      .order('created_at', { ascending: true });

    if (error) {
      Logger.log('Error fetching terminal history:', error);
      return [];
    }

    const tweetActions: TweetAction[] = [];
    let currentSessionId: string | null = null;

    // Iterate over the messages to extract actions
    for (const entry of data) {
      const { session_id, role, content } = entry;
      currentSessionId = session_id;

      if (role === 'user' && content.startsWith('TERMINAL OUTPUT:')) {
        const output = content.replace('TERMINAL OUTPUT:', '').trim();
        const lines = output.split('\n');

        // Extract details from the terminal output
        const actionLine = lines.find(line => line.startsWith('Action:'));
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
              sessionId: currentSessionId,
              role,
              action: actionLine ? actionLine.replace('Action:', '').trim() : '',
              tweetId,
              status: statusLine ? statusLine.replace('Status:', '').trim() : '',
              details: detailsLine ? detailsLine.replace('Details:', '').trim() : '',
              textContent: textLine ? textLine.replace('Text:', '').trim() : undefined,
              mediaUrls: mediaLine && mediaLine !== 'Media: None'
                ? mediaLine.replace('Media:', '').trim().split(', ')
                : []
            });
          }
        }
      }
    }

    // Log the successful tweets
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
async function gatherUserInteractions(): Promise<Map<string, TwitterInteractionResult[]>> {
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

// Export the function for use in other files
export { extractTweetActions };

// If running directly, execute the function
if (require.main === module) {
  (async () => {
    const userInteractions = await gatherUserInteractions();

    // Iterate over each user and their interactions
    for (const [userId, interactions] of userInteractions.entries()) {
      console.log(`\nUser ID: ${userId}`);
      interactions.forEach(interaction => {
        console.log(interaction.formattedString);
      });
    }
  })();
}