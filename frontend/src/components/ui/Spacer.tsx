import React from 'react';
import { cn } from '../../utils/cn';

interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  direction?: 'vertical' | 'horizontal' | 'both';
}

export function Spacer({
  size = 'md',
  direction = 'vertical',
  className = '',
  ...props
}: SpacerProps) {
  const sizeClasses = {
    xs: {
      vertical: 'h-2',
      horizontal: 'w-2',
      both: 'h-2 w-2',
    },
    sm: {
      vertical: 'h-4',
      horizontal: 'w-4',
      both: 'h-4 w-4',
    },
    md: {
      vertical: 'h-6',
      horizontal: 'w-6',
      both: 'h-6 w-6',
    },
    lg: {
      vertical: 'h-8',
      horizontal: 'w-8',
      both: 'h-8 w-8',
    },
    xl: {
      vertical: 'h-12',
      horizontal: 'w-12',
      both: 'h-12 w-12',
    },
    '2xl': {
      vertical: 'h-16',
      horizontal: 'w-16',
      both: 'h-16 w-16',
    },
    '3xl': {
      vertical: 'h-24',
      horizontal: 'w-24',
      both: 'h-24 w-24',
    },
  };

  const classes = cn(sizeClasses[size][direction], 'flex-shrink-0', className);

  return <div className={classes} aria-hidden="true" {...props} />;
}

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  label?: string;
}

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'thin',
  spacing = 'md',
  label,
  className = '',
  ...props
}: DividerProps) {
  const baseClasses = cn('border-gray-200 dark:border-gray-700');

  const orientationClasses = {
    horizontal: 'w-full h-0',
    vertical: 'h-full w-0',
  };

  const variantClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const thicknessClasses = {
    thin: orientation === 'horizontal' ? 'border-t' : 'border-l',
    medium: orientation === 'horizontal' ? 'border-t-2' : 'border-l-2',
    thick: orientation === 'horizontal' ? 'border-t-4' : 'border-l-4',
  };

  const spacingClasses = {
    none: '',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-8' : 'mx-8',
  };

  if (label && orientation === 'horizontal') {
    return (
      <div className={cn('relative', spacingClasses[spacing], className)} {...props}>
        <div className="absolute inset-0 flex items-center">
          <div
            className={cn(
              baseClasses,
              'w-full',
              variantClasses[variant],
              thicknessClasses[thickness]
            )}
          />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-gray-900 px-3 text-sm text-gray-500 dark:text-gray-400">
            {label}
          </span>
        </div>
      </div>
    );
  }

  const classes = cn(
    baseClasses,
    orientationClasses[orientation],
    variantClasses[variant],
    thicknessClasses[thickness],
    spacingClasses[spacing],
    className
  );

  return <hr className={classes} {...props} />;
}
