import { ArrowRight, BarChart3, Building2, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react';
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
            <div className="flex items-center gap-3 text-primary">
              <Building2 className="h-10 w-10" />
              <h1 className="font-headline text-[42px] font-bold">ProcurePro</h1>
            </div>
            <p className="mt-3 font-label text-label-md uppercase text-on-surface-variant">BERYL Ecosystem</p>
          </div>
          <h2 className="mb-8 max-w-xl font-headline text-[40px] font-bold leading-tight text-on-surface">
            Connect to the largest institutional bidding network.
          </h2>
          <p className="mb-12 max-w-xl text-[20px] leading-9 text-on-surface-variant">
            Join a platform where institutional authority meets modern procurement efficiency. BERYL provides a secure,
            transparent, and authoritative digital vault for your bidding activities.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-7">
              <ShieldCheck className="mb-6 h-7 w-7 text-primary-container" />
              <h3 className="font-label text-[16px] font-bold">Secure Transactions</h3>
              <p className="mt-2 text-sm text-on-surface-variant">End-to-end encrypted procurement workflows.</p>
            </Card>
            <Card className="p-7">
              <BarChart3 className="mb-6 h-7 w-7 text-primary-container" />
              <h3 className="font-label text-[16px] font-bold">Data Precision</h3>
              <p className="mt-2 text-sm text-on-surface-variant">Advanced RFP analysis and yield reporting.</p>
            </Card>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-background p-12">
        <div className="w-full max-w-xl">
          <h2 className="font-headline text-[40px] font-bold">Create Account</h2>
          <p className="mb-10 mt-2 text-[18px] text-on-surface-variant">Enter your personal details to begin.</p>
          <div className="mb-10 flex gap-4">
            <div className="h-1.5 flex-1 rounded bg-primary-container" />
            <div className="h-1.5 flex-1 rounded bg-surface-container-highest" />
          </div>
          <div className="space-y-7">
            <Input label="Full Name" icon={<User className="h-5 w-5" />} placeholder="John Doe" />
            <Input label="Work Email" icon={<Mail className="h-5 w-5" />} placeholder="john@company.com" />
            <Input label="Password" icon={<LockKeyhole className="h-5 w-5" />} type="password" placeholder="••••••••" />
            <Input label="Confirm Password" icon={<LockKeyhole className="h-5 w-5" />} type="password" placeholder="••••••••" />
            <Button className="h-14 w-full" icon={<ArrowRight className="h-5 w-5" />}>Next: Organization Details</Button>
          </div>
          <p className="mt-12 text-center text-[16px] text-on-surface-variant">
            Already have an account? <span className="font-bold text-primary">Back to Login</span>
          </p>
        </div>
      </section>
    </div>
  );
}
