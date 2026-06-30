import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createResume, getResume, updateResume } from '../../../api/resumesApi';
import { getApiErrorMessage } from '../../../api/apiResponse';
import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import type { AvailabilityStatus, ResumeMutationPayload } from '../../../types/resume';

type FormState = {
  name: string;
  role: string;
  careerYears: string;
  availableFrom: string;
  availabilityStatus: AvailabilityStatus;
  employmentStatus: string;
  skills: string;
};

const initialForm: FormState = {
  name: '',
  role: '',
  careerYears: '',
  availableFrom: '',
  availabilityStatus: 'available',
  employmentStatus: '',
  skills: ''
};

export function ResumeFormPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resumeId } = useParams();
  const isEdit = Boolean(resumeId);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errorMessage, setErrorMessage] = useState('');

  const resumeQuery = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => getResume(resumeId ?? ''),
    enabled: isEdit
  });

  useEffect(() => {
    if (!resumeQuery.data) return;

    setForm({
      name: resumeQuery.data.name,
      role: resumeQuery.data.role,
      careerYears: resumeQuery.data.careerYears ? String(resumeQuery.data.careerYears) : '',
      availableFrom: resumeQuery.data.availableFrom,
      availabilityStatus: resumeQuery.data.availabilityStatus,
      employmentStatus: resumeQuery.data.employmentStatus,
      skills: resumeQuery.data.skills.join(', ')
    });
  }, [resumeQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: ResumeMutationPayload) => (resumeId ? updateResume(resumeId, payload) : createResume(payload)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resumes'] });
      if (resumeId) {
        await queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      }
      navigate('/manpower');
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, '인력 정보를 저장하지 못했습니다.'));
    }
  });

  const updateField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    saveMutation.mutate({
      name: form.name,
      role: form.role,
      careerYears: form.careerYears ? Number(form.careerYears) : '',
      availableFrom: form.availableFrom,
      availabilityStatus: form.availabilityStatus,
      employmentStatus: form.employmentStatus,
      skills: form.skills
    });
  };

  return (
    <section>
      <PageTitle
        title={isEdit ? '인력 정보 수정' : '인력 입력'}
        description="제안 추천과 투입현황 관리에 사용할 인력 기본 정보를 등록합니다."
        actions={
          <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('/manpower')}>
            목록
          </Button>
        }
      />

      <Card className="p-6">
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="이름" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
            <Input label="역할/등급" value={form.role} onChange={(event) => updateField('role', event.target.value)} placeholder="예: Backend, PM, DevOps" />
            <Input
              label="경력 연차"
              type="number"
              min={0}
              value={form.careerYears}
              onChange={(event) => updateField('careerYears', event.target.value)}
            />
            <Input label="다음 가용일" type="date" value={form.availableFrom} onChange={(event) => updateField('availableFrom', event.target.value)} />
            <label className="block">
              <span className="mb-2 block font-label text-label-sm text-on-surface-variant">상태</span>
              <select
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body text-[16px] text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                value={form.availabilityStatus}
                onChange={(event) => updateField('availabilityStatus', event.target.value)}
              >
                <option value="available">가용</option>
                <option value="assigned">투입중</option>
                <option value="partiallyAssigned">부분투입</option>
                <option value="unavailable">교체검토</option>
              </select>
            </label>
            <Input
              label="고용/계약 상태"
              value={form.employmentStatus}
              onChange={(event) => updateField('employmentStatus', event.target.value)}
              placeholder="예: 정규직, 프리랜서, 협력사"
            />
          </div>

          <label className="block">
            <span className="mb-2 block font-label text-label-sm text-on-surface-variant">보유 기술</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-[16px] text-on-surface outline-none transition placeholder:text-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/25"
              value={form.skills}
              onChange={(event) => updateField('skills', event.target.value)}
              placeholder="React, TypeScript, Spring Boot처럼 쉼표로 구분"
            />
          </label>

          {errorMessage ? <p className="font-body text-[14px] text-error">{errorMessage}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/manpower')}>
              취소
            </Button>
            <Button type="submit" icon={<Save className="h-4 w-4" />} disabled={saveMutation.isPending || resumeQuery.isLoading}>
              저장
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
