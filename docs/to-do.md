to-do
- setup the terminal (DONE)
- setup the twitter logic with the database (DONE)
- setup supabase client database (DONE)
- setup the AI core that interacts with the terminal (DONE, CREATED AI AGENT SYSTEM)
- setup SUPABASE functions for the service
- implement boop's memory into the AI core (prob involves creating a memory agent that saves/loads memory)

misc:
- have to enable vision tech for the new system (if images are provided as an input)
- make it so genned videos/urls get saved to the supabase bucket so we can display them on site
- enhance media generation pipeline
- make it easy to visualize all internal thoughts from the sub-agents
- make sure to include a similar "fetchAndFormatTweetMemory" function when we're replying/quote-tweeting for deeper context and save this to supabase db
- log the token usage per agent, somehow

current dev log:
- finished talking with o1 to optimize the supbase data, came to the re-structure idea of making a user system in the code base which can connect a user profile across all platforms for AI's memory & connection with users
tweet logic is optimized for supabase db, so we'd need to make a module for all those interactions
- database.md file is not finished, it needs logic of storing command log interactions + the bot's internal thought processes between core and sub-agents

nov 25
i made more database structure progress and got terminal agent database function too

im trying to get it so we that:
1. its important for the ai agent class to not NEED tool output, but handle tool output strictly if provided

some agents can have tool output, some might not have tool output but only has a direct response, and some agents might have both. we want to be flexible

- itd be crucial to be able to go promptEnhancerAgent.run("some input") and have it return a response with tool output or direct response based on the prompt

- we'd need to make chat history more manageable, so that we can have chains of ai agents that just converse and interact with each other. this should even allow group chat discussions. this is good for talking to an agent self as well, and planning out creative ideas, etc which can then be fed into direct tool output as a final result

- finally, i want to be able to save to the database the complete creative agent responses. that way we can easily display each agent's internal process and creative output in a front end UI. makes it flexible

note: be careful to not OD it with too much tokens and calls lol, balance creativity x cost

next steps:
1. finish making it so base agent is flexible to handle tool output or direct response (+ in how to make chat history better)
2. add supabase table for custom agent responses
3. give supabase tables RLS, then add all the tables
4. build supabase functions for each functionality in our current code base
5. intergrate current code checking against supabase data, exactly like satoshAI framework
6. create memory system. involves creating memory agent that interacts with mem0 to save/load memory, and a dynamic way to load the correct memory for each agent depending on the task (which depends on command/agent) which includes creating a memory entry in DB (saves agent's memory for long term). need supabase table for summaries, learnings, dream data
8. create media generation agent systems for images/videos that save to supabase bucket
9. DONE WITH v2

- maybe think about incorporating the result of a send tweet or send tweet with media data, so we can include that in the short term memory buffer that gets sent to the memory agent. easier to deal with users in an instant way rather than waiting for dream reflection