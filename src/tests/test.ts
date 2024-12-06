import { getShortTermHistory } from '../supabase/functions/terminal/terminalHistory';

// Get short term history and slice to last 5 messages
const shortTermHistory = await getShortTermHistory();
const lastFiveMessages = shortTermHistory.slice(-5);
console.log(lastFiveMessages);