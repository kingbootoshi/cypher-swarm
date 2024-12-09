![4YiBHikFejQwnKmuwaOXk_1f74036290b34d32838b4be888b83f08](https://github.com/user-attachments/assets/db362428-fe27-499d-be63-e61853e1a208)

**CYPHER SWARM** is an agentic AI framework designed to unify multiple specialized AI agents under one modular, memory-rich "hivemind" system. Inspired by the ethos of Satoshi Nakamoto and the crypto origins of "CYPHER GENESIS," this framework turns your AI ecosystem into a collaborative intelligence network that can interface with virtually any environment—Twitter, Discord, custom terminals, or web APIs—while sharing a common memory and personality core.

## Key Concepts

1. **Unified Personality & Hivemind Memory**  
   All agents share one main, configurable personality prompt—shaped by dynamic variables, world knowledge, user-specific insights, and long-term learnings. This ensures coherence and consistency across the entire system.

2. **Terminal Agent as the World Interface**  
   The Terminal Agent acts as the CEO, orchestrating other specialized agents. Connected to a custom terminal environment, it can:
   - Execute commands (run functions) that interface with external platforms.
   - Gather context from various sources (e.g., Twitter timeline, user requests).
   - Delegate tasks to specialized agents (tweet generation, memory extraction, image creation).

3. **Modular Specialization**  
   - **Twitter Agent**: Browse timelines, fetch mentions, and generate context for tweets.
   - **Media Agent**: Produce images or other media assets on demand.
   - **Memory & Learning Agents**: Extract patterns, store long-term knowledge, and make that knowledge accessible to all agents.
   - **Planned**: Future agents for internet access, Bitcoin wallet functionality, and more—easily integrated into the same memory and personality system.

4. **Hivemind Brain**  
   All agents tap into a shared memory system. User interactions, world knowledge, and past actions are summarized and stored, enabling each agent to recall context, learn from experience, and evolve over time. The memory system supports hierarchical summarization (short → mid → long term) and can integrate knowledge extracted from any connected interface.

## Why CYPHER SWARM?

- **Scalability**: Add or remove agents as needed, each with their own domain expertise.  
- **Consistency**: A single personality prompt and memory system keeps the entire network coherent.  
- **Extensibility**: Easily integrate new tools, APIs, or platforms.  
- **Context-Rich Intelligence**: Layered memory and learning pipelines ensure continuous improvement.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/kingbootoshi/cypher-swarm.git

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in your API keys and other config details

# Edit the agent.yaml file to your liking (located in src/config/agent.yaml)

# Start the system
bun src/index.ts
```