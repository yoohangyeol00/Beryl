import { ArrowLeft, BriefcaseBusiness, Building2, Mail, PlusCircle, Phone, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { createCompanyMemberInvitation } from '../../../api/companyMembersApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

function RequiredLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{children}</span>
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
    </span>
  );
}

export function BuyerCompanyMemberFormPage() {
  const navigate = useNavigate();
  const basePath = '/company-members';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [memberType, setMemberType] = useState<'employee' | 'reviewer' | 'manager'>('employee');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await createCompanyMemberInvitation({
        name,
        email,
        department: department || undefined,
        position: position || undefined,
        phone: phone || undefined,
        role: 'companyUser',
        memberType
      });
      navigate(basePath, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '사용자 등록 중 오류가 발생했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <PageTitle
        title="회사 구성원 등록"
        description="현재 기업 소속 사용자를 초대하고, 부서와 직책, 연락처 정보를 함께 등록합니다."
        actions={
          <>
            <Button variant="secondary" type="button" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
              뒤로
            </Button>
            <Button type="submit" form="company-member-form" icon={<Mail className="h-4 w-4" />} disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '초대하기'}
            </Button>
          </>
        }
      />

      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {errorMessage}
        </div>
      ) : null}

      <form id="company-member-form" className="mt-5" onSubmit={handleSubmit}>
        <Card className="p-8">
          <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
            <PlusCircle className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-[26px] font-bold">사용자 정보</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label={<RequiredLabel>이름</RequiredLabel>}
              icon={<UserRound className="h-5 w-5" />}
              placeholder="홍길동"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
            <Input
              label={<RequiredLabel>이메일</RequiredLabel>}
              icon={<Mail className="h-5 w-5" />}
              placeholder="user@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="부서"
              icon={<Building2 className="h-5 w-5" />}
              placeholder="사업개발팀"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              autoComplete="organization"
            />
            <Input
              label="직책"
              icon={<BriefcaseBusiness className="h-5 w-5" />}
              placeholder="팀장"
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              autoComplete="organization-title"
            />
            <Input
              label="연락처"
              icon={<Phone className="h-5 w-5" />}
              placeholder="010-1234-5678"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
            />
            <label className="block">
              <span className="mb-2 block font-label text-label-sm text-on-surface-variant">권한 레벨</span>
              <select
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                value={memberType}
                onChange={(event) => setMemberType(event.target.value as 'employee' | 'reviewer' | 'manager')}
              >
                <option value="employee">실무자</option>
                <option value="reviewer">검토자/상급자</option>
                <option value="manager">관리자</option>
              </select>
            </label>
          </div>
        </Card>
      </form>
    </section>
  );
}
