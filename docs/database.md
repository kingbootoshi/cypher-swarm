# Database Structure and Usage in Codebase

This documentation provides an overview of the database tables and explains how they are used within the codebase. The structure is designed to efficiently manage user data, interactions, and the bot's activities, with scalability for future platform integrations.

---

## USERS

### `users` Table

- **Purpose**: Stores a unique record for every user the bot interacts with, regardless of whether they have registered on the platform. Assigns a UUID to each user for consistent identification.

- **Fields**:
  - `id` (UUID, Primary Key): Uniquely identifies a user in the system.
  - `is_registered` (BOOLEAN): Indicates if the user has registered on the platform (`TRUE`) or not (`FALSE`).
  - `registered_at` (TIMESTAMP): Timestamp when the user registered. `NULL` if unregistered.
  - `created_at` (TIMESTAMP): Timestamp when the user record was created.
  - `updated_at` (TIMESTAMP): Timestamp of the last update to the user record.

- **Usage in Codebase**:
  - **User Creation**: When the bot interacts with a new user on Twitter, a new `users` record is created with `is_registered` set to `FALSE`.
  - **User Registration**: Upon user registration on the platform, `is_registered` is updated to `TRUE`, and `registered_at` is set.
  - **Data Linking**: The `id` is used as a foreign key in other tables (`user_accounts`, `twitter_interactions`, etc.) to associate all related data with the user.

---

### `user_accounts` Table

- **Purpose**: Links users from the `users` table to their accounts on various platforms. Allows a single user to be associated with multiple platform accounts.

- **Fields**:
  - `id` (SERIAL, Primary Key): Unique identifier for the user account record.
  - `user_id` (UUID): Foreign key referencing `users(id)`, linking the platform account to the user.
  - `platform` (VARCHAR): Name of the platform (e.g., `'twitter'`, `'discord'`, `'telegram'`, `'btc_wallet'`).
  - `platform_user_id` (VARCHAR): User's unique ID on the platform.
  - `username` (VARCHAR): User's username or handle on the platform.
  - `is_followed_by_bot` (BOOLEAN): Indicates if the bot is following the user on the platform.
  - `last_followed_at` (TIMESTAMP): Timestamp when the bot last followed the user.
  - `additional_data` (JSONB): Stores any platform-specific additional data.
  - `connected_at` (TIMESTAMP): Timestamp when the account was linked to the user.
  - **Unique Constraint**: Ensures each `platform_user_id` is unique per platform.

- **Usage in Codebase**:
  - **Account Linking**: When the bot interacts with a user, a `user_accounts` record is created linking the `user_id` to their platform account.
  - **Follow Status**: `is_followed_by_bot` and `last_followed_at` are updated when the bot follows or unfollows the user on Twitter.
  - **Data Retrieval**: Used to fetch platform-specific user information when needed in the codebase.

---

## TWITTER SPECIFIC

### `twitter_tweets` Table

- **Purpose**: Stores tweets sent by the bot on Twitter, categorized by type, and records relationships to other tweets (replies, retweets, etc.).

- **Fields**:
  - `tweet_id` (VARCHAR, Primary Key): The tweet's unique ID on Twitter.
  - `text` (TEXT): Content of the tweet.
  - `tweet_type` (VARCHAR): Type of tweet (`'main'`, `'reply'`, `'retweet'`, `'quote'`, `'media'`).
  - `in_reply_to_tweet_id` (VARCHAR): ID of the tweet this one replies to, if applicable.
  - `retweeted_tweet_id` (VARCHAR): ID of the original tweet if this is a retweet.
  - `quoted_tweet_id` (VARCHAR): ID of the original tweet if this is a quote tweet.
  - `media_urls` (TEXT[]): Array of media URLs included in the tweet (may be stored elsewhere; kept here for reference).
  - `created_at` (TIMESTAMP): Timestamp when the tweet was sent by the bot.

- **Usage in Codebase**:
  - **Logging Bot Tweets**: After sending a tweet, the bot inserts a record into `twitter_tweets` with all relevant details.
  - **Avoiding Duplicates**: Helps ensure the bot does not resend or duplicate tweets.
  - **Analytics**: Allows for tracking engagement and analyzing the bot's tweet performance.

---

### `twitter_interactions` Table

- **Purpose**: Stores details of interactions the bot has with other users on Twitter, including replies, likes, retweets, and quotes.

- **Fields**:
  - `id` (SERIAL, Primary Key): Unique identifier for the interaction record.
  - `tweet_id` (VARCHAR): ID of the tweet the bot interacted with.
  - `user_id` (UUID): Foreign key referencing `users(id)`, identifies the user involved in the interaction.
  - `text` (TEXT): Content of the user's tweet.
  - `action` (VARCHAR): Type of interaction (`'replied'`, `'liked'`, `'retweeted'`, `'quoted'`).
  - `context` (JSONB): Stores context data from `fetchAndFormatTweetMemory()`, including conversation history.
  - `timestamp` (TIMESTAMP): Timestamp when the user's tweet was posted.

- **Usage in Codebase**:
  - **Interaction Logging**: When the bot interacts with a tweet, it logs the interaction in this table.
  - **Contextual Responses**: The `context` field helps the bot generate appropriate responses by providing conversation history.
  - **Interaction Tracking**: Helps prevent the bot from interacting with the same content multiple times and supports analytics.

---

### `twitter_follows` Table

(Note: In the latest structure, follow status is tracked directly in `user_accounts` via `is_followed_by_bot` and `last_followed_at`. This table might be redundant.)

- **Purpose**: Tracks follow relationships between the bot and users on Twitter.

- **Fields**:
  - `id` (SERIAL, Primary Key): Unique identifier for the follow record.
  - `user_id` (UUID): Foreign key referencing `users(id)`, identifies the user being followed.
  - `followed_at` (TIMESTAMP): Timestamp when the bot followed the user.
  - `is_followed` (BOOLEAN): Indicates whether the bot is currently following the user.

- **Usage in Codebase**:
  - **Follow Management**: When the bot follows or unfollows a user, it updates this table.
  - **Decision Making**: The bot checks this table to decide whether to follow a user based on certain criteria.

---

## Integration into the Codebase

- **User and Account Management**:
  - When interacting with a new user, the bot creates entries in `users` and `user_accounts`.
  - All user-related data is linked via `user_id`, simplifying data retrieval and manipulation.

- **Interaction Handling**:
  - Interactions are logged in `twitter_interactions` with comprehensive context information.
  - The `context` field allows the bot to maintain conversation threads and generate context-aware responses.

- **Tweet Management**:
  - The bot's tweets are recorded in `twitter_tweets`, allowing for tracking and analysis.
  - This helps in managing cooldowns, preventing duplicate content, and understanding engagement metrics.

- **Follow Status Checking**:
  - The bot uses the `is_followed_by_bot` field in `user_accounts` to determine follow status.
  - Follow actions are updated accordingly to maintain accurate records.

- **Scalability and Future Integration**:
  - The structure supports linking user accounts from multiple platforms, readying the system for future expansions (e.g., Discord, Telegram).
  - By maintaining platform-agnostic user records, the bot can provide a unified experience across services.

- **Data Consistency and Integrity**:
  - Consistent use of `user_id` across tables ensures data integrity.
  - Foreign key constraints maintain relational integrity between users, accounts, and interactions.

- **Efficiency Improvements**:
  - Only essential data is stored, reducing unnecessary database bloat.
  - Redundancies are minimized (e.g., removing `username` from `twitter_interactions` since it's accessible via `user_accounts`).

- **Privacy and Compliance**:
  - The structure allows for compliance with data protection regulations by centralizing user data.
  - Unregistered users are handled appropriately, and data can be managed according to policies.

---

By following this structure, the codebase efficiently manages user interactions, bot activities, and prepares for future growth. It provides a solid foundation for the bot's operations, ensuring scalability, maintainability, and performance.

SQL COMMANDS (edit this to add RLS)
========================================

USERS:
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_registered BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE user_accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR NOT NULL,
  platform_user_id VARCHAR NOT NULL,
  username VARCHAR,
  is_followed_by_bot BOOLEAN DEFAULT FALSE,
  last_followed_at TIMESTAMP,
  additional_data JSONB,
  connected_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (platform, platform_user_id)
);


TWITTER SPECIFIC:
-- Table: twitter_tweets (bot's tweets)
CREATE TABLE twitter_tweets (
  tweet_id VARCHAR PRIMARY KEY,
  text TEXT,
  tweet_type VARCHAR, -- 'main', 'reply', 'retweet', 'quote', 'media'
  in_reply_to_tweet_id VARCHAR,
  retweeted_tweet_id VARCHAR,
  quoted_tweet_id VARCHAR,
  media_urls TEXT[], -- this is going to be stored in the bucket instead, keep for now
  created_at TIMESTAMP -- Use current time when the bot sends the tweet
);

-- Table: twitter_interactions (tweets the bot has interacted with)
CREATE TABLE twitter_interactions (
  id SERIAL PRIMARY KEY,
  tweet_id VARCHAR,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  text TEXT,
  action VARCHAR, -- 'replied', 'liked', 'retweeted', 'quoted'
  context JSONB, -- Stores context from fetchAndFormatTweetMemory()
  timestamp TIMESTAMP -- Time when the user's tweet was posted
);

CREATE TABLE twitter_follows (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT NOW(),
  is_followed BOOLEAN DEFAULT TRUE
);