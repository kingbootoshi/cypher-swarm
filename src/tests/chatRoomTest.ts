import { ChatAgent } from '../ai/agents/chatAgent/chatAgent';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { AnthropicClient } from '../ai/models/clients/AnthropicClient';
import { Logger } from '../utils/logger';

// Logger.enable();

// Initialize chat agents
const openAIAgent = new ChatAgent(new OpenAIClient("gpt-4o"));
const anthropicAgent = new ChatAgent(new AnthropicClient("claude-3-5-sonnet-20240620"));

// Have agents converse back and forth 10 times (5 messages each)
let lastMessage = '';
for (let i = 0; i < 5; i++) {
  // OpenAI agent's turn
  const openAIResult = await openAIAgent.run(lastMessage);
  console.log('OpenAI Response:', openAIResult.output);
  lastMessage = openAIResult.output;

  // Anthropic agent's turn
  const anthropicResult = await anthropicAgent.run(lastMessage);
  console.log('Anthropic Response:', anthropicResult.output);
  lastMessage = anthropicResult.output;
}