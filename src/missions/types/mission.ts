export interface MissionMetrics {
  [key: string]: number;
}

export interface CompletionCriteria {
  description: string;
  target: number;
  current: number;
  qualitative_analysis?: string;
}

export interface Mission {
  id: string;
  description: string;
  priority: number;
  status: 'active' | 'pending' | 'completed';
  metrics: MissionMetrics;
  completion_criteria: CompletionCriteria[];
  created_at: Date;
  updated_at: Date;
}

export interface MissionConfig {
  missions: Mission[];
  current_mission: string;
}

export interface MissionAnalysis {
  current_mission: string;
  metrics_update: MissionMetrics;
  progress_evaluation: string;
}

export interface MissionError {
  code: string;
  message: string;
  timestamp: Date;
}
