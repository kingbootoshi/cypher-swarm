import { supabase } from '../../supabaseClient';
import { uploadAndLogMedia } from './mediaEntries';
import { Logger } from '../../../utils/logger';

/**
 * Logs a reply tweet and its media to the database.
 */
export async function logReplyTweet(
  tweetId: string,
  text: string,
  repliedToTweetId: string,
  mediaData?: { data: Buffer; mediaType: string }[]
): Promise<string | null> {
  try {
    let mediaIds: string[] | null = null;

    // Process and upload media if provided
    if (mediaData && mediaData.length > 0) {
      const mediaIdResults = await Promise.all(
        mediaData.map(async ({ data: mediaBuffer, mediaType }) => {
          try {
            return await uploadAndLogMedia(mediaBuffer, tweetId, mediaType);
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
      tweet_id: tweetId,
      text: text.trim(),
      tweet_type: 'reply',
      has_media: mediaIds !== null && mediaIds.length > 0,
      bot_username: process.env.TWITTER_USERNAME,
      in_reply_to_tweet_id: repliedToTweetId.trim(),
      created_at: new Date().toISOString(),
    };

    // Insert reply tweet record into the database
    const { data, error } = await supabase
      .from('twitter_tweets')
      .insert(insertData)
      .select('tweet_id')
      .single();

    if (error) {
      Logger.log('Error logging reply tweet to Supabase:', error.message);
      Logger.log('Error details:', error.details);
      Logger.log('Error hint:', error.hint);
      return null;
    }

    // If we have media, create the tweet_media relationships
    if (mediaIds && mediaIds.length > 0) {
      const mediaRelations = mediaIds.map(mediaId => ({
        tweet_id: tweetId,
        media_id: mediaId
      }));

      const { error: mediaRelationError } = await supabase
        .from('tweet_media')
        .insert(mediaRelations);

      if (mediaRelationError) {
        Logger.log('Error creating media relations:', mediaRelationError);
      }
    }

    // Log the interaction with updated context
    const { error: interactionError } = await supabase
      .from('twitter_interactions')
      .insert({
        tweet_id: tweetId,
        bot_username: process.env.TWITTER_USERNAME,
        text: text.trim(),
        action: 'reply',
        context: {
          replied_to_tweet_id: repliedToTweetId,
          has_media: mediaIds !== null && mediaIds.length > 0
        },
        timestamp: new Date().toISOString()
      });

    if (interactionError) {
      Logger.log('Error logging interaction:', interactionError);
    }

    Logger.log('Successfully logged reply tweet to Supabase:', data);
    return data.tweet_id;
  } catch (error) {
    Logger.log('Exception in logReplyTweet:', error);
    return null;
  }
} 