import { BarChart3, ShieldCheck } from 'lucide-react';
import logo from '../../../assets/logo.png';
import { Card } from '../../../components/ui/Card';

export function SignupIntroPanel() {
  return (
    <section className="relative flex flex-col justify-center overflow-hidden bg-surface-container p-12 lg:p-20">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),transparent_45%),linear-gradient(45deg,transparent_60%,rgba(255,255,255,0.35))]" />
      <div className="relative max-w-2xl">
        <div className="mb-20">
          <img src={logo} alt="BERYL" className="h-20 w-full max-w-xs object-contain object-left" />
        </div>
        <h2 className="mb-8 max-w-xl font-headline text-[40px] font-bold leading-tight text-on-surface">
          공공 입찰 네트워크에 안전하게 참여하세요
        </h2>
        <p className="mb-12 max-w-xl text-[20px] leading-9 text-on-surface-variant">
          발주기관과 공급기업을 하나의 기업 기준으로 연결하고, 입찰 공고부터 계약과 투입 인력까지 한 흐름으로 관리합니다.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-7">
            <ShieldCheck className="mb-6 h-7 w-7 text-primary-container" />
            <h3 className="font-label text-[16px] font-bold">안전한 거래</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              입찰과 계약 정보를 기업 단위로 관리하고, 권한이 있는 사용자만 접근합니다.
            </p>
          </Card>
          <Card className="p-7">
            <BarChart3 className="mb-6 h-7 w-7 text-primary-container" />
            <h3 className="font-label text-[16px] font-bold">정확한 데이터</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              RFP 분석과 수주 현황 데이터를 기반으로 공고와 인력 추천 흐름을 추적합니다.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
