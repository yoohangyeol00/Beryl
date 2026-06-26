import { Bell, CircleHelp, Search, UserRound } from 'lucide-react';
import { Input } from '../ui/Input';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6 lg:px-10">
      <div className="w-full max-w-[700px]">
        <Input
          aria-label="통합 검색"
          className="h-14 rounded-xl bg-surface-container-lowest text-lg"
          icon={<Search aria-hidden className="h-6 w-6" />}
          placeholder="통합 검색..."
        />
      </div>
      <div className="flex items-center gap-7">
        <Bell className="h-7 w-7 text-on-surface" />
        <CircleHelp className="h-7 w-7 text-on-surface" />
        <div className="h-8 w-px bg-outline-variant" />
        <div className="text-right">
          <p className="font-label text-label-md text-on-surface">김관리 팀장</p>
          <p className="text-xs text-on-surface-variant">BERYL 관리자</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-on-primary">
          <UserRound className="h-6 w-6" />
        </div>
      </div>
    </header>
  );
}
