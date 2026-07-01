import type { ReactNode } from 'react';

type PageTitleProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageTitle({ title, description, actions }: PageTitleProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-headline text-[36px] font-bold leading-tight text-on-surface">{title}</h1>
        {description ? <p className="mt-3 text-[18px] leading-7 text-on-surface-variant">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
