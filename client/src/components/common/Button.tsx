import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gradient' | 'cyan' | 'amber' | 'emerald' | 'purple' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-lg gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm',
    secondary: 'bg-white dark:bg-dark-tertiary hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-border shadow-sm',
    outline: 'border border-gray-300 dark:border-dark-border-strong hover:bg-gray-50 dark:hover:bg-dark-tertiary text-gray-700 dark:text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-dark-tertiary text-gray-700 dark:text-gray-300',
    gradient: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    cyan: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    amber: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    purple: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-dark-tertiary dark:hover:bg-dark-border shadow-sm',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
