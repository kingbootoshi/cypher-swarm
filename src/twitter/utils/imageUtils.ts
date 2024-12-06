// Utility file for image handling and Twitter interactions
import axios from 'axios';
import { formatTimestamp } from '../../utils/formatTimestamps';
import { scraper } from '../twitterClient';
import { Tweet } from 'goat-x';
import { getConversationWithUser } from '../../supabase/functions/twitter/getTweetContext';

// Define the QuoteContext type interface
interface QuoteContext {
    sender: string;
    text: string;
    timestamp: string;
    photos: string[];
}

/**
 * Fetches an image from a URL and converts it to base64
 * @param imageUrl URL of the image to fetch
 * @returns Object containing media type and base64 data
 */
export async function getImageAsBase64(imageUrl: string): Promise<{
    media_type: string;
    data: Buffer;
} | null> {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        // Get media type from content-type header
        const media_type = response.headers['content-type'] || 'image/jpeg';

        // Return Buffer directly instead of converting to base64
        const data = Buffer.from(response.data);

        return { media_type, data };
    } catch (error) {
        console.error(`Failed to fetch image from ${imageUrl}:`, error);
        return null;
    }
}

/**
 * Fetches the full conversation thread based on a tweet ID.
 * @param tweetId - The ID of the tweet.
 * @returns An array representing the conversation thread.
 */
export async function getConversationThread(tweetId: string): Promise<any[]> {
    try {
        // Fetch the focus tweet
        const focusTweet = await scraper.getTweet(tweetId);
        if (!focusTweet) {
            console.error('Tweet not found.');
            return [];
        }

        // Initialize array for parent tweets
        const parentTweets: Tweet[] = [];

        // Traverse up the thread to collect all parent tweets
        let currentTweet = focusTweet;
        while (currentTweet.inReplyToStatusId) {
            const parentTweet = await scraper.getTweet(currentTweet.inReplyToStatusId);
            if (parentTweet) {
                parentTweets.unshift(parentTweet);
                currentTweet = parentTweet;
            } else {
                break;
            }
        }

        // Map parent tweets to our desired format
        const conversation = await Promise.all(parentTweets.map(async t => {
            // Handle quote tweet if present
            let quoteContext: QuoteContext | null = null;
            if (t.quotedStatusId) {
                const quotedTweet = await scraper.getTweet(t.quotedStatusId);
                if (quotedTweet) {
                    quoteContext = {
                        sender: quotedTweet.username || 'Unknown User',
                        text: quotedTweet.text || '',
                        timestamp: new Date(quotedTweet.timeParsed!).toISOString(),
                        photos: quotedTweet.photos?.map(photo => photo.url) || []
                    };
                }
            }

            return {
                sender: t.username || 'Unknown User',
                tweet_id: t.id,
                text: t.text || '',
                timestamp: new Date(t.timeParsed!).toISOString(),
                photos: t.photos?.map(photo => photo.url) || [],
                quoteContext
            };
        }));

        // Add the focus tweet with its quote context
        let focusTweetQuoteContext: QuoteContext | null = null;
        if (focusTweet.quotedStatusId) {
            const quotedTweet = await scraper.getTweet(focusTweet.quotedStatusId);
            if (quotedTweet) {
                focusTweetQuoteContext = {
                    sender: quotedTweet.username || 'Unknown User',
                    text: quotedTweet.text || '',
                    timestamp: new Date(quotedTweet.timeParsed!).toISOString(),
                    photos: quotedTweet.photos?.map(photo => photo.url) || []
                };
            }
        }

        // Return array with parent tweets and focus tweet
        return [
            ...conversation,
            {
                sender: focusTweet.username || 'Unknown User',
                tweet_id: focusTweet.id,
                text: focusTweet.text || '',
                timestamp: new Date(focusTweet.timeParsed!).toISOString(),
                photos: focusTweet.photos?.map(photo => photo.url) || [],
                quoteContext: focusTweetQuoteContext,
                isFocusTweet: true // Add this flag to identify the focus tweet
            }
        ];

    } catch (error) {
        console.error('Error fetching conversation thread:', error);
        return [];
    }
}

/**
 * Formats the memory string for the tweet conversation.
 * @param threadMessages - Messages from the tweet thread.
 * @param historyData - Historical messages between the user and agent.
 * @returns A formatted string representing the conversation memory.
 */
export function formatMemory(
    threadMessages: any[],
    historyData: { userProfile: any; conversation: any[] }
): string {
    const { userProfile, conversation: historyMessages } = historyData;

    // Helper function to format a single message
    const formatMessage = (msg: any): string => {
        const formattedTimestamp = formatTimestamp(msg.timestamp);
        const isAgent =
            msg.sender.toLowerCase() === 'agent' ||
            msg.sender === process.env.TWITTER_USERNAME;
        const senderDisplay = isAgent ? '(YOU)' : msg.sender;
        let messageText = `[${formattedTimestamp}] ${senderDisplay}: ${msg.text}`;

        // Add quote context if present
        if (msg.quoteContext) {
            const quoteIsAgent =
                msg.quoteContext.sender.toLowerCase() === 'agent' ||
                msg.quoteContext.sender === process.env.TWITTER_USERNAME;
            const quoteSenderDisplay = quoteIsAgent
                ? '(YOU)'
                : msg.quoteContext.sender;
            messageText += `\n    📝 Quoting ${quoteSenderDisplay}: ${msg.quoteContext.text}`;
            if (msg.quoteContext.photos && msg.quoteContext.photos.length > 0) {
                messageText += `\n    🖼️ Quote tweet contains ${msg.quoteContext.photos.length} image(s)`;
            }
        }

        return messageText;
    };

    // Build the user profile section
    let userProfileSection = '';
    if (userProfile) {
        userProfileSection = `
## User Profile:
- **Name**: ${userProfile.name || 'N/A'}
- **Bio**: ${userProfile.biography || 'N/A'}
- **Location**: ${userProfile.location || 'N/A'}
`;
    }

    // Separate the thread messages
    const [parentTweet, ...restThreadMessages] = threadMessages;
    const focusTweet = restThreadMessages.pop(); // The last message is the focus tweet
    const repliesAbove = restThreadMessages;

    // Initialize an array to hold the thread memory sections
    const threadMemorySections: string[] = [];

    // Add 'Current Tweet Thread' heading
    threadMemorySections.push('## Current Tweet Thread:\n');

    // Format parent tweet
    if (parentTweet) {
        threadMemorySections.push('### Parent Tweet:');
        threadMemorySections.push(formatMessage(parentTweet));
        threadMemorySections.push(''); // Add an empty line
    }

    // Format replies above if any
    if (repliesAbove.length > 0) {
        threadMemorySections.push('### Replies Above the Tweet You Are Replying To:');
        threadMemorySections.push(repliesAbove.map(formatMessage).join('\n'));
        threadMemorySections.push('');
    }

    // Format focus tweet with the special heading
    if (focusTweet) {
        threadMemorySections.push(
            '## THIS IS THE CURRENT TWEET YOU ARE REPLYING TO. GIVE YOUR FULL FOCUS TO REPLYING TO THIS TWEET.'
        );
        threadMemorySections.push(formatMessage(focusTweet));
        threadMemorySections.push('');
    }

    // Combine the thread sections into one string
    const threadMemory = threadMemorySections.join('\n');

    // Format history messages
    const formattedHistory = historyMessages.map(formatMessage).join('\n');
    const historyMemory = formattedHistory
        ? `## Recent Tweet History Between You and ${focusTweet ? focusTweet.sender : 'the user'}\n\n${formattedHistory}`
        : 'No previous conversation history.';

    // Combine all sections
    const memory = `${userProfileSection}\n${threadMemory}\n${historyMemory}`;

    return memory;
}

/**
 * Fetches and formats tweet memory including conversation and focus tweet.
 * @param tweetId - The ID of the tweet to fetch.
 * @returns An object containing formatted memory and relevant tweet data.
 */
export async function fetchAndFormatTweetMemory(tweetId: string): Promise<{
    memory: string;
    username: string;
    text: string;
    photos: Array<{ photoUrl: string; sender: string }>;
    focusTweet?: {
        sender: string;
        text: string;
        timestamp: string;
        photos?: string[];
        quoteContext?: {
            sender: string;
            text: string;
            timestamp: string;
            photos?: string[];
        };
    };
} | null> {
    try {
        const tweet = await scraper.getTweet(tweetId);
        if (!tweet?.username || !tweet?.text) {
            console.log(`❌ Failed to fetch tweet, username, or text for tweet ${tweetId}`);
            return null;
        }

        // Get conversation with user from Supabase, now includes userProfile and conversation
        const conversationWithUser = await getConversationWithUser(tweet.username);

        // Get conversation thread from Twitter
        const conversationThread = await getConversationThread(tweetId);

        // Format memory
        const memory = formatMemory(conversationThread, conversationWithUser);

        // Collect all photos from the entire thread, excluding focus tweet and its quote context
        const allPhotos = conversationThread.reduce((photos: Array<{ photoUrl: string; sender: string }>, message) => {
            // Skip focus tweet as we process its photos separately
            if (message.isFocusTweet) {
                return photos;
            }

            if (message.photos && message.photos.length > 0) {
                for (const photoUrl of message.photos) {
                    photos.push({ photoUrl, sender: message.sender });
                }
            }

            // Include photos from quote context
            if (message.quoteContext && message.quoteContext.photos && message.quoteContext.photos.length > 0) {
                for (const photoUrl of message.quoteContext.photos) {
                    photos.push({ photoUrl, sender: message.quoteContext.sender });
                }
            }

            return photos;
        }, []);

        // Find the focus tweet (marked with isFocusTweet flag)
        const focusTweet = conversationThread.find(t => t.isFocusTweet);

        return {
            memory,
            username: tweet.username,
            text: tweet.text,
            photos: allPhotos, // Now an array of objects { photoUrl, sender }
            focusTweet: focusTweet ? {
                sender: focusTweet.sender,
                text: focusTweet.text,
                timestamp: formatTimestamp(focusTweet.timestamp),
                photos: focusTweet.photos || [],
                quoteContext: focusTweet.quoteContext
            } : undefined
        };
    } catch (error) {
        console.error('Error fetching memory context:', error);
        return null;
    }
}

/**
 * Assembles the Twitter interface content.
 * @param recentMainTweetsContent - Recent main tweets content.
 * @param tweetId - The ID of the tweet.
 * @returns An object containing text content and image contents.
 */
export async function assembleTwitterInterface(
    tweetId: string
): Promise<{
    textContent: string;
    imageContents: Array<{
        sender: string;
        media_type: string;
        data: Buffer;
    }>;
    usernames: string[];
}> {
    const tweetMemoryResult = await fetchAndFormatTweetMemory(tweetId);
    const tweetMemory = tweetMemoryResult?.memory || '';
    const imageContents: Array<{
        sender: string;
        media_type: string;
        data: Buffer;
    }> = [];

    // Keep track of processed photo URLs to avoid duplicates
    const processedPhotoUrls = new Set<string>();

    // Collect all usernames involved
    const usernamesInvolved = new Set<string>();

    if (tweetMemoryResult) {
        // Add usernames from the conversation thread
        const conversationThread = await getConversationThread(tweetId);
        
        // Add usernames from all tweets in the thread
        conversationThread.forEach(tweet => {
            // Add main tweet sender
            usernamesInvolved.add(tweet.sender);
            
            // Add quote tweet sender if exists
            if (tweet.quoteContext) {
                usernamesInvolved.add(tweet.quoteContext.sender);
            }
        });

        // Add the initial tweet's username
        usernamesInvolved.add(tweetMemoryResult.username);

        // Add focus tweet sender
        if (tweetMemoryResult.focusTweet) {
            usernamesInvolved.add(tweetMemoryResult.focusTweet.sender);

            // Add sender from focus tweet's quote context
            if (tweetMemoryResult.focusTweet.quoteContext) {
                usernamesInvolved.add(tweetMemoryResult.focusTweet.quoteContext.sender);
            }
        }

        // Add senders from photos
        if (tweetMemoryResult.photos && tweetMemoryResult.photos.length > 0) {
            tweetMemoryResult.photos.forEach(photoInfo => {
                usernamesInvolved.add(photoInfo.sender);
            });
        }
    }

    // Convert the set to an array
    const usernames = Array.from(usernamesInvolved);

    // Process images if they exist
    if (tweetMemoryResult) {
        // Process focus tweet images and quote tweet images if they exist
        if (tweetMemoryResult.focusTweet) {
            // Process focus tweet images
            if (tweetMemoryResult.focusTweet.photos?.length) {
                for (const photoUrl of tweetMemoryResult.focusTweet.photos) {
                    if (!processedPhotoUrls.has(photoUrl)) {
                        const imageData = await getImageAsBase64(photoUrl);
                        if (imageData) {
                            imageContents.push({
                                sender: tweetMemoryResult.focusTweet.sender,
                                ...imageData
                            });
                            processedPhotoUrls.add(photoUrl);
                        }
                    }
                }
            }

            // Process quote tweet images if they exist
            if (tweetMemoryResult.focusTweet.quoteContext?.photos?.length) {
                for (const photoUrl of tweetMemoryResult.focusTweet.quoteContext.photos) {
                    if (!processedPhotoUrls.has(photoUrl)) {
                        const imageData = await getImageAsBase64(photoUrl);
                        if (imageData) {
                            imageContents.push({
                                sender: tweetMemoryResult.focusTweet.quoteContext.sender || 'Unknown User',
                                ...imageData
                            });
                            processedPhotoUrls.add(photoUrl);
                        }
                    }
                }
            }
        }

        // Process images from the conversation thread, excluding focus tweet and its quote context
        if (tweetMemoryResult.photos?.length) {
            for (const { photoUrl, sender } of tweetMemoryResult.photos) {
                if (!processedPhotoUrls.has(photoUrl)) {
                    const imageData = await getImageAsBase64(photoUrl);
                    if (imageData) {
                        imageContents.push({
                            sender,
                            ...imageData
                        });
                        processedPhotoUrls.add(photoUrl);
                    }
                }
            }
        }
    }

    // Create the text content with the updated memory
    const textContent = `
# TWITTER INTERFACE
This section contains your LIVE Twitter interface featuring context you need to reply to the current tweet.

${tweetMemory}

${imageContents.length > 0 ? `## IMAGES IN CONVERSATION\nThe following messages contain ${imageContents.length} images that provide additional context.` : ''}
`;

    return { textContent, imageContents, usernames };
}
  