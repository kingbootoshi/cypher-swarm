import { getRecentMainTweets } from "../supabase/functions/twitter/tweetEntries";
import { getShortTermHistory } from "../supabase/functions/terminal/terminalHistory";

console.log("short term history: ", await getShortTermHistory(6));