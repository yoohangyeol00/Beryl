import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function SupplierFormPage() {
  return (
    <section>
      <PageTitle title="공급기업 등록 및 수정" description="기업 기본 정보, 담당자, 수행 가능 분야를 관리합니다." />
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="기업명" placeholder="베릴소프트" />
          <Input label="사업자등록번호" placeholder="000-00-00000" />
          <Input label="대표 담당자" placeholder="정하늘" />
          <Input label="담당자 이메일" placeholder="manager@supplier.co.kr" />
          <Input label="전문 분야" placeholder="SI, AI 분석, 데이터 플랫폼" />
          <Input label="계약 등급" placeholder="A" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary">취소</Button>
          <Button>저장</Button>
        </div>
      </Card>
    </section>
  );
}
