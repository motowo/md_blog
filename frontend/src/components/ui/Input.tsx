import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, description, leftIcon, rightIcon, invalid, className = '', id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseClasses = cn(
      'block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset',
      'text-zinc-900 placeholder:text-zinc-400',
      'focus:ring-2 focus:ring-inset',
      'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500 disabled:ring-zinc-200',
      'dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500',
      'dark:disabled:bg-white/5 dark:disabled:text-zinc-400',
      'sm:text-sm sm:leading-6'
    );

    const stateClasses = cn(
      invalid || error
        ? 'ring-red-300 focus:ring-red-500 dark:ring-red-500'
        : 'ring-zinc-300 focus:ring-zinc-600 dark:ring-white/10 dark:focus:ring-white/20'
    );

    const paddingClasses = cn(
      leftIcon && rightIcon ? 'pl-10 pr-10' : leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : 'px-3'
    );

    const inputClasses = cn(baseClasses, stateClasses, paddingClasses, className);

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium leading-6 text-zinc-900 dark:text-white"
          >
            {label}
            {props.required && (
              <span className="ml-1 text-red-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <div className={cn('relative', label && 'mt-2')}>
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <div className="h-5 w-5 text-zinc-400">{leftIcon}</div>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={invalid || !!error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : description ? `${inputId}-description` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <div className="h-5 w-5 text-zinc-400">{rightIcon}</div>
            </div>
          )}
        </div>
        {description && !error && (
          <p
            id={`${inputId}-description`}
            className="mt-2 text-sm text-zinc-500 dark:text-zinc-400"
          >
            {description}
          </p>
        )}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
