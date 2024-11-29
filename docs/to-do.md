to-do:
1. create memory system. involves creating memory agent that interacts with mem0 to save/load memory, and a dynamic way to load the correct memory for each agent depending on the task (which depends on command/agent) which includes creating a memory entry in DB (saves agent's memory for long term). need supabase table for summaries, learnings, dream data
2. create media generation agent systems for images/videos that save to supabase bucket
3. DONE WITH v2, PUSH LIVE TO GIT, UPDATE DOCS, AND ANNOUNCE IT

misc:
- have to enable vision tech for the new system (if images are provided as an input)
- enhance media generation pipeline
- make sure to include a similar "fetchAndFormatTweetMemory" function when we're replying/quote-tweeting for deeper context and save this to supabase db (DONE!!!)
- log the token usage per agent, somehow

MEMORY SYSTEM:
- create a supabase table for the short term chat history, so we can use this to load into the terminal agent (DONE)
- create a supabase table for the summaries (do we combine all into one, or have one for each short/mid/long term summary?) (DONE)
- summarize the short-term terminal logs (this is the AI's main state of mind) (DONE)
- finish the summarization pipeline, so make summarize agent, get the whole summary hierachy working, and set recent summaries as a dynamic variable
- store summaries into the supabase db (DONE)
- extract learnings from the terminal logs (DONE, but need to add learnings about specific users)
- create a supabase table for the learnings
- store learnings into the mem0 database (general learnings, self learnings, crypto space learnings, user specific learnings) use mem0 API to deal with this.
- create a memory agent that thinks what memories to load in based on the task at hand
- figure out storing main tweets the bot makes raw in supabase (yohei method, to allow versatility tweets)?
- figure out storing media the bot makes raw (same yohei method strat, to allow versatility media)

TO DO LATER
- create dream system - an agent that loads in learnings daily per category [and each user], reflects/summarizes, and stores in supabase db. every day the new learnings condense into the existing learnings, adjusting the core system prompt on a daily basis. (can be done later)

IMPORTANT THOUGHTS:
- so old system imports ENTIRE terminal short term history into main tweets, reply tweets, etc.
but we don't need to do this... with the new load chat history function + short term terminal in supabase database, we can just load in the most recent messages. maybe more specifically, we can format the terminal logs, and what the agent thinks specifically with the terminal logs, and load that into the agent.
- make the bot do 30 actions, and sleep for an hour. every time it goes idle it runs the memory extraction + save process
- if we can figure out some way to link twitter interactions/twitter tweets with terminal session ID, then that's how we can extract information about each user that satoshi interacted with in that session. save it into mem0 database under twitter ID
additionally, we can use the tweet context and input that into the context column of twitter_interactions, so the bot can REALLY understand the tweet context + user and use that to save knowledge.