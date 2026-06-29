import type { ChangeEvent, ReactNode } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

type ToolbarSelect = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
};

type PageToolbarProps = {
  children?: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  selects?: ToolbarSelect[];
  resultCount?: number;
  actions?: ReactNode;
};

export function PageToolbar({ children, searchPlaceholder = '검색어 입력', searchValue = '', onSearchChange, selects, resultCount, actions }: PageToolbarProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(220px,360px)_repeat(2,minmax(150px,220px))]">
          <Input placeholder={searchPlaceholder} value={searchValue} onChange={handleSearchChange} />
          {selects?.map((select) => (
            <label key={select.label} className="block">
              <span className="sr-only">{select.label}</span>
              <select
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                value={select.value}
                onChange={(event) => select.onChange(event.target.value)}
              >
                {select.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          )) ?? children ?? (
            <>
              <Input placeholder="상태 전체" />
              <Input placeholder="기간 전체" />
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 whitespace-nowrap">
          {typeof resultCount === 'number' ? <span className="mr-2 text-sm text-on-surface-variant">{resultCount.toLocaleString('ko-KR')}건 표시</span> : null}
          {actions ? <div className="flex items-center gap-1 text-on-surface">{actions}</div> : null}
          <Button variant="secondary" icon={<Filter className="h-4 w-4" />}>
            필터 적용
          </Button>
        </div>
      </div>
    </div>
  );
}

