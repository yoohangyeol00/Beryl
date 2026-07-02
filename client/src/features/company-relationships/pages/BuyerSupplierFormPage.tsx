import { ArrowLeft, Brain, Building2, ClipboardList, Save, UploadCloud, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/apiResponse';
import {
  createSupplierRelationship,
  getSupplierRelationships,
  getSupplierRelationship,
  updateSupplierRelationship,
  uploadSupplierCertificationFile,
  type CreateSupplierRelationshipRequest,
  type SupplierRelationship,
  type SupplierManagementStatus
} from '../../../api/suppliersApi';
import { LoadingState } from '../../../components/common/LoadingState';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { getSupplierClientsPath, getSupplierPoolPath } from '../../modes/roleMode';
import { certificationOptions, supplierFormLabels, supplierStatusLabel } from '../labels';

type RelationshipType = NonNullable<CreateSupplierRelationshipRequest['relationship']>['relationshipType'];

export function BuyerSupplierFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { supplierId } = useParams();
  const isEdit = Boolean(supplierId);
  const isSupplierClientMode = location.pathname.startsWith('/supplier/clients');
  const listPath = isSupplierClientMode ? getSupplierClientsPath() : getSupplierPoolPath();
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
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(isSupplierClientMode ? 'won_project' : 'preferred_partner');
  const [relationshipId, setRelationshipId] = useState(supplierId ?? '');
  const [isLoadingDetail, setIsLoadingDetail] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [initialSnapshot, setInitialSnapshot] = useState('');
  const formSnapshot = useMemo(
    () =>
      buildFormSnapshot({
        companyName,
        businessNumber,
        companyType,
        representativeName,
        homepage,
        address,
        contactName,
        contactDepartment,
        contactEmail,
        contactPhone,
        technologies,
        certifications,
        internalGrade,
        managementStatus,
        tags,
        memo,
        relationshipType
      }),
    [
      address,
      businessNumber,
      certifications,
      companyName,
      companyType,
      contactDepartment,
      contactEmail,
      contactName,
      contactPhone,
      homepage,
      internalGrade,
      managementStatus,
      memo,
      relationshipType,
      representativeName,
      tags,
      technologies
    ]
  );
  const isDirty = Boolean(initialSnapshot) && formSnapshot !== initialSnapshot;

  useEffect(() => {
    if (!supplierId) {
      setIsLoadingDetail(false);
      setInitialSnapshot(formSnapshot);
      return;
    }

    let isMounted = true;
    setIsLoadingDetail(true);
    setErrorMessage('');

    getSupplierRelationship(supplierId, { perspective: isSupplierClientMode ? 'supplier' : 'buyer' })
      .catch(async (error) => {
        if (!isSupplierClientMode) {
          throw error;
        }

        const relationships = await getSupplierRelationships({ perspective: 'supplier' });
        const fallback = relationships.items.find((item) => item.id === supplierId || item.targetCompany.id === supplierId);

        if (!fallback) {
          throw error;
        }

        return fallback;
      })
      .then((supplier) => {
        if (!isMounted) return;
        applyRelationshipToForm(supplier, isSupplierClientMode ? 'won_project' : 'preferred_partner');
        setInitialSnapshot(buildRelationshipSnapshot(supplier, isSupplierClientMode ? 'won_project' : 'preferred_partner'));
        setErrorMessage('');
      })
      .catch((error) => {
        if (!isMounted) return;
        if (isSupplierClientMode) {
          setRelationshipId('');
          setErrorMessage('');
          setDraftMessage('거래처 연결 정보를 확인하지 못했습니다. 수정 후 저장하면 거래처 관계를 다시 연결합니다.');
          return;
        }
        setErrorMessage(getApiErrorMessage(error, isSupplierClientMode ? '거래처 정보를 불러오지 못했습니다.' : '공급기업 정보를 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isSupplierClientMode, supplierId]);

  const handleCancel = () => {
    navigate(listPath);
  };

  const handleAddTechnology = () => {
    const nextTechnology = technologyInput.trim();
    if (!nextTechnology || technologies.includes(nextTechnology)) return;

    setTechnologies((current) => [...current, nextTechnology]);
    setTechnologyInput('');
  };

  const applyRelationshipToForm = (supplier: SupplierRelationship, fallbackRelationshipType: RelationshipType) => {
    setRelationshipId(supplier.id);
    setCompanyName(supplier.targetCompany.name);
    setBusinessNumber(supplier.targetCompany.businessRegistrationNo ?? '');
    setCompanyType(supplier.targetCompany.companyType ?? '');
    setRepresentativeName(supplier.targetCompany.representativeName ?? '');
    setHomepage(supplier.targetCompany.websiteUrl ?? '');
    setAddress(supplier.targetCompany.address ?? '');
    setContactName(supplier.contact?.name ?? '');
    setContactDepartment(supplier.contact?.department ?? supplier.contact?.position ?? '');
    setContactEmail(supplier.contact?.email ?? supplier.targetCompany.contactEmail ?? '');
    setContactPhone(supplier.contact?.phone ?? supplier.targetCompany.contactPhone ?? '');
    setTechnologies(supplier.capabilities);
    setCertifications(supplier.certifications);
    setInternalGrade(supplier.internalGrade ?? '');
    setManagementStatus(supplier.managementStatus ?? 'active');
    setTags(supplier.tags ?? '');
    setMemo(supplier.memo ?? '');
    setRelationshipType((supplier.relationshipType as RelationshipType) ?? fallbackRelationshipType);
  };

  const handleSaveDraft = () => {
    const draftKey = `beryl-company-relationship-draft:${isSupplierClientMode ? 'supplier' : 'buyer'}:${supplierId ?? 'new'}`;
    window.localStorage.setItem(draftKey, formSnapshot);
    setDraftMessage('임시 저장했습니다.');
    setInitialSnapshot(formSnapshot);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload: CreateSupplierRelationshipRequest = {
        company: {
          name: companyName,
          businessRegistrationNo: isSupplierClientMode ? undefined : businessNumber,
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
        capabilities: isSupplierClientMode ? [] : technologies,
        certifications: isSupplierClientMode ? [] : certifications,
        relationship: {
          sourcePerspective: isSupplierClientMode ? 'supplier' : 'buyer',
          relationshipType,
          internalGrade,
          managementStatus,
          tags,
          memo
        }
      };

      const savedSupplier = isEdit && relationshipId
        ? await updateSupplierRelationship(relationshipId, payload)
        : await createSupplierRelationship(payload);

      for (const file of certificationFiles) {
        await uploadSupplierCertificationFile(savedSupplier.id, file);
      }

      navigate(listPath, { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, supplierFormLabels.errorFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <PageTitle
        title={isSupplierClientMode ? (isEdit ? '거래처 수정' : '거래처 등록') : isEdit ? supplierFormLabels.editTitle : supplierFormLabels.createTitle}
        description={isSupplierClientMode ? '수행사업과 연결된 발주기관 거래처의 담당자, 관리 등급, 메모를 관리합니다.' : supplierFormLabels.description}
        actions={
          <Button variant="secondary" type="button" icon={<ArrowLeft className="h-4 w-4" />} onClick={handleCancel}>
            {supplierFormLabels.cancel}
          </Button>
        }
      />

      {errorMessage ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error-container px-5 py-4 font-semibold text-on-error-container">
          {errorMessage}
        </div>
      ) : null}
      {draftMessage ? (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-5 py-4 font-semibold text-primary">
          {draftMessage}
        </div>
      ) : null}

      {isLoadingDetail ? <LoadingState /> : null}

      {!isLoadingDetail ? (
      <form id="supplier-form" className="space-y-6" onSubmit={handleSubmit}>
        <Card className="p-6">
          <SectionTitle icon={<Building2 className="h-5 w-5" />} title={supplierFormLabels.basicInfo} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={supplierFormLabels.companyName}
              placeholder="예: 테크브릿지코리아"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
            {!isSupplierClientMode ? (
              <Input
                label={supplierFormLabels.businessNumber}
                placeholder="000-00-00000"
                value={businessNumber}
                onChange={(event) => setBusinessNumber(event.target.value)}
              />
            ) : null}
            <Input
              label={supplierFormLabels.companyType}
              placeholder="예: 중소기업, 중견기업"
              value={companyType}
              onChange={(event) => setCompanyType(event.target.value)}
            />
            <Input
              label={supplierFormLabels.representative}
              placeholder="대표자명"
              value={representativeName}
              onChange={(event) => setRepresentativeName(event.target.value)}
            />
            <Input
              label={supplierFormLabels.homepage}
              placeholder="https://example.co.kr"
              value={homepage}
              onChange={(event) => setHomepage(event.target.value)}
            />
            <Input label={supplierFormLabels.address} placeholder="본사 주소" value={address} onChange={(event) => setAddress(event.target.value)} />
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={<UserRound className="h-5 w-5" />} title={supplierFormLabels.contactInfo} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={supplierFormLabels.contactName}
              placeholder="담당자명"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
            />
            <Input
              label={supplierFormLabels.contactDepartment}
              placeholder="예: 사업개발팀 / 책임"
              value={contactDepartment}
              onChange={(event) => setContactDepartment(event.target.value)}
            />
            <Input
              label={supplierFormLabels.contactEmail}
              type="email"
              placeholder="manager@supplier.co.kr"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
            <Input
              label={supplierFormLabels.contactPhone}
              placeholder="010-0000-0000"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />
          </div>
        </Card>

        {isSupplierClientMode ? (
          <Card className="p-6">
            <SectionTitle icon={<ClipboardList className="h-5 w-5" />} title="거래 관리 정보" />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="관리 등급"
                placeholder="예: 핵심 발주처, 정기 거래, 확인 필요"
                value={internalGrade}
                onChange={(event) => setInternalGrade(event.target.value)}
              />
              <label className="block">
                <span className="mb-2 block font-label text-label-sm text-on-surface-variant">관리 상태</span>
                <select
                  className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                  value={managementStatus}
                  onChange={(event) => setManagementStatus(event.target.value as SupplierManagementStatus)}
                >
                  <option value="preferred">핵심 거래처</option>
                  <option value="active">운영중</option>
                  <option value="review">검토중</option>
                  <option value="watch">주의 필요</option>
                </select>
              </label>
              <Input label="관리 태그" placeholder="예: 정산 빠름, 의사결정 느림, 장기계약 가능" value={tags} onChange={(event) => setTags(event.target.value)} />
              <Input label="담당 메모" placeholder="계약/검수/정산/커뮤니케이션 특이사항" value={memo} onChange={(event) => setMemo(event.target.value)} />
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <SectionTitle icon={<Brain className="h-5 w-5" />} title={supplierFormLabels.capabilityInfo} />
            <div className="space-y-6">
              <div>
                <div className="mb-2">
                  <p className="font-label text-label-sm font-semibold text-on-surface-variant">{supplierFormLabels.coreTechnologies}</p>
                  <p className="mt-1 text-sm text-on-surface-variant">{supplierFormLabels.coreTechnologiesDesc}</p>
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
                    placeholder={supplierFormLabels.addTechnology}
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
                <p className="mb-2 font-label text-label-sm font-semibold text-on-surface-variant">{supplierFormLabels.certifications}</p>
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
                <p className="mb-2 font-label text-label-sm font-semibold text-on-surface-variant">{supplierFormLabels.certificationFile}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-36 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center transition hover:bg-surface-container-low"
                >
                  <UploadCloud className="mb-2 h-10 w-10 text-primary" />
                  <span className="font-label text-[15px] font-semibold text-on-surface">
                    {certificationFiles.length > 0
                      ? `${certificationFiles.length}${supplierFormLabels.uploadSelected}`
                      : supplierFormLabels.uploadEmpty}
                  </span>
                  <span className="mt-1 break-all text-sm text-on-surface-variant">
                    {certificationFiles.length > 0 ? certificationFiles.map((file) => file.name).join(', ') : supplierFormLabels.uploadHelp}
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
                <Input
                  label={supplierFormLabels.grade}
                  placeholder="예: A, B+, 검토중"
                  value={internalGrade}
                  onChange={(event) => setInternalGrade(event.target.value)}
                />
                <label className="block">
                  <span className="mb-2 block font-label text-label-sm text-on-surface-variant">{supplierFormLabels.status}</span>
                  <select
                    className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                    value={managementStatus}
                    onChange={(event) => setManagementStatus(event.target.value as SupplierManagementStatus)}
                  >
                    <option value="preferred">{supplierStatusLabel.preferred}</option>
                    <option value="active">{supplierStatusLabel.active}</option>
                    <option value="review">{supplierStatusLabel.review}</option>
                    <option value="watch">{supplierStatusLabel.watch}</option>
                  </select>
                </label>
                <Input label={supplierFormLabels.tags} placeholder="예: 우수, PM 강점, 일정 안정" value={tags} onChange={(event) => setTags(event.target.value)} />
                <Input label={supplierFormLabels.memo} placeholder="최근 평가, 작업 이슈, 강점 메모" value={memo} onChange={(event) => setMemo(event.target.value)} />
              </div>
            </div>
          </Card>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" type="button" onClick={handleCancel} disabled={isSubmitting}>
            {supplierFormLabels.cancel}
          </Button>
          <Button variant="secondary" type="button" onClick={handleSaveDraft} disabled={!isDirty || isSubmitting}>
            {supplierFormLabels.saveDraft}
          </Button>
          <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={isSubmitting}>
            {isSubmitting ? supplierFormLabels.saving : isEdit ? supplierFormLabels.update : supplierFormLabels.create}
          </Button>
        </div>
      </form>
      ) : null}
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

type RelationshipFormSnapshot = {
  companyName: string;
  businessNumber: string;
  companyType: string;
  representativeName: string;
  homepage: string;
  address: string;
  contactName: string;
  contactDepartment: string;
  contactEmail: string;
  contactPhone: string;
  technologies: string[];
  certifications: string[];
  internalGrade: string;
  managementStatus: SupplierManagementStatus;
  tags: string;
  memo: string;
  relationshipType: RelationshipType;
};

function buildRelationshipSnapshot(supplier: SupplierRelationship, fallbackRelationshipType: RelationshipType) {
  return buildFormSnapshot({
    companyName: supplier.targetCompany.name,
    businessNumber: supplier.targetCompany.businessRegistrationNo ?? '',
    companyType: supplier.targetCompany.companyType ?? '',
    representativeName: supplier.targetCompany.representativeName ?? '',
    homepage: supplier.targetCompany.websiteUrl ?? '',
    address: supplier.targetCompany.address ?? '',
    contactName: supplier.contact?.name ?? '',
    contactDepartment: supplier.contact?.department ?? supplier.contact?.position ?? '',
    contactEmail: supplier.contact?.email ?? supplier.targetCompany.contactEmail ?? '',
    contactPhone: supplier.contact?.phone ?? supplier.targetCompany.contactPhone ?? '',
    technologies: supplier.capabilities,
    certifications: supplier.certifications,
    internalGrade: supplier.internalGrade ?? '',
    managementStatus: supplier.managementStatus ?? 'active',
    tags: supplier.tags ?? '',
    memo: supplier.memo ?? '',
    relationshipType: (supplier.relationshipType as RelationshipType) ?? fallbackRelationshipType
  });
}

function buildFormSnapshot(value: RelationshipFormSnapshot) {
  return JSON.stringify({
    ...value,
    technologies: [...value.technologies].sort(),
    certifications: [...value.certifications].sort()
  });
}
