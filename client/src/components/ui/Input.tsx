import type { InputHTMLAttributes, ReactNode } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  label?: string;
};

export function Input({ className = '', icon, label, id, ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block font-label text-label-sm text-on-surface-variant">{label}</span> : null}
      <span className="relative block">
        {icon ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">{icon}</span> : null}
        <input
          id={id}
          className={[
            'h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim',
            icon ? 'pl-10' : '',
            className
          ].join(' ')}
          {...props}
        />
      </span>
    </label>
  );
}
