export interface TweetActionResult {
  success: boolean;
  message: string;
  tweetId?: string;
}

export interface ReplyResult extends TweetActionResult {}
export interface QuoteResult extends TweetActionResult {}
export interface RetweetResult extends TweetActionResult {} 