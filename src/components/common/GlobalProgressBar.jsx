import React from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

/**
 * GlobalProgressBar - Top-of-screen animated indicator for active API requests.
 * Reacts automatically to TanStack Query fetching & mutating states.
 */
const GlobalProgressBar = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const activeCount = isFetching + isMutating;

  if (activeCount === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none">
      <div className="h-1 w-full bg-emerald-100/60 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse w-full transform origin-left transition-all duration-300" />
      </div>
    </div>
  );
};

export default GlobalProgressBar;
