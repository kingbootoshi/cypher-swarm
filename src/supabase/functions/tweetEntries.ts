import { supabase } from '../supabaseClient';
import { uploadAndLogMedia } from './mediaEntries';
import { Logger } from '../../utils/logger';

interface TweetData {
  tweet_id?: string | null;
  text: string;
  tweet_type: 'main' | 'reply' | 'quote' | 'retweet';
  has_media?: boolean;
  bot_username?: string;
  in_reply_to_tweet_id?: string;
  retweeted_tweet_id?: string;
  quoted_tweet_id?: string;
  created_at?: string;
}

/**
 * Logs a main tweet and its media to the database.
 */
export async function logTweet(
  data: TweetData,
  mediaData?: { data: Buffer; mediaType: string; }[]
): Promise<string | null> {
  try {
    let mediaIds: string[] | null = null;

    // Process and upload media if provided and tweet_id is available
    if (mediaData && mediaData.length > 0 && data.tweet_id) {
      const mediaIdResults = await Promise.all(
        mediaData.map(async ({ data: mediaBuffer, mediaType }) => {
          try {
            return await uploadAndLogMedia(mediaBuffer, data.tweet_id!, mediaType);
          } catch (error) {
            Logger.log('Error processing media:', error);
            return null;
          }
        })
      );

      // Filter out any null values
      mediaIds = mediaIdResults.filter((id): id is string => id !== null);
    }

    // Build insert data
    const insertData = {
      tweet_id: data.tweet_id || null,
      text: data.text.trim(),
      tweet_type: data.tweet_type,
      has_media: data.has_media || false,
      bot_username: data.bot_username || process.env.TWITTER_USERNAME,
      in_reply_to_tweet_id: data.in_reply_to_tweet_id,
      retweeted_tweet_id: data.retweeted_tweet_id,
      quoted_tweet_id: data.quoted_tweet_id,
      created_at: data.created_at || new Date().toISOString(),
    };

    // Insert tweet record into the database
    const { data: tweet, error } = await supabase
      .from('twitter_tweets')
      .insert(insertData)
      .select('tweet_id')
      .maybeSingle();

    if (error) {
      Logger.log('Error logging tweet to Supabase:', error.message);
      Logger.log('Error details:', error.details);
      Logger.log('Error hint:', error.hint);
      return null;
    }

    // If we have media and tweet_id, create the tweet_media relationships
    if (mediaIds && mediaIds.length > 0 && data.tweet_id) {
      const mediaRelations = mediaIds.map((mediaId) => ({
        tweet_id: data.tweet_id!,
        media_id: mediaId,
      }));

      const { error: mediaRelationError } = await supabase
        .from('tweet_media')
        .insert(mediaRelations);

      if (mediaRelationError) {
        Logger.log('Error creating media relations:', mediaRelationError);
      }
    }

    Logger.log('Successfully logged tweet to Supabase:', tweet);
    return tweet?.tweet_id || null;
  } catch (error) {
    Logger.log('Exception in logTweet:', error);
    return null;
  }
} 