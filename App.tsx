
import React, { useState, useEffect, useCallback } from 'react';
import { User, Role, WorkoutSession, StudentStats } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import { sheetService } from './services/sheetService';

const App: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const data = await sheetService.loadData();
    setStudents(data.students || []);
    setWorkouts(data.workouts || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 監聽狀態變動，確保資料 100% 存入 LocalStorage
  useEffect(() => {
    if (!isLoading) {
      sheetService.syncData(students, workouts);
    }
  }, [students, workouts, isLoading]);

  const currentUser = { 
    id: 'c1', 
    name: '專業教練', 
    role: Role.COACH, 
    category: 'other' as any, 
    stats: {} as StudentStats 
  };

  const handleUpdateStats = (studentId: string, newStats: StudentStats) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, stats: newStats } : s));
  };

  const handleAddWorkout = (newWorkout: WorkoutSession) => {
    setWorkouts(prev => [...prev, newWorkout]);
  };

  const handleUpdateWorkout = (updatedWorkout: WorkoutSession) => {
    setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (window.confirm("確定要刪除這筆訓練紀錄嗎？")) {
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    }
  };

  const handleAddStudent = (newStudent: User) => {
    setStudents(prev => [...prev, newStudent]);
  };

  const handleDeleteStudent = (studentId: string): boolean => {
    const confirmMessage = "🚨 警告：確定要刪除這位學員及其所有訓練紀錄嗎？\n資料將會永久消失。";
    if (window.confirm(confirmMessage)) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setWorkouts(prev => prev.filter(w => w.studentId !== studentId));
      return true;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-sky-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-sky-900 font-black text-2xl tracking-tighter">Student Up</p>
            <p className="text-sky-400 font-bold text-sm animate-pulse">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout userName={currentUser.name} onLogout={() => {}}>
      <div className="relative animate-in slide-in-from-bottom-6 duration-1000">
        <Dashboard 
          currentUser={currentUser as User}
          students={students}
          workouts={workouts}
          onUpdateStats={handleUpdateStats}
          onAddWorkout={handleAddWorkout}
          onUpdateWorkout={handleUpdateWorkout}
          onDeleteWorkout={handleDeleteWorkout}
          onAddStudent={handleAddStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      </div>
    </Layout>
  );
};

export default App;
