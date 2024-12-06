import { generateImage } from './imageGen';
import { generateVideoFromImage } from './videoGen';

/**
 * Combined pipeline that generates a retro anime image and converts it to video
 * @param prompt - User prompt for generation
 * @returns Promise containing the final video URL
 */
export async function generateImageToVideo(prompt: string): Promise<string> {
    try {
        // Generate the retro anime image
        const imageUrl = await generateImage(prompt);
        
        // Generate video from the image
        const videoUrl = await generateVideoFromImage(prompt, imageUrl);
        
        return videoUrl;

    } catch (error) {
        console.error('Error in generation pipeline:', error);
        throw error;
    }
}