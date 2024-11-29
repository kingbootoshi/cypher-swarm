import { supabase } from '../../supabaseClient';

/**
 * Retrieves the conversation between the agent and a user from the database.
 * @param username - The Twitter username of the user.
 * @returns An array of conversation messages.
 */
export async function getConversationWithUser(username: string): Promise<any[]> {
    try {
        // Fetch the user's account based on username and platform
        const { data: userAccount, error: userAccountError } = await supabase
            .from('user_accounts')
            .select('id, user_id')
            .eq('username', username)
            .eq('platform', 'twitter')
            .single(); // We expect a single result

        if (userAccountError || !userAccount) {
            console.error('Error fetching user account:', userAccountError?.message);
            return [];
        }

        const userId = userAccount.user_id;

        if (!userId) {
            console.error('User ID is null or undefined.');
            return [];
        }

        // Fetch user interactions (tweets from the user)
        const { data: userInteractions, error: interactionsError } = await supabase
            .from('twitter_interactions')
            .select('tweet_id, text, timestamp')
            .eq('user_id', userId)
            .order('timestamp', { ascending: true });

        if (interactionsError) {
            console.error('Error fetching user interactions:', interactionsError);
            return [];
        }

        // Collect IDs of the user's tweets
        const userTweetIds = userInteractions
            .map(tweet => tweet.tweet_id)
            .filter(id => id !== null) as string[];

        // Fetch agent's tweets that are replies to the user's tweets
        const { data: agentReplies, error: agentRepliesError } = await supabase
            .from('twitter_tweets')
            .select('tweet_id, text, created_at, in_reply_to_tweet_id')
            .in('in_reply_to_tweet_id', userTweetIds)
            .order('created_at', { ascending: true });

        if (agentRepliesError) {
            console.error('Error fetching agent replies:', agentRepliesError);
            return [];
        }

        // Map user interactions to a common format
        const userMessages = userInteractions.map(interaction => ({
            sender: username,
            tweet_id: interaction.tweet_id,
            text: interaction.text,
            timestamp: interaction.timestamp
        }));

        // Map agent replies to a common format
        const agentMessages = agentReplies.map(reply => ({
            sender: process.env.TWITTER_USERNAME || 'agent',
            tweet_id: reply.tweet_id,
            text: reply.text,
            timestamp: reply.created_at
        }));

        // Combine and sort messages chronologically
        const allMessages = [...userMessages, ...agentMessages];
        allMessages.sort((a, b) => {
            // Default to 0 if timestamps are null, or compare if both exist
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeA - timeB;
        });

        // Limit conversation to the most recent 5 messages from each sender
        const limitedConversation: any[] = [];
        let userCount = 0;
        let agentCount = 0;

        for (let i = allMessages.length - 1; i >= 0; i--) {
            const msg = allMessages[i];

            if (msg.sender === username && userCount < 5) {
                limitedConversation.push(msg);
                userCount++;
            } else if ((msg.sender === process.env.TWITTER_USERNAME || msg.sender === 'agent') && agentCount < 5) {
                limitedConversation.push(msg);
                agentCount++;
            }

            if (userCount >= 5 && agentCount >= 5) {
                break;
            }
        }

        // Reverse to maintain chronological order
        limitedConversation.reverse();

        return limitedConversation;

    } catch (error) {
        console.error('Error in getConversationWithUser:', error);
        return [];
    }
}
