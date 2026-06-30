export const shorthands = undefined;

const buyers = [
  ['행정안전부', 'public_agency'],
  ['과학기술정보통신부', 'public_agency'],
  ['국토교통부', 'public_agency'],
  ['서울특별시', 'public_agency'],
  ['경기도', 'public_agency'],
  ['한국인터넷진흥원', 'public_agency'],
  ['한국데이터산업진흥원', 'public_agency'],
  ['한국지역정보개발원', 'public_agency'],
  ['한국교육학술정보원', 'public_agency'],
  ['한국보건산업진흥원', 'public_agency'],
  ['한국문화정보원', 'public_agency'],
  ['한국환경공단', 'public_agency']
];

const jobs = [
  ['NARA-2026-001102', '행정안전부', '범정부 클라우드 행정서비스 운영 플랫폼 고도화', 'Cloud, Kubernetes, Java, Observability', 'nara', 1850000000, '2026-06-25', '2026-07-10', 'closingSoon', 79, 6],
  ['NARA-2026-001137', '국토교통부', '스마트 건설 인허가 데이터 통합관리 시스템 구축', 'GIS, Data Lake, Spring Boot, React', 'nara', 2140000000, '2026-06-20', '2026-07-18', 'open', 84, 7],
  ['NARA-2026-001185', '서울특별시', '서울시 민원 상담 챗봇 및 지식관리 체계 개선', 'AI, NLP, Node.js, PostgreSQL', 'nara', 760000000, '2026-06-27', '2026-07-09', 'closingSoon', 72, 4],
  ['NARA-2026-001206', '경기도', '도정 데이터 기반 정책 모니터링 대시보드 구축', 'BI, React, TypeScript, ETL', 'nara', 930000000, '2026-06-23', '2026-07-16', 'open', 81, 5],
  ['NARA-2026-001244', '한국지역정보개발원', '지방행정 표준업무 API 게이트웨이 전환 사업', 'API Gateway, MSA, Java, Security', 'nara', 1670000000, '2026-06-19', '2026-07-12', 'open', 86, 8],
  ['NARA-2026-001281', '한국환경공단', '환경 인허가 온라인 접수 및 심사 시스템 개선', 'Workflow, Java, Oracle, Accessibility', 'nara', 620000000, '2026-06-17', '2026-07-04', 'closingSoon', 68, 3],
  ['NARA-2026-001309', '한국문화정보원', '문화데이터 개방 포털 검색 품질 개선 및 운영', 'Search, OpenAPI, React, Data Quality', 'nara', 540000000, '2026-06-14', '2026-07-25', 'open', 75, 4],
  ['NARA-2026-001342', '한국교육학술정보원', '교육행정 업무포털 사용자 경험 개선 사업', 'UX, React, Design System, Java', 'nara', 880000000, '2026-06-12', '2026-07-02', 'closingSoon', 71, 5],
  ['NARA-2026-001377', '한국인터넷진흥원', '사이버 위협정보 공유 플랫폼 기능 고도화', 'Security, SIEM, Kafka, Backend', 'nara', 1960000000, '2026-06-28', '2026-07-21', 'open', 90, 9],
  ['NARA-2026-001411', '한국보건산업진흥원', '보건의료 R&D 과제관리 시스템 통합 유지보수', 'Legacy, Java, Reporting, Batch', 'nara', 720000000, '2026-06-10', '2026-07-01', 'closingSoon', 66, 3],
  ['NIPA-2026-AI-023', '정보통신산업진흥원', 'AI 바우처 사업 성과관리 및 정산 시스템 구축', 'AI, Workflow, PostgreSQL, React', 'nipa', 1210000000, '2026-06-26', '2026-07-17', 'open', 83, 6],
  ['NIPA-2026-CLOUD-031', '정보통신산업진흥원', '클라우드 SaaS 전환 지원 포털 운영 고도화', 'SaaS, Cloud, DevOps, TypeScript', 'nipa', 1120000000, '2026-06-22', '2026-07-11', 'open', 80, 5],
  ['NIPA-2026-SW-045', '정보통신산업진흥원', 'SW 전문인력 매칭 데이터 분석 기반 구축', 'Matching, Data Analytics, Node.js, React', 'nipa', 890000000, '2026-06-18', '2026-07-05', 'closingSoon', 77, 4],
  ['NIPA-2026-DX-052', '정보통신산업진흥원', '지역 디지털 혁신거점 사업관리 플랫폼 개선', 'Portal, Spring Boot, Dashboard, API', 'nipa', 670000000, '2026-06-15', '2026-07-23', 'open', 74, 4],
  ['NIPA-2026-SEC-061', '정보통신산업진흥원', '중소 SW기업 보안성 진단 지원 시스템 운영', 'Security, Audit, Java, Batch', 'nipa', 580000000, '2026-06-09', '2026-07-03', 'closingSoon', 69, 3],
  ['NIPA-2026-DATA-074', '정보통신산업진흥원', 'ICT 통계 데이터 수집 및 품질관리 시스템 구축', 'ETL, Data Quality, BI, PostgreSQL', 'nipa', 940000000, '2026-06-29', '2026-07-26', 'open', 82, 5],
  ['NIA-2026-GOV-018', '한국지능정보사회진흥원', '공공 마이데이터 서비스 연계관리 시스템 고도화', 'MyData, API, Security, Java', 'nia', 1430000000, '2026-06-24', '2026-07-19', 'open', 87, 7],
  ['NIA-2026-CLOUD-026', '한국지능정보사회진흥원', '공공 클라우드 전환 사업관리 대시보드 구축', 'Cloud, Dashboard, React, PostgreSQL', 'nia', 1010000000, '2026-06-20', '2026-07-07', 'closingSoon', 78, 5],
  ['NIA-2026-DATA-033', '한국지능정보사회진흥원', '국가 데이터맵 메타데이터 품질진단 자동화', 'Metadata, ETL, Python, API', 'nia', 830000000, '2026-06-16', '2026-07-24', 'open', 85, 6],
  ['NIA-2026-PORTAL-041', '한국지능정보사회진흥원', '디지털정부서비스 통합 안내 포털 UI/UX 개선', 'UX, Accessibility, React, Design System', 'nia', 650000000, '2026-06-13', '2026-07-06', 'closingSoon', 73, 4],
  ['NIA-2026-AI-057', '한국지능정보사회진흥원', '공공 AI 활용사례 지식베이스 및 검색 서비스 구축', 'AI Search, Vector DB, Node.js, React', 'nia', 1180000000, '2026-06-27', '2026-07-27', 'open', 89, 7],
  ['NIA-2026-OPS-068', '한국지능정보사회진흥원', '정보화사업 운영성과 통합 리포팅 시스템 구축', 'Reporting, BI, Java, Batch', 'nia', 710000000, '2026-06-11', '2026-07-13', 'open', 76, 4],
  ['MANUAL-2026-0007', '과학기술정보통신부', '국가 R&D 협업 플랫폼 프로토타입 구축 컨설팅', 'Prototype, Consulting, React, API', 'manual', 390000000, '2026-06-07', '2026-07-05', 'closingSoon', 61, 2],
  ['MANUAL-2026-0011', '서울특별시', '공공시설 예약관리 서비스 통합 운영 지원', 'Reservation, Operations, Java, QA', 'manual', 460000000, '2026-06-05', '2026-07-20', 'open', 64, 3],
  ['MANUAL-2026-0019', '경기도', '산하기관 업무관리 시스템 표준 템플릿 구축', 'Template, Workflow, React, TypeScript', 'manual', 520000000, '2026-06-03', '2026-07-14', 'open', 70, 4],
  ['EMAIL-2026-0004', '한국데이터산업진흥원', '데이터 거래지원 업무시스템 유지관리 제안 요청', 'Maintenance, Data Portal, Java, Oracle', 'email', 310000000, '2026-06-01', '2026-07-01', 'closingSoon', 58, 2],
  ['EMAIL-2026-0009', '한국문화정보원', '문화공공데이터 API 운영 및 모니터링 지원', 'OpenAPI, Monitoring, Node.js, DevOps', 'email', 280000000, '2026-05-29', '2026-07-08', 'closingSoon', 62, 2],
  ['PRIVATE-2026-0031', '서울특별시', '스마트시티 민관협력 서비스 PoC 수행사 모집', 'PoC, IoT, API, Dashboard', 'private_bid', 450000000, '2026-06-28', '2026-07-30', 'open', 79, 4],
  ['PRIVATE-2026-0042', '한국인터넷진흥원', '보안 스타트업 지원 플랫폼 운영 파트너 선정', 'Security, Portal, CRM, Operations', 'private_bid', 360000000, '2026-06-22', '2026-07-18', 'open', 74, 3],
  ['OTHER-2026-0005', '한국환경공단', '탄소중립 실천 데이터 수집 앱 백오피스 구축', 'Mobile Backend, Admin, PostgreSQL, React', 'other', 510000000, '2026-06-08', '2026-07-16', 'open', 67, 3]
];

function q(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function up(pgm) {
  for (const [name, companyType] of buyers) {
    pgm.sql(`
      insert into companies (name, company_type, status, supports_buyer, supports_supplier)
      select ${q(name)}, ${q(companyType)}, 'active', true, false
      where not exists (
        select 1 from companies where lower(name) = lower(${q(name)})
      )
    `);
  }

  for (const [
    noticeNumber,
    buyerName,
    title,
    category,
    sourceType,
    budget,
    publishedAt,
    deadline,
    status,
    rfpScore,
    recommendedPeople
  ] of jobs) {
    const procurementType = sourceType === 'private_bid' ? 'private' : 'public';
    const sourceUrl =
      sourceType === 'nara'
        ? 'https://www.g2b.go.kr/'
        : sourceType === 'nipa'
          ? 'https://www.nipa.kr/'
          : sourceType === 'nia'
            ? 'https://www.nia.or.kr/'
            : null;

    pgm.sql(`
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
        ${q(noticeNumber)},
        ${q(title)},
        ${q(category)},
        ${q(procurementType)},
        ${q(sourceType)},
        ${q(sourceUrl)},
        ${q(budget)},
        ${q(publishedAt)},
        ${q(deadline)},
        ${q(status)},
        ${q(rfpScore)},
        ${q(recommendedPeople)},
        ${q(`${sourceType} 출처로 수집된 공고 가데이터입니다.\n\nBERYL 공고 목록, 출처 필터, 공공/민간 구분 검증을 위한 샘플입니다.`)}
      from companies c
      where lower(c.name) = lower(${q(buyerName)})
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
    `);
  }
}

export function down(pgm) {
  const noticeNumbers = jobs.map(([noticeNumber]) => q(noticeNumber)).join(', ');

  pgm.sql(`
    delete from jobs
    where notice_number in (${noticeNumbers})
  `);
}
