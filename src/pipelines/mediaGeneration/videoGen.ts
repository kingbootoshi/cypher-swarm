import dotenv from 'dotenv';
import { LumaAI } from 'lumaai';

// Load environment variables
dotenv.config();

interface Generation {
  id: string;
  state: 'pending' | 'completed' | 'failed';
  failure_reason?: string;
  assets: {
    video: string;
  };
}

/**
 * Generates a video from a prompt using Luma AI
 * @param prompt - The prompt to generate the video from
 * @returns Promise containing the video URL
 */
export async function generateVideoFromPrompt(prompt: string): Promise<string> {
    const client = new LumaAI({ authToken: process.env.LUMAAI_API_KEY! });

    try {
        let generation = await client.generations.create({
            prompt: prompt
        }) as Generation;

        while (generation.state !== 'completed') {
            if (generation.state === 'failed') {
                throw new Error(`Generation failed: ${generation.failure_reason}`);
            }
            await new Promise(r => setTimeout(r, 3000));
            generation = await client.generations.get(generation.id) as Generation;
        }
        
        return generation.assets.video;

    } catch (error) {
        console.error('Error in video generation:', error);
        throw error;
    }
}

/**
 * Generates a video from an input image using Luma AI
 * @param prompt - The prompt to guide the video generation
 * @param imageUrl - URL of the input image
 * @returns Promise containing the video URL
 */
export async function generateVideoFromImage(prompt: string, imageUrl: string): Promise<string> {
    const client = new LumaAI({ authToken: process.env.LUMAAI_API_KEY! });

    try {
        let generation = await client.generations.create({
            prompt: prompt,
            keyframes: {
                frame0: {
                    type: "image",
                    url: imageUrl
                }
            }
        }) as Generation;

        while (generation.state !== 'completed') {
            if (generation.state === 'failed') {
                throw new Error(`Generation failed: ${generation.failure_reason}`);
            }
            await new Promise(r => setTimeout(r, 3000));
            generation = await client.generations.get(generation.id) as Generation;
        }
        
        return generation.assets.video;

    } catch (error) {
        console.error('Error in video generation:', error);
        throw error;
    }
}