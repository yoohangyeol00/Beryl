import type { ReactNode } from 'react';
import { Button } from './Button';

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, title, children, onClose, actions, footer }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/30 p-6">
      <section className="flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col rounded-lg border border-outline-variant bg-surface-container-lowest shadow-ambient">
        <div className="flex shrink-0 items-center justify-between px-6 py-4">
          <h2 className="font-headline text-headline-md text-on-surface">{title}</h2>
          {actions ?? (
            <Button variant="ghost" onClick={onClose}>
              닫기
            </Button>
          )}
        </div>
        <div className="scrollbar-hidden min-h-0 overflow-y-auto px-6">{children}</div>
        {footer ? <div className="flex shrink-0 justify-end px-6 py-2">{footer}</div> : null}
      </section>
    </div>
  );
}
