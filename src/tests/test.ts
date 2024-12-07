import { getCooldownStatus } from "../supabase/functions/twitter/cooldowns";
import { Logger } from "../utils/logger";

Logger.enable();

console.log("getting cooldown status: ", await getCooldownStatus());