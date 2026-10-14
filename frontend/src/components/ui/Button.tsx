import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-[#5B5CE2] hover:bg-[#4A4BC8] text-white focus:ring-[#5B5CE2]/40 shadow-sm',
    secondary: 'bg-white dark:bg-[#1E293B] text-[#17202F] dark:text-slate-200 border border-[#E7E9EF] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-subtle',
    outline: 'border border-[#5B5CE2] text-[#5B5CE2] hover:bg-indigo-50 dark:hover:bg-indigo-950/30 focus:ring-[#5B5CE2]/30',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/40 shadow-sm',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-300',
  }[variant];

  return (
    <button
      className={clsx(baseClasses, sizeClasses, variantClasses, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
