import { Building2, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function MyPage() {
  return (
    <section>
      <PageTitle
        title="마이페이지"
        description="계정 정보, 소속 기관, 보안 설정을 관리합니다."
        actions={<Button>변경사항 저장</Button>}
      />

      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <Card className="p-8 text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-2xl bg-primary text-on-primary">
              <UserRound className="h-14 w-14" />
            </div>
            <h2 className="mt-6 font-headline text-[28px] font-bold">김관리 팀장</h2>
            <p className="mt-2 text-on-surface-variant">BERYL 관리자</p>
            <div className="mt-5 flex justify-center">
              <Badge tone="success">활성 계정</Badge>
            </div>
          </Card>

          <Card className="p-7">
            <h3 className="mb-5 font-headline text-[22px] font-bold">접근 권한</h3>
            <div className="space-y-4">
              <Permission icon={<ShieldCheck />} label="시스템 관리자" />
              <Permission icon={<Building2 />} label="발주기관 관리" />
              <Permission icon={<KeyRound />} label="입찰공고 등록" />
            </div>
          </Card>
        </aside>

        <div className="space-y-8">
          <Card className="p-8">
            <h2 className="mb-7 font-headline text-[26px] font-bold">기본 정보</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="이름" placeholder="김관리" />
              <Input label="직책" placeholder="팀장" />
              <Input label="업무 이메일" icon={<Mail className="h-5 w-5" />} placeholder="admin@beryl.co.kr" />
              <Input label="연락처" placeholder="010-1234-5678" />
              <Input label="소속" placeholder="BERYL 운영팀" />
              <Input label="역할" placeholder="시스템 관리자" />
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="mb-7 font-headline text-[26px] font-bold">보안 설정</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="현재 비밀번호" type="password" placeholder="현재 비밀번호" />
              <Input label="새 비밀번호" type="password" placeholder="새 비밀번호" />
            </div>
            <div className="mt-6 flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-5">
              <div>
                <p className="font-bold">2단계 인증</p>
                <p className="mt-1 text-sm text-on-surface-variant">관리자 계정 보호를 위해 2단계 인증을 권장합니다.</p>
              </div>
              <Badge tone="info">준비중</Badge>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Permission({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-on-surface">
      <span className="grid h-9 w-9 place-items-center rounded bg-secondary-container text-primary">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
