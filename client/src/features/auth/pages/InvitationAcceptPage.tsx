import { ArrowRight, Building2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation, getInvitationAcceptInfo, type InvitationAcceptInfo } from '../../../api/authApi';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../AuthContext';
import { LoginIntroPanel } from '../components/LoginIntroPanel';

export function InvitationAcceptPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSession } = useAuth();
  const token = searchParams.get('token') ?? '';
  const [invitation, setInvitation] = useState<InvitationAcceptInfo | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadInvitation() {
      if (!token) {
        setErrorMessage('초대 링크에 필요한 토큰이 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        const nextInvitation = await getInvitationAcceptInfo(token);

        if (isMounted) {
          setInvitation(nextInvitation);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, '초대 정보를 불러오지 못했습니다.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const session = await acceptInvitation({
        token,
        password,
        passwordConfirm
      });
      setSession(session);
      navigate('/buyer/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '초대 수락 중 오류가 발생했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <LoginIntroPanel />
      <section className="flex items-center justify-center bg-background p-12">
        <div className="w-full max-w-xl">
          <h2 className="font-headline text-[40px] font-bold">초대 수락</h2>
          <p className="mb-10 mt-2 text-[18px] text-on-surface-variant">
            비밀번호를 설정하면 BERYL 계정이 활성화됩니다.
          </p>
          <div className="mb-10 h-1.5 w-1/2 rounded bg-primary-container" />

          {isLoading ? (
            <Card className="p-6">
              <p className="font-label text-[15px] text-on-surface-variant">초대 정보를 확인 중입니다.</p>
            </Card>
          ) : invitation ? (
            <form className="space-y-7" onSubmit={handleSubmit}>
              <Card className="space-y-4 p-5">
                <ReadonlyField icon={<Building2 className="h-5 w-5" />} label="소속 기업" value={invitation.companyName} />
                <ReadonlyField icon={<UserRound className="h-5 w-5" />} label="이름" value={invitation.name} />
                <ReadonlyField icon={<Mail className="h-5 w-5" />} label="이메일" value={invitation.email} />
              </Card>

              <Input
                label="비밀번호"
                icon={<LockKeyhole className="h-5 w-5" />}
                type="password"
                placeholder="8자 이상 입력"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
              <Input
                label="비밀번호 확인"
                icon={<LockKeyhole className="h-5 w-5" />}
                type="password"
                placeholder="비밀번호를 다시 입력"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                autoComplete="new-password"
                required
              />

              {errorMessage ? (
                <p className="rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
                  {errorMessage}
                </p>
              ) : null}

              <Button className="h-14 w-full" icon={<ArrowRight className="h-5 w-5" />} disabled={isSubmitting}>
                {isSubmitting ? '수락 중...' : '초대 수락'}
              </Button>
            </form>
          ) : (
            <Card className="p-6">
              <p className="font-semibold text-error">{errorMessage}</p>
              <Link className="mt-5 inline-block font-label font-semibold text-primary" to="/login">
                로그인으로 돌아가기
              </Link>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

function ReadonlyField({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-outline">{icon}</span>
      <span>
        <span className="block font-label text-label-sm text-on-surface-variant">{label}</span>
        <span className="block font-semibold text-on-surface">{value}</span>
      </span>
    </div>
  );
}
