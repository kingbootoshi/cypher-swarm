to-do:
1. create memory system. involves creating memory agent that interacts with mem0 to save/load memory, and a dynamic way to load the correct memory for each agent depending on the task (which depends on command/agent) which includes creating a memory entry in DB (saves agent's memory for long term). need supabase table for summaries, learnings, dream data
2. create media generation agent systems for images/videos that save to supabase bucket
3. DONE WITH v2, PUSH LIVE TO GIT, UPDATE DOCS, AND ANNOUNCE IT

misc:
- have to enable vision tech for the new system (if images are provided as an input)
- enhance media generation pipeline
- make sure to include a similar "fetchAndFormatTweetMemory" function when we're replying/quote-tweeting for deeper context and save this to supabase db
- log the token usage per agent, somehow

notes:
- maybe think about incorporating the result of a send tweet or send tweet with media data, so we can include that in the short term memory buffer that gets sent to the memory agent. easier to deal with users in an instant way rather than waiting for dream reflection (wtf does this mean on re-read ???)
- we added a context field to twitter_interactions, right now it tracks if the og tweet was a mention, reply, or other tweet to the bot. parent tweets are marked null. make sure to use this field to add further context like tweet thread, users involved etc.

MEMORY SYSTEM:
- create a supabase table for the short term chat history, so we can use this to load into the terminal agent
- summarize the short-term terminal logs (this is the AI's main state of mind)
- extract learnings from the terminal logs (how to extract learnings about specific users ?? maybe extract from tweet interactions - we can see what interactions the bot uses in terminal logs via the commands it uses! then cross-check the tweets database for more context)
- store learnings into the mem0 database (general learnings, self learnings, user specific learnings)
- store summaries into the supabase db
- create dream system - an agent that loads in learnings daily per category [and each user], reflects/summarizes, and stores in supabase db. every day the new learnings condense into the existing learnings, adjusting the core system prompt on a daily basis.

additional:
- do we need to store main tweets in mem0 database & supabase (yohei method, to allow versatility tweets)? because if the bot stores a main tweet, that'd be added to self learnings?

how to pull memories?
- memory agent that decides which memories to load in based on the task at hand (which depends on command/agent)