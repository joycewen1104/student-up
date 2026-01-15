
import React, { useState, useEffect } from 'react';
import { User, StudentStats, Role } from '../types';

interface ProfileEditorProps {
  user: User;
  onSave: (stats: StudentStats) => void;
  viewerRole: Role;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onSave, viewerRole }) => {
  const [formData, setFormData] = useState<StudentStats>(user.stats);

  useEffect(() => {
    setFormData(user.stats);
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, updatedAt: new Date().toISOString() });
    alert("學員狀態更新成功！");
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-sky-100 p-10">
      <h3 className="text-2xl font-black mb-8 text-sky-900 border-b border-sky-50 pb-4 flex items-center">
        <span className="bg-sky-400 w-2 h-8 rounded-full mr-3"></span>
        修改學員身體狀態
      </h3>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-2 ml-1">身高 (cm)</label>
            <input 
              type="number" 
              className="w-full border-2 border-sky-50 rounded-2xl p-4 font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/30 outline-none transition-all"
              value={formData.height}
              onChange={e => setFormData({...formData, height: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-2 ml-1">體重 (kg)</label>
            <input 
              type="number" 
              className="w-full border-2 border-sky-50 rounded-2xl p-4 font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/30 outline-none transition-all"
              value={formData.weight}
              onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-2 ml-1">體脂率 (%)</label>
            <input 
              type="number" 
              className="w-full border-2 border-sky-50 rounded-2xl p-4 font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/30 outline-none transition-all"
              value={formData.bodyFat}
              onChange={e => setFormData({...formData, bodyFat: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-2 ml-1">傷病/受損情況</label>
            <input 
              type="text" 
              className="w-full border-2 border-sky-50 rounded-2xl p-4 font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/30 outline-none transition-all"
              placeholder="例如：右肩拉傷、無"
              value={formData.injuries}
              onChange={e => setFormData({...formData, injuries: e.target.value})}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black text-sky-300 uppercase tracking-widest mb-2 ml-1">學員本期訓練目標</label>
            <textarea 
              rows={4}
              className="w-full border-2 border-sky-50 rounded-2xl p-4 font-bold text-sky-900 focus:border-sky-400 focus:bg-sky-50/30 outline-none transition-all"
              placeholder="請描述本月或本季欲達成的目標..."
              value={formData.goals}
              onChange={e => setFormData({...formData, goals: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="bg-sky-400 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-sky-500 transition-all shadow-xl shadow-sky-100 active:scale-95"
          >
            更新檔案資料
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor;
