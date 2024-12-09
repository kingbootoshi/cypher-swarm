import { linkTwitterInteractions } from "../supabase/functions/twitter/linkInteractions";
import { Logger } from "../utils/logger";

Logger.enable();

export async function testLinkInteractions() {
  const tweetId = '1866022173648863460';
  const interaction = await linkTwitterInteractions(tweetId);
  Logger.log('Interaction:', interaction);
}

testLinkInteractions().then(() => {
  Logger.log('Test completed successfully');
  process.exit(0);
});