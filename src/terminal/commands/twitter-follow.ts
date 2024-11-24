import { Command } from '../types/commands';
import { followUser } from '../../twitter/twitterFunctions/followUser';

/**
 * @command twitter-follow
 * @description Follows a specified Twitter user
 */
export const twitterFollow: Command = {
  name: 'follow',
  description: 'Follows a specified Twitter user',
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
      const success = await followUser(args.username);
      return {
        output: success 
          ? `✅ Action: Follow User\nTarget: @${args.username}\nStatus: Success\nDetails: Successfully followed user @${args.username}`
          : `❌ Action: Follow User\nTarget: @${args.username}\nStatus: Failed\nDetails: Unable to follow user @${args.username}`
      };
    } catch (error) {
      return {
        output: `❌ Action: Follow User\nTarget: @${args.username}\nStatus: Error\nDetails: ${error.message}`
      };
    }
  }
}; 