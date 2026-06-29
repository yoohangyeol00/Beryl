import { BriefcaseBusiness, Building2, KeyRound, LogOut, Mail, Phone, ShieldCheck, Trash2, Upload } from 'lucide-react';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import {
  logout,
  updatePassword,
  updateProfile,
  withdrawAccount,
} from '../../../api/authApi';
import { updateMyCompany, uploadMyCompanyLogo } from '../../../api/companiesApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../auth/AuthContext';

export function MyPage() {
  const navigate = useNavigate();
  const { clearSession, session: authSession, setSession, status } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [businessRegistrationNo, setBusinessRegistrationNo] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyContactPhone, setCompanyContactPhone] = useState('');
  const [companyContactEmail, setCompanyContactEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isLogoutPending, setIsLogoutPending] = useState(false);
  const [isWithdrawPending, setIsWithdrawPending] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isCompanySaving, setIsCompanySaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [companyMessage, setCompanyMessage] = useState('');
  const [logoMessage, setLogoMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authSession) {
      return;
    }

    setName(authSession.user.name);
    setEmail(authSession.user.email);
    setDepartment(authSession.member?.department ?? '');
    setPosition(authSession.member?.position ?? '');
    setPhone(authSession.member?.phone ?? '');
    setCompanyNameInput(authSession.company?.name ?? '');
    setBusinessRegistrationNo(authSession.company?.businessRegistrationNo ?? '');
    setCompanyType(authSession.company?.companyType ?? '');
    setRepresentativeName(authSession.company?.representativeName ?? '');
    setCompanyAddress(authSession.company?.address ?? '');
    setCompanyContactPhone(authSession.company?.contactPhone ?? '');
    setCompanyContactEmail(authSession.company?.contactEmail ?? '');
  }, [authSession]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage('');
    setErrorMessage('');
    setIsProfileSaving(true);

    try {
      const nextSession = await updateProfile({
        name,
        email,
        department,
        position,
        phone
      });
      setSession(nextSession);
      setName(nextSession.user.name);
      setEmail(nextSession.user.email);
      setDepartment(nextSession.member?.department ?? '');
      setPosition(nextSession.member?.position ?? '');
      setPhone(nextSession.member?.phone ?? '');
      setProfileMessage('기본 정보가 저장되었습니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '기본 정보 저장 중 오류가 발생했습니다.'));
    } finally {
      setIsProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage('');
    setErrorMessage('');
    setIsPasswordSaving(true);

    try {
      await updatePassword({
        currentPassword,
        newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('비밀번호가 변경되었습니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '비밀번호 변경 중 오류가 발생했습니다.'));
    } finally {
      setIsPasswordSaving(false);
    }
  }

  async function handleCompanySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompanyMessage('');
    setErrorMessage('');
    setIsCompanySaving(true);

    try {
      const nextSession = await updateMyCompany({
        name: companyNameInput,
        businessRegistrationNo,
        companyType,
        representativeName,
        address: companyAddress,
        contactPhone: companyContactPhone,
        contactEmail: companyContactEmail
      });
      setSession(nextSession);
      setCompanyMessage('기업 정보가 저장되었습니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '기업 정보 저장 중 오류가 발생했습니다.'));
    } finally {
      setIsCompanySaving(false);
    }
  }

  async function handleLogout() {
    setErrorMessage('');
    setIsLogoutPending(true);

    try {
      await logout();
      clearSession();
      navigate('/login', { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '로그아웃 중 오류가 발생했습니다.'));
      setIsLogoutPending(false);
    }
  }

  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setLogoMessage('');
    setErrorMessage('');

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('회사 로고는 2MB 이하의 이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsLogoUploading(true);

    try {
      const nextSession = await uploadMyCompanyLogo(file);
      setSession(nextSession);
      setLogoMessage('회사 로고가 저장되었습니다.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '회사 로고 업로드 중 오류가 발생했습니다.'));
    } finally {
      setIsLogoUploading(false);
    }
  }

  async function handleWithdraw() {
    const confirmed = window.confirm('탈퇴하면 현재 계정으로 다시 로그인할 수 없습니다. 탈퇴하시겠습니까?');

    if (!confirmed) {
      return;
    }

    setErrorMessage('');
    setIsWithdrawPending(true);

    try {
      await withdrawAccount();
      clearSession();
      navigate('/login', { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '탈퇴 처리 중 오류가 발생했습니다.'));
      setIsWithdrawPending(false);
    }
  }

  const roleLabel = authSession?.user.role === 'systemAdmin' ? '서비스 관리자' : '기업 사용자';
  const companyName = authSession?.company?.name ?? '소속 기업 없음';
  const companyLogoUrl = authSession?.company?.logoUrl;
  const profileLabel = position || roleLabel;
  const isLoading = status === 'loading';

  return (
    <section>
      <PageTitle title="마이페이지" description="계정 정보, 소속 기업, 보안 설정을 관리합니다." />

      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <Card className="p-8 text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-2xl bg-surface-container-lowest p-3 text-primary">
              {companyLogoUrl ? (
                <img src={companyLogoUrl} alt={`${companyName} 로고`} className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-14 w-14" />
              )}
            </div>
            <h2 className="mt-6 font-headline text-[28px] font-bold">
              {isLoading ? '불러오는 중' : authSession?.user.name ?? '-'}
            </h2>
            <p className="mt-2 text-on-surface-variant">{profileLabel}</p>
            <div className="mt-5 flex justify-center">
              <Badge tone="success">활성 계정</Badge>
            </div>
            <label
              className={[
                'mt-5 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 font-label text-[14px] font-semibold text-on-surface transition-colors hover:bg-surface-container',
                isLoading || isLogoUploading ? 'pointer-events-none opacity-60' : ''
              ].join(' ')}
            >
              <Upload className="h-4 w-4" />
              {isLogoUploading ? '업로드 중...' : '회사 로고 업로드'}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={isLoading || isLogoUploading}
                onChange={handleLogoChange}
              />
            </label>
            {logoMessage ? <p className="mt-3 text-sm font-semibold text-primary">{logoMessage}</p> : null}
            <Button
              type="button"
              variant="secondary"
              icon={<LogOut className="h-5 w-5" />}
              className="mt-7 w-full"
              disabled={isLoading || isLogoutPending}
              onClick={handleLogout}
            >
              {isLogoutPending ? '로그아웃 중...' : '로그아웃'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              icon={<Trash2 className="h-5 w-5" />}
              className="h-12 w-full rounded-lg border border-error/25 bg-error-container/45 px-4 text-error hover:bg-error-container hover:text-on-error-container"
              disabled={isLoading || isWithdrawPending}
              onClick={handleWithdraw}
            >
              {isWithdrawPending ? '탈퇴 처리 중...' : '탈퇴하기'}
            </Button>

          </Card>

          <Card className="p-7">
            <h3 className="mb-5 font-headline text-[22px] font-bold">접근 권한</h3>
            <div className="space-y-4">
              <Permission icon={<ShieldCheck />} label={roleLabel} />
              <Permission icon={<Building2 />} label={companyName} />
              {position ? <Permission icon={<BriefcaseBusiness />} label={position} /> : null}
              <Permission icon={<KeyRound />} label="세션 기반 인증" />
            </div>
          </Card>
        </aside>

        <div className="space-y-8">
          <Card className="p-8">
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="font-headline text-[26px] font-bold">기본 정보</h2>
                <Button type="submit" disabled={isLoading || isProfileSaving}>
                  {isProfileSaving ? '저장 중...' : '기본 정보 저장'}
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="이름"
                  placeholder="홍길동"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
                <Input
                  label="직책"
                  placeholder="과장"
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                />
                <Input label="역할" value={roleLabel} disabled />
                <Input
                  label="업무 이메일"
                  icon={<Mail className="h-5 w-5" />}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <Input
                  label="연락처"
                  icon={<Phone className="h-5 w-5" />}
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                <Input
                  label="소속 부서"
                  placeholder="사업개발팀"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                />
                <div className="md:col-span-2">
                  <div className="grid gap-3 md:grid-cols-2 md:items-end">
                    {/* <Input label="소속 기업" value={companyName} disabled /> */}

                  </div>
                </div>
              </div>
              {profileMessage ? <p className="mt-5 font-semibold text-primary">{profileMessage}</p> : null}
            </form>
          </Card>

          <Card className="p-8">
            <form onSubmit={handleCompanySubmit}>
              <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="font-headline text-[26px] font-bold">기업 정보</h2>
                <Button type="submit" disabled={isLoading || isCompanySaving}>
                  {isCompanySaving ? '저장 중...' : '기업 정보 저장'}
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="기업명"
                  placeholder="A기업"
                  value={companyNameInput}
                  onChange={(event) => setCompanyNameInput(event.target.value)}
                  required
                />
                <Input
                  label="사업자등록번호"
                  placeholder="123-45-67890"
                  value={businessRegistrationNo}
                  onChange={(event) => setBusinessRegistrationNo(event.target.value)}
                />
                <Input
                  label="기업 유형"
                  placeholder="법인, 공공기관, 협력사"
                  value={companyType}
                  onChange={(event) => setCompanyType(event.target.value)}
                />
                <Input
                  label="대표자명"
                  placeholder="대표자명"
                  value={representativeName}
                  onChange={(event) => setRepresentativeName(event.target.value)}
                />
                <Input
                  label="대표 연락처"
                  placeholder="02-0000-0000"
                  value={companyContactPhone}
                  onChange={(event) => setCompanyContactPhone(event.target.value)}
                />
                <Input
                  label="대표 이메일"
                  placeholder="contact@company.com"
                  value={companyContactEmail}
                  onChange={(event) => setCompanyContactEmail(event.target.value)}
                />
                <div className="md:col-span-2">
                  <Input
                    label="주소"
                    placeholder="기업 주소"
                    value={companyAddress}
                    onChange={(event) => setCompanyAddress(event.target.value)}
                  />
                </div>
              </div>
              {companyMessage ? <p className="mt-5 font-semibold text-primary">{companyMessage}</p> : null}
            </form>
          </Card>

          <Card className="p-8">
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="font-headline text-[26px] font-bold">보안 설정</h2>
                <Button type="submit" disabled={isLoading || isPasswordSaving}>
                  {isPasswordSaving ? '변경 중...' : '비밀번호 변경'}
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="현재 비밀번호"
                  type="password"
                  placeholder="현재 비밀번호"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                />
                <Input
                  label="새 비밀번호"
                  type="password"
                  placeholder="새 비밀번호"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {passwordMessage ? <p className="mt-5 font-semibold text-primary">{passwordMessage}</p> : null}
              <div className="mt-6 flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-low p-5">
                <div>
                  <p className="font-bold">2단계 인증</p>
                  <p className="mt-1 text-sm text-on-surface-variant">관리자 계정 보호를 위해 2단계 인증을 권장합니다.</p>
                </div>
                <Badge tone="info">준비중</Badge>
              </div>
            </form>
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

function getErrorMessage(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
