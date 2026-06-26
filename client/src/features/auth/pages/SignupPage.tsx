import { ArrowRight, BarChart3, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react';
import logo from '../../../assets/logo.png';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative flex flex-col justify-center overflow-hidden bg-surface-container p-12 lg:p-20">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),transparent_45%),linear-gradient(45deg,transparent_60%,rgba(255,255,255,0.35))]" />
        <div className="relative max-w-2xl">
          <div className="mb-20">
            <img src={logo} alt="BERYL" className="h-20 w-full max-w-xs object-contain object-left" />
          </div>
          <h2 className="mb-8 max-w-xl font-headline text-[40px] font-bold leading-tight text-on-surface">
            공공 입찰 네트워크에 안전하게 참여하세요.
          </h2>
          <p className="mb-12 max-w-xl text-[20px] leading-9 text-on-surface-variant">
            기관과 공급기업이 하나의 기준으로 입찰, 계약, 인력 배정 정보를 관리할 수 있도록 BERYL이 업무 흐름을 연결합니다.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-7">
              <ShieldCheck className="mb-6 h-7 w-7 text-primary-container" />
              <h3 className="font-label text-[16px] font-bold">안전한 거래</h3>
              <p className="mt-2 text-sm text-on-surface-variant">입찰과 계약 업무를 신뢰할 수 있는 환경에서 관리합니다.</p>
            </Card>
            <Card className="p-7">
              <BarChart3 className="mb-6 h-7 w-7 text-primary-container" />
              <h3 className="font-label text-[16px] font-bold">정확한 데이터</h3>
              <p className="mt-2 text-sm text-on-surface-variant">RFP 분석과 수주 현황을 데이터 기반으로 추적합니다.</p>
            </Card>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-background p-12">
        <div className="w-full max-w-xl">
          <h2 className="font-headline text-[40px] font-bold">계정 만들기</h2>
          <p className="mb-10 mt-2 text-[18px] text-on-surface-variant">서비스 이용을 위해 기본 정보를 입력해주세요.</p>
          <div className="mb-10 flex gap-4">
            <div className="h-1.5 flex-1 rounded bg-primary-container" />
            <div className="h-1.5 flex-1 rounded bg-surface-container-highest" />
          </div>
          <div className="space-y-7">
            <Input label="이름" icon={<User className="h-5 w-5" />} placeholder="홍길동" />
            <Input label="업무 이메일" icon={<Mail className="h-5 w-5" />} placeholder="name@company.com" />
            <Input label="비밀번호" icon={<LockKeyhole className="h-5 w-5" />} type="password" placeholder="비밀번호를 입력하세요" />
            <Input label="비밀번호 확인" icon={<LockKeyhole className="h-5 w-5" />} type="password" placeholder="비밀번호를 다시 입력하세요" />
            <Button className="h-14 w-full" icon={<ArrowRight className="h-5 w-5" />}>
              다음: 조직 정보 입력
            </Button>
          </div>
          <p className="mt-12 text-center text-[16px] text-on-surface-variant">
            이미 계정이 있으신가요? <span className="font-bold text-primary">로그인으로 돌아가기</span>
          </p>
        </div>
      </section>
    </div>
  );
}
