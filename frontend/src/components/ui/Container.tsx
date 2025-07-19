import React from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  center?: boolean;
}

export function Container({
  children,
  size = 'lg',
  padding = true,
  center = true,
  className = '',
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl', // 768px
    md: 'max-w-5xl', // 1024px
    lg: 'max-w-7xl', // 1280px
    xl: 'max-w-[1536px]', // 1536px
    full: 'max-w-full',
  };

  const classes = cn(
    'w-full',
    sizeClasses[size],
    center && 'mx-auto',
    padding && 'px-4 sm:px-6 lg:px-8',
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fullHeight?: boolean;
  container?: boolean;
  containerSize?: ContainerProps['size'];
}

export function Section({
  children,
  spacing = 'lg',
  fullHeight = false,
  container = true,
  containerSize = 'lg',
  className = '',
  ...props
}: SectionProps) {
  const spacingClasses = {
    none: '',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
    xl: 'py-24 md:py-32',
  };

  const classes = cn(spacingClasses[spacing], fullHeight && 'min-h-screen', className);

  const content = container ? <Container size={containerSize}>{children}</Container> : children;

  return (
    <section className={classes} {...props}>
      {content}
    </section>
  );
}

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export function Grid({
  children,
  cols = 3,
  gap = 'md',
  responsive = true,
  className = '',
  ...props
}: GridProps) {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  };

  const responsiveClasses: Record<number, string> = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
  };

  const classes = cn(
    'grid',
    gapClasses[gap],
    responsive && cols !== 1 ? responsiveClasses[cols] : colClasses[cols],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export function Stack({
  children,
  spacing = 'md',
  direction = 'vertical',
  align = 'stretch',
  justify = 'start',
  className = '',
  ...props
}: StackProps) {
  const spacingClasses = {
    xs: direction === 'vertical' ? 'space-y-1' : 'space-x-1',
    sm: direction === 'vertical' ? 'space-y-2' : 'space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : 'space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : 'space-x-6',
    xl: direction === 'vertical' ? 'space-y-8' : 'space-x-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const classes = cn(
    'flex',
    direction === 'vertical' ? 'flex-col' : 'flex-row',
    spacingClasses[spacing],
    alignClasses[align],
    justifyClasses[justify],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
