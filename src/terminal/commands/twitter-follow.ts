import { Command } from '../types/commands';
import { followUser, FollowResult } from '../../twitter/functions/followUser';

/**
 * @command twitter-follow
 * @description Follows a specified Twitter user
 */
export const twitterFollow: Command = {
  name: 'follow',
  description: 'Follow a user. Do not include the @ symbol.',
  parameters: [
    {
      name: 'username',
      description: 'Username of the account to follow (without @)',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      const result: FollowResult = await followUser(args.username);

      // Format output based on status
      const statusEmoji = {
        success: '✅',
        already_following: 'ℹ️',
        user_not_found: '❌',
        error: '❌'
      }[result.status];

      return {
        output: `${statusEmoji} Action: Follow User\nTarget: @${args.username}\nStatus: ${result.status}\nDetails: ${result.message}${
          result.error ? `\nError: ${result.error}` : ''
        }`
      };
    } catch (error) {
      return {
        output: `❌ Action: Follow User\nTarget: @${args.username}\nStatus: Error\nDetails: ${error.message}`
      };
    }
  }
}; 