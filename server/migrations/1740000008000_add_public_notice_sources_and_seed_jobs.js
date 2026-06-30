export const shorthands = undefined;

const publicBuyers = [
  ['조달청', 'public_agency'],
  ['정보통신산업진흥원', 'public_agency'],
  ['한국지능정보사회진흥원', 'public_agency']
];

const seedJobs = [
  {
    noticeNumber: 'NARA-2026-000841',
    buyerName: '조달청',
    title: '차세대 통합 전자조달 업무지원 시스템 구축',
    category: 'Java, Spring Boot, React, PostgreSQL',
    procurementType: 'public',
    sourceType: 'nara',
    sourceUrl: 'https://www.g2b.go.kr/',
    budget: 2450000000,
    publishedAt: '2026-06-24',
    deadline: '2026-07-15',
    status: 'open',
    rfpScore: 82,
    recommendedPeople: 8,
    description:
      '나라장터 수집 공고 샘플입니다.\n\n전자조달 업무 포털 고도화, 통합 검색, RFP 분석 및 업무 모니터링 기능 구축을 포함합니다.'
  },
  {
    noticeNumber: 'NIPA-2026-SW-017',
    buyerName: '정보통신산업진흥원',
    title: 'AI 기반 SW기업 지원사업 통합관리 플랫폼 운영 및 고도화',
    category: 'AI, 데이터 분석, Node.js, React',
    procurementType: 'public',
    sourceType: 'nipa',
    sourceUrl: 'https://www.nipa.kr/',
    budget: 980000000,
    publishedAt: '2026-06-21',
    deadline: '2026-07-08',
    status: 'closingSoon',
    rfpScore: 76,
    recommendedPeople: 5,
    description:
      'NIPA 수집 공고 샘플입니다.\n\n지원사업 신청, 평가, 협약, 성과관리 데이터를 통합하고 AI 기반 사업 현황 분석을 제공합니다.'
  },
  {
    noticeNumber: 'NIA-2026-DX-042',
    buyerName: '한국지능정보사회진흥원',
    title: '공공 디지털서비스 이용지원 포털 기능 개선 및 운영',
    category: 'Cloud, DevOps, TypeScript, Accessibility',
    procurementType: 'public',
    sourceType: 'nia',
    sourceUrl: 'https://www.nia.or.kr/',
    budget: 1320000000,
    publishedAt: '2026-06-18',
    deadline: '2026-07-22',
    status: 'open',
    rfpScore: 88,
    recommendedPeople: 6,
    description:
      'NIA 수집 공고 샘플입니다.\n\n공공 디지털서비스 이용지원 포털의 접근성, 검색, 운영 자동화, 통계 기능 개선을 포함합니다.'
  }
];

function q(value) {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

export function up(pgm) {
  pgm.sql('alter table jobs drop constraint jobs_source_type_check');
  pgm.addConstraint('jobs', 'jobs_source_type_check', {
    check: "source_type in ('nara', 'nipa', 'nia', 'private_bid', 'manual', 'email', 'other')"
  });
  pgm.createIndex('jobs', 'source_type');
  pgm.createIndex('jobs', 'procurement_type');

  for (const [name, companyType] of publicBuyers) {
    pgm.sql(
      `
        insert into companies (name, company_type, status, supports_buyer, supports_supplier)
        select ${q(name)}, ${q(companyType)}, 'active', true, false
        where not exists (
          select 1 from companies where lower(name) = lower(${q(name)})
        )
      `
    );
  }

  for (const job of seedJobs) {
    pgm.sql(
      `
        insert into jobs (
          buyer_company_id,
          notice_number,
          title,
          category,
          procurement_type,
          source_type,
          source_url,
          budget,
          published_at,
          deadline,
          status,
          rfp_score,
          recommended_people_count,
          description
        )
        select
          c.id,
          ${q(job.noticeNumber)},
          ${q(job.title)},
          ${q(job.category)},
          ${q(job.procurementType)},
          ${q(job.sourceType)},
          ${q(job.sourceUrl)},
          ${q(job.budget)},
          ${q(job.publishedAt)},
          ${q(job.deadline)},
          ${q(job.status)},
          ${q(job.rfpScore)},
          ${q(job.recommendedPeople)},
          ${q(job.description)}
        from companies c
        where lower(c.name) = lower(${q(job.buyerName)})
        limit 1
        on conflict (notice_number)
        do update set
          buyer_company_id = excluded.buyer_company_id,
          title = excluded.title,
          category = excluded.category,
          procurement_type = excluded.procurement_type,
          source_type = excluded.source_type,
          source_url = excluded.source_url,
          budget = excluded.budget,
          published_at = excluded.published_at,
          deadline = excluded.deadline,
          status = excluded.status,
          rfp_score = excluded.rfp_score,
          recommended_people_count = excluded.recommended_people_count,
          description = excluded.description,
          updated_at = now()
      `
    );
  }
}

export function down(pgm) {
  pgm.sql(
    `
      delete from jobs
      where notice_number in ('NARA-2026-000841', 'NIPA-2026-SW-017', 'NIA-2026-DX-042')
    `
  );
  pgm.dropIndex('jobs', 'procurement_type');
  pgm.dropIndex('jobs', 'source_type');
  pgm.sql('alter table jobs drop constraint jobs_source_type_check');
  pgm.addConstraint('jobs', 'jobs_source_type_check', {
    check: "source_type in ('nara', 'private_bid', 'manual', 'email', 'other')"
  });
}
