import type { ReactNode } from 'react';
import { Button } from './Button';

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/30 p-6">
      <section className="w-full max-w-3xl rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-ambient">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-headline text-headline-md text-on-surface">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
