import { ArrowLeft, BriefcaseBusiness, Building2, Mail, PlusCircle, Phone, Save, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { createCompanyMemberInvitation } from '../../../api/companyMembersApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function BuyerCompanyMemberFormPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
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
        role: 'companyUser'
      });
      navigate('/buyer/company-members', { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '사용자 등록 중 오류가 발생했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <PageTitle
        title="기관 사용자 등록"
        description="현재 기업 소속 사용자를 초대하고, 부서와 직책, 연락처 정보를 함께 등록합니다."
        actions={
          <>
            <Button variant="secondary" type="button" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
              뒤로
            </Button>
            <Button type="submit" form="company-member-form" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '사용자 등록'}
            </Button>
          </>
        }
      />

      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {errorMessage}
        </div>
      ) : null}

      <form id="company-member-form" className="grid gap-8 xl:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <Card className="p-8">
          <div className="mb-7 flex items-center gap-3 border-b border-outline-variant pb-6">
            <PlusCircle className="h-6 w-6 text-primary" />
            <h2 className="font-headline text-[26px] font-bold">기본 정보</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="이름"
              icon={<UserRound className="h-5 w-5" />}
              placeholder="홍길동"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
            <Input
              label="이메일"
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
            <div className="md:col-span-2">
              <Input
                label="연락처"
                icon={<Phone className="h-5 w-5" />}
                placeholder="010-1234-5678"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </div>
          </div>
        </Card>

        <aside className="space-y-6">
          <Card className="p-7">
            <h3 className="mb-4 font-headline text-[22px] font-bold">등록 기준</h3>
            <ul className="space-y-4 text-on-surface-variant">
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                초대 대상은 `companyUser`로 등록됩니다.
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                부서와 직책은 선택 입력입니다.
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                등록 후 목록 화면으로 돌아갑니다.
              </li>
            </ul>
          </Card>
        </aside>
      </form>
    </section>
  );
}
