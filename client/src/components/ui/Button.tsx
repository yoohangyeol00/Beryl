import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
};

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-on-primary-container',
  secondary: 'border border-primary bg-transparent text-primary hover:bg-primary/5',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container'
};

export function Button({ className = '', variant = 'primary', icon, children, ...props }: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 font-label text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      ].join(' ')}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
