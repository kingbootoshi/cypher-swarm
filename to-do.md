TO DO:
- create dream system - an agent that loads in learnings daily per category [and each user], reflects/summarizes, and stores in supabase db. every day the new learnings condense into the existing learnings, adjusting the core system prompt on a daily basis. (can be done later)
- get fireworks model image capabilities by chaining the image gen into the firework agent history after 'seeing' it
- log the token usage per agent, somehow
- log the schema outputs of every agent when they run in pipelines, so we can visualize it on site
- update site so we get new terminal and functionalities
- make the agent system for CORE agents configurable for new user modalarity
- make the media gen system easily configurable for new user modalarity
- look into bundling commands like replies from terminal agent so we can hammer out multiple replies at once

IDEAS:
- content manager agent that reads different timelines/world news and decides what to tweet about
content manager pipeline:
-> reads different timelines and summarizes the current meta/trend of what ppl are talking about
-> gets live news of what's happening in the world
-> gets current mempool data to see if anything interesting is going on
once it gets all this news, it thinks of a topic to tweet about, and gives that + summarized info to the main tweet agent

- need to figure out how to get satoshi to bull post about other communities/projects too

- i can make a chatgpt pro prompt base i can use to reference and copy and paste, maybe it can help me make full agent pipelines

- probably have to reverse engineer twit api to see the twitter blue post request and edit goat-x package