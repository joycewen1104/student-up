
import React, { useState, useEffect } from 'react';
import { WorkoutSession, ExerciseRecord, Role, SportCategory } from '../types';

interface WorkoutHistoryProps {
  sessions: WorkoutSession[];
  role: Role;
  studentCategory: SportCategory;
  studentId: string;
  onAddSession: (session: WorkoutSession) => void;
  onUpdateSession: (session: WorkoutSession) => void;
  onDeleteSession: (workoutId: string) => void;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ 
  sessions, role, studentCategory, studentId, onAddSession, onUpdateSession, onDeleteSession 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  
  const [coachNotes, setCoachNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<{weight?: number, bodyFat?: number, injuries?: string}>({});
  const [currentExercises, setCurrentExercises] = useState<ExerciseRecord[]>([]);

  // Temp exercise states for weightlifting
  const [weightliftingEx, setWeightliftingEx] = useState<Partial<ExerciseRecord>>({});
  
  // Swimming & Boxing specific state
  const [swimmingEx, setSwimmingEx] = useState<Partial<ExerciseRecord>>({ stroke: '自由式', progress: '' });
  const [boxingEx, setBoxingEx] = useState<Partial<ExerciseRecord>>({ isStrengthTraining: false, combinations: '' });

  const categoryLabels: Record<SportCategory, string> = {
    workout: 'WORKOUT',
    swimming: 'SWIMMING',
    boxing: 'BOXING',
    other: 'OTHER'
  };

  // When editingSessionId changes, populate the form
  useEffect(() => {
    if (editingSessionId) {
      const session = sessions.find(s => s.id === editingSessionId);
      if (session) {
        setCoachNotes(session.coachNotes);
        setStatusUpdate(session.recordedStats || {});
        setCurrentExercises(session.exercises);
        
        // Special mapping for swimming/boxing as they use a "virtual" single exercise entry
        if (studentCategory === 'swimming' && session.exercises[0]) {
          setSwimmingEx({ stroke: session.exercises[0].stroke, progress: session.exercises[0].progress });
        } else if (studentCategory === 'boxing' && session.exercises[0]) {
          setBoxingEx({ isStrengthTraining: session.exercises[0].isStrengthTraining, combinations: session.exercises[0].combinations });
        }
        
        setShowForm(true);
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
    }
  }, [editingSessionId, sessions, studentCategory]);

  const resetForm = () => {
    setEditingSessionId(null);
    setCurrentExercises([]);
    setCoachNotes('');
    setStatusUpdate({});
    setSwimmingEx({ stroke: '自由式', progress: '' });
    setBoxingEx({ isStrengthTraining: false, combinations: '' });
    setShowForm(false);
  };

  const addWeightliftingExercise = () => {
    if (weightliftingEx.name && weightliftingEx.weight) {
      setCurrentExercises([...currentExercises, {
        id: Math.random().toString(36).substr(2, 9),
        name: weightliftingEx.name,
        weight: Number(weightliftingEx.weight),
        sets: Number(weightliftingEx.sets || 0),
        reps: Number(weightliftingEx.reps || 0)
      }]);
      setWeightliftingEx({});
    }
  };

  const submitSession = () => {
    let finalExercises: ExerciseRecord[] = [];

    if (studentCategory === 'workout') {
      if (currentExercises.length === 0 && !statusUpdate.weight) return;
      finalExercises = currentExercises;
    } else if (studentCategory === 'swimming') {
      if (!swimmingEx.progress && !statusUpdate.weight) return;
      finalExercises = [{
        id: Math.random().toString(36).substr(2, 9),
        name: '游泳紀錄',
        stroke: swimmingEx.stroke as any,
        progress: swimmingEx.progress
      }];
    } else if (studentCategory === 'boxing') {
      if (!boxingEx.combinations && !boxingEx.isStrengthTraining && !statusUpdate.weight) return;
      finalExercises = [{
        id: Math.random().toString(36).substr(2, 9),
        name: '拳擊紀錄',
        isStrengthTraining: boxingEx.isStrengthTraining,
        combinations: boxingEx.combinations
      }];
    }

    const sessionData: WorkoutSession = {
      id: editingSessionId || Math.random().toString(36).substr(2, 9),
      studentId: studentId,
      date: editingSessionId ? sessions.find(s => s.id === editingSessionId)!.date : new Date().toISOString().split('T')[0],
      exercises: finalExercises,
      coachNotes: coachNotes,
      recordedStats: (statusUpdate.weight || statusUpdate.bodyFat || statusUpdate.injuries) ? statusUpdate : undefined
    };

    if (editingSessionId) {
      onUpdateSession(sessionData);
    } else {
      onAddSession(sessionData);
    }

    resetForm();
  };

  const handleEditClick = (session: WorkoutSession) => {
    setEditingSessionId(session.id);
  };

  const renderForm = () => {
    switch (studentCategory) {
      case 'workout':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <input 
                placeholder="動作項目 (如：深蹲)" 
                className="border-2 border-sky-50 p-4 rounded-2xl col-span-2 text-sm font-bold focus:border-sky-400 focus:bg-sky-50/20 outline-none transition-all shadow-sm"
                value={weightliftingEx.name || ''}
                onChange={e => setWeightliftingEx({...weightliftingEx, name: e.target.value})}
              />
              <input 
                placeholder="重量 (kg)" 
                type="number"
                className="border-2 border-sky-50 p-4 rounded-2xl text-sm font-bold focus:border-sky-400 focus:bg-sky-50/20 outline-none transition-all shadow-sm"
                value={weightliftingEx.weight || ''}
                onChange={e => setWeightliftingEx({...weightliftingEx, weight: Number(e.target.value)})}
              />
              <button 
                onClick={addWeightliftingExercise}
                className="bg-sky-400 text-white rounded-2xl font-black text-sm hover:bg-sky-500 transition-all shadow-xl shadow-sky-100 active:scale-95"
              >
                加入動作
              </button>
              <input 
                placeholder="次數" 
                type="number"
                className="border-2 border-sky-50 p-4 rounded-2xl text-sm font-bold focus:border-sky-400 focus:bg-sky-50/20 outline-none transition-all shadow-sm"
                value={weightliftingEx.reps || ''}
                onChange={e => setWeightliftingEx({...weightliftingEx, reps: Number(e.target.value)})}
              />
              <input 
                placeholder="組數" 
                type="number"
                className="border-2 border-sky-50 p-4 rounded-2xl text-sm font-bold focus:border-sky-400 focus:bg-sky-50/20 outline-none transition-all shadow-sm"
                value={weightliftingEx.sets || ''}
                onChange={e => setWeightliftingEx({...weightliftingEx, sets: Number(e.target.value)})}
              />
            </div>
            {currentExercises.length > 0 && (
              <div className="bg-sky-50/50 p-6 rounded-[32px] border-2 border-sky-50">
                <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-3 ml-2">訓練項目清單</h4>
                <div className="space-y-3">
                  {currentExercises.map((ex, i) => (
                    <div key={i} className="text-xs font-bold text-sky-900 bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-sky-50">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-lg bg-sky-400 text-white flex items-center justify-center text-[10px]">{i+1}</span>
                        <span>{ex.name}: <span className="text-sky-500">{ex.weight}kg</span> x {ex.reps}次 x {ex.sets}組</span>
                      </div>
                      <button onClick={() => setCurrentExercises(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'swimming':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-3 ml-1">選擇主要訓練泳姿</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['自由式', '蛙式', '仰式', '蝶式'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSwimmingEx({...swimmingEx, stroke: s as any})}
                    className={`p-4 rounded-2xl font-black text-sm border-2 transition-all ${
                      swimmingEx.stroke === s 
                      ? 'border-sky-400 bg-sky-400 text-white shadow-lg shadow-sky-100' 
                      : 'border-sky-50 bg-white text-sky-300 hover:border-sky-200 shadow-sm'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-2 ml-1">訓練進度紀錄</label>
              <textarea 
                className="w-full border-2 border-sky-50 p-5 rounded-[32px] text-sm font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/20 outline-none transition-all min-h-[140px] shadow-sm"
                placeholder="例如：主項 1500m 穩定配速完成..."
                value={swimmingEx.progress || ''}
                onChange={e => setSwimmingEx({...swimmingEx, progress: e.target.value})}
              />
            </div>
          </div>
        );
      case 'boxing':
        return (
          <div className="space-y-6">
            <div 
              onClick={() => setBoxingEx({...boxingEx, isStrengthTraining: !boxingEx.isStrengthTraining})}
              className={`flex items-center justify-between p-6 rounded-[32px] border-2 cursor-pointer transition-all ${
                boxingEx.isStrengthTraining ? 'bg-sky-400 border-sky-400 text-white shadow-xl shadow-sky-100' : 'bg-white border-sky-50 text-sky-300 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span className="font-black text-lg tracking-tight">今日包含肌力訓練計畫</span>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${boxingEx.isStrengthTraining ? 'bg-white text-sky-400 shadow-lg' : 'bg-sky-50'}`}>
                {boxingEx.isStrengthTraining && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="4"/></svg>}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-2 ml-1">組合拳訓練細節</label>
              <textarea 
                className="w-full border-2 border-sky-50 p-5 rounded-[32px] text-sm font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/20 outline-none transition-all min-h-[140px] shadow-sm"
                placeholder="例如：1-2-3-Hook 組合練習..."
                value={boxingEx.combinations || ''}
                onChange={e => setBoxingEx({...boxingEx, combinations: e.target.value})}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-sky-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-sky-400"></div>
        <div>
          <h3 className="text-2xl font-black text-sky-900 tracking-tight">訓練歷程資料庫</h3>
          <p className="text-sky-300 text-xs font-black uppercase tracking-widest">{categoryLabels[studentCategory]} DATABASE</p>
        </div>
        <button 
          onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}
          className={`px-8 py-4 rounded-[24px] text-sm font-black transition-all shadow-xl active:scale-95 flex items-center space-x-2 ${
            showForm ? 'bg-sky-50 text-sky-400 shadow-none' : 'bg-sky-400 text-white shadow-sky-100 hover:bg-sky-500'
          }`}
        >
          <span>{showForm ? '取消並返回' : '新增紀錄'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white border-4 border-sky-100 rounded-[48px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 space-y-8 relative">
          <div className="flex items-center justify-between border-b border-sky-50 pb-6">
            <div className="flex items-center space-x-3 text-sky-400 font-black text-xs uppercase tracking-[0.3em]">
              <span className="bg-sky-400 text-white w-2.5 h-8 rounded-full shadow-md"></span>
              <span>{editingSessionId ? '正在修改訓練紀錄' : '新紀錄錄入中'}</span>
            </div>
          </div>

          <div className="bg-sky-50/50 p-8 rounded-[32px] border-2 border-sky-50 space-y-4">
            <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest ml-1">身體數據更新</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input 
                placeholder="體重 (kg)" type="number"
                className="border-2 border-white p-4 rounded-2xl text-sm font-bold focus:border-sky-400 outline-none transition-all shadow-sm"
                value={statusUpdate.weight || ''}
                onChange={e => setStatusUpdate({...statusUpdate, weight: Number(e.target.value)})}
              />
              <input 
                placeholder="體脂 (%)" type="number"
                className="border-2 border-white p-4 rounded-2xl text-sm font-bold focus:border-sky-400 outline-none transition-all shadow-sm"
                value={statusUpdate.bodyFat || ''}
                onChange={e => setStatusUpdate({...statusUpdate, bodyFat: Number(e.target.value)})}
              />
              <input 
                placeholder="目前傷勢" 
                className="border-2 border-white p-4 rounded-2xl text-sm font-bold focus:border-sky-400 outline-none transition-all shadow-sm"
                value={statusUpdate.injuries || ''}
                onChange={e => setStatusUpdate({...statusUpdate, injuries: e.target.value})}
              />
            </div>
          </div>
          
          {renderForm()}

          <div className="pt-6 border-t border-sky-50">
            <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-3 ml-1">教練點評</label>
            <textarea 
              rows={3}
              placeholder="專業修正規劃..."
              className="w-full border-2 border-sky-50 rounded-[32px] p-6 text-sm font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/20 outline-none transition-all shadow-sm"
              value={coachNotes}
              onChange={e => setCoachNotes(e.target.value)}
            />
          </div>

          <button 
            onClick={submitSession}
            className="w-full bg-sky-400 text-white py-6 rounded-[32px] font-black text-xl hover:bg-sky-500 transition-all shadow-2xl shadow-sky-200 active:scale-95"
          >
            {editingSessionId ? '確認更新訓練紀錄' : '儲存訓練紀錄'}
          </button>
        </div>
      )}

      <div className="space-y-8">
        {[...sessions].sort((a,b) => b.date.localeCompare(a.date)).map((session) => (
          <div key={session.id} className="bg-white border border-sky-100 rounded-[48px] p-10 shadow-sm hover:shadow-xl hover:shadow-sky-50 transition-all duration-500 border-l-8 border-l-sky-400 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-sky-50">
              <div>
                <div className="text-3xl font-black text-sky-900 tracking-tighter mb-1">{session.date}</div>
                <div className="text-[10px] text-sky-200 font-black tracking-[0.2em] uppercase">RECORD: {session.id.slice(-6)}</div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditClick(session)}
                  className="p-3 bg-sky-50 text-sky-400 rounded-2xl hover:bg-sky-400 hover:text-white transition-all shadow-sm"
                  title="修改紀錄"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDeleteSession(session.id)}
                  className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-400 hover:text-white transition-all shadow-sm"
                  title="刪除紀錄"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {session.recordedStats && (
                <div className="p-4 bg-sky-50/30 rounded-2xl border border-sky-100 flex flex-wrap gap-4">
                  {session.recordedStats.weight && <div className="text-xs font-bold text-sky-800"><span className="text-sky-300">體重:</span> {session.recordedStats.weight}kg</div>}
                  {session.recordedStats.bodyFat && <div className="text-xs font-bold text-sky-800"><span className="text-sky-300">體脂:</span> {session.recordedStats.bodyFat}%</div>}
                  {session.recordedStats.injuries && <div className="text-xs font-bold text-red-400"><span className="text-red-200">狀態:</span> {session.recordedStats.injuries}</div>}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {session.exercises.map((ex) => (
                  <div key={ex.id}>
                    {studentCategory === 'workout' ? (
                      <div className="flex items-center justify-between bg-sky-50/50 p-6 rounded-[32px] border border-sky-100">
                        <span className="text-xl font-black text-sky-900">{ex.name}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sky-500 font-black text-xl">{ex.weight}kg</span>
                          <span className="text-sky-900 font-bold">{ex.reps}x{ex.sets}</span>
                        </div>
                      </div>
                    ) : studentCategory === 'swimming' ? (
                      <div className="bg-blue-50/50 p-8 rounded-[40px] border-2 border-blue-100">
                        <span className="bg-blue-400 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase mb-3 inline-block">{ex.stroke}</span>
                        <p className="text-blue-900 font-bold italic">"{ex.progress}"</p>
                      </div>
                    ) : (
                      <div className="bg-sky-50/50 p-8 rounded-[40px] border-2 border-sky-100">
                        {ex.isStrengthTraining && <span className="bg-sky-400 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase mb-3 inline-block">肌力專項</span>}
                        <p className="text-sky-900 font-bold italic">"{ex.combinations}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {session.coachNotes && (
              <div className="mt-8 p-6 bg-sky-400/5 border-l-4 border-sky-400 rounded-r-3xl">
                <p className="text-sky-900 font-bold text-base">{session.coachNotes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutHistory;
