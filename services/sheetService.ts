
import { User, WorkoutSession } from '../types';
import { INITIAL_STUDENTS, INITIAL_WORKOUTS } from '../constants';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLL1gfuRvpLQVx0D8Yhhvh9mrYDR6hYr1jzC-013_hKLZqLSUt23UF8rCiBeEew9nTzA/exec';

export const sheetService = {
  // 取得資料：從 Google Sheets 讀取
  async loadData(): Promise<{ students: User[], workouts: WorkoutSession[] }> {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();

      // 如果試算表是空的，回傳初始資料以避免空白畫面
      const hasData = Array.isArray(data.students) && data.students.length > 0;

      return {
        students: hasData ? data.students : INITIAL_STUDENTS,
        workouts: Array.isArray(data.workouts) && data.workouts.length > 0 ? data.workouts : INITIAL_WORKOUTS
      };
    } catch (error) {
      console.error('Google Sheets 讀取失敗，使用備用資料:', error);
      // 失敗時回傳初始資料，確保畫面有內容
      return { students: INITIAL_STUDENTS, workouts: INITIAL_WORKOUTS };
    }
  },

  // 儲存資料到 Google Sheets
  async syncData(students: User[], workouts: WorkoutSession[]): Promise<void> {
    try {
      // 使用 text/plain 避免觸發 CORS Preflight (Google Apps Script 不支援 OPTIONS)
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ students, workouts })
      });
      console.log('Google Sheets 同步成功');
    } catch (error) {
      console.error('Google Sheets 同步失敗:', error);
    }
  },

  getAppUrl(): string {
    return GOOGLE_SCRIPT_URL;
  }
};
