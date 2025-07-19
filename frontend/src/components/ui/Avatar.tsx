import React from 'react';
import { cn } from '../../utils/cn';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  shape = 'circle',
  status,
  statusPosition = 'bottom-right',
  className = '',
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
  };

  const statusSizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
    '2xl': 'h-5 w-5',
  };

  const statusPositionClasses = {
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-left': 'bottom-0 left-0',
  };

  const statusColorClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  const baseClasses = cn(
    'relative inline-flex items-center justify-center',
    'bg-gray-200 dark:bg-gray-700',
    'overflow-hidden',
    'flex-shrink-0'
  );

  const classes = cn(baseClasses, sizeClasses[size], shapeClasses[shape], className);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      );
    }

    if (fallback) {
      return (
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {getInitials(fallback)}
        </span>
      );
    }

    return (
      <svg
        className="h-full w-full p-1 text-gray-500 dark:text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    );
  };

  return (
    <div className={classes} {...props}>
      {renderContent()}
      {status && (
        <span
          className={cn(
            'absolute border-2 border-white dark:border-gray-900',
            'rounded-full',
            statusSizeClasses[size],
            statusPositionClasses[statusPosition],
            statusColorClasses[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
  spacing?: 'tight' | 'normal' | 'loose';
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  spacing = 'normal',
  className = '',
  ...props
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  const spacingClasses = {
    tight: '-space-x-2',
    normal: '-space-x-3',
    loose: '-space-x-4',
  };

  const classes = cn('flex items-center', spacingClasses[spacing], className);

  return (
    <div className={classes} {...props}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="relative ring-2 ring-white dark:ring-gray-900 rounded-full"
          style={{ zIndex: visibleChildren.length - index }}
        >
          {React.isValidElement(child) &&
            React.cloneElement(child as React.ReactElement<AvatarProps>, {
              size,
            })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className="relative ring-2 ring-white dark:ring-gray-900 rounded-full"
          style={{ zIndex: 0 }}
        >
          <Avatar
            size={size}
            fallback={`+${remainingCount}`}
            className="bg-gray-300 dark:bg-gray-600"
          />
        </div>
      )}
    </div>
  );
}
