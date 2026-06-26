import { LockKeyhole } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-10">
    <Card className="w-full max-w-md p-8">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-primary-container" />
          <h1 className="font-headline text-headline-lg text-primary">BERYL</h1>
        </div>
        <p className="text-body-md text-on-surface-variant">Public Procurement Intelligence</p>
      </div>
      <div className="space-y-4">
        <Input label="이메일" placeholder="name@agency.go.kr" />
        <Input label="비밀번호" type="password" placeholder="비밀번호 입력" />
        <Button className="w-full" icon={<LockKeyhole className="h-4 w-4" />}>
          로그인
        </Button>
      </div>
    </Card>
    </div>
  );
}
