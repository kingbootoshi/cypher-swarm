import { fal } from "@fal-ai/client";
import dotenv from "dotenv";

dotenv.config();

// Configure fal client with API key from environment variables
fal.config({
  credentials: process.env.FAL_API_KEY
});

/**
 * Generates a retro anime style image using fal.ai API
 * @param prompt - The user's prompt that will be combined with retro anime style
 * @returns Promise containing the generated image URL
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    // Combine the prompt with retro anime style prefix
    const fullPrompt = `retro anime style image of ${prompt}`;

    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt: fullPrompt,
        loras: [
          {
            path: "Bootoshi/retroanime",
            scale: 1
          }
        ],
        image_size: "square_hd",
        num_images: 1,
        output_format: "jpeg",
        guidance_scale: 3.5,
        num_inference_steps: 28,
        enable_safety_checker: true
      }
    });

    return result.data.images[0].url;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}