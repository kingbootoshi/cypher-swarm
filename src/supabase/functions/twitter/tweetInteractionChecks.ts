import { supabase } from '../../supabaseClient';
import { Logger } from '../../../utils/logger';

type TweetAction = 'reply' | 'quote' | 'retweet';

/**
 * Checks if the bot has already performed a specific action on a tweet
 */
export async function hasAlreadyActioned(
  tweetId: string,
  action: TweetAction
): Promise<boolean> {
  try {
    const field = action === 'reply' ? 'in_reply_to_tweet_id' : 
                 action === 'quote' ? 'quoted_tweet_id' : 
                 'retweeted_tweet_id';

    const { data, error } = await supabase
      .from('twitter_tweets')
      .select('id')
      .eq(field, tweetId)
      .maybeSingle();

    if (error) {
      Logger.log(`Error checking tweet action status: ${error.message}`);
      return false;
    }

    const hasActioned = !!data;
    Logger.log(`Tweet ${tweetId} ${action} status: ${hasActioned ? 'already done' : 'not done yet'}`);
    return hasActioned;

  } catch (error) {
    Logger.log(`Error checking if tweet ${tweetId} was already ${action}ed:`, error);
    return false;
  }
}

/**
 * Checks if a tweet has been interacted with by the bot
 */
export async function hasInteractedWithTweet(tweetId: string): Promise<boolean> {
  try {
    Logger.log(`Checking interactions for tweet ${tweetId}...`);
    
    // First check if this tweet is one we've interacted with via reply/quote/retweet
    const { data: interactions, error } = await supabase
      .from('twitter_tweets')
      .select('tweet_type, in_reply_to_tweet_id, quoted_tweet_id, retweeted_tweet_id')
      .or(
        `in_reply_to_tweet_id.eq.${tweetId},` +
        `quoted_tweet_id.eq.${tweetId},` +
        `retweeted_tweet_id.eq.${tweetId}`
      );

    if (error) {
      Logger.log('Error checking tweet interactions:', error);
      return false;
    }

    if (interactions && interactions.length > 0) {
      const interactionTypes = interactions.map(i => {
        if (i.in_reply_to_tweet_id === tweetId) return 'reply';
        if (i.quoted_tweet_id === tweetId) return 'quote';
        if (i.retweeted_tweet_id === tweetId) return 'retweet';
        return null;
      }).filter(Boolean);

      Logger.log(`Found previous interactions for tweet ${tweetId}:`, interactionTypes);
      return true;
    }

    Logger.log(`No previous interactions found for tweet ${tweetId}`);
    return false;

  } catch (error) {
    Logger.log(`Error checking tweet interactions for ${tweetId}:`, error);
    return false;
  }
}

/**
 * Debug function to check all interactions with a tweet
 */
export async function debugTweetInteractions(tweetId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('twitter_tweets')
      .select('*')
      .or(
        `in_reply_to_tweet_id.eq.${tweetId},` +
        `quoted_tweet_id.eq.${tweetId},` +
        `retweeted_tweet_id.eq.${tweetId}`
      );

    if (error) {
      Logger.log('Error in debug check:', error);
      return;
    }

    Logger.log(`Debug: Found ${data.length} interactions for tweet ${tweetId}:`);
    data.forEach(interaction => {
      if (interaction.in_reply_to_tweet_id === tweetId) {
        Logger.log(`- Reply (Tweet ID: ${interaction.tweet_id})`);
      }
      if (interaction.quoted_tweet_id === tweetId) {
        Logger.log(`- Quote (Tweet ID: ${interaction.tweet_id})`);
      }
      if (interaction.retweeted_tweet_id === tweetId) {
        Logger.log(`- Retweet (Tweet ID: ${interaction.tweet_id})`);
      }
    });
  } catch (error) {
    Logger.log('Debug error:', error);
  }
} 