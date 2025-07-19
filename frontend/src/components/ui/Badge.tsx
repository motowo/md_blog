import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  rounded = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
  ...props
}: BadgeProps) {
  const baseClasses = cn(
    'badge inline-flex items-center font-medium',
    'transition-all duration-200'
  );

  const variantClasses = {
    default: cn('bg-gray-100 text-gray-800', 'dark:bg-gray-700 dark:text-gray-200'),
    primary: cn('bg-primary-100 text-primary-800', 'dark:bg-primary-900/30 dark:text-primary-300'),
    secondary: cn('bg-gray-100 text-gray-800', 'dark:bg-gray-700 dark:text-gray-200'),
    success: cn('bg-green-100 text-green-800', 'dark:bg-green-900/30 dark:text-green-300'),
    warning: cn('bg-yellow-100 text-yellow-800', 'dark:bg-yellow-900/30 dark:text-yellow-300'),
    danger: cn('bg-red-100 text-red-800', 'dark:bg-red-900/30 dark:text-red-300'),
    outline: cn(
      'bg-transparent border border-gray-300 text-gray-700',
      'dark:border-gray-600 dark:text-gray-300'
    ),
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-0.5 text-sm gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-base gap-2',
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const dotSizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    className
  );

  return (
    <span className={classes} {...props}>
      {dot && (
        <span
          className={cn(
            'rounded-full',
            dotSizeClasses[size],
            variant === 'default' && 'bg-gray-500 dark:bg-gray-400',
            variant === 'primary' && 'bg-primary-500',
            variant === 'secondary' && 'bg-gray-500',
            variant === 'success' && 'bg-green-500',
            variant === 'warning' && 'bg-yellow-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'outline' && 'bg-current'
          )}
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'inline-flex items-center justify-center',
            'rounded-full hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors duration-200 -mr-0.5',
            size === 'xs' && 'h-3 w-3 ml-0.5',
            size === 'sm' && 'h-3.5 w-3.5 ml-1',
            size === 'md' && 'h-4 w-4 ml-1',
            size === 'lg' && 'h-5 w-5 ml-1.5'
          )}
          aria-label="Remove"
        >
          <svg
            className={cn(
              size === 'xs' && 'h-2 w-2',
              size === 'sm' && 'h-2.5 w-2.5',
              size === 'md' && 'h-3 w-3',
              size === 'lg' && 'h-3.5 w-3.5'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
