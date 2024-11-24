import fetch from 'node-fetch';
import { URL } from 'url';

/**
 * Determines the media type based on URL or file extension
 * @param url - The media URL or file path
 * @returns The corresponding MIME type string
 */
export function getMediaType(url: string): string {
  // Extract extension from URL or path
  const ext = new URL(url).pathname.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'mp4':
      return 'video/mp4';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Fetches media content from URL and prepares it for tweet attachment
 * @param url - URL of the media file
 * @returns Promise resolving to media data object
 */
async function fetchMediaFromUrl(url: string): Promise<{ data: Buffer; mediaType: string }> {
  try {
    // Download media file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    
    return {
      data: buffer,
      mediaType: getMediaType(url)
    };
  } catch (error) {
    console.error(`Error fetching media from URL ${url}:`, error);
    throw error;
  }
}

/**
 * Prepares media data for tweet attachments from URLs
 * @param mediaUrls - Array of media URLs (images, GIFs, or videos)
 * @returns Promise resolving to array of media data objects
 */
export async function prepareMediaData(mediaUrls: string[]) {
  if (!mediaUrls || mediaUrls.length === 0) return undefined;

  // Validate URLs
  mediaUrls.forEach(url => {
    try {
      new URL(url);
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  });

  try {
    return await Promise.all(mediaUrls.map(fetchMediaFromUrl));
  } catch (error) {
    console.error('Error preparing media data:', error);
    throw error;
  }
} 