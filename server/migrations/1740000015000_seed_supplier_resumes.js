export const shorthands = undefined;

const supplierCompanyName = '테크브리지코리아';

const people = [
  ['김도윤', 'PM/아키텍트', 16, '2026-08-01', 'partiallyAssigned', '정규직', ['공공 SI', 'MSA', 'Spring Boot', 'PostgreSQL', '전자조달', 'PM'], '조달청', '전자조달 플랫폼 고도화', 0.5, '2026-07-31'],
  ['이서연', 'Frontend', 9, '2026-08-16', 'partiallyAssigned', '정규직', ['React', 'TypeScript', '대시보드', '접근성', '공공 포털', 'UX'], '행정안전부', '전자조달 포털 개선', 0.4, '2026-08-15'],
  ['박지훈', 'Backend', 10, '2026-07-01', 'available', '정규직', ['Java', 'Spring Boot', 'API', 'PostgreSQL', '배치', '성능개선'], null, null, 0, null],
  ['정하린', 'Data Engineer', 8, '2026-07-15', 'available', '정규직', ['PostgreSQL', 'ETL', '데이터 표준화', 'Python', '공공 데이터', '품질관리'], null, null, 0, null],
  ['최민재', 'DevOps', 11, '2026-09-01', 'assigned', '정규직', ['Kubernetes', 'CI/CD', 'AWS', 'Nginx', '모니터링', '보안'], '국토교통부', '클라우드 전환 사업', 1, '2026-08-31'],
  ['강서준', 'Backend', 7, '2026-07-20', 'available', '프리랜서', ['Node.js', 'Express', 'TypeScript', 'API', 'PostgreSQL', '인증'], null, null, 0, null],
  ['윤지아', 'QA', 6, '2026-07-10', 'available', '정규직', ['테스트 자동화', 'Playwright', '품질관리', '공공 SI', '결함관리'], null, null, 0, null],
  ['한유진', 'Business Analyst', 12, '2026-08-05', 'partiallyAssigned', '정규직', ['RFP 분석', '요구사항 정의', '공공 SI', '조달', '업무설계', 'PMO'], '한국도로공사', '성과관리 대시보드 구축', 0.5, '2026-08-04'],
  ['오현우', 'Security', 13, '2026-08-20', 'assigned', '정규직', ['개인정보보호', '망분리', 'ISMS-P', '보안점검', '공공기관', '인증'], '한국인터넷진흥원', '보안 컨설팅', 1, '2026-08-19'],
  ['문채원', 'Frontend', 5, '2026-07-01', 'available', '정규직', ['React', 'Vite', 'TypeScript', '디자인 시스템', '차트', '테이블 UI'], null, null, 0, null],
  ['배성민', 'DBA', 14, '2026-08-10', 'partiallyAssigned', '정규직', ['PostgreSQL', 'Oracle', '튜닝', '마이그레이션', '백업/복구', '공공 DB'], '서울시', '통합 민원 DB 전환', 0.6, '2026-08-09'],
  ['신나래', 'UI/UX', 8, '2026-07-25', 'available', '정규직', ['UX 리서치', '공공 포털', '디자인 시스템', '접근성', '프로토타이핑'], null, null, 0, null],
  ['서태오', 'Backend', 12, '2026-09-15', 'assigned', '정규직', ['Java', 'Spring Boot', 'MSA', 'Kafka', 'API Gateway', '성능개선'], '관세청', '통관 시스템 MSA 전환', 1, '2026-09-14'],
  ['임수빈', 'PMO', 10, '2026-07-08', 'available', '정규직', ['PMO', '일정관리', '위험관리', '보고체계', '공공 SI', '감리 대응'], null, null, 0, null],
  ['조은별', 'AI Engineer', 6, '2026-08-01', 'partiallyAssigned', '정규직', ['Python', 'LLM', 'RAG', '문서 분석', '데이터 파이프라인', 'Vertex AI'], '한국지능정보사회진흥원', 'AI 기반 계약 리스크 분석 PoC', 0.5, '2026-07-31'],
  ['홍태경', 'Cloud Architect', 15, '2026-08-12', 'partiallyAssigned', '정규직', ['클라우드 전환', 'Kubernetes', 'MSA', '보안', '아키텍처', '공공기관'], '교육부', '교육행정 클라우드 전환', 0.5, '2026-08-11'],
  ['권리안', 'Mobile', 7, '2026-07-18', 'available', '프리랜서', ['React Native', '모바일 웹', '인증', '알림', '접근성'], null, null, 0, null],
  ['남기범', 'System Engineer', 11, '2026-07-30', 'available', '정규직', ['Linux', 'WAS', '배포', '운영전환', '장애대응', '모니터링'], null, null, 0, null],
  ['차예린', 'Data Analyst', 5, '2026-08-03', 'available', '정규직', ['SQL', 'BI', '대시보드', '지표설계', '데이터 시각화', '공공 데이터'], null, null, 0, null],
  ['백준호', 'Backend', 4, '2026-07-01', 'available', '정규직', ['Java', 'Spring Boot', 'REST API', 'JUnit', 'PostgreSQL'], null, null, 0, null]
];

function q(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function qArray(values) {
  return `array[${values.map(q).join(', ')}]::text[]`;
}

export function up(pgm) {
  pgm.sql(`
    insert into companies (name, company_type, status, supports_buyer, supports_supplier)
    select ${q(supplierCompanyName)}, 'supplier', 'active', false, true
    where not exists (
      select 1 from companies where lower(name) = lower(${q(supplierCompanyName)})
    )
  `);

  const clients = [...new Set(people.map((person) => person[7]).filter(Boolean))];
  for (const clientName of clients) {
    pgm.sql(`
      insert into companies (name, company_type, status, supports_buyer, supports_supplier)
      select ${q(clientName)}, 'public_agency', 'active', true, false
      where not exists (
        select 1 from companies where lower(name) = lower(${q(clientName)})
      )
    `);
  }

  for (const [name, role, careerYears, availableFrom, availabilityStatus, employmentStatus, skills, clientName, projectName, allocationRate, currentEndDate] of people) {
    pgm.sql(`
      with target_companies as (
        select id
        from companies
        where supports_supplier = true
          and coalesce(company_type, '') <> 'public_agency'
      )
      insert into resumes (
        owner_company_id,
        name,
        role,
        career_years,
        available_from,
        availability_status,
        employment_status
      )
      select
        target_companies.id,
        ${q(name)},
        ${q(role)},
        ${q(careerYears)},
        ${q(availableFrom)},
        ${q(availabilityStatus)},
        ${q(employmentStatus)}
      from target_companies
      where not exists (
        select 1
        from resumes r
        where r.owner_company_id = target_companies.id
          and r.name = ${q(name)}
      )
    `);

    pgm.sql(`
      insert into resume_skills (resume_id, skill_name)
      select r.id, skill_name
      from resumes r
      cross join unnest(${qArray(skills)}) as skill_name
      where r.name = ${q(name)}
        and exists (
          select 1
          from companies c
          where c.id = r.owner_company_id
            and c.supports_supplier = true
            and coalesce(c.company_type, '') <> 'public_agency'
        )
        and not exists (
          select 1
          from resume_skills rs
          where rs.resume_id = r.id
            and rs.skill_name = skill_name
        )
    `);

    pgm.sql(`
      insert into resume_projects (
        resume_id,
        project_name,
        client_name,
        role,
        started_at,
        ended_at,
        man_months,
        description
      )
      select
        r.id,
        coalesce(${q(projectName)}, ${q(`${role} 대표 수행 이력`)}),
        ${q(clientName)},
        ${q(role)},
        case when ${q(currentEndDate)} is null then date '2025-01-01' else (${q(currentEndDate)})::date - interval '6 months' end,
        ${q(currentEndDate)},
        case when ${q(allocationRate)} = 0 then 6 else greatest(1, ${q(allocationRate)} * 6) end,
        ${q(`${name} ${role} 가데이터 수행 이력`)}
      from resumes r
      where r.name = ${q(name)}
        and exists (
          select 1
          from companies c
          where c.id = r.owner_company_id
            and c.supports_supplier = true
            and coalesce(c.company_type, '') <> 'public_agency'
        )
        and not exists (
          select 1
          from resume_projects rp
          where rp.resume_id = r.id
            and rp.project_name = coalesce(${q(projectName)}, ${q(`${role} 대표 수행 이력`)})
        )
    `);

    if (clientName && projectName && allocationRate > 0) {
      pgm.sql(`
        insert into won_projects (
          buyer_company_id,
          supplier_company_id,
          name,
          status,
          started_at,
          ended_at,
          planned_man_months,
          actual_man_months
        )
        select
          buyer.id,
          supplier.id,
          ${q(projectName)},
          'inProgress',
          (${q(currentEndDate)})::date - interval '6 months',
          ${q(currentEndDate)},
          6,
          4
        from companies supplier
        join companies buyer on lower(buyer.name) = lower(${q(clientName)})
        where supplier.supports_supplier = true
          and coalesce(supplier.company_type, '') <> 'public_agency'
          and not exists (
            select 1
            from won_projects wp
            where wp.supplier_company_id = supplier.id
              and wp.buyer_company_id = buyer.id
              and wp.name = ${q(projectName)}
          )
      `);

      pgm.sql(`
        insert into project_assignments (
          won_project_id,
          resume_id,
          buyer_company_id,
          supplier_company_id,
          role,
          assigned_from,
          assigned_to,
          allocation_rate,
          planned_man_months,
          actual_man_months,
          status
        )
        select
          wp.id,
          r.id,
          wp.buyer_company_id,
          wp.supplier_company_id,
          ${q(role)},
          (${q(currentEndDate)})::date - interval '6 months',
          ${q(currentEndDate)},
          ${q(allocationRate)},
          greatest(1, ${q(allocationRate)} * 6),
          greatest(1, ${q(allocationRate)} * 4),
          'assigned'
        from resumes r
        join won_projects wp
          on wp.supplier_company_id = r.owner_company_id
         and wp.name = ${q(projectName)}
        where r.name = ${q(name)}
          and not exists (
            select 1
            from project_assignments pa
            where pa.won_project_id = wp.id
              and pa.resume_id = r.id
          )
      `);
    }
  }
}

export function down(pgm) {
  const names = people.map(([name]) => q(name)).join(', ');
  const projectNames = people.map((person) => person[8]).filter(Boolean).map(q).join(', ');

  pgm.sql(`
    delete from project_assignments
    where resume_id in (
      select id from resumes where name in (${names})
    )
  `);

  if (projectNames) {
    pgm.sql(`
      delete from won_projects
      where name in (${projectNames})
    `);
  }

  pgm.sql(`
    delete from resumes
    where name in (${names})
      and exists (
        select 1
        from companies c
        where c.id = resumes.owner_company_id
          and c.supports_supplier = true
          and coalesce(c.company_type, '') <> 'public_agency'
      )
  `);
}
