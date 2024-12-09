import { fal } from "@fal-ai/client";
import dotenv from "dotenv";
import { configLoader } from "../../utils/config";

dotenv.config();

// Get image generation settings with defaults
const imageConfig = configLoader.getConfig().imageGen || {
  loraPath: "Bootoshi/retroanime",
  promptPrefix: "retro anime style image of"
};

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
    const fullPrompt = `${imageConfig.promptPrefix} ${prompt}`;

    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt: fullPrompt,
        loras: [
          {
            path: imageConfig.loraPath,
            scale: 1
          }
        ],
        image_size: "square_hd",
        num_images: 1,
        output_format: "jpeg",
        guidance_scale: 3.5,
        num_inference_steps: 28,
        enable_safety_checker: false
      }
    });

    return result.data.images[0].url;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}