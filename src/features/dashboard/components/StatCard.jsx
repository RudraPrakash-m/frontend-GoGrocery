import React from 'react';

const StatCard = ({ label, value, textColor = 'text-slate-900' }) => {
  return (
    <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-200/90 shadow-xs space-y-1">
      <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className={`text-2xl md:text-3xl font-extrabold tracking-tight ${textColor}`}>
        {value}
      </p>
    </div>
  );
};

export default StatCard;
