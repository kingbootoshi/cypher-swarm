// scripts/extractTweetActions.ts

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

// Export the function for use in other files
export { extractTweetActions };

// If running directly, execute the function
if (require.main === module) {
  extractTweetActions();
}