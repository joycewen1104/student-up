
import { User, Role, WorkoutSession } from './types';

export const INITIAL_STUDENTS: User[] = [
  {
    id: 's1',
    name: '陳小明',
    role: Role.STUDENT,
    category: 'workout',
    stats: {
      height: 175,
      weight: 70,
      bodyFat: 18,
      injuries: '左膝蓋有舊傷',
      goals: '增肌 5kg，深蹲達到 100kg',
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 's2',
    name: '林美玲',
    role: Role.STUDENT,
    category: 'other',
    stats: {
      height: 160,
      weight: 52,
      bodyFat: 22,
      injuries: '無',
      goals: '改善體態與柔軟度，能完成頭倒立',
      updatedAt: new Date().toISOString()
    }
  }
];

export const INITIAL_WORKOUTS: WorkoutSession[] = [
  {
    id: 'w1',
    studentId: 's1',
    date: '2023-10-01',
    exercises: [
      { id: 'e1', name: '槓鈴深蹲', weight: 60, sets: 4, reps: 10 },
      { id: 'e2', name: '臥推', weight: 40, sets: 3, reps: 12 }
    ],
    coachNotes: '動作穩定，可以嘗試增重。'
  },
  {
    id: 'w2',
    studentId: 's1',
    date: '2023-10-08',
    exercises: [
      { id: 'e3', name: '槓鈴深蹲', weight: 65, sets: 4, reps: 8 },
      { id: 'e4', name: '臥推', weight: 42.5, sets: 3, reps: 10 }
    ],
    coachNotes: '增重後動作稍微變形，注意核心出力。'
  }
];
