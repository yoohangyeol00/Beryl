import { ArrowRight, BarChart3, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import logo from '../../../assets/logo.png';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

export function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative flex flex-col justify-center overflow-hidden bg-surface-container p-12 lg:p-20">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),transparent_45%),linear-gradient(45deg,transparent_60%,rgba(255,255,255,0.35))]" />
        <div className="relative max-w-2xl">
          <div className="mb-20">
            <img src={logo} alt="BERYL" className="h-20 w-full max-w-xs object-contain object-left" />
          </div>
          <h2 className="mb-8 max-w-xl font-headline text-[40px] font-bold leading-tight text-on-surface">
            공공 입찰과 인력 매칭을 하나의 흐름으로 연결합니다.
          </h2>
          <p className="mb-12 max-w-xl text-[20px] leading-9 text-on-surface-variant">
            BERYL은 입찰 공고, RFP 분석, 공급기업 관리, 인력 배정을 안전하고 투명하게 운영하기 위한 통합 플랫폼입니다.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-7">
              <ShieldCheck className="mb-6 h-7 w-7 text-primary-container" />
              <h3 className="font-label text-[16px] font-bold">안전한 접근</h3>
              <p className="mt-2 text-sm text-on-surface-variant">기관 입찰 업무에 필요한 권한 기반 접근을 제공합니다.</p>
            </Card>
            <Card className="p-7">
              <BarChart3 className="mb-6 h-7 w-7 text-primary-container" />
              <h3 className="font-label text-[16px] font-bold">조달 인사이트</h3>
              <p className="mt-2 text-sm text-on-surface-variant">RFP 분석, 인력 추천, 사업 현황을 한곳에서 확인합니다.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-background p-12">
        <div className="w-full max-w-xl">
          <h2 className="font-headline text-[40px] font-bold">다시 오신 것을 환영합니다</h2>
          <p className="mb-10 mt-2 text-[18px] text-on-surface-variant">BERYL 계정으로 로그인해 업무를 이어가세요.</p>
          <div className="mb-10 h-1.5 w-1/2 rounded bg-primary-container" />
          <div className="space-y-7">
            <Input label="업무 이메일" icon={<Mail className="h-5 w-5" />} placeholder="name@company.com" />
            <Input label="비밀번호" icon={<LockKeyhole className="h-5 w-5" />} type="password" placeholder="비밀번호를 입력하세요" />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-on-surface-variant">
                <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                로그인 상태 유지
              </label>
              <button className="font-label font-semibold text-primary">비밀번호 찾기</button>
            </div>
            <Button className="h-14 w-full" icon={<ArrowRight className="h-5 w-5" />}>
              로그인
            </Button>
          </div>
          <p className="mt-12 text-center text-[16px] text-on-surface-variant">
            계정이 없으신가요? <span className="font-bold text-primary">회원가입</span>
          </p>
        </div>
      </section>
    </div>
  );
}
