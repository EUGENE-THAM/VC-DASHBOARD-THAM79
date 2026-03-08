'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

import {
    TrendingUp,
    BarChart3,
    Star,
    Target,
    Clock,
    Zap
} from 'lucide-react';

export const KPICard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all group cursor-default">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
            </div>
            <div className={cn("p-2 rounded-xl transition-colors", color)}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-1">
            {trend === 'up' ? (
                <TrendingUp size={16} className="text-emerald-500" />
            ) : (
                <BarChart3 size={16} className="text-red-500" />
            )}
            <span className={cn(
                "text-xs font-semibold",
                trend === 'up' ? "text-emerald-500" : "text-red-500"
            )}>
                {trendValue}
            </span>
            <span className="text-xs text-gray-400">period total</span>
        </div>
    </div>
);

export const InsightCard = ({ label, value, subtext, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-primary/20 transition-all">
        <div className={cn("p-2.5 rounded-lg shrink-0", color)}>
            <Icon size={18} className="text-white" />
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{label}</p>
            <h4 className="text-sm font-bold text-gray-900 mt-0.5">{value}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">{subtext}</p>
        </div>
    </div>
);
