## Core Tables

### 1. `users` Table
- **Purpose**: Central table for unique user identities
- **Fields**:
  - `id` UUID PRIMARY KEY: Unique identifier
  - `is_registered` BOOLEAN: Registration status
  - `registered_at` TIMESTAMP: When user registered
  - `created_at` TIMESTAMP: Record creation time
  - `updated_at` TIMESTAMP: Last update time

### 2. `user_accounts` Table
- **Purpose**: Links users to their platform accounts
- **Fields**:
  - `id` SERIAL PRIMARY KEY: Unique identifier
  - `user_id` UUID: References users(id)
  - `platform` VARCHAR: Platform name (e.g., 'twitter', 'discord')
  - `platform_user_id` VARCHAR: User's ID on the platform
  - `username` VARCHAR: Platform username/handle
  - `connected_at` TIMESTAMP: Account linking time
- **Constraints**: UNIQUE (platform, platform_user_id)

## Twitter-Specific Tables

### 1. `twitter_user_accounts` Table
- **Purpose**: Stores Twitter-specific user data
- **Fields**:
  - `user_account_id` INTEGER PRIMARY KEY: References user_accounts(id)
  - `is_followed_by_bot` BOOLEAN: Follow status
  - `last_followed_at` TIMESTAMP: Last follow time

### 2. `twitter_tweets` Table
- **Purpose**: Records tweets sent by the bot
- **Fields**:
  - `tweet_id` VARCHAR PRIMARY KEY: Twitter's tweet ID
  - `text` TEXT: Tweet content
  - `tweet_type` VARCHAR: Type ('main', 'reply', 'retweet', 'quote', 'media')
  - `in_reply_to_tweet_id` VARCHAR: Parent tweet ID for replies
  - `retweeted_tweet_id` VARCHAR: Original tweet ID for retweets
  - `quoted_tweet_id` VARCHAR: Original tweet ID for quotes
  - `created_at` TIMESTAMP: Tweet creation time
  - `updated_at` TIMESTAMP: Last update time

### 3. `twitter_interactions` Table
- **Purpose**: Tracks bot interactions with users' tweets
- **Fields**:
  - `id` SERIAL PRIMARY KEY: Unique identifier
  - `tweet_id` VARCHAR: References twitter_tweets(tweet_id)
  - `user_id` UUID: References users(id)
  - `text` TEXT: Content of user's tweet
  - `action` VARCHAR: Interaction type ('replied', 'liked', 'retweeted', 'quoted')
  - `context` JSONB: Conversation context data
  - `timestamp` TIMESTAMP: User's tweet posting time
- **Constraints**: UNIQUE (tweet_id, action)

## Media Management

### 1. `media` Table
- **Purpose**: Stores metadata for media files
- **Fields**:
  - `id` UUID PRIMARY KEY: Unique identifier
  - `media_type` VARCHAR: Type ('image', 'video')
  - `file_path` VARCHAR: Path in Supabase storage
  - `created_at` TIMESTAMP: Upload time
  - `updated_at` TIMESTAMP: Last update time

### 2. `tweet_media` Table
- **Purpose**: Links media files to tweets
- **Fields**:
  - `tweet_id` VARCHAR: References twitter_tweets(tweet_id)
  - `media_id` UUID: References media(id)
- **Constraints**: PRIMARY KEY (tweet_id, media_id)

## Performance Optimization

### Indexes
- user_accounts(user_id)
- user_accounts(platform)
- twitter_interactions(user_id)
- twitter_interactions(tweet_id)
- twitter_tweets(created_at)

## Implementation Notes

### User Flow
1. New user interacts with bot:
   - Create record in `users`
   - Create record in `user_accounts`
   - Create record in `twitter_user_accounts`

2. Sending tweets:
   - Store tweet in `twitter_tweets`
   - For media tweets, store media metadata in `media`
   - Link media to tweet in `tweet_media`

3. Tracking interactions:
   - Log in `twitter_interactions`
   - Use unique constraint to prevent duplicate actions

### Data Management
- Timestamps are set from application code
- Media files stored in Supabase storage
- Context data stored as JSONB for flexibility

### Platform Expansion
To add a new platform:
1. Add platform identifier to `user_accounts.platform`
2. Create new platform-specific table (e.g., `discord_user_accounts`)
3. Link to `user_accounts` via `user_account_id`

## SQL Schema

```sql
-- Core user management
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_registered BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Platform account linkage
CREATE TABLE user_accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NULL, -- Allow NULL for unregistered users
  platform VARCHAR NOT NULL,
  platform_user_id VARCHAR NOT NULL,
  username VARCHAR,
  connected_at TIMESTAMP,
  UNIQUE (platform, platform_user_id)
);
-- Media storage
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type VARCHAR NOT NULL,    -- 'image', 'video', etc.
  file_path VARCHAR NOT NULL,     -- Path in Supabase storage
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Twitter-specific account data
CREATE TABLE twitter_user_accounts (
  user_account_id INTEGER PRIMARY KEY REFERENCES user_accounts(id) ON DELETE CASCADE,
  is_followed_by_bot BOOLEAN DEFAULT FALSE,
  last_followed_at TIMESTAMP
);

-- Bot's tweets
CREATE TABLE twitter_tweets (
  tweet_id VARCHAR PRIMARY KEY,
  text TEXT,
  tweet_type VARCHAR,             -- 'main', 'reply', 'retweet', 'quote', 'media'
  in_reply_to_tweet_id VARCHAR,
  retweeted_tweet_id VARCHAR,
  quoted_tweet_id VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Link tweets to media
CREATE TABLE tweet_media (
  tweet_id VARCHAR REFERENCES twitter_tweets(tweet_id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  PRIMARY KEY (tweet_id, media_id)
);

-- Bot's interactions with users' tweets
CREATE TABLE twitter_interactions (
  id SERIAL PRIMARY KEY,
  tweet_id VARCHAR REFERENCES twitter_tweets(tweet_id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  text TEXT,                      -- Content of the user's tweet
  action VARCHAR,                 -- 'replied', 'liked', 'retweeted', 'quoted'
  context JSONB,                  -- Stores context from fetchAndFormatTweetMemory()
  timestamp TIMESTAMP,            -- When the user's tweet was posted
  UNIQUE (tweet_id, action)       -- Prevent duplicate actions on the same tweet
);

CREATE TABLE terminal_history (
  id BIGSERIAL PRIMARY KEY,  -- This auto-increments for each new entry
  session_id UUID NOT NULL,   -- This stays same for related entries
  entry_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  parent_id BIGINT REFERENCES terminal_history(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id VARCHAR NOT NULL,
  session_id VARCHAR NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  direct_response TEXT,
  tool_output JSONB,
  error TEXT,
);


-- Indexes for performance
CREATE INDEX idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX idx_user_accounts_platform ON user_accounts(platform);
CREATE INDEX idx_twitter_interactions_user_id ON twitter_interactions(user_id);
CREATE INDEX idx_twitter_interactions_tweet_id ON twitter_interactions(tweet_id);
CREATE INDEX idx_twitter_tweets_created_at ON twitter_tweets(created_at);
CREATE INDEX idx_terminal_history_session_id ON terminal_history(session_id);
CREATE INDEX idx_agent_responses_lookup ON agent_responses(agent_id, session_id);

-- Example of adding another platform (e.g., Discord)
CREATE TABLE discord_user_accounts (
  user_account_id INTEGER PRIMARY KEY REFERENCES user_accounts(id) ON DELETE CASCADE,
  discord_nickname VARCHAR,
  roles TEXT[],
  last_interaction_at TIMESTAMP
);
```