import { Command } from '../types/commands';
import { missionSystem } from '../../missions';

/**
 * @command get-mission-status
 * @description Get current status of a mission
 */
export const getMissionStatus: Command = {
  name: 'get-mission-status',
  description: 'Get current status of a mission',
  parameters: [
    {
      name: 'missionId',
      description: 'ID of the mission (optional, defaults to current)',
      required: false,
      type: 'string'
    }
  ],
  handler: async (args) => {
    const missionId = args.missionId;
    const mission = missionId 
      ? missionSystem.getMissionById(missionId)
      : missionSystem.getCurrentMission();

    if (!mission) {
      return {
        output: 'No mission found'
      };
    }

    return {
      output: JSON.stringify({
        id: mission.id,
        description: mission.description,
        status: mission.status,
        metrics: mission.metrics,
        completion_criteria: mission.completion_criteria
      }, null, 2)
    };
  }
}; 