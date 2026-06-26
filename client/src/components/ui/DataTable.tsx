import type { ReactNode } from 'react';

export type DataTableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
};

const alignMap = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center'
};

export function DataTable<T extends object>({ columns, data, getRowKey, onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-surface-container-low text-on-surface">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={[
                    'whitespace-nowrap px-7 py-5 font-label text-[15px] font-bold',
                    alignMap[column.align ?? 'left']
                  ].join(' ')}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={getRowKey(row)}
                className={[
                  'bg-surface-container-lowest transition-colors',
                  onRowClick ? 'cursor-pointer hover:bg-surface-container-low' : ''
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
                      'whitespace-nowrap border-t border-outline-variant px-7 py-6 font-body text-[16px] text-on-surface',
                      alignMap[column.align ?? 'left']
                    ].join(' ')}
                  >
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
