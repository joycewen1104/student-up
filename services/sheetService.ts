
import { User, WorkoutSession } from '../types';
import { INITIAL_STUDENTS, INITIAL_WORKOUTS } from '../constants';

const STORAGE_KEY_STUDENTS = 'student_up_students_v1_final';
const STORAGE_KEY_WORKOUTS = 'student_up_workouts_v1_final';

export const sheetService = {
  // 取得資料：優先從 localStorage 讀取
  async loadData(): Promise<{ students: User[], workouts: WorkoutSession[] }> {
    try {
      const localStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
      const localWorkouts = localStorage.getItem(STORAGE_KEY_WORKOUTS);
      
      // 只有在完全沒有該 Key 時才使用初始資料，空陣列也視為有效資料
      return {
        students: localStudents !== null ? JSON.parse(localStudents) : INITIAL_STUDENTS,
        workouts: localWorkouts !== null ? JSON.parse(localWorkouts) : INITIAL_WORKOUTS
      };
    } catch (error) {
      console.error('讀取本地資料失敗:', error);
      return { students: INITIAL_STUDENTS, workouts: INITIAL_WORKOUTS };
    }
  },

  // 儲存資料到本地
  async syncData(students: User[], workouts: WorkoutSession[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(workouts));
    } catch (error) {
      console.error('儲存本地資料失敗:', error);
    }
  },

  getAppUrl(): string {
    return '';
  }
};
