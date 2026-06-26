import { Bell, CircleHelp, Search, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { Input } from '../ui/Input';

export function Header() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center bg-surface-container-lowest">
      <div className="hidden h-full w-80 shrink-0 items-center border-r border-outline-variant px-6 lg:flex">
        <Link to="/dashboard/admin" className="block">
          <img src={logo} alt="BERYL" className="h-14 w-44 object-contain object-left" />
        </Link>
      </div>

      <div className="flex h-full min-w-0 flex-1 items-center justify-between gap-6 border-b border-outline-variant px-6 lg:px-10">
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
          <Link to="/mypage" className="flex items-center gap-4 rounded-xl px-2 py-1 hover:bg-surface-container">
            <div className="text-right">
              <p className="font-label text-label-md text-on-surface">김관리 팀장</p>
              <p className="text-xs text-on-surface-variant">BERYL 관리자</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-on-primary">
              <UserRound className="h-6 w-6" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
