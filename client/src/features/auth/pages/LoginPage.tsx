import { ArrowRight, BarChart3, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../../../api/authApi';
import { getApiErrorMessage } from '../../../api/apiResponse';
import logo from '../../../assets/logo.png';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const session = await login({
        email,
        password
      });
      setSession(session);
      navigate(getRedirectPath(location.state), { replace: true });
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative flex flex-col justify-center overflow-hidden bg-surface-container p-12 lg:p-20">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),transparent_45%),linear-gradient(45deg,transparent_60%,rgba(255,255,255,0.35))]" />
        <div className="relative max-w-2xl">
          <div className="mb-20">
            <img src={logo} alt="BERYL" className="h-20 w-full max-w-xs object-contain object-left" />
          </div>
          <h2 className="mb-8 max-w-xl font-headline text-[40px] font-bold leading-tight text-on-surface">
            공공 입찰과 인력 매칭을 하나의 흐름으로 연결합니다.
          </h2>
          <p className="mb-12 max-w-xl text-[20px] leading-9 text-on-surface-variant">
            BERYL은 입찰 공고, RFP 분석, 공급기업 관리, 인력 배정을 안전하고 투명하게 운영하기 위한 통합 플랫폼입니다.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-7">
              <ShieldCheck className="mb-6 h-7 w-7 text-primary-container" />
              <h3 className="font-label text-[16px] font-bold">안전한 접근</h3>
              <p className="mt-2 text-sm text-on-surface-variant">기관 입찰 업무에 필요한 권한 기반 접근을 제공합니다.</p>
            </Card>
            <Card className="p-7">
              <BarChart3 className="mb-6 h-7 w-7 text-primary-container" />
              <h3 className="font-label text-[16px] font-bold">조달 인사이트</h3>
              <p className="mt-2 text-sm text-on-surface-variant">RFP 분석, 인력 추천, 사업 현황을 한곳에서 확인합니다.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-background p-12">
        <div className="w-full max-w-xl">
          <h2 className="font-headline text-[40px] font-bold">다시 오신 것을 환영합니다</h2>
          <p className="mb-10 mt-2 text-[18px] text-on-surface-variant">BERYL 계정으로 로그인해 업무를 이어가세요.</p>
          <div className="mb-10 h-1.5 w-1/2 rounded bg-primary-container" />
          <form className="space-y-7" onSubmit={handleSubmit}>
            <Input
              label="업무 이메일"
              icon={<Mail className="h-5 w-5" />}
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="비밀번호"
              icon={<LockKeyhole className="h-5 w-5" />}
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
    </div>
  );
}

function getLoginErrorMessage(error: unknown) {
  return getApiErrorMessage(error, '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
}

function getRedirectPath(state: unknown) {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: { pathname?: string } }).from;

    if (from?.pathname && from.pathname !== '/login' && from.pathname !== '/signup') {
      return from.pathname;
    }
  }

  return '/dashboard/admin';
}
