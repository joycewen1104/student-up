
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  userName: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-sky-50/30">
      <nav className="bg-sky-400 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white p-1.5 rounded-xl shadow-sm">
                <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight drop-shadow-sm">Student Up</span>
            </div>
            
            <div className="flex items-center">
              {/* 右側資訊已依要求移除 */}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-sky-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sky-400/70 text-sm font-medium">
          &copy; 2024 Student Up 教練管理系統 - 專業版
        </div>
      </footer>
    </div>
  );
};

export default Layout;
