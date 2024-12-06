import { assembleTwitterInterface } from '../twitter/utils/imageUtils';
import { TestAgent } from '../ai/agents/testAgent/testAgent';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';
import { AnthropicClient } from '../ai/models/clients/AnthropicClient';
import { FireworkClient } from '../ai/models/clients/FireworkClient';

Logger.enable();

// Assemble Twitter interface
const { textContent, imageContents } = await assembleTwitterInterface("1862442359020990812");

// Create dynamic variables for runtime
const runtimeVariables = {
  corePersonalityPrompt: "talk like a pirate",
  twitterInterface: textContent,
};

// Create test agent
const openAIClient = new OpenAIClient("gpt-4o");
const anthropicClient = new AnthropicClient("claude-3-5-sonnet-20240620");
const fireworkClient = new FireworkClient("accounts/fireworks/models/llama-v3p1-405b-instruct");
const testAgent = new TestAgent(anthropicClient);

// Add all images at once
testAgent.addImage(
  imageContents.map(img => ({
    name: img.sender,
    mime: img.media_type,
    data: img.data,
  })),
);

// Run the agent with dynamic variables
const runAgentTest = await testAgent.run(
  "What is depicted in the attached images?",
  runtimeVariables
);

console.log("RUN AGENT TEST:", runAgentTest);