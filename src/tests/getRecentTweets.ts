import { getRecentMainTweets } from "../supabase/functions/twitter/tweetEntries";

const mainTweets = await getRecentMainTweets();
console.log("Main tweets:", mainTweets);
