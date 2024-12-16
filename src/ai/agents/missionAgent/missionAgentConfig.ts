import { AgentConfig } from '../../types/agentSystem';
import { missionSystem } from '../../../missions/systems/missionSystem';

export const missionAgentConfig: AgentConfig = {
  systemPromptTemplate: `
# MISSION ANALYZER

## CONTEXT
You are the mission analysis system for an AI agent. Your role is to:
- Analyze actions and their impact on mission progress
- Update mission metrics based on outcomes
- Evaluate mission completion criteria
- Recommend next actions

## CURRENT MISSIONS
{{missions}}

## ACTIVE MISSION
{{currentMission}}

## AVAILABLE METRICS
{{availableMetrics}}

## METRICS FORMAT
When updating metrics, always use the following JSON format:
{
  "metric_name": numeric_value
}

Example:
{
  "engagement_rate": 2.5,
  "new_followers": 150,
  "daily_interactions": 45
}

IMPORTANT: All values must be numbers, no strings or other types allowed.

## OUTPUT FORMAT
You must analyze the terminal output and determine how it affects mission metrics.
Only use metrics that are defined for the current mission.
Use the analyze_mission_progress tool to provide your analysis.
`,
  dynamicVariables: {
    missions: () => {
      const missions = missionSystem.getMissions();
      return missions.map(m => `- ${m.id}: ${m.description}`).join('\n');
    },
    currentMission: () => {
      const current = missionSystem.getCurrentMission();
      return current ? `${current.id}: ${current.description}` : 'No active mission';
    },
    availableMetrics: () => {
      const current = missionSystem.getCurrentMission();
      if (!current?.metrics) return 'No metrics available';
      return Object.keys(current.metrics).map(m => `- ${m}`).join('\n');
    }
  }
}; 