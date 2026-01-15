
export enum Role {
  COACH = 'COACH',
  STUDENT = 'STUDENT'
}

export type SportCategory = 'workout' | 'boxing' | 'swimming' | 'other';

export interface StudentStats {
  height: number;
  weight: number;
  bodyFat: number;
  injuries: string;
  goals: string;
  updatedAt: string;
}

export interface ExerciseRecord {
  id: string;
  name: string;
  weight?: number; 
  sets?: number;   
  reps?: number;   
  stroke?: '自由式' | '蛙式' | '仰式' | '蝶式'; 
  progress?: string; 
  isStrengthTraining?: boolean; 
  combinations?: string; 
}

export interface WorkoutSession {
  id: string;
  studentId: string;
  date: string;
  exercises: ExerciseRecord[];
  coachNotes: string; 
  // Optional body metrics at time of recording
  recordedStats?: {
    weight?: number;
    bodyFat?: number;
    injuries?: string;
  };
}

export interface User {
  id: string;
  name: string;
  role: Role;
  category: SportCategory;
  stats: StudentStats;
}

export enum ProgressStatus {
  IMPROVING = '進步',
  STABLE = '持平',
  REGRESSING = '退步',
  UNKNOWN = '數據不足'
}
