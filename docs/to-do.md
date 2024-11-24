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
- make sure to include a similar "fetchAndFormatTweetMemory" function when we're replying/quote-tweeting for deeper context

current dev log:
- finished talking with o1 to optimize the supbase data, came to the re-structure idea of making a user system in the code base which can connect a user profile across all platforms for AI's memory & connection with users
tweet logic is optimized for supabase db, so we'd need to make a module for all those interactions
- database.md file is not finished, it needs logic of storing command log interactions + the bot's internal thought processes between core and sub-agents