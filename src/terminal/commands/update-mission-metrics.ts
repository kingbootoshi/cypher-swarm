import { Command } from '../types/commands';
import { missionSystem } from '../../missions';
import { Logger } from '../../utils/logger';

/**
 * @command update-mission-metrics
 * @description Update metrics for a specific mission
 */
export const updateMissionMetrics: Command = {
  name: 'update-mission-metrics',
  description: 'Update metrics for a specific mission',
  parameters: [
    {
      name: 'missionId',
      description: 'ID of the mission',
      required: true,
      type: 'string'
    },
    {
      name: 'metrics',
      description: 'Metrics in JSON format',
      required: true,
      type: 'string'
    }
  ],
  handler: async (args) => {
    try {
      const { missionId, metrics } = args;
      const metricsObj = JSON.parse(metrics);
      
      await missionSystem.updateMissionMetrics(missionId, metricsObj);
      Logger.log(`📊 Mission metrics updated for: ${missionId}`);
      
      return {
        output: `Mission metrics successfully updated`
      };
    } catch (error) {
      Logger.log(`🚨 Failed to update mission metrics: ${error}`);
      return {
        output: `Error updating mission metrics: ${error}`
      };
    }
  }
}; 