import { getShortTermHistory } from "../supabase/functions/terminal/terminalHistory";
import { getFormattedRecentHistory } from "../supabase/functions/terminal/terminalHistory";

console.log(await getFormattedRecentHistory());