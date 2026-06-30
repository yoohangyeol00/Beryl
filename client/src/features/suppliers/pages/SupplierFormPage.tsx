import { ArrowLeft, Brain, Building2, Save, UploadCloud, UserRound, X } from 'lucide-react';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { createSupplierRelationship, uploadSupplierCertificationFile, type SupplierManagementStatus } from '../../../api/suppliersApi';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

const certificationOptions = [
  { title: 'GS 인증 (1등급)', description: 'Good Software' },
  { title: 'CMMI (Level 3+)', description: 'Process Capability' },
  { title: 'ISO 27001', description: 'Security Management' }
];

const ko = {
  createTitle: '공급기업 등록',
  editTitle: '공급기업 수정',
  description: '발주 사업에 참여할 수 있는 공급기업의 기본 정보, 담당자, 수행 역량을 관리합니다.',
  basicInfo: '기본 정보',
  contactInfo: '담당자 정보',
  capabilityInfo: '기술 역량',
  companyName: '공급기업명',
  businessNumber: '사업자등록번호',
  companyType: '기업 유형',
  representative: '대표자',
  homepage: '홈페이지',
  address: '주소',
  contactName: '담당자명',
  contactDepartment: '소속/직책',
  contactEmail: '담당자 이메일',
  contactPhone: '담당자 연락처',
  coreTechnologies: '핵심 보유 기술',
  coreTechnologiesDesc: '업체가 보유한 주요 기술 스택이나 핵심 역량을 입력하세요.',
  certifications: '인증 및 등급 현황',
  certificationFile: '인증서 사본 업로드',
  uploadGuide: '인증서 파일 업로드는 다음 단계에서 연결됩니다.',
  uploadHelp: '현재 등록 API는 인증명 저장까지 지원합니다.',
  grade: '내부 등급',
  status: '관리 상태',
  tags: '관리 태그',
  memo: '평가 메모',
  cancel: '취소',
  saveDraft: '임시 저장',
  create: '등록',
  update: '수정',
  saving: '저장 중...',
  errorFallback: '공급기업 등록 중 오류가 발생했습니다.'
};

export function SupplierFormPage() {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const isEdit = Boolean(supplierId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [homepage, setHomepage] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactDepartment, setContactDepartment] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [technologyInput, setTechnologyInput] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certificationFiles, setCertificationFiles] = useState<File[]>([]);
  const [internalGrade, setInternalGrade] = useState('');
  const [managementStatus, setManagementStatus] = useState<SupplierManagementStatus>('active');
  const [tags, setTags] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCancel = () => {
    navigate('/suppliers');
  };

  const handleAddTechnology = () => {
    const nextTechnology = technologyInput.trim();
    if (!nextTechnology || technologies.includes(nextTechnology)) return;

    setTechnologies((current) => [...current, nextTechnology]);
    setTechnologyInput('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const savedSupplier = await createSupplierRelationship({
        company: {
          name: companyName,
          businessRegistrationNo: businessNumber,
          companyType,
          representativeName,
          websiteUrl: homepage,
          address,
          contactPhone,
          contactEmail
        },
        contact: {
          name: contactName,
          department: contactDepartment,
          email: contactEmail,
          phone: contactPhone
        },
        capabilities: technologies,
        certifications,
        relationship: {
          relationshipType: 'preferred_partner',
          internalGrade,
          managementStatus,
          tags,
          memo
        }
      });

      for (const file of certificationFiles) {
        await uploadSupplierCertificationFile(savedSupplier.id, file);
      }

      navigate('/suppliers', { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, ko.errorFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <PageTitle
        title={isEdit ? ko.editTitle : ko.createTitle}
        description={ko.description}
        actions={
          <Button variant="secondary" type="button" icon={<ArrowLeft className="h-4 w-4" />} onClick={handleCancel}>
            {ko.cancel}
          </Button>
        }
      />

      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {errorMessage}
        </div>
      ) : null}

      <form id="supplier-form" className="space-y-6" onSubmit={handleSubmit}>
        <Card className="p-6">
          <SectionTitle icon={<Building2 className="h-5 w-5" />} title={ko.basicInfo} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label={ko.companyName} placeholder="예: 테크브리지코리아" value={companyName} onChange={(event) => setCompanyName(event.target.value)} required />
            <Input label={ko.businessNumber} placeholder="000-00-00000" value={businessNumber} onChange={(event) => setBusinessNumber(event.target.value)} />
            <Input label={ko.companyType} placeholder="예: 중소기업, 중견기업" value={companyType} onChange={(event) => setCompanyType(event.target.value)} />
            <Input label={ko.representative} placeholder="대표자명" value={representativeName} onChange={(event) => setRepresentativeName(event.target.value)} />
            <Input label={ko.homepage} placeholder="https://example.co.kr" value={homepage} onChange={(event) => setHomepage(event.target.value)} />
            <Input label={ko.address} placeholder="본사 주소" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={<UserRound className="h-5 w-5" />} title={ko.contactInfo} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label={ko.contactName} placeholder="담당자명" value={contactName} onChange={(event) => setContactName(event.target.value)} />
            <Input label={ko.contactDepartment} placeholder="예: 사업개발팀 / 책임" value={contactDepartment} onChange={(event) => setContactDepartment(event.target.value)} />
            <Input label={ko.contactEmail} type="email" placeholder="manager@supplier.co.kr" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
            <Input label={ko.contactPhone} placeholder="010-0000-0000" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={<Brain className="h-5 w-5" />} title={ko.capabilityInfo} />
          <div className="space-y-6">
            <div>
              <div className="mb-2">
                <p className="font-label text-label-sm font-semibold text-on-surface-variant">{ko.coreTechnologies}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{ko.coreTechnologiesDesc}</p>
              </div>
              <div className="flex min-h-[100px] flex-wrap items-start gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
                {technologies.map((technology) => (
                  <span
                    key={technology}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-secondary-container px-3 font-label text-sm font-semibold text-on-secondary-container"
                  >
                    {technology}
                    <button type="button" onClick={() => setTechnologies((current) => current.filter((item) => item !== technology))}>
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
                <input
                  className="h-8 min-w-24 flex-1 border-none bg-transparent px-2 text-[16px] text-on-surface outline-none placeholder:text-on-surface-variant"
                  placeholder="+ 추가"
                  value={technologyInput}
                  onBlur={handleAddTechnology}
                  onChange={(event) => setTechnologyInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;
                    event.preventDefault();
                    handleAddTechnology();
                  }}
                />
              </div>
            </div>

            <div>
              <p className="mb-2 font-label text-label-sm font-semibold text-on-surface-variant">{ko.certifications}</p>
              <div className="grid gap-4 md:grid-cols-3">
                {certificationOptions.map((certification) => (
                  <CertificationOption
                    key={certification.title}
                    title={certification.title}
                    description={certification.description}
                    checked={certifications.includes(certification.title)}
                    onChange={(checked) =>
                      setCertifications((current) =>
                        checked ? [...current, certification.title] : current.filter((item) => item !== certification.title)
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-label text-label-sm font-semibold text-on-surface-variant">{ko.certificationFile}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-36 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center transition hover:bg-surface-container-low"
              >
                <UploadCloud className="mb-2 h-10 w-10 text-primary" />
                <span className="font-label text-[15px] font-semibold text-on-surface">
                  {certificationFiles.length > 0 ? `${certificationFiles.length}개 파일 선택됨` : '클릭해서 인증서 파일을 선택하세요'}
                </span>
                <span className="mt-1 break-all text-sm text-on-surface-variant">
                  {certificationFiles.length > 0 ? certificationFiles.map((file) => file.name).join(', ') : 'PDF, JPG, PNG (최대 10MB)'}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg"
                multiple
                className="hidden"
                onChange={(event) => setCertificationFiles(Array.from(event.target.files ?? []))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input label={ko.grade} placeholder="예: A, B+, 검토중" value={internalGrade} onChange={(event) => setInternalGrade(event.target.value)} />
              <label className="block">
                <span className="mb-2 block font-label text-label-sm text-on-surface-variant">{ko.status}</span>
                <select
                  className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                  value={managementStatus}
                  onChange={(event) => setManagementStatus(event.target.value as SupplierManagementStatus)}
                >
                  <option value="preferred">우수</option>
                  <option value="active">운영중</option>
                  <option value="review">검토중</option>
                  <option value="watch">주의</option>
                </select>
              </label>
              <Input label={ko.tags} placeholder="예: 우수, PM 강점, 일정 안정" value={tags} onChange={(event) => setTags(event.target.value)} />
              <Input label={ko.memo} placeholder="최근 평가, 협업 이슈, 강점 메모" value={memo} onChange={(event) => setMemo(event.target.value)} />
            </div>
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={handleCancel} disabled={isSubmitting}>
            {ko.cancel}
          </Button>
          <Button variant="secondary" type="button" disabled>
            {ko.saveDraft}
          </Button>
          <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>
            {isSubmitting ? ko.saving : isEdit ? ko.update : ko.create}
          </Button>
        </div>
      </form>
    </section>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <h2 className="font-headline text-[22px] font-bold text-on-surface">{title}</h2>
    </div>
  );
}

function CertificationOption({
  title,
  description,
  checked,
  onChange
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-20 cursor-pointer items-center rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition hover:bg-surface-container-low">
      <input
        type="checkbox"
        className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="ml-3">
        <span className="block font-label text-[15px] font-semibold text-on-surface">{title}</span>
        <span className="mt-1 block text-sm text-on-surface-variant">{description}</span>
      </span>
    </label>
  );
}
