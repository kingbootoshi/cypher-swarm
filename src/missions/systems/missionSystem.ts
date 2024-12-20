import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { Mission, MissionMetrics, MissionConfig } from '../types/mission';
import { Logger } from '../../utils/logger';

interface CompletionMapping {
  metric: string;
  keywords: string[];
  qualitativeAnalysis: (current: number, target: number) => string;
}

export class MissionSystem {
  private static instance: MissionSystem;
  private missionsPath: string;
  private missions: MissionConfig;

  private completionMappings: CompletionMapping[] = [
    {
      metric: 'new_followers',
      keywords: ['followers', 'abonnés', 'suiveurs'],
      qualitativeAnalysis: (current, target) => {
        const progress = (current / target) * 100;
        if (progress >= 100) return "Objectif atteint !";
        if (progress >= 75) return "Excellente progression, proche de l'objectif";
        if (progress >= 50) return "Bonne progression, maintenir l'effort";
        if (progress >= 25) return "Progression régulière, intensifier les actions";
        return "Phase initiale, nécessite plus d'actions";
      }
    },
    {
      metric: 'engagement_rate',
      keywords: ['engagement', 'interaction', 'taux'],
      qualitativeAnalysis: (current, target) => {
        const ratio = current / target;
        if (ratio >= 1) return "Engagement optimal atteint";
        if (ratio >= 0.8) return "Très bon engagement, proche de l'objectif";
        if (ratio >= 0.5) return "Engagement modéré, amélioration possible";
        return "Engagement faible, revoir la stratégie";
      }
    },
    {
      metric: 'daily_interactions',
      keywords: ['interactions', 'activité', 'quotidien'],
      qualitativeAnalysis: (current, target) => {
        const ratio = current / target;
        if (ratio >= 1) return "Objectif d'interactions atteint";
        if (ratio >= 0.7) return "Bon niveau d'interactions";
        if (ratio >= 0.4) return "Interactions modérées";
        return "Augmenter le niveau d'interactions";
      }
    }
  ];

  private constructor() {
    this.missionsPath = path.join(__dirname, '../../config/missions.yaml');
    this.loadMissions();
  }

  public static getInstance(): MissionSystem {
    if (!MissionSystem.instance) {
      MissionSystem.instance = new MissionSystem();
    }
    return MissionSystem.instance;
  }

  private loadMissions(): void {
    try {
      const fileContents = fs.readFileSync(this.missionsPath, 'utf8');
      this.missions = yaml.load(fileContents) as MissionConfig;
      Logger.log('🎯 Missions configuration loaded successfully');
    } catch (error) {
      Logger.log(`🚨 Failed to load missions: ${error}`);
      throw error;
    }
  }

  private async saveMissions(): Promise<void> {
    try {
      const yamlStr = yaml.dump(this.missions);
      await fs.promises.writeFile(this.missionsPath, yamlStr, 'utf8');
      Logger.log('💾 Missions saved successfully');
    } catch (error) {
      Logger.log(`🚨 Failed to save missions: ${error}`);
      throw error;
    }
  }

  public getMissions(): Mission[] {
    return this.missions.missions;
  }

  public getCurrentMission(): Mission | undefined {
    return this.getMissionById(this.missions.current_mission);
  }

  public getMissionById(id: string): Mission | undefined {
    return this.missions.missions.find(m => m.id === id);
  }

  private updateCompletionCriteria(mission: Mission, metrics: MissionMetrics): void {
    mission.completion_criteria = mission.completion_criteria.map(criteria => {
      // Find the mapping for the criteria
      const mapping = this.completionMappings.find(m => 
        m.keywords.some(keyword => 
          criteria.description.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (mapping && metrics[mapping.metric] !== undefined) {
        const current = metrics[mapping.metric];
        const analysis = mapping.qualitativeAnalysis(current, criteria.target);
        
        Logger.log(`📊 ${criteria.description}: ${analysis}`);
        Logger.log(`   Progression: ${current}/${criteria.target}`);

        return {
          ...criteria,
          current,
          qualitative_analysis: analysis 
        };
      }

      return criteria;
    });
  }

  public async updateMissionMetrics(missionId: string, metrics: MissionMetrics): Promise<void> {
    const mission = this.getMissionById(missionId);
    if (!mission) {
      Logger.log(`🚨 Mission not found: ${missionId}`);
      throw new Error(`Mission not found: ${missionId}`);
    }

    // Update metrics
    mission.metrics = { ...mission.metrics, ...metrics };
    Logger.log(`📊 Updated metrics for mission: ${missionId}`, metrics);

    // Automatic update of completion_criteria
    this.updateCompletionCriteria(mission, metrics);
    Logger.log(`🎯 Updated completion criteria for mission: ${missionId}`);

    // Update the date
    mission.updated_at = new Date();
    
    // Save the changes
    await this.saveMissions();
    Logger.log(`💾 Saved mission updates for: ${missionId}`);
  }

  public async getMissionStatus(): Promise<string> {
    const mission = this.getCurrentMission();
    if (!mission) return 'No active mission';
    
    return `${mission.id}: ${mission.description} | [ENG ${mission.metrics.engagement_rate}%/5%] [FOL ${mission.metrics.new_followers}/1000] [INT ${mission.metrics.daily_interactions}/100]`;
  }
}

export const missionSystem = MissionSystem.getInstance();
