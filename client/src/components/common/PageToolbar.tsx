import { Filter } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type CompositionEvent, type ReactNode } from 'react';
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

export function PageToolbar({
  children,
  searchPlaceholder = '검색어 입력',
  searchValue = '',
  onSearchChange,
  selects,
  resultCount,
  actions
}: PageToolbarProps) {
  const [draftSearchValue, setDraftSearchValue] = useState(searchValue);
  const [isComposing, setIsComposing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (isComposing || isSearchFocused) return;

    setDraftSearchValue(searchValue);
  }, [isComposing, isSearchFocused, searchValue]);

  useEffect(() => {
    if (isComposing || !isSearchFocused || draftSearchValue === searchValue) return;

    const timeoutId = window.setTimeout(() => {
      onSearchChange?.(draftSearchValue);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [draftSearchValue, isComposing, isSearchFocused, onSearchChange, searchValue]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftSearchValue(event.target.value);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);

    if (draftSearchValue !== searchValue) {
      onSearchChange?.(draftSearchValue);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;

    setIsComposing(false);
    setDraftSearchValue(nextValue);
  };

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="w-full sm:w-[280px] lg:w-[320px]">
            <Input
              placeholder={searchPlaceholder}
              value={draftSearchValue}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
            />
          </div>
          {selects?.map((select) => (
            <label key={select.label} className="block w-full sm:w-[190px] lg:w-[210px]">
              <span className="sr-only">{select.label}</span>
              <select
                className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-body text-[15px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
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
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 whitespace-nowrap xl:pt-0.5">
          {typeof resultCount === 'number' ? <span className="mr-2 text-sm text-on-surface-variant">{resultCount.toLocaleString('ko-KR')}건 표시</span> : null}
          {actions ? <div className="flex items-center gap-1 text-on-surface">{actions}</div> : null}
          <Button variant="secondary" className="h-11 px-4" icon={<Filter className="h-4 w-4" />}>
            필터 적용
          </Button>
        </div>
      </div>
    </div>
  );
}
