import { ChatAgent } from '../ai/agents/chatAgent/chatAgent';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { DeepSeekClient } from '../ai/models/clients/DeepSeekClient';
import { Logger } from '../utils/logger';

// Logger.enable();

// Initialize chat agents
const openAIAgent = new ChatAgent(new OpenAIClient("gpt-4o"));
const deepSeekAgent = new ChatAgent(new DeepSeekClient("deepseek-chat"));

// Have agents converse back and forth 10 times (5 messages each)
let lastMessage = '';
for (let i = 0; i < 5; i++) {
  // OpenAI agent's turn
  const openAIResult = await openAIAgent.run(lastMessage);
  console.log('OpenAI Response:', openAIResult.output);
  lastMessage = openAIResult.output;

  // Anthropic agent's turn
  const deepSeekResult = await deepSeekAgent.run(lastMessage);
  console.log('DeepSeek Response:', deepSeekResult.output);
  lastMessage = deepSeekResult.output;
}