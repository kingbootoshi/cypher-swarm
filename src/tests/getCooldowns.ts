import { getCooldownStatus } from "../supabase/functions/twitter/cooldowns";
import { Logger } from "../utils/logger";
Logger.enable();

console.log("Cooldown Status:", await getCooldownStatus());
