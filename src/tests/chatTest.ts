import { ChatAgent } from '../ai/agents/chatAgent/chatAgent';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { AnthropicClient } from '../ai/models/clients/AnthropicClient';
import { FireworkClient } from '../ai/models/clients/FireworkClient';
import { Logger } from '../utils/logger';

Logger.enable();

// Test configurations for different models
const models = [
  {
    name: 'OpenAI',
    client: new OpenAIClient('gpt-4o', { temperature: 1 }),
  },
  {
    name: 'Anthropic', 
    client: new AnthropicClient('claude-3-5-haiku-20241022', { temperature: 1 }),
  },
  {
    name: 'Fireworks',
    client: new FireworkClient('accounts/fireworks/models/llama-v3p1-405b-instruct', { temperature: 1 }),
  }
];

// Run chat tests for each model
async function runChatTests() {
  console.log('\n🤖 Starting Chat Model Tests\n');

  for (const model of models) {
    console.log(`\n📝 Testing ${model.name} Chat Model`);
    
    try {
      // Initialize chat agent for current model
      const chatAgent = new ChatAgent(model.client);

      // Run test conversation
      const chatResult = await chatAgent.run("Hello! How are you today?");

      // Log results
      if (chatResult.success) {
        console.log(`✅ ${model.name} Chat Response:`, chatResult.output);
      } else {
        console.error(`❌ ${model.name} Chat Failed:`, chatResult.error);
      }
    } catch (error) {
      console.error(`❌ ${model.name} Chat Error:`, error);
    }
  }

  console.log('\n🏁 Chat Model Tests Completed\n');
}

// Execute the chat tests
runChatTests();