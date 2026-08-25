import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple' | 'cyan' | 'teal';
  badgeText?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  colorScheme = 'blue',
  badgeText,
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100 text-blue-600',
      badge: 'bg-blue-100 text-blue-800',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-700',
      iconBg: 'bg-amber-100 text-amber-600',
      badge: 'bg-amber-100 text-amber-800',
    },
    rose: {
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      text: 'text-rose-700',
      iconBg: 'bg-rose-100 text-rose-600',
      badge: 'bg-rose-100 text-rose-800',
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-100 text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-800',
    },
    purple: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100 text-purple-600',
      badge: 'bg-purple-100 text-purple-800',
    },
    cyan: {
      bg: 'bg-cyan-50/70',
      border: 'border-cyan-200',
      text: 'text-cyan-700',
      iconBg: 'bg-cyan-100 text-cyan-600',
      badge: 'bg-cyan-100 text-cyan-800',
    },
    teal: {
      bg: 'bg-teal-50/70',
      border: 'border-teal-200',
      text: 'text-teal-700',
      iconBg: 'bg-teal-100 text-teal-600',
      badge: 'bg-teal-100 text-teal-800',
    },
  }[colorScheme];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 border shadow-sm transition duration-200 hover:shadow-md ${colorClasses.bg} ${colorClasses.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold tracking-wide uppercase text-slate-500 block mb-1">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${colorClasses.text}`}>
              {value}
            </span>
            {badgeText && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${colorClasses.badge}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-600 mt-1 font-medium">{subtitle}</p>}
          {trend && <p className="text-[11px] text-slate-500 mt-1">{trend}</p>}
        </div>

        {icon && (
          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${colorClasses.iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
