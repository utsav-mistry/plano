'use client';

import React from 'react';
import { MoreHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  label: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  iconColorClass: string;
}

export default function KPICard({ label, value, trend, icon, iconColorClass }: KPICardProps) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  return (
    <div className="bg-bg-surface p-5 rounded-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconColorClass)}>
          {icon}
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">{label}</span>
        <h3 className="text-3xl font-serif font-bold text-text-primary tracking-tight">{value}</h3>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <div className={cn(
          "flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full",
          isPositive ? "text-success-700 bg-success-50" : isNegative ? "text-danger-700 bg-danger-50" : "text-gray-500 bg-gray-50"
        )}>
          {isPositive && <TrendingUp size={12} />}
          {isNegative && <TrendingDown size={12} />}
          {!isPositive && !isNegative && <Minus size={12} />}
          {Math.abs(trend)}%
        </div>
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">since last month</span>
      </div>
    </div>
  );
}
