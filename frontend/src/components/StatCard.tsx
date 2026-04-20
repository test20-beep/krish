import React from 'react';
import { LucideIcon } from 'lucide-react';

const colors: Record<string, { bg: string; icon: string }> = {
  purple: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-600 dark:text-indigo-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'text-amber-600 dark:text-amber-400' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'text-rose-600 dark:text-rose-400' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', icon: 'text-sky-600 dark:text-sky-400' },
  red: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400' },
};

export default function StatCard({ label, value, icon: Icon, trend, trendUp, color = 'purple', subtitle }: {
  label: string; value: string | number; icon: LucideIcon; trend?: string; trendUp?: boolean; color?: string; subtitle?: string;
}) {
  const c = colors[color] || colors.purple;
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</p>
          <p className="text-[26px] font-bold mt-1 font-heading leading-tight">{value}</p>
          {subtitle && <p className="text-[10px] text-muted mt-0.5">{subtitle}</p>}
          {trend && <p className={`text-xs mt-1.5 font-semibold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>{trendUp ? '↑' : '↓'} {trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg} group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
