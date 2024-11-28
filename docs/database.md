## Core Tables

### 1. `users` Table
- **Purpose**: Central table for unique user identities
- **Fields**:
  - `id` UUID PRIMARY KEY: Unique identifier (auto-generated)
  - `is_registered` BOOLEAN: Registration status (default false)
  - `registered_at` TIMESTAMP: When user registered
  - `created_at` TIMESTAMP: Record creation time
  - `updated_at` TIMESTAMP: Last update time

### 2. `user_accounts` Table
- **Purpose**: Links users to their platform accounts
- **Fields**:
  - `id` SERIAL PRIMARY KEY: Unique identifier
  - `user_id` UUID: References users(id), nullable for unregistered users
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
  - `is_followed_by_bot` BOOLEAN: Follow status (default false)
  - `last_followed_at` TIMESTAMP: Last follow time
  - `profile_data` JSONB DEFAULT NULL: Store complete Twitter profile
  - `last_profile_update` TIMESTAMP: Track when profile was last updated

### 2. `twitter_tweets` Table
- **Purpose**: Records tweets sent by the bot
- **Fields**:
  - `id` SERIAL PRIMARY KEY: Unique identifier
  - `tweet_id` VARCHAR NULL: Twitter's tweet ID
  - `text` TEXT: Tweet content
  - `tweet_type` VARCHAR: Type ('main', 'reply', 'retweet', 'quote')
  - `has_media` BOOLEAN: Indicates if tweet has media (default false)
  - `bot_username` TEXT: Bot's Twitter account ID
  - `in_reply_to_tweet_id` VARCHAR: Parent tweet ID for replies
  - `retweeted_tweet_id` VARCHAR: Original tweet ID for retweets
  - `quoted_tweet_id` VARCHAR: Original tweet ID for quotes
  - `created_at` TIMESTAMP: Tweet creation time
  - `CONSTRAINT unique_tweet_id UNIQUE NULLS NOT DISTINCT (tweet_id)`: Only enforce uniqueness for non-null values

### 3. `twitter_interactions` Table
- **Purpose**: Tracks bot interactions with users' tweets
- **Fields**:
  - `id` SERIAL PRIMARY KEY: Unique identifier
  - `tweet_id` VARCHAR: Twitter's tweet ID
  - `user_id` UUID: References users(id)
  - `bot_username` TEXT: Bot's Twitter account ID
  - `text` TEXT: Content of user's tweet
  - `context` JSONB: Conversation context data
  - `timestamp` TIMESTAMP: When the user's tweet was created

## Terminal & Agent Tables

### 1. `terminal_history` Table
- **Purpose**: Logs terminal interactions and commands
- **Fields**:
  - `id` BIGSERIAL PRIMARY KEY: Unique identifier
  - `session_id` UUID: References sessions(id)
  - `internal_thought` TEXT: Agent's internal thought
  - `plan` TEXT: Agent's plan
  - `command` TEXT: Command executed
  - `terminal_log` TEXT: Command output log

### 2. `agent_responses` Table
- **Purpose**: Stores AI agent responses and outputs
- **Fields**:
  - `id` UUID PRIMARY KEY: Unique identifier (auto-generated)
  - `agent_id` VARCHAR: Identifier for the agent
  - `session_id` VARCHAR: Session identifier
  - `timestamp` TIMESTAMPTZ: Response time (default NOW())
  - `chat_history` TEXT[]: Array of chat messages
  - `direct_response` TEXT: Agent's response
  - `tool_output` JSONB: Tool execution output
  - `error` TEXT: Error message if any

### 3. `terminal_status` Table
- **Purpose**: Tracks terminal system status
- **Fields**:
  - `id` BOOLEAN PRIMARY KEY: Ensures single row (default true)
  - `is_active` BOOLEAN: Terminal active status
  - `last_updated` TIMESTAMPTZ: Last status update (default NOW())

## Media Management

### 1. `media` Table
- **Purpose**: Stores metadata for media files
- **Fields**:
  - `id` UUID PRIMARY KEY: Unique identifier (auto-generated)
  - `media_type` VARCHAR: Media type
  - `file_path` VARCHAR: Path in Supabase storage
  - `created_at` TIMESTAMP: Upload time

### 2. `tweet_media` Table
- **Purpose**: Links media files to tweets
- **Fields**:
  - `tweet_id` VARCHAR: References twitter_tweets(tweet_id)
  - `media_id` UUID: References media(id)
  - `CONSTRAINT tweet_id_not_null CHECK (tweet_id IS NOT NULL)`: Ensure we only link media to tweets with IDs
- **Constraints**: PRIMARY KEY (tweet_id, media_id)

## Performance Optimization

### Indexes
- user_accounts(user_id)
- user_accounts(platform)
- twitter_interactions(user_id)
- twitter_interactions(tweet_id)
- twitter_tweets(created_at)
- twitter_tweets(bot_username)
- twitter_interactions(bot_username)
- terminal_history(session_id)
- agent_responses(agent_id, session_id)

## Security

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

All tables have Row Level Security (RLS) enabled with the following policies:
- Private tables (service role only access):
  - users
  - user_accounts
  - twitter_user_accounts
- Public readable tables (public read, service role write):
  - media
  - twitter_tweets
  - tweet_media
  - twitter_interactions
  - terminal_history
  - agent_responses
  - terminal_status

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
  created_at TIMESTAMP
);

-- Twitter-specific account data
CREATE TABLE twitter_user_accounts (
  user_account_id INTEGER PRIMARY KEY REFERENCES user_accounts(id) ON DELETE CASCADE,
  is_followed_by_bot BOOLEAN DEFAULT FALSE,
  last_followed_at TIMESTAMP,
  profile_data JSONB DEFAULT NULL,  -- Store complete Twitter profile
  last_profile_update TIMESTAMP     -- Track when profile was last updated
);

-- Bot's tweets
CREATE TABLE twitter_tweets (
  id SERIAL PRIMARY KEY,
  tweet_id VARCHAR NULL,  -- Allow NULL
  text TEXT,
  tweet_type VARCHAR,             -- 'main', 'reply', 'quote', 'retweet'
  has_media BOOLEAN DEFAULT FALSE,
  bot_username TEXT,             
  in_reply_to_tweet_id VARCHAR,
  retweeted_tweet_id VARCHAR,
  quoted_tweet_id VARCHAR,
  created_at TIMESTAMP,
  CONSTRAINT unique_tweet_id UNIQUE NULLS NOT DISTINCT (tweet_id)  -- Only enforce uniqueness for non-null values
);

-- Link tweets to media (modified to handle nullable tweet_id)
CREATE TABLE tweet_media (
  tweet_id VARCHAR REFERENCES twitter_tweets(tweet_id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  PRIMARY KEY (tweet_id, media_id),
  CONSTRAINT tweet_id_not_null CHECK (tweet_id IS NOT NULL)  -- Ensure we only link media to tweets with IDs
);

CREATE TABLE twitter_interactions (
  id SERIAL PRIMARY KEY,
  tweet_id VARCHAR,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bot_username TEXT,         
  text TEXT,                        -- User's tweet text
  context JSONB,                    -- Store any additional context
  timestamp TIMESTAMP,              -- When the user's tweet was created
  UNIQUE(tweet_id)                  -- Prevent duplicate entries for same tweet
);

-- Terminal history table with new structure
CREATE TABLE terminal_history (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  internal_thought TEXT,
  plan TEXT,
  command TEXT NOT NULL,
  terminal_log TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create terminal_history table for active short-term history
CREATE TABLE short_term_terminal_history (
    id BIGSERIAL PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for faster queries
    CONSTRAINT terminal_history_session_idx UNIQUE (id, session_id)
);

CREATE TABLE agent_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id VARCHAR NOT NULL,
  session_id VARCHAR NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  chat_history TEXT[],
  direct_response TEXT,
  tool_output JSONB,
  error TEXT
);

CREATE TABLE terminal_status (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id), -- Ensures only one row exists
  is_active BOOLEAN NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_accounts_user_id ON user_accounts(user_id);
CREATE INDEX idx_user_accounts_platform ON user_accounts(platform);
CREATE INDEX idx_twitter_interactions_user_id ON twitter_interactions(user_id);
CREATE INDEX idx_twitter_interactions_tweet_id ON twitter_interactions(tweet_id);
CREATE INDEX idx_twitter_interactions_bot_account ON twitter_interactions(bot_username);
CREATE INDEX idx_twitter_tweets_created_at ON twitter_tweets(created_at);
CREATE INDEX idx_terminal_history_session_id ON terminal_history(session_id);
CREATE INDEX idx_agent_responses_lookup ON agent_responses(agent_id, session_id);
CREATE INDEX idx_twitter_tweets_bot_account ON twitter_tweets(bot_username);
CREATE INDEX idx_user_accounts_platform_user ON user_accounts(platform, platform_user_id);
CREATE INDEX idx_twitter_tweets_type ON twitter_tweets(tweet_type);
CREATE INDEX idx_twitter_tweets_reply_to ON twitter_tweets(in_reply_to_tweet_id);
CREATE INDEX idx_twitter_tweets_quoted ON twitter_tweets(quoted_tweet_id);
CREATE INDEX idx_twitter_tweets_retweeted ON twitter_tweets(retweeted_tweet_id);
CREATE INDEX short_term_terminal_history_session_id_idx ON terminal_history(session_id);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitter_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_term_terminal_history ENABLE ROW LEVEL SECURITY;
-- Private tables (only service role can access)
-- Users table
CREATE POLICY "Service role only" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- User accounts table
CREATE POLICY "Service role only" ON user_accounts
  FOR ALL USING (auth.role() = 'service_role');

-- Twitter user accounts table
CREATE POLICY "Service role only" ON twitter_user_accounts
  FOR ALL USING (auth.role() = 'service_role');

-- Public readable tables (anyone can read, only service role can modify)
-- Media table
CREATE POLICY "Public read access" ON media
  FOR SELECT USING (true);
CREATE POLICY "Service role modification" ON media
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Twitter tweets table
CREATE POLICY "Public read access" ON twitter_tweets
  FOR SELECT USING (true);
CREATE POLICY "Service role modification" ON twitter_tweets
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Tweet media table
CREATE POLICY "Public read access" ON tweet_media
  FOR SELECT USING (true);
CREATE POLICY "Service role modification" ON tweet_media
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Twitter interactions table
CREATE POLICY "Public read access" ON twitter_interactions
  FOR SELECT USING (true);
CREATE POLICY "Service role modification" ON twitter_interactions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Terminal history table
CREATE POLICY "Public read access" ON terminal_history
  FOR SELECT USING (true);
CREATE POLICY "Service role modification" ON terminal_history
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Agent responses table
CREATE POLICY "Public read access" ON agent_responses
  FOR SELECT USING (true);
CREATE POLICY "Service role modification" ON agent_responses
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Terminal status table
CREATE POLICY "Public read access" ON terminal_status
  FOR SELECT USING (true);
CREATE POLICY "Service role modification" ON terminal_status
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Short term terminal history table
CREATE POLICY "Service role modification" ON short_term_terminal_history
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Insert the initial row
INSERT INTO terminal_status (id, is_active) VALUES (TRUE, FALSE);
```

Example of adding another platform (e.g., Discord)
```sql
CREATE TABLE discord_user_accounts (
  user_account_id INTEGER PRIMARY KEY REFERENCES user_accounts(id) ON DELETE CASCADE,
  discord_nickname VARCHAR,
  roles TEXT[],
  last_interaction_at TIMESTAMP
);
```