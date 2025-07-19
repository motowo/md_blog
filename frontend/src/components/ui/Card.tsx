import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  rounded = 'lg',
}: CardProps) {
  const baseClasses = 'bg-white dark:bg-dark-100 border border-gray-200 dark:border-dark-200';

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  const hoverClasses = hover
    ? 'transition-shadow duration-200 hover:shadow-lg dark:hover:shadow-2xl cursor-pointer'
    : '';

  return (
    <div
      className={`
        ${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} 
        ${roundedClasses[rounded]} ${hoverClasses} ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`border-b border-gray-200 dark:border-dark-200 pb-3 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`border-t border-gray-200 dark:border-dark-200 pt-3 mt-4 ${className}`}>
      {children}
    </div>
  );
}
