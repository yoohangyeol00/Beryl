import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

type PageToolbarProps = {
  children?: ReactNode;
  searchPlaceholder?: string;
};

export function PageToolbar({ children, searchPlaceholder = '검색어 입력' }: PageToolbarProps) {
  return (
    <Card className="mb-4 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-3 md:grid-cols-[280px_180px_180px]">
          <Input placeholder={searchPlaceholder} />
          {children ?? (
            <>
              <Input placeholder="상태 전체" />
              <Input placeholder="기간 전체" />
            </>
          )}
        </div>
        <Button variant="secondary" icon={<Filter className="h-4 w-4" />}>
          필터 적용
        </Button>
      </div>
    </Card>
  );
}
