import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import useNetworkStatus from '../../hooks/useNetworkStatus';

const MainLayout = () => {
  // Monitor real-time online/offline network transitions
  useNetworkStatus();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-10 pb-28 md:pb-10 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
