import { BarChart3, ShieldCheck } from 'lucide-react';
import logo from '../../../assets/logo.png';
import { Card } from '../../../components/ui/Card';

export function LoginIntroPanel() {
  return (
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
            <p className="mt-2 text-sm text-on-surface-variant">
              기업 입찰 업무에 필요한 권한 기반 접근을 제공합니다.
            </p>
          </Card>
          <Card className="p-7">
            <BarChart3 className="mb-6 h-7 w-7 text-primary-container" />
            <h3 className="font-label text-[16px] font-bold">조달 인사이트</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              RFP 분석, 인력 추천, 사업 현황을 한 화면에서 확인합니다.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
