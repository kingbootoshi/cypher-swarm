// this file is responsible for in-taking short term chat history, extracting learnings from it, & summarizing it into a short term summary
// it is also responsible for checking if we have enough short term summaries to process into a mid term summary
// and if we have enough mid term summaries to process into a long term summary

import { MemorySummaries } from '../supabase/functions/memory/summaries';
import { ExtractorAgent } from '../ai/agents/extractorAgent/extractorAgent';
import { getShortTermHistory } from '../supabase/functions/terminal/terminalHistory';
import { Logger } from '../utils/logger';
import { OpenAIClient } from '../ai/models/clients/OpenAiClient';

Logger.enable();
const openAIClient = new OpenAIClient("gpt-4o");
const extractorAgent = new ExtractorAgent(openAIClient);
const shortTermHistory = await getShortTermHistory();
extractorAgent.loadChatHistory(shortTermHistory);
const learnings = await extractorAgent.run();

console.log("LEARNINGS:", learnings);