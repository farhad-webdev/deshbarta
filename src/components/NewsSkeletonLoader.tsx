import React from 'react';
import { RefreshCw } from 'lucide-react';

export const NewsSkeletonLoader: React.FC = () => {
  return (
    <div className="w-full space-y-8 animate-pulse py-2">
      {/* Skeleton Header Badge */}
      <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-red-600 animate-spin" />
          <div>
            <div className="h-4 w-48 bg-slate-300 rounded font-bold mb-1" />
            <div className="h-3 w-64 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-6 w-24 bg-red-200 rounded-full hidden sm:block" />
      </div>

      {/* Top Layout Skeleton: Lead Story + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lead Hero Card Skeleton */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="w-full h-64 sm:h-96 bg-slate-200 rounded-xl" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 bg-red-200 rounded-full" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </div>
          <div className="h-7 w-5/6 bg-slate-300 rounded" />
          <div className="h-7 w-3/4 bg-slate-300 rounded" />
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-11/12 bg-slate-200 rounded" />
            <div className="h-4 w-4/5 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Right: Trending List Skeleton */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5">
          <div className="h-6 w-36 bg-slate-300 rounded border-b pb-2" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-center border-b border-slate-100 pb-3 last:border-0">
              <div className="w-20 h-16 bg-slate-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-full bg-slate-300 rounded" />
                <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="w-full h-44 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-16 bg-red-100 rounded" />
            <div className="h-5 w-full bg-slate-300 rounded" />
            <div className="h-5 w-4/5 bg-slate-300 rounded" />
            <div className="h-3 w-full bg-slate-200 rounded pt-1" />
            <div className="h-3 w-2/3 bg-slate-200 rounded" />
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-12 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
