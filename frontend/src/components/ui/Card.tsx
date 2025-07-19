import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  className = '',
  ...props
}: CardProps) {
  const baseClasses = cn('overflow-hidden transition-colors duration-200');

  const variantClasses = {
    default: cn('bg-white border border-zinc-200', 'dark:bg-zinc-900 dark:border-zinc-800'),
    elevated: cn(
      'bg-white shadow-sm border border-zinc-200',
      'dark:bg-zinc-900 dark:border-zinc-800'
    ),
    outline: cn('border-2 border-zinc-300 bg-transparent', 'dark:border-zinc-600'),
    ghost: cn('bg-zinc-50 border border-transparent', 'dark:bg-zinc-800/50'),
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    roundedClasses[rounded],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, border = true, className = '', ...props }: CardHeaderProps) {
  const classes = cn(
    'px-6 py-4',
    border && 'border-b border-zinc-200 dark:border-zinc-800',
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  const classes = cn('px-6 py-4', className);

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, border = true, className = '', ...props }: CardFooterProps) {
  const classes = cn(
    'px-6 py-4',
    border && 'border-t border-zinc-200 dark:border-zinc-800',
    'bg-zinc-50 dark:bg-zinc-800/50',
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
