import React from 'react';

/**
 * CardSkeleton - Animated pulse skeleton loader for dashboard stat cards & widgets
 * @param {Object} props
 * @param {number} [props.count=4] - Number of skeleton cards to display
 */
const CardSkeleton = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs animate-pulse space-y-3"
        >
          <div className="h-3 w-1/2 bg-slate-200 rounded-md" />
          <div className="h-8 w-3/4 bg-slate-200 rounded-xl" />
          <div className="h-3 w-1/3 bg-slate-100 rounded-md" />
        </div>
      ))}
    </>
  );
};

export default CardSkeleton;
