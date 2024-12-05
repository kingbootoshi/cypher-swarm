import { supabase } from '../../supabaseClient';
import { Logger } from '../../../utils/logger';

/**
 * Links and formats all interactions related to a specific tweet
 * @param tweetId - The Twitter tweet ID to look up
 * @returns Formatted string of all related interactions or null if not found
 */
export interface TwitterInteractionResult {
  formattedString: string;
  userId: string;  // For easy access to user ID
}

export async function linkTwitterInteractions(tweetId: string): Promise<TwitterInteractionResult | null> {
  try {
    Logger.log('Starting Twitter interaction linking process...');
    Logger.log(`Looking up tweet ID: ${tweetId}`);

    // 1. Check if tweet exists in twitter_interactions
    const { data: interactionData, error: interactionError } = await supabase
      .from('twitter_interactions')
      .select(`
        *,
        users!inner(*)
      `)
      .eq('tweet_id', tweetId)
      .single();

    if (interactionError) {
      Logger.log('Error fetching interaction:', interactionError);
      return null;
    }

    if (!interactionData) {
      Logger.log('No interaction found for tweet ID');
      return null;
    }

    Logger.log('Found interaction data:', interactionData);

    if (!interactionData.user_id) {
      Logger.log('interactionData.user_id is null');
      return null;
    }

    // 2. Get user account details
    const { data: userAccountData, error: userAccountError } = await supabase
      .from('user_accounts')
      .select(`
        *,
        twitter_user_accounts(*)
      `)
      .eq('user_id', interactionData.user_id)
      .eq('platform', 'twitter')
      .single();

    if (userAccountError) {
      Logger.log('Error fetching user account:', userAccountError);
      return null;
    }

    Logger.log('Found user account data:', userAccountData);

    // 3. Check for bot responses in twitter_tweets
    const { data: botResponses, error: botResponseError } = await supabase
      .from('twitter_tweets')
      .select('*')
      .or(`in_reply_to_tweet_id.eq.${tweetId},retweeted_tweet_id.eq.${tweetId},quoted_tweet_id.eq.${tweetId}`);

    if (botResponseError) {
      Logger.log('Error fetching bot responses:', botResponseError);
      return null;
    }

    Logger.log('Found bot responses:', botResponses);

    const userId: string = interactionData.user_id;

    // 4. Format the interaction string with the desired order
    let formattedInteraction = `
=== TWITTER INTERACTION SUMMARY ===
`;

    // Combine User Details and User Profile
    formattedInteraction += `
[USER PROFILE]
• Internal User ID: ${userId}
• Twitter Username: ${userAccountData.username}`;

    let interfaceText = '';
    if (interactionData.context && typeof interactionData.context === 'object' && 'twitterInterface' in interactionData.context) {
      interfaceText = interactionData.context.twitterInterface as string;
    }

    // Add User Profile from context if available
    if (interfaceText) {
      // User Profile Section
      const profileMatch = interfaceText.match(/## User Profile:\n((?:- .*\n)*)/);
      if (profileMatch) {
        const profileLines = profileMatch[1].split('\n').filter(line => line.trim());
        profileLines.forEach(line => {
          const cleanLine = line.replace(/- \*\*|\*\*/g, '');
          formattedInteraction += `\n${cleanLine}`;
        });
      }
    }

    // Add Parent Tweet
    if (interfaceText) {
      // Parent Tweet
      const parentTweetMatch = interfaceText.match(/### Parent Tweet:\n\[(.*?)\] (.*?):(.*?)(?=\n\n|$)/s);
      if (parentTweetMatch) {
        const [_, timestamp, author, content] = parentTweetMatch;
        formattedInteraction += `\n\n[PARENT TWEET]
• Timestamp: ${timestamp}
• Author: ${author}
• Content: ${content.trim()}`;
      }
    }

    // Add Replies to Parent Tweet
    if (interfaceText) {
      const repliesMatch = interfaceText.match(/### Replies Above.*?:(.*?)(?=\n\n## |$)/s);
      if (repliesMatch) {
        formattedInteraction += '\n\n[TWEET THREAD REPLIES TO THE PARENT TWEET, ABOVE CURRENT INTERACTION FOCUS]';
        const replies = repliesMatch[1].trim().split('\n');
        replies.forEach(reply => {
          const replyMatch = reply.match(/\[(.*?)\] (.*?):(.*?)(?=\n|$)/);
          if (replyMatch) {
            const [_, timestamp, author, content] = replyMatch;
            formattedInteraction += `\n\n• Timestamp: ${timestamp}
• Author: ${author}
• Content: ${content.trim()}`;
          }
        });
      }
    }

    const interactionText = interactionData.text ?? 'No content';
    const interactionTimestamp = interactionData.timestamp ? new Date(interactionData.timestamp).toLocaleString() : 'Unknown';

    // Add Current Interaction Focus
    formattedInteraction += `
    
[CURRENT TWEET FOCUS]
• Content: ${interactionText}
• Timestamp: ${interactionTimestamp}`;

    // Add Your Responses
    formattedInteraction += `
    
[YOUR RESPONSES TO THE FOCUS TWEET]`;

    if (botResponses && botResponses.length > 0) {
      botResponses.forEach(response => {
        const responseTime = response.created_at ? new Date(response.created_at).toLocaleString() : 'Unknown';
        formattedInteraction += `\n\n[${getResponseType(response)}]
• Content: ${response.text}
• Time: ${responseTime}`;
      });
    } else {
      formattedInteraction += '\n• No bot responses recorded';
    }

    // Add Past Conversation History
    if (interfaceText) {
      const historyMatch = interfaceText.match(/## Recent Tweet History.*?\n(.*?)(?=\n\n|$)/s);
      if (historyMatch) {
        formattedInteraction += '\n\n[PAST CONVERSATION HISTORY WITH USER]';
        const history = historyMatch[1].trim().split('\n');
        history.forEach(tweet => {
          const tweetMatch = tweet.match(/\[(.*?)\] (.*?):(.*?)(?=\n|$)/);
          if (tweetMatch) {
            const [_, timestamp, author, content] = tweetMatch;
            formattedInteraction += `\n\n• Timestamp: ${timestamp}
• Author: ${author}
• Content: ${content.trim()}`;
          }
        });
      }
    }

    formattedInteraction += '\n=== END OF SUMMARY ===';

    Logger.log('Successfully formatted interaction summary');

    return {
      formattedString: formattedInteraction,
      userId: userId
    };

  } catch (error) {
    Logger.log('Unexpected error in linkTwitterInteractions:', error);
    return null;
  }
}

/**
 * Helper function to determine and format the type of bot response
 */
function getResponseType(response: any): string {
  const types: string[] = [];
  
  if (response.in_reply_to_tweet_id) types.push('Reply');
  if (response.retweeted_tweet_id) types.push('Retweet');
  if (response.quoted_tweet_id) types.push('Quote');
  
  return types.length ? `${types.join(' + ')}` : 'Main Tweet';
}