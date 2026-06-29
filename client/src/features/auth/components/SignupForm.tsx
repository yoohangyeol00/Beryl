import { ArrowRight, Building2, IdCard, LockKeyhole, Mail, User } from 'lucide-react';
import { type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface SignupFormProps {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  companyName: string;
  businessRegistrationNo: string;
  supportsBuyer: boolean;
  supportsSupplier: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onBusinessRegistrationNoChange: (value: string) => void;
  onSupportsBuyerChange: (value: boolean) => void;
  onSupportsSupplierChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function SignupForm({
  name,
  email,
  password,
  passwordConfirm,
  companyName,
  businessRegistrationNo,
  supportsBuyer,
  supportsSupplier,
  isSubmitting,
  errorMessage,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmChange,
  onCompanyNameChange,
  onBusinessRegistrationNoChange,
  onSupportsBuyerChange,
  onSupportsSupplierChange,
  onSubmit
}: SignupFormProps) {
  function handleBuyerChange(nextChecked: boolean) {
    if (!nextChecked && !supportsSupplier) {
      return;
    }

    onSupportsBuyerChange(nextChecked);
  }

  function handleSupplierChange(nextChecked: boolean) {
    if (!nextChecked && !supportsBuyer) {
      return;
    }

    onSupportsSupplierChange(nextChecked);
  }

  return (
    <section className="flex items-center justify-center bg-background p-12">
      <div className="w-full max-w-xl">
        <h2 className="font-headline text-[40px] font-bold">계정 만들기</h2>
        <p className="mb-10 mt-2 text-[18px] text-on-surface-variant">
          서비스를 이용하기 위해 기본 정보와 기업 이용 모드를 선택해주세요.
        </p>
        <div className="mb-10 flex gap-4">
          <div className="h-1.5 flex-1 rounded bg-primary-container" />
          <div className="h-1.5 flex-1 rounded bg-surface-container-highest" />
        </div>
        <form className="space-y-7" onSubmit={onSubmit}>
          <Input
            label="이름"
            icon={<User className="h-5 w-5" />}
            placeholder="홍길동"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            autoComplete="name"
            required
          />
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
            autoComplete="new-password"
            required
          />
          <Input
            label="비밀번호 확인"
            icon={<LockKeyhole className="h-5 w-5" />}
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={passwordConfirm}
            onChange={(event) => onPasswordConfirmChange(event.target.value)}
            autoComplete="new-password"
            required
          />
          <Input
            label="기업명"
            icon={<Building2 className="h-5 w-5" />}
            placeholder="A기업"
            value={companyName}
            onChange={(event) => onCompanyNameChange(event.target.value)}
            autoComplete="organization"
            required
          />
          <Input
            label="사업자등록번호"
            icon={<IdCard className="h-5 w-5" />}
            placeholder="123-45-67890"
            value={businessRegistrationNo}
            onChange={(event) => onBusinessRegistrationNoChange(event.target.value)}
          />

          <fieldset className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <legend className="px-1 font-label text-label-sm text-on-surface-variant">기업 이용 모드</legend>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ModeCheckbox
                label="발주기관 모드"
                description="공고, 공급기업, 수주사업을 발주 관점에서 관리합니다."
                checked={supportsBuyer}
                onChange={handleBuyerChange}
              />
              <ModeCheckbox
                label="공급기관 모드"
                description="참여 공고, 발주기관, 투입 인력을 공급 관점에서 관리합니다."
                checked={supportsSupplier}
                onChange={handleSupplierChange}
              />
            </div>
          </fieldset>

          {errorMessage ? (
            <p className="rounded-lg border border-error/30 bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
              {errorMessage}
            </p>
          ) : null}
          <Button className="h-14 w-full" icon={<ArrowRight className="h-5 w-5" />} disabled={isSubmitting}>
            {isSubmitting ? '가입 중...' : '계정 만들기'}
          </Button>
        </form>
        <p className="mt-12 text-center text-[16px] text-on-surface-variant">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="font-bold text-primary">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </section>
  );
}

function ModeCheckbox({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded border border-outline-variant bg-background p-4 transition hover:bg-surface-container-low">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <span className="block font-label text-[15px] font-bold text-on-surface">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-on-surface-variant">{description}</span>
      </span>
    </label>
  );
}
