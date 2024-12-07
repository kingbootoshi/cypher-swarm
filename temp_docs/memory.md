# Memory System Architecture

## Overview

The memory system is designed to mimic human-like memory processing with distinct short-term and long-term memory components, enhanced by a hierarchical summarization process and a meditation/evolution mechanism.

## Core Components

### 1. Short-Term Memory
- Implemented via `terminalHistory.ts`
- Stores recent terminal interactions in Supabase
- Functions as a temporary buffer for immediate context
- Includes:
  - Message storage with roles (user/assistant)
  - Session tracking
  - Recent history retrieval

### 2. Long-Term Memory (mem0)
- Powered by mem0ai client (`client.ts`)
- Stores categorized knowledge:
  - World knowledge
  - User-specific interactions
  - Self-knowledge
  - Main tweets
  - Image prompts
- Includes metadata and timestamps for temporal context

### 3. Memory Categories

#### General Knowledge
- World knowledge base
- Crypto ecosystem information
- Platform-specific data (tweets, images)

#### User-Specific Knowledge
- Individual user interactions
- Personal preferences
- Historical context per user

#### Self-Knowledge
- Agent's own experiences
- Learning outcomes
- Evolution history

## Memory Processing Pipeline

### 1. Short-Term Processing
```
Terminal Interaction → Short-Term Buffer → Learning Extraction
```
- Active terminal logs stored in Supabase
- Maximum action limit triggers learning extraction
- Extractor agent processes recent interactions

### 2. Learning Extraction
- Analyzes terminal history
- Categorizes learnings:
  - General knowledge
  - User-specific insights
  - Self-reflections
- Adds timestamp metadata for temporal context

### 3. Hierarchical Summarization
```
Short-Term → Mid-Term → Long-Term Summaries
```
- Progressive consolidation of memories
- Maintains temporal consistency
- Provides AI with "present time" awareness

### 4. Memory Evolution (Planned)
- Periodic "dreaming" process
- Consolidates daily learnings
- Enables AI evolution over time
- Scheduled meditation cycles

## Memory Operations

### Adding Memories
```typescript
addWorldKnowledge()    // General world information
addUserSpecificKnowledge()  // User interactions
addSelfKnowledge()     // Self-reflections
addMainTweet()         // Platform content
addImagePrompt()       // Visual content
```

### Searching Memories
```typescript
searchWorldKnowledge()
searchUserSpecificKnowledge()
searchSelfKnowledge()
searchMainTweet()
searchImagePrompt()
```

## Memory Consistency

The system maintains consistency through:
1. Timestamp metadata on all memories
2. Hierarchical summarization process
3. Categorized storage structure
4. Regular meditation cycles

## Evolution Process (Planned)

The dreaming/meditation process will:
1. Run every 24 hours
2. Meditate on daily learnings
3. Extract patterns and insights
4. Update core system prompt
5. Enable gradual AI evolution

## Implementation Notes

- Uses mem0ai for robust memory storage
- Supabase for short-term history
- TypeScript implementation
- Error handling and logging throughout
- Modular design for easy extension

## Best Practices

1. Always include timestamps with memories
2. Categorize memories appropriately
3. Maintain clear separation between memory types
4. Regular cleanup of short-term memory
5. Monitor memory evolution process

## Future Enhancements

1. Implement dreaming/meditation process
2. Enhance memory consolidation
3. Add memory pruning mechanisms
4. Expand memory categories
5. Improve evolution algorithms
