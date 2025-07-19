import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  animated?: boolean;
  striped?: boolean;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = false,
  labelPosition = 'outside',
  animated = false,
  striped = false,
  className = '',
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-gray-600 dark:bg-gray-400',
    primary: 'bg-primary-600 dark:bg-primary-500',
    success: 'bg-green-600 dark:bg-green-500',
    warning: 'bg-yellow-600 dark:bg-yellow-500',
    danger: 'bg-red-600 dark:bg-red-500',
  };

  const stripedBackground = striped ? 'bg-stripes bg-stripes-white/10' : '';

  const animatedClasses = animated ? 'animate-progress-slide' : '';

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && labelPosition === 'outside' && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out relative',
            variantClasses[variant],
            stripedBackground,
            animatedClasses
          )}
          style={{ width: `${percentage}%` }}
        >
          {showLabel && labelPosition === 'inside' && percentage > 10 && (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  showLabel = true,
  className = '',
  ...props
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantClasses = {
    default: 'text-gray-600 dark:text-gray-400',
    primary: 'text-primary-600 dark:text-primary-500',
    success: 'text-green-600 dark:text-green-500',
    warning: 'text-yellow-600 dark:text-yellow-500',
    danger: 'text-red-600 dark:text-red-500',
  };

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-300 ease-out', variantClasses[variant])}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  current: number;
  steps: Array<{
    title: string;
    description?: string;
  }>;
  variant?: 'default' | 'numbered';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}

export function Steps({
  current,
  steps,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  className = '',
  ...props
}: StepsProps) {
  const sizeClasses = {
    sm: {
      dot: 'h-2 w-2',
      number: 'h-6 w-6 text-xs',
      text: 'text-sm',
    },
    md: {
      dot: 'h-3 w-3',
      number: 'h-8 w-8 text-sm',
      text: 'text-base',
    },
    lg: {
      dot: 'h-4 w-4',
      number: 'h-10 w-10 text-base',
      text: 'text-lg',
    },
  };

  const containerClasses = cn(
    'flex',
    orientation === 'horizontal' ? 'items-center' : 'flex-col',
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {steps.map((step, index) => {
        const isCompleted = index < current;
        const isCurrent = index === current;
        const isUpcoming = index > current;

        return (
          <React.Fragment key={index}>
            <div className={cn('flex items-center', orientation === 'vertical' && 'w-full')}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full transition-all duration-200',
                    variant === 'numbered' ? sizeClasses[size].number : sizeClasses[size].dot,
                    isCompleted && 'bg-primary-600 text-white',
                    isCurrent &&
                      'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900',
                    isUpcoming && 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  )}
                >
                  {variant === 'numbered' && (
                    <span className="font-medium">{isCompleted ? '✓' : index + 1}</span>
                  )}
                </div>
                {orientation === 'horizontal' && (
                  <div className="mt-2 text-center">
                    <div
                      className={cn(
                        'font-medium',
                        sizeClasses[size].text,
                        isCompleted || isCurrent
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {step.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {orientation === 'vertical' && (
                <div className="ml-4 flex-1">
                  <div
                    className={cn(
                      'font-medium',
                      sizeClasses[size].text,
                      isCompleted || isCurrent
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'transition-all duration-200',
                  orientation === 'horizontal' ? 'h-0.5 flex-1 mx-4' : 'w-0.5 h-12 ml-4 my-2',
                  isCompleted ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
