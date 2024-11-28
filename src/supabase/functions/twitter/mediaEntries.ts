import { supabase } from '../../supabaseClient';
import { Logger } from '../../../utils/logger';

/**
 * Uploads media to bucket and logs it in the media table.
 * @param mediaBuffer - The Buffer containing media data
 * @param tweetId - The ID of the tweet associated with the media
 * @param mediaType - The type of media (e.g., 'image/jpeg')
 * @returns The ID of the media entry in the database
 */
export async function uploadAndLogMedia(
  mediaBuffer: Buffer,
  tweetId: string,
  mediaType: string
): Promise<string> {
  try {
    // Generate media path with proper extension
    const extension = mediaType.split('/')[1] || 'bin';
    const mediaPath = `tweets/${tweetId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    // Upload to Supabase bucket with proper content type
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(mediaPath, mediaBuffer, {
        contentType: mediaType, // This ensures proper content-type is set
        upsert: true,
      });

    if (uploadError) {
      Logger.log('Error uploading media to bucket:', uploadError);
      throw new Error(`Failed to upload media: ${uploadError.message}`);
    }

    // Log media in database with proper media type
    const { data, error: dbError } = await supabase
      .from('media')
      .insert({
        file_path: mediaPath,
        media_type: mediaType,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (dbError) {
      Logger.log('Error logging media to database:', dbError);
      throw new Error(`Failed to log media: ${dbError.message}`);
    }

    Logger.log('Successfully uploaded and logged media:', data);
    return data.id;
  } catch (error) {
    Logger.log('Exception in uploadAndLogMedia:', error);
    throw error;
  }
} 