import dotenv from 'dotenv';
import { Logger } from './logger';

Logger.enable();

// Load environment variables
dotenv.config();

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Queries the Perplexity AI API with a given prompt
 * @param query - The user's question or prompt
 * @returns The AI's response as a string
 */
export async function queryPerplexity(query: string): Promise<string> {
  // System message to control AI behavior
  const messages: Message[] = [
    {
      role: 'system',
      content: 'Give a clear, direct answer to the user\'s question.'
    },
    {
      role: 'user',
      content: query
    }
  ];

  try {
    // Make API request to Perplexity
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json() as PerplexityResponse;
    return data.choices[0].message.content;

  } catch (error) {
    Logger.log('Error querying Perplexity:', error);
    throw error;
  }
}