import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    animation === 'pulse' && 'animate-pulse',
    animation === 'wave' &&
      'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700'
  );

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '40px', height: '40px' },
    rectangular: { width: '100%', height: '120px' },
    rounded: { width: '100%', height: '120px' },
  };

  const classes = cn(baseClasses, variantClasses[variant], className);

  const styles = {
    width: width || defaultSizes[variant].width,
    height: height || defaultSizes[variant].height,
    ...style,
  };

  return <div className={classes} style={styles} {...props} />;
}

interface SkeletonTextProps {
  lines?: number;
  spacing?: 'sm' | 'md' | 'lg';
  animation?: SkeletonProps['animation'];
  className?: string;
}

export function SkeletonText({
  lines = 3,
  spacing = 'md',
  animation = 'pulse',
  className = '',
}: SkeletonTextProps) {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '60%' : '100%'}
          animation={animation}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  showMedia?: boolean;
  showActions?: boolean;
  animation?: SkeletonProps['animation'];
  className?: string;
}

export function SkeletonCard({
  showMedia = true,
  showActions = true,
  animation = 'pulse',
  className = '',
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg overflow-hidden',
        className
      )}
    >
      {showMedia && (
        <Skeleton
          variant="rectangular"
          height={200}
          animation={animation}
          className="rounded-none"
        />
      )}
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} animation={animation} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="50%" animation={animation} />
            <Skeleton variant="text" width="30%" animation={animation} />
          </div>
        </div>
        <SkeletonText lines={3} animation={animation} />
        {showActions && (
          <div className="flex space-x-2 pt-2">
            <Skeleton variant="rounded" width={80} height={32} animation={animation} />
            <Skeleton variant="rounded" width={80} height={32} animation={animation} />
          </div>
        )}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  animation?: SkeletonProps['animation'];
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  animation = 'pulse',
  className = '',
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg overflow-hidden',
        className
      )}
    >
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-4">
                  <Skeleton variant="text" width="80%" animation={animation} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton
                    variant="text"
                    width={colIndex === 0 ? '60%' : '80%'}
                    animation={animation}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
