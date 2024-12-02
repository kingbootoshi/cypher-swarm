import { supabase } from '../../supabaseClient';

/**
 * Retrieves the conversation between the agent and a user from the database,
 * including user profile information and arranging messages in a back-and-forth order.
 * @param username - The Twitter username of the user.
 * @returns An object containing user profile data and an array of conversation messages.
 */
export async function getConversationWithUser(username: string): Promise<{
    userProfile: any;
    conversation: any[];
}> {
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
            return { userProfile: null, conversation: [] };
        }

        const userId = userAccount.user_id;
        const userAccountId = userAccount.id;

        if (!userId || !userAccountId) {
            console.error('User ID or User Account ID is null or undefined.');
            return { userProfile: null, conversation: [] };
        }

        // Fetch user profile data from twitter_user_accounts
        const { data: twitterUserAccount, error: twitterUserAccountError } = await supabase
            .from('twitter_user_accounts')
            .select('profile_data')
            .eq('user_account_id', userAccountId)
            .single();

        if (twitterUserAccountError || !twitterUserAccount) {
            console.error('Error fetching Twitter user account:', twitterUserAccountError?.message);
            return { userProfile: null, conversation: [] };
        }

        const userProfile = twitterUserAccount.profile_data;

        // Fetch user interactions (tweets from the user)
        const { data: userInteractions, error: interactionsError } = await supabase
            .from('twitter_interactions')
            .select('tweet_id, text, timestamp')
            .eq('user_id', userId)
            .order('timestamp', { ascending: true });

        if (interactionsError) {
            console.error('Error fetching user interactions:', interactionsError);
            return { userProfile, conversation: [] };
        }

        // Fetch bot's replies to the user's tweets
        const userTweetIds = userInteractions.map(tweet => tweet.tweet_id).filter(id => id !== null) as string[];

        const { data: botReplies, error: botRepliesError } = await supabase
            .from('twitter_tweets')
            .select('tweet_id, text, created_at, in_reply_to_tweet_id')
            .in('in_reply_to_tweet_id', userTweetIds)
            .order('created_at', { ascending: true });

        if (botRepliesError) {
            console.error('Error fetching bot replies:', botRepliesError);
            return { userProfile, conversation: [] };
        }

        // Create a map of user tweets by tweet_id for quick access
        const userTweetsMap = new Map<string, any>();
        userInteractions.forEach(tweet => {
            if (tweet.tweet_id) {
                userTweetsMap.set(tweet.tweet_id, tweet);
            }
        });

        // Build the conversation as a back-and-forth
        const conversation: any[] = [];

        for (const userTweet of userInteractions) {
            // Add the user's message
            conversation.push({
                sender: username,
                tweet_id: userTweet.tweet_id,
                text: userTweet.text,
                timestamp: userTweet.timestamp
            });

            // Find the bot's reply to this tweet, if any
            const botReply = botReplies.find(reply => reply.in_reply_to_tweet_id === userTweet.tweet_id);

            if (botReply) {
                conversation.push({
                    sender: process.env.TWITTER_USERNAME || 'agent',
                    tweet_id: botReply.tweet_id,
                    text: botReply.text,
                    timestamp: botReply.created_at
                });
            }
        }

        return { userProfile, conversation };

    } catch (error) {
        console.error('Error in getConversationWithUser:', error);
        return { userProfile: null, conversation: [] };
    }
}
