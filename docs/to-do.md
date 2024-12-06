to-do:
1. make more configurable (i think config that alters core personality + name for mem0 db)
2. DONE WITH v2, PUSH LIVE TO GIT, UPDATE DOCS, AND ANNOUNCE IT

TO DO LATER
- create dream system - an agent that loads in learnings daily per category [and each user], reflects/summarizes, and stores in supabase db. every day the new learnings condense into the existing learnings, adjusting the core system prompt on a daily basis. (can be done later)
- log the token usage per agent, somehow

IMPORTANT THOUGHTS:
- so old system imports ENTIRE terminal short term history into main tweets, reply tweets, etc.
but we don't need to do this... with the new load chat history function + short term terminal in supabase database, we can just load in the most recent messages. maybe more specifically, we can format the terminal logs, and what the agent thinks specifically with the terminal logs, and load that into the agent.
- make the bot do 30 actions, and sleep for an hour. every time it goes idle it runs the memory extraction + save process
- if we can figure out some way to link twitter interactions/twitter tweets with terminal session ID, then that's how we can extract information about each user that satoshi interacted with in that session. save it into mem0 database under twitter ID
additionally, we can use the tweet context and input that into the context column of twitter_interactions, so the bot can REALLY understand the tweet context + user and use that to save knowledge.