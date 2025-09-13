'use client';

import { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { Button } from './button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      {icon && (
        <div className="mx-auto w-12 h-12 text-slate-400 mb-4 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

interface EmptyStateCardProps extends EmptyStateProps {
  className?: string;
}

export function EmptyStateCard(props: EmptyStateCardProps) {
  return (
    <div className="p-6">
      <EmptyState {...props} />
    </div>
  );
}
