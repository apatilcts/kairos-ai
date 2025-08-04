'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'outline' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
  error?: boolean;
  icon?: React.ReactNode;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = 'default', 
    inputSize = 'md', 
    error = false,
    icon,
    label,
    helperText,
    ...props 
  }, ref) => {
    const variants = {
      default: 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500',
      outline: 'border-gray-300 bg-transparent focus:border-blue-500 focus:ring-blue-500',
      filled: 'border-transparent bg-gray-100 focus:border-blue-500 focus:ring-blue-500 focus:bg-white',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-4 text-lg',
    };

    const inputClasses = cn(
      'flex w-full rounded-lg border shadow-sm transition-all duration-200',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      variants[variant],
      sizes[inputSize],
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      icon && 'pl-10',
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            {...props}
          />
        </div>
        {helperText && (
          <p className={cn(
            'text-xs',
            error ? 'text-red-600' : 'text-gray-500'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };