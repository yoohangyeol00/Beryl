import { Calendar, FileText, Save, Send, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../../components/common/PageTitle';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable';

type Candidate = {
  id: string;
  name: string;
  role: string;
  grade: string;
  availableFrom: string;
  rate: string;
  fitScore: number;
};

const ko = {
  title: '\uC81C\uC548\uC11C \uC0DD\uC131',
  desc: '\uC785\uCC30\uACF5\uACE0\uC758 RFP \uC694\uAD6C\uC0AC\uD56D\uC744 \uAE30\uBC18\uC73C\uB85C \uC81C\uC548 \uC778\uB825, \uB2E8\uAC00, \uD22C\uC785 \uC77C\uC815, \uC81C\uCD9C \uC0C1\uD0DC\uB97C \uC791\uC131\uD569\uB2C8\uB2E4.',
  saveDraft: '\uC784\uC2DC\uC800\uC7A5',
  submit: '\uC81C\uC548\uC11C \uC81C\uCD9C',
  projectInfo: '\uB300\uC0C1 \uC785\uCC30\uACF5\uACE0',
  projectName: '\uCC28\uC138\uB300 \uD1B5\uD569 \uC7AC\uB09C \uC548\uC804 \uAD00\uB9AC \uC2DC\uC2A4\uD15C \uAD6C\uCD95',
  agency: '\uBC1C\uC8FC\uAE30\uAD00',
  agencyValue: '\uC18C\uBC29\uCCAD',
  noticeNo: '\uACF5\uACE0\uBC88\uD638',
  budget: '\uCD94\uC815 \uC608\uC0B0',
  deadline: '\uC81C\uC548 \uB9C8\uAC10',
  proposalBase: '\uC81C\uC548 \uAE30\uBCF8 \uC815\uBCF4',
  proposalTitle: '\uC81C\uC548\uBA85',
  proposalTitlePh: '\uC7AC\uB09C \uC548\uC804 \uAD00\uB9AC \uC2DC\uC2A4\uD15C \uAD6C\uCD95 \uC81C\uC548',
  manager: '\uC81C\uC548 \uB2F4\uB2F9\uC790',
  managerPh: '\uAE40\uC81C\uC548 \uD300\uC7A5',
  amount: '\uC81C\uC548 \uAE08\uC561',
  amountPh: '8,650,000,000 KRW',
  startDate: '\uD22C\uC785 \uC608\uC815\uC77C',
  duration: '\uC608\uC0C1 \uC218\uD589 \uAE30\uAC04',
  durationPh: '12\uAC1C\uC6D4',
  strategy: '\uC81C\uC548 \uC804\uB7B5 \uBA54\uBAA8',
  strategyPh: 'RFP\uC758 \uD575\uC2EC \uC694\uAD6C\uC0AC\uD56D, \uB2F9\uC0AC \uAC15\uC810, \uB9AC\uC2A4\uD06C \uB300\uC751 \uBC29\uC548\uC744 \uC815\uB9AC\uD558\uC138\uC694.',
  peopleTitle: '\uC81C\uC548 \uC778\uB825 \uAD6C\uC131',
  rfpSummary: 'RFP \uC694\uAD6C \uC694\uC57D',
  checklist: '\uC81C\uCD9C \uCCB4\uD06C\uB9AC\uC2A4\uD2B8',
  name: '\uC774\uB984',
  role: '\uC5ED\uD560',
  grade: '\uB4F1\uAE09',
  availableFrom: '\uAC00\uC6A9\uC77C',
  rate: '\uC81C\uC548 \uB2E8\uAC00',
  fit: '\uC801\uD569\uB3C4',
  requirement1: '\uD544\uC218 \uAE30\uC220: Java/Spring, MSA, Kubernetes',
  requirement2: '\uC8FC\uC694 \uC0B0\uCD9C\uBB3C: \uC124\uACC4\uC11C, \uAC1C\uBC1C\uC0B0\uCD9C\uBB3C, \uC6B4\uC601\uC774\uAD00 \uACC4\uD68D',
  requirement3: '\uD3C9\uAC00 \uD3EC\uC778\uD2B8: \uC720\uC0AC \uACF5\uACF5 \uC0AC\uC5C5 \uACBD\uD5D8\uACFC \uD22C\uC785 \uAC00\uC6A9\uC131',
  check1: 'RFP \uCCA8\uBD80\uD30C\uC77C \uD655\uC778',
  check2: '\uC81C\uC548 \uC778\uB825 \uAC00\uC6A9\uC77C \uD655\uC778',
  check3: '\uB2E8\uAC00/\uC608\uC0B0 \uC801\uD569\uC131 \uAC80\uD1A0',
  check4: '\uC81C\uCD9C \uB9C8\uAC10 \uC804 \uCD5C\uC885 \uAC80\uD1A0',
  point: '\uC810'
};

const candidates: Candidate[] = [
  { id: 'c-1', name: '\uAE40\uB3C4\uC724', role: 'PM/\uC544\uD0A4\uD14D\uD2B8', grade: '\uD2B9\uAE09', availableFrom: '2026-08-01', rate: '\uC6D4 1,600\uB9CC\uC6D0', fitScore: 92 },
  { id: 'c-2', name: '\uC774\uC11C\uC5F0', role: 'Frontend', grade: '\uACE0\uAE09', availableFrom: '2026-08-16', rate: '\uC6D4 1,100\uB9CC\uC6D0', fitScore: 86 },
  { id: 'c-3', name: '\uBC15\uC9C0\uD6C8', role: 'Backend', grade: '\uACE0\uAE09', availableFrom: '2026-07-01', rate: '\uC6D4 1,100\uB9CC\uC6D0', fitScore: 81 }
];

const columns: DataTableColumn<Candidate>[] = [
  { key: 'name', header: ko.name, render: (row) => <strong>{row.name}</strong> },
  { key: 'role', header: ko.role },
  { key: 'grade', header: ko.grade },
  { key: 'availableFrom', header: ko.availableFrom },
  { key: 'rate', header: ko.rate, align: 'right' },
  { key: 'fitScore', header: ko.fit, align: 'right', render: (row) => `${row.fitScore}${ko.point}` }
];

export function ProposalCreatePage() {
  const navigate = useNavigate();

  return (
    <section>
      <PageTitle
        title={ko.title}
        description={ko.desc}
        actions={
          <>
            <Button variant="secondary" icon={<Save className="h-4 w-4" />}>{ko.saveDraft}</Button>
            <Button icon={<Send className="h-4 w-4" />} onClick={() => navigate('/bid-participation')}>{ko.submit}</Button>
          </>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card className="p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-outline-variant pb-5">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">{ko.projectInfo}</h2>
              <Badge tone="danger">D-4</Badge>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Info label={ko.projectName} value="20261012345-00" wide />
              <Info label={ko.agency} value={ko.agencyValue} />
              <Info label={ko.budget} value="8,900,000,000 KRW" />
              <Info label={ko.deadline} value="2026-07-03 14:00" />
            </div>
          </Card>

          <Card className="p-7">
            <div className="mb-6 flex items-center gap-3 border-b border-outline-variant pb-5">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="font-headline text-[26px] font-bold">{ko.proposalBase}</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Input label={ko.proposalTitle} placeholder={ko.proposalTitlePh} />
              <Input label={ko.manager} placeholder={ko.managerPh} />
              <Input label={ko.amount} placeholder={ko.amountPh} />
              <Input label={ko.startDate} type="date" />
              <Input label={ko.duration} placeholder={ko.durationPh} />
            </div>
            <textarea className="mt-5 min-h-40 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-[16px] leading-7 outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim" placeholder={ko.strategyPh} />
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-outline-variant p-6">
              <h2 className="flex items-center gap-3 font-headline text-[26px] font-bold"><Users className="h-6 w-6 text-primary" />{ko.peopleTitle}</h2>
            </div>
            <DataTable columns={columns} data={candidates} getRowKey={(row) => row.id} tableClassName="min-w-[820px] w-full" />
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-headline text-[22px] font-bold"><Calendar className="h-5 w-5 text-primary" />{ko.rfpSummary}</h3>
            <ul className="space-y-3 text-sm leading-6 text-on-surface-variant">
              {[ko.requirement1, ko.requirement2, ko.requirement3].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="mb-4 font-headline text-[22px] font-bold">{ko.checklist}</h3>
            <ul className="space-y-3 text-sm leading-6 text-on-surface-variant">
              {[ko.check1, ko.check2, ko.check3, ko.check4].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-2 w-2 rounded-full bg-primary" />{item}</li>)}
            </ul>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <p className="text-sm text-on-surface-variant">{label}</p>
      <p className="mt-2 font-headline text-[19px] font-bold text-on-surface">{value}</p>
    </div>
  );
}