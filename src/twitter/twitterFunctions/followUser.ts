import { scraper } from '../twitterClient';

/**
 * Follows a specific user
 * @param username - The username of the account to follow
 * @returns Promise<boolean> indicating success or failure
 */
export async function followUser(username: string): Promise<boolean> {
  try {
    await scraper.followUser(username);
    console.log(`Successfully followed user @${username}`);
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
} 