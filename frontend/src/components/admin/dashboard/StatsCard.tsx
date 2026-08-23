import type { ElementType } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-light-green text-deep-green flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      
      <div className="flex-1">
        <h3 className="text-sm font-bold text-charcoal/60 uppercase tracking-wider mb-1">
          {title}
        </h3>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-charcoal leading-none">
            {value}
          </span>
          {trend && (
            <span 
              className={`text-xs font-bold mb-1 ${
                trendUp ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
