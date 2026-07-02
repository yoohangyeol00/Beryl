import { ArrowDownUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  headerClassName?: string;
  cellClassName?: string;
};

type SortState<T> = {
  key: DataTableColumn<T>['key'];
  direction: 'asc' | 'desc';
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loadingMessage?: string;
  loadingContent?: ReactNode;
  isLoading?: boolean;
  density?: 'comfortable' | 'compact';
  tableClassName?: string;
};

const alignMap = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center'
};

const densityClass = {
  comfortable: {
    th: 'px-7 py-5',
    td: 'px-7 py-6'
  },
  compact: {
    th: 'px-5 py-3',
    td: 'px-5 py-4'
  }
};

function defaultSortValue<T extends object>(row: T, column: DataTableColumn<T>) {
  const value = column.sortValue ? column.sortValue(row) : row[column.key as keyof T];
  return typeof value === 'number' ? value : String(value ?? '').toLocaleLowerCase();
}

export function DataTable<T extends object>({
  columns,
  data,
  getRowKey,
  onRowClick,
  emptyMessage = '표시할 데이터가 없습니다.',
  loadingMessage,
  loadingContent,
  isLoading = false,
  density = 'comfortable',
  tableClassName = 'min-w-full'
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState<T> | null>(null);
  const spacing = densityClass[density];

  const sortedData = useMemo(() => {
    if (!sort) return data;

    const column = columns.find((item) => item.key === sort.key);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const first = defaultSortValue(a, column);
      const second = defaultSortValue(b, column);
      const result = typeof first === 'number' && typeof second === 'number'
        ? first - second
        : String(first).localeCompare(String(second), 'ko');

      return sort.direction === 'asc' ? result : -result;
    });
  }, [columns, data, sort]);

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    setSort((current) => {
      if (current?.key !== column.key) {
        return { key: column.key, direction: 'asc' };
      }

      return { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="overflow-x-auto">
        <table className={[tableClassName, 'border-collapse'].join(' ')}>
          <thead className="bg-surface-container-low text-on-surface">
            <tr>
              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                const SortIcon = !isSorted ? ArrowDownUp : sort.direction === 'asc' ? ChevronUp : ChevronDown;

                return (
                  <th
                    key={String(column.key)}
                    className={[
                      'whitespace-nowrap font-label text-[14px] font-bold',
                      spacing.th,
                      alignMap[column.align ?? 'left'],
                      column.headerClassName ?? ''
                    ].join(' ')}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded text-inherit transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                        onClick={() => handleSort(column)}
                        aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        {column.header}
                        <SortIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading && loadingContent ? (
              <tr>
                <td colSpan={columns.length} className="border-t border-outline-variant px-7 py-14">
                  {loadingContent}
                </td>
              </tr>
            ) : isLoading && loadingMessage ? (
              <tr>
                <td colSpan={columns.length} className="border-t border-outline-variant px-7 py-14 text-center font-semibold text-primary">
                  {loadingMessage}
                </td>
              </tr>
            ) : isLoading ? (
              Array.from({ length: 4 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={String(column.key)} className={['border-t border-outline-variant', spacing.td].join(' ')}>
                      <div className="h-5 w-full min-w-24 animate-pulse rounded bg-surface-container" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length > 0 ? (
              sortedData.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className={[
                    'bg-surface-container-lowest transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-surface-container-low focus-within:bg-surface-container-low' : ''
                  ].join(' ')}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={[
                        'whitespace-nowrap border-t border-outline-variant font-body text-[15px] text-on-surface',
                        spacing.td,
                        alignMap[column.align ?? 'left'],
                        column.cellClassName ?? ''
                      ].join(' ')}
                    >
                      {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="border-t border-outline-variant px-7 py-14 text-center text-on-surface-variant">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
