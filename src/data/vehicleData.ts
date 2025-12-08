// Types used throughout the app
export type ServiceCategory = 'key-programming' | 'ecu-cloning' | 'dashboard' | 'immo-off';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface Tool {
  name: string;
  required: boolean;
}

export interface Procedure {
  id: string;
  category: ServiceCategory;
  title: string;
  description: string;
  timeMinutes: number;
  difficulty: DifficultyLevel;
  cost: { min: number; max: number };
  tools: Tool[];
  steps: string[];
  notes?: string[];
  pinCode?: string;
  chipType?: string;
}

export interface VehicleModel {
  model: string;
  years: string;
  procedures: Procedure[];
}

export interface VehicleMake {
  make: string;
  logo?: string;
  models: VehicleModel[];
}

export const categoryLabels: Record<ServiceCategory, string> = {
  'key-programming': 'Key Programming',
  'ecu-cloning': 'ECU Cloning',
  'dashboard': 'Dashboard',
  'immo-off': 'IMMO Off'
};

export const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'bg-success/20 text-success border-success/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  hard: 'bg-accent/20 text-accent border-accent/30',
  expert: 'bg-destructive/20 text-destructive border-destructive/30'
};