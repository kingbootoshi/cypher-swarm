# Architecture Overview

This document provides a detailed overview of the project's architecture, including modules, components, and how they interact.

## Modules and Components

### 1. Terminal System

- **Location**: `src/terminal/`
- **Purpose**: Provides a command execution environment that can be used by both the AI agent and human users.
- **Key Files**:
  - `executeCommand.ts`: Core logic for command execution.
  - `commandRegistry.ts`: Manages the registration and retrieval of command handlers.
  - `commands/`: Directory containing individual command implementations.

### 2. AI Module

- **Location**: `src/ai/`
- **Purpose**: Contains the AI logic, including prompt generation and AI interactions.
- **Key Files**:
  - `coreFunctions/`: Core AI functions such as `mainTweet` and `replyTweet`.
  - `assembleSystemPrompt.ts`: Generates the system prompt with command information.

### 3. Twitter Integration

- **Location**: `src/twitter/`
- **Purpose**: Handles interactions with the Twitter API.
- **Key Files**:
  - `twitterCommands.ts`: Contains functions for sending tweets, retrieving replies, etc.

## Interaction Flow

- The AI agent generates a command based on the system prompt.
- The command is passed to the terminal system for execution.
- The terminal executes the command and returns the output.
- The AI agent uses the output to inform subsequent actions.

---
