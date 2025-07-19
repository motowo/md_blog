import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'plain';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = cn(
    'inline-flex items-center justify-center gap-2',
    'font-semibold transition-all duration-200',
    'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
  );

  const variantClasses = {
    primary: cn(
      'bg-zinc-900 text-white shadow-sm',
      'hover:bg-zinc-800',
      'focus-visible:outline-zinc-900'
    ),
    secondary: cn(
      'bg-zinc-100 text-zinc-900 shadow-sm',
      'hover:bg-zinc-200',
      'focus-visible:outline-zinc-500',
      'dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
    ),
    outline: cn(
      'border border-zinc-300 bg-white text-zinc-900 shadow-sm',
      'hover:bg-zinc-50',
      'focus-visible:outline-zinc-500',
      'dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900'
    ),
    ghost: cn(
      'text-zinc-900',
      'hover:bg-zinc-100',
      'focus-visible:outline-zinc-500',
      'dark:text-zinc-100 dark:hover:bg-zinc-800'
    ),
    plain: cn(
      'text-zinc-600',
      'hover:text-zinc-900',
      'focus-visible:outline-zinc-500',
      'dark:text-zinc-400 dark:hover:text-zinc-100'
    ),
  };

  const sizeClasses = {
    xs: 'rounded-md px-2 py-1 text-xs',
    sm: 'rounded-md px-3 py-1.5 text-sm',
    md: 'rounded-md px-3.5 py-2 text-sm',
    lg: 'rounded-md px-4 py-2.5 text-base',
  };

  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  const LoadingSpinner = () => (
    <svg
      className={cn('animate-spin', iconSizeClasses[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderIcon = (icon: React.ReactNode) => {
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<unknown>, {
        className: cn(
          iconSizeClasses[size],
          (icon as React.ReactElement<{ className?: string }>).props?.className
        ),
      });
    }
    return icon;
  };

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? <LoadingSpinner /> : leftIcon && renderIcon(leftIcon)}
      {children}
      {!loading && rightIcon && renderIcon(rightIcon)}
    </button>
  );
}
