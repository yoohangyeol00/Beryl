import { PageTitle } from '../../../components/common/PageTitle';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function AgencyFormPage() {
  return (
    <section>
      <PageTitle title="발주기관 등록 및 수정" description="기관 기본 정보와 담당 조직 정보를 입력합니다." />
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="기관명" placeholder="조달청" />
          <Input label="기관 코드" placeholder="PPS-001" />
          <Input label="대표 부서" placeholder="디지털조달기획과" />
          <Input label="담당자" placeholder="김민준" />
          <Input label="담당자 이메일" placeholder="manager@agency.go.kr" />
          <Input label="연락처" placeholder="02-0000-0000" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary">취소</Button>
          <Button>저장</Button>
        </div>
      </Card>
    </section>
  );
}
