import { 
    searchWorldKnowledge,
    searchCryptoKnowledge,
    searchSelfKnowledge,
    searchUserSpecificKnowledge,
    searchMainTweet,
    searchImagePrompt
  } from "./searchMemories";
  import { Logger } from '../utils/logger';
  
  Logger.enable();
  
  // Test function to run all memory searches
  async function testMemorySearches() {
    try {
      // Test search queries
      const testQuery = "bitcoin, ai, crypto, blockchain";
      const testUserId = "123"; // Replace with an actual user ID for testing
  
      Logger.log("🧪 Starting memory search tests...\n");
  
      // Test world knowledge search
      Logger.log("Testing World Knowledge Search:");
      const worldResults = await searchWorldKnowledge(testQuery);
      Logger.log("World Knowledge Results:", worldResults, "\n");
  
      // Test crypto knowledge search
      Logger.log("Testing Crypto Knowledge Search:");
      const cryptoResults = await searchCryptoKnowledge(testQuery);
      Logger.log("Crypto Knowledge Results:", cryptoResults, "\n");
  
      // Test self knowledge search
      Logger.log("Testing Self Knowledge Search:");
      const selfResults = await searchSelfKnowledge(testQuery);
      Logger.log("Self Knowledge Results:", selfResults, "\n");
  
      // Test user-specific knowledge search
      Logger.log("Testing User-Specific Knowledge Search:");
      const userResults = await searchUserSpecificKnowledge(testQuery, testUserId);
      Logger.log("User-Specific Results:", userResults, "\n");
  
      // Test main tweets search
      Logger.log("Testing Main Tweets Search:");
      const tweetResults = await searchMainTweet(testQuery);
      Logger.log("Main Tweets Results:", tweetResults, "\n");
  
      // Test image prompts search
      Logger.log("Testing Image Prompts Search:");
      const imageResults = await searchImagePrompt(testQuery);
      Logger.log("Image Prompts Results:", imageResults, "\n");
  
    } catch (error) {
      Logger.log("❌ Error during memory search tests:", error);
    }
  }
  
  // Run the tests
  testMemorySearches().then(() => {
    Logger.log("✅ Memory search tests completed");
  }).catch((error) => {
    Logger.log("❌ Fatal error in test execution:", error);
  });