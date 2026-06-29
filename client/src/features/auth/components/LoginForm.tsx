import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface LoginFormProps {
  email: string;
  password: string;
  isSubmitting: boolean;
  errorMessage: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoginForm({
  email,
  password,
  isSubmitting,
  errorMessage,
  onEmailChange,
  onPasswordChange,
  onSubmit
}: LoginFormProps) {
  return (
    <section className="flex items-center justify-center bg-background p-12">
      <div className="w-full max-w-xl">
        <h2 className="font-headline text-[40px] font-bold">다시 오신 것을 환영합니다</h2>
        <p className="mb-10 mt-2 text-[18px] text-on-surface-variant">BERYL 계정으로 로그인해 업무를 이어가세요.</p>
        <div className="mb-10 h-1.5 w-1/2 rounded bg-primary-container" />
        <form className="space-y-7" onSubmit={onSubmit}>
          <Input
            label="업무 이메일"
            icon={<Mail className="h-5 w-5" />}
            placeholder="name@company.com"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            autoComplete="email"
            required
          />
          <Input
            label="비밀번호"
            icon={<LockKeyhole className="h-5 w-5" />}
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            autoComplete="current-password"
            required
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-on-surface-variant">
              <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
              로그인 상태 유지
            </label>
            <button type="button" className="font-label font-semibold text-primary">
              비밀번호 찾기
            </button>
          </div>
          {errorMessage ? (
            <p className="rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
              {errorMessage}
            </p>
          ) : null}
          <Button className="h-14 w-full" icon={<ArrowRight className="h-5 w-5" />} disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>
        <p className="mt-12 text-center text-[16px] text-on-surface-variant">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="font-bold text-primary">
            회원가입
          </Link>
        </p>
      </div>
    </section>
  );
}
