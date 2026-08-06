import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}></div>
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-luxury-navy border border-outline-variant/60 rounded-xl p-5 shadow-sm animate-pulse space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
            </div>
            <div className="space-y-2 pt-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>
        </div>
    );
};

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
    return (
        <div className="space-y-3 w-full animate-pulse">
            {Array.from({ length: rows }).map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-luxury-navy border border-outline-variant/60 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                        </div>
                    </div>
                    <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
            ))}
        </div>
    );
};
