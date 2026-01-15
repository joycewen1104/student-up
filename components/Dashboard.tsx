
import React, { useState } from 'react';
import { User, WorkoutSession, Role, StudentStats, SportCategory } from '../types';
import WorkoutHistory from './WorkoutHistory';
import ProfileEditor from './ProfileEditor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  currentUser: User;
  students: User[];
  workouts: WorkoutSession[];
  onUpdateStats: (studentId: string, stats: StudentStats) => void;
  onAddWorkout: (workout: WorkoutSession) => void;
  onUpdateWorkout: (workout: WorkoutSession) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onAddStudent: (student: User) => void;
  onDeleteStudent: (studentId: string) => boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, students, workouts, onUpdateStats, onAddWorkout, 
  onUpdateWorkout, onDeleteWorkout, onAddStudent, onDeleteStudent 
}) => {
  const [activeCategory, setActiveCategory] = useState<SportCategory | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<User>>({});

  const filteredStudents = activeCategory ? students.filter(s => s.category === activeCategory) : [];
  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentWorkouts = workouts.filter(w => w.studentId === selectedStudentId);

  const categoryLabels: Record<SportCategory, string> = {
    workout: 'WORKOUT',
    swimming: 'SWIMMING',
    boxing: 'BOXING',
    other: 'OTHER'
  };

  const handleCategoryClick = (category: SportCategory) => {
    setActiveCategory(category);
    setSelectedStudentId(null);
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.name && activeCategory) {
      const studentToAdd: User = {
        id: 's_' + Math.random().toString(36).substr(2, 9),
        name: newStudent.name!,
        role: Role.STUDENT,
        category: activeCategory,
        stats: {
          height: 0, weight: 0, bodyFat: 0, injuries: '無', goals: '', updatedAt: new Date().toISOString()
        }
      };
      onAddStudent(studentToAdd);
      setShowAddStudentModal(false);
      setNewStudent({});
      setSelectedStudentId(studentToAdd.id);
    }
  };

  const updateStudentStatsFromSession = (session: WorkoutSession) => {
    if (selectedStudent && session.recordedStats) {
      const updatedStats = {
        ...selectedStudent.stats,
        weight: session.recordedStats.weight ?? selectedStudent.stats.weight,
        bodyFat: session.recordedStats.bodyFat ?? selectedStudent.stats.bodyFat,
        injuries: session.recordedStats.injuries ?? selectedStudent.stats.injuries,
        updatedAt: new Date().toISOString()
      };
      onUpdateStats(selectedStudent.id, updatedStats);
    }
  };

  const handleAddSessionWithStats = (session: WorkoutSession) => {
    onAddWorkout(session);
    updateStudentStatsFromSession(session);
  };

  const handleUpdateSessionWithStats = (session: WorkoutSession) => {
    onUpdateWorkout(session);
    updateStudentStatsFromSession(session);
  };

  const chartData = selectedStudent ? [
    { name: '前期', weight: selectedStudent.stats.weight + 1, fat: selectedStudent.stats.bodyFat + 0.5 },
    { name: '目前', weight: selectedStudent.stats.weight, fat: selectedStudent.stats.bodyFat },
  ] : [];

  // 分類選單
  if (!activeCategory) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <section className="bg-white p-10 rounded-[40px] shadow-sm border border-sky-100">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-sky-900 mb-2 tracking-tight">運動項目</h2>
            <p className="text-sky-300 font-bold uppercase tracking-[0.3em] text-xs">請選擇專項訓練分類</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(['workout', 'swimming', 'boxing'] as SportCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="group relative h-64 rounded-[40px] border-4 border-sky-50 bg-white overflow-hidden transition-all duration-500 hover:border-sky-400 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-sky-400 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <div className="relative z-10 p-8 flex flex-col items-center justify-center h-full">
                    <span className="text-4xl font-black text-sky-900 tracking-tighter transition-colors group-hover:text-sky-400 block mb-2 uppercase">
                      {categoryLabels[cat]}
                    </span>
                    <div className="inline-block px-5 py-2 bg-sky-50 rounded-full text-[12px] font-black text-sky-300 uppercase tracking-widest group-hover:bg-sky-400 group-hover:text-white transition-all">
                      {students.filter(s => s.category === cat).length} 名學員
                    </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // 學員列表
  if (activeCategory && !selectedStudentId) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveCategory(null)} className="p-4 bg-white rounded-3xl border border-sky-100 text-sky-400 hover:bg-sky-50 shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-3xl font-black text-sky-900 tracking-tight">{categoryLabels[activeCategory]} 學員列表</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button onClick={() => setShowAddStudentModal(true)} className="h-56 rounded-[32px] border-4 border-dashed border-sky-100 flex flex-col items-center justify-center space-y-3 group hover:border-sky-400 hover:bg-sky-50 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-300 group-hover:bg-sky-400 group-hover:text-white flex items-center justify-center transition-all shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
            </div>
            <span className="font-black text-sky-300 group-hover:text-sky-500 uppercase tracking-widest text-sm">新增學員</span>
          </button>

          {filteredStudents.map(student => (
            <div key={student.id} className="relative h-56">
               <div 
                onClick={() => setSelectedStudentId(student.id)}
                className="absolute inset-0 bg-white p-8 rounded-[32px] border border-sky-100 shadow-sm hover:shadow-xl hover:border-sky-400 transition-all duration-300 flex flex-col justify-end cursor-pointer group"
              >
                <h3 className="text-2xl font-black text-sky-900 group-hover:text-sky-400 transition-colors mb-4">{student.name}</h3>
                <div className="flex space-x-6">
                  <div>
                    <div className="text-[10px] font-black text-sky-200 uppercase">體重</div>
                    <div className="font-black text-sky-700">{student.stats.weight}kg</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-sky-200 uppercase">體脂</div>
                    <div className="font-black text-sky-700">{student.stats.bodyFat}%</div>
                  </div>
                </div>
              </div>
              {/* 刪除按鈕獨立於點擊區域之外 */}
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteStudent(student.id); }}
                className="absolute top-6 right-6 p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm z-30"
                title="刪除學員"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {showAddStudentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-md">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-200">
              <h3 className="text-3xl font-black text-sky-900 mb-8">新增學員姓名</h3>
              <form onSubmit={handleAddStudentSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-sky-300 uppercase mb-2 ml-1">學員姓名</label>
                  <input required placeholder="輸入姓名" className="w-full border-2 border-sky-50 rounded-2xl p-4 font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/30 outline-none transition-all" value={newStudent.name || ''} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
                </div>
                <div className="flex space-x-4 pt-6">
                  <button type="button" onClick={() => setShowAddStudentModal(false)} className="flex-1 bg-sky-50 text-sky-400 py-4 rounded-2xl font-black">取消</button>
                  <button type="submit" className="flex-1 bg-sky-400 text-white py-4 rounded-2xl font-black shadow-xl">確認新增</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 學員詳細內容頁面
  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => setSelectedStudentId(null)} className="p-4 bg-white rounded-3xl border border-sky-100 text-sky-400 hover:bg-sky-50 shadow-sm active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <span className="text-xs font-black text-sky-300 uppercase tracking-[0.2em] mb-1 block">學員資料庫</span>
            <div className="flex items-center space-x-4">
              <h2 className="text-4xl font-black text-sky-900 tracking-tighter">{selectedStudent?.name}</h2>
              <button 
                onClick={() => {
                  const success = onDeleteStudent(selectedStudentId!);
                  if (success) setSelectedStudentId(null);
                }}
                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-md"
                title="刪除學員"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl bg-sky-400 p-6 rounded-[32px] shadow-lg text-white flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-black uppercase opacity-80 mb-1">本期目標</h3>
            <p className="font-bold text-sm leading-tight truncate">{selectedStudent?.stats.goals || "未設定目標..."}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-sky-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: '身高', val: selectedStudent?.stats.height, unit: 'cm' },
            { label: '體重', val: selectedStudent?.stats.weight, unit: 'kg' },
            { label: '體脂', val: selectedStudent?.stats.bodyFat, unit: '%' },
            { label: '狀態/傷病', val: selectedStudent?.stats.injuries, unit: '', color: 'red' }
          ].map((stat, i) => (
            <div key={i} className={`p-6 ${stat.color === 'red' ? 'bg-red-50' : 'bg-sky-50/20'} border-2 border-transparent rounded-3xl`}>
              <div className="text-[10px] font-black text-sky-300 uppercase mb-2">{stat.label}</div>
              <div className={`text-2xl font-black ${stat.color === 'red' ? 'text-red-900' : 'text-sky-900'}`}>
                {stat.val}<span className="text-sm font-bold opacity-40 ml-1">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WorkoutHistory 
        sessions={studentWorkouts} 
        role={Role.COACH}
        studentCategory={activeCategory!}
        studentId={selectedStudentId!}
        onAddSession={handleAddSessionWithStats} 
        onUpdateSession={handleUpdateSessionWithStats}
        onDeleteSession={onDeleteWorkout}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-sky-100">
          <h3 className="text-xl font-black text-sky-900 mb-8 flex items-center">
              <span className="w-2 h-6 bg-sky-400 rounded-full mr-2"></span>
              體態趨勢紀錄
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f9ff" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#bae6fd'}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#38bdf8'}} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}} />
                <Line yAxisId="left" type="monotone" dataKey="weight" name="體重(kg)" stroke="#38bdf8" strokeWidth={5} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <ProfileEditor 
          user={selectedStudent!} 
          onSave={(stats) => onUpdateStats(selectedStudentId!, stats)}
          viewerRole={Role.COACH}
        />
      </div>
    </div>
  );
};

export default Dashboard;
