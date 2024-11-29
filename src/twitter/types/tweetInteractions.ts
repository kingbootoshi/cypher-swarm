export interface TwitterInteractionContext {
  type: string;
  twitterInterface?: string; // Store the dynamic Twitter interface
  parentTweetId?: string;
  // ... any other context fields
} 