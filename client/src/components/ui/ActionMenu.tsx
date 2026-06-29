import { MoreHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  onClick: () => void;
};

type ActionMenuProps = {
  label?: string;
  items: ActionMenuItem[];
  align?: 'left' | 'right';
};

export function ActionMenu({ label = '더보기', items, align = 'right' }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded  bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container-low"
        onClick={() => setOpen((current) => !current)}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open ? (
        <div
          role="menu"
          className={[
            'absolute top-12 z-20 min-w-32 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0'
          ].join(' ')}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={[
                'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-surface-container-low',
                item.tone === 'danger' ? 'text-error' : 'text-on-surface'
              ].join(' ')}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
