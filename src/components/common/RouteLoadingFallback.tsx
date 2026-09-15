import React from 'react';
import { Loader2 } from 'lucide-react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[320px] w-full py-16 text-slate-400 animate-pulse"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-3 shadow-xs">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
      <p className="text-xs font-semibold text-slate-500">Loading module...</p>
      <span className="sr-only">Loading view content</span>
    </div>
  );
};
