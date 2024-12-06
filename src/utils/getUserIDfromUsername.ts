import { findTwitterUserByUsername } from "../supabase/functions/twitter/userEntries";
import { Logger } from './logger';

/**
 * Retrieves user IDs for an array of Twitter usernames from the database
 * @param usernames Array of Twitter usernames to look up
 * @returns Object mapping usernames to their user IDs (null if not found)
 */
export async function getUserIDsFromUsernames(
    usernames: string[]
): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};

    // Fetch user IDs concurrently for efficiency
    await Promise.all(
        usernames.map(async (username) => {
            try {
                const result = await findTwitterUserByUsername(username);
                results[username] = result?.userId || null;
            } catch (error) {
                Logger.log(`Error retrieving user ID for ${username}:`, error);
                results[username] = null;
            }
        })
    );

    return results;
}