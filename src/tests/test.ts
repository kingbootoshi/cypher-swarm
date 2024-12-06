import { getRecentMainTweets } from "../supabase/functions/twitter/tweetEntries";

console.log(await getRecentMainTweets());