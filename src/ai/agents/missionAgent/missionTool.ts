import { z } from 'zod';
import { Tool } from '../../types/agentSystem';
import { missionSystem } from '../../../missions';

// Helper function to get available metrics
function getAvailableMetrics(missionId: string): string[] {
  const mission = missionSystem.getMissionById(missionId);
  if (!mission?.metrics) return [];
  return Object.keys(mission.metrics);
}

export const missionToolSchema = z.object({
  internal_thoughts: z.string().describe('Your internal thoughts about the mission progress analysis.'),
  mission_analysis: z.object({
    current_mission: z.string(),
    metrics_update: z.record(z.number()).refine(
      (metrics) => {
        const availableMetrics = getAvailableMetrics(missionSystem.getCurrentMission()?.id || '');
        return Object.keys(metrics).every(key => availableMetrics.includes(key));
      },
      {
        message: `Invalid metrics. Available metrics: ${
          getAvailableMetrics(missionSystem.getCurrentMission()?.id || '').join(', ')
        }`
      }
    ),
    progress_evaluation: z.string()
  }),
  next_actions: z.array(z.string())
});

export const MissionTool: Tool = {
  type: 'function',
  function: {
    name: 'analyze_mission_progress',
    description: `Analyze current mission progress and update metrics.
    Available metrics for current mission: ${
      getAvailableMetrics(missionSystem.getCurrentMission()?.id || '').join(', ')
    }`,
    parameters: {
      type: 'object',
      required: ['internal_thoughts', 'mission_analysis', 'next_actions'],
      properties: {
        internal_thoughts: {
          type: 'string',
          description: 'Your internal thoughts about the mission progress analysis.'
        },
        mission_analysis: {
          type: 'object',
          required: ['current_mission', 'metrics_update', 'progress_evaluation'],
          properties: {
            current_mission: {
              type: 'string',
              description: 'ID of the mission being analyzed.'
            },
            metrics_update: {
              type: 'object',
              description: 'Mission metrics update.'
            },
            progress_evaluation: {
              type: 'string',
              description: 'Textual evaluation of mission progress.'
            }
          }
        },
        next_actions: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'List of recommended next actions.'
        }
      }
    }
  }
}; 