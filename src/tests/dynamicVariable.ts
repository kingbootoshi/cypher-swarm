import { assembleTwitterInterface } from '../twitter/utils/imageUtils';
import { TestAgent } from '../ai/agents/testAgent/testAgent';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { AnthropicClient } from '../ai/models/clients/AnthropicClient';
import { FireworkClient } from '../ai/models/clients/FireworkClient';

Logger.enable();

// Assemble Twitter interface
const { textContent, imageContents } = await assembleTwitterInterface(".", "1862314487681786077");

// Create test agent
const openAIClient = new OpenAIClient("gpt-4o");
const anthropicClient = new AnthropicClient("claude-3-5-haiku-20241022");
const fireworkClient = new FireworkClient("accounts/fireworks/models/llama-v3p1-405b-instruct");
const testAgent = new TestAgent(fireworkClient);

// Create dynamic variables for runtime
const runtimeVariables = {
  corePersonalityPrompt: "talk like a pirate",
  twitterInterface: textContent, // Replace the placeholder with actual content
};

// Run the agent with dynamic variables
const runAgentTest = await testAgent.run(
  "What is this tweet about?",  // inputMessage
  runtimeVariables            // dynamicVariables
);

console.log("RUN AGENT TEST:", runAgentTest);