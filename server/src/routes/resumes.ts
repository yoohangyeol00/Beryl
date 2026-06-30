import { type Request, type Response } from 'express';
import { pool } from '../db.js';
import { getCurrentCompanyId, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { createCompanyScopedRouter } from './companyScopedRouter.js';

export const resumesRouter = createCompanyScopedRouter();

type AvailabilityStatus = 'available' | 'assigned' | 'partiallyAssigned' | 'unavailable';

interface ResumeRow {
  id: string;
  name: string;
  role: string | null;
  career_years: number | null;
  available_from: string | Date | null;
  availability_status: AvailabilityStatus;
  employment_status: string | null;
  skills: string[] | null;
  current_client: string | null;
  current_project: string | null;
  current_mm: string | null;
  current_end_date: string | Date | null;
}

interface ResumeProjectRow {
  id: string;
  project_name: string;
  client_name: string | null;
  role: string | null;
  started_at: string | Date | null;
  ended_at: string | Date | null;
  man_months: string | null;
  description: string | null;
}

interface ResumeSummaryRow {
  total: string;
  assigned: string;
  available_soon: string;
  unavailable: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getNullableString(value: unknown): string | null {
  return getString(value) || null;
}

function getInteger(value: unknown): number | null {
  const parsed = Number(getString(value) || value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function getDate(value: unknown): string | null {
  const date = getString(value);

  if (!date) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : null;
}

function getAvailabilityStatus(value: unknown): AvailabilityStatus {
  const status = getString(value);

  if (status === 'assigned' || status === 'partiallyAssigned' || status === 'unavailable') {
    return status;
  }

  return 'available';
}

function getSkills(value: unknown): string[] {
  const values = Array.isArray(value) ? value : getString(value).split(',');
  return values
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 30);
}

function getPositiveInteger(value: unknown, fallback: number, max?: number): number {
  const parsed = Number(getString(value) || value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return max ? Math.min(parsed, max) : parsed;
}

function formatDateValue(value: string | Date | null): string {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function toResumeListItem(row: ResumeRow) {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? '',
    careerYears: row.career_years ?? 0,
    skills: row.skills ?? [],
    availableFrom: formatDateValue(row.available_from),
    availabilityStatus: row.availability_status,
    employmentStatus: row.employment_status ?? '',
    currentClient: row.current_client ?? '-',
    currentProject: row.current_project ?? '대기',
    currentManMonths: row.current_mm ? Number(row.current_mm) : 0,
    currentEndDate: formatDateValue(row.current_end_date) || '-'
  };
}

function toResumeProject(row: ResumeProjectRow) {
  return {
    id: row.id,
    projectName: row.project_name,
    clientName: row.client_name ?? '',
    role: row.role ?? '',
    startedAt: formatDateValue(row.started_at),
    endedAt: formatDateValue(row.ended_at),
    manMonths: row.man_months ? Number(row.man_months) : 0,
    description: row.description ?? ''
  };
}

async function getResumeById(resumeId: string, currentCompanyId: string): Promise<ResumeRow | null> {
  const result = await pool.query<ResumeRow>(
    `
      select
        r.id,
        r.name,
        r.role,
        r.career_years,
        r.available_from,
        r.availability_status,
        r.employment_status,
        coalesce(array_remove(array_agg(distinct rs.skill_name order by rs.skill_name), null), '{}') as skills,
        buyer.name as current_client,
        wp.name as current_project,
        pa.allocation_rate::text as current_mm,
        pa.assigned_to as current_end_date
      from resumes r
      left join resume_skills rs on rs.resume_id = r.id
      left join lateral (
        select *
        from project_assignments pa
        where pa.resume_id = r.id
          and pa.status in ('planned', 'assigned')
        order by pa.assigned_to nulls last, pa.created_at desc
        limit 1
      ) pa on true
      left join won_projects wp on wp.id = pa.won_project_id
      left join companies buyer on buyer.id = pa.buyer_company_id
      where r.id = $1
        and r.owner_company_id = $2
      group by r.id, buyer.name, wp.name, pa.allocation_rate, pa.assigned_to
      limit 1
    `,
    [resumeId, currentCompanyId]
  );

  return result.rows[0] ?? null;
}

async function replaceSkills(resumeId: string, skills: string[]): Promise<void> {
  await pool.query('delete from resume_skills where resume_id = $1', [resumeId]);

  for (const skill of skills) {
    await pool.query('insert into resume_skills (resume_id, skill_name) values ($1, $2)', [resumeId, skill]);
  }
}

resumesRouter.get('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const query = asRecord(req.query);
  const page = getPositiveInteger(query.page, 1);
  const pageSize = getPositiveInteger(query.pageSize, 50, 100);
  const offset = (page - 1) * pageSize;
  const values: unknown[] = [currentCompanyId];
  const conditions = ['r.owner_company_id = $1'];
  const q = getString(query.q);
  const availabilityStatus = getString(query.availabilityStatus);

  if (q) {
    values.push(`%${q}%`);
    conditions.push(`(
      r.name ilike $${values.length}
      or r.role ilike $${values.length}
      or exists (
        select 1
        from resume_skills rsq
        where rsq.resume_id = r.id
          and rsq.skill_name ilike $${values.length}
      )
    )`);
  }

  if (availabilityStatus === 'available' || availabilityStatus === 'assigned' || availabilityStatus === 'partiallyAssigned' || availabilityStatus === 'unavailable') {
    values.push(availabilityStatus);
    conditions.push(`r.availability_status = $${values.length}`);
  }

  const whereSql = conditions.join('\n and ');

  try {
    const listResult = await pool.query<ResumeRow>(
      `
        select
          r.id,
          r.name,
          r.role,
          r.career_years,
          r.available_from,
          r.availability_status,
          r.employment_status,
          coalesce(array_remove(array_agg(distinct rs.skill_name order by rs.skill_name), null), '{}') as skills,
          buyer.name as current_client,
          wp.name as current_project,
          pa.allocation_rate::text as current_mm,
          pa.assigned_to as current_end_date
        from resumes r
        left join resume_skills rs on rs.resume_id = r.id
        left join lateral (
          select *
          from project_assignments pa
          where pa.resume_id = r.id
            and pa.status in ('planned', 'assigned')
          order by pa.assigned_to nulls last, pa.created_at desc
          limit 1
        ) pa on true
        left join won_projects wp on wp.id = pa.won_project_id
        left join companies buyer on buyer.id = pa.buyer_company_id
        where ${whereSql}
        group by r.id, buyer.name, wp.name, pa.allocation_rate, pa.assigned_to
        order by r.created_at desc, r.id desc
        limit $${values.length + 1}
        offset $${values.length + 2}
      `,
      [...values, pageSize, offset]
    );

    const summaryResult = await pool.query<ResumeSummaryRow>(
      `
        select
          count(*)::text as total,
          count(*) filter (where availability_status in ('assigned', 'partiallyAssigned'))::text as assigned,
          count(*) filter (where available_from is not null and available_from <= current_date + interval '30 days')::text as available_soon,
          count(*) filter (where availability_status = 'unavailable')::text as unavailable
        from resumes r
        where ${whereSql}
      `,
      values
    );
    const summary = summaryResult.rows[0] ?? { total: '0', assigned: '0', available_soon: '0', unavailable: '0' };

    sendSuccess(res, {
      items: listResult.rows.map(toResumeListItem),
      total: Number(summary.total),
      summary: {
        total: Number(summary.total),
        assigned: Number(summary.assigned),
        availableSoon: Number(summary.available_soon),
        unavailable: Number(summary.unavailable)
      }
    });
  } catch (error) {
    next(error);
  }
});

resumesRouter.get('/:resumeId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const resumeId = getString(req.params.resumeId);

  try {
    const resume = await getResumeById(resumeId, currentCompanyId);

    if (!resume) {
      sendError(res, 404, 'RESUME_NOT_FOUND', '인력 정보를 찾을 수 없습니다.');
      return;
    }

    const projectsResult = await pool.query<ResumeProjectRow>(
      `
        select id, project_name, client_name, role, started_at, ended_at, man_months, description
        from resume_projects
        where resume_id = $1
        order by coalesce(ended_at, started_at) desc nulls last, created_at desc
      `,
      [resumeId]
    );

    sendSuccess(res, {
      ...toResumeListItem(resume),
      projects: projectsResult.rows.map(toResumeProject)
    });
  } catch (error) {
    next(error);
  }
});

resumesRouter.post('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const body = asRecord(req.body);
  const name = getString(body.name);
  const skills = getSkills(body.skills);

  if (!name) {
    sendError(res, 400, 'VALIDATION_ERROR', '인력 이름은 필수입니다.');
    return;
  }

  try {
    const result = await pool.query<ResumeRow>(
      `
        insert into resumes (
          owner_company_id,
          company_member_id,
          name,
          role,
          career_years,
          available_from,
          availability_status,
          employment_status
        )
        values ($1, null, $2, $3, $4, $5, $6, $7)
        returning
          id,
          name,
          role,
          career_years,
          available_from,
          availability_status,
          employment_status,
          '{}'::varchar[] as skills,
          null::varchar as current_client,
          null::varchar as current_project,
          null::text as current_mm,
          null::date as current_end_date
      `,
      [
        currentCompanyId,
        name,
        getNullableString(body.role),
        getInteger(body.careerYears),
        getDate(body.availableFrom),
        getAvailabilityStatus(body.availabilityStatus),
        getNullableString(body.employmentStatus)
      ]
    );

    await replaceSkills(result.rows[0].id, skills);
    const created = await getResumeById(result.rows[0].id, currentCompanyId);
    sendSuccess(res, toResumeListItem(created ?? result.rows[0]), 201);
  } catch (error) {
    next(error);
  }
});

resumesRouter.patch('/:resumeId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const resumeId = getString(req.params.resumeId);
  const body = asRecord(req.body);
  const name = getString(body.name);
  const skills = 'skills' in body ? getSkills(body.skills) : null;

  if (!name) {
    sendError(res, 400, 'VALIDATION_ERROR', '인력 이름은 필수입니다.');
    return;
  }

  try {
    const existing = await getResumeById(resumeId, currentCompanyId);

    if (!existing) {
      sendError(res, 404, 'RESUME_NOT_FOUND', '인력 정보를 찾을 수 없습니다.');
      return;
    }

    await pool.query(
      `
        update resumes
        set
          name = $1,
          role = $2,
          career_years = $3,
          available_from = $4,
          availability_status = $5,
          employment_status = $6,
          updated_at = now()
        where id = $7
          and owner_company_id = $8
      `,
      [
        name,
        getNullableString(body.role),
        getInteger(body.careerYears),
        getDate(body.availableFrom),
        getAvailabilityStatus(body.availabilityStatus),
        getNullableString(body.employmentStatus),
        resumeId,
        currentCompanyId
      ]
    );

    if (skills) {
      await replaceSkills(resumeId, skills);
    }

    const updated = await getResumeById(resumeId, currentCompanyId);
    sendSuccess(res, toResumeListItem(updated ?? existing));
  } catch (error) {
    next(error);
  }
});

resumesRouter.delete('/:resumeId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const resumeId = getString(req.params.resumeId);

  try {
    const existing = await getResumeById(resumeId, currentCompanyId);

    if (!existing) {
      sendError(res, 404, 'RESUME_NOT_FOUND', '인력 정보를 찾을 수 없습니다.');
      return;
    }

    await pool.query('delete from resumes where id = $1 and owner_company_id = $2', [resumeId, currentCompanyId]);
    sendSuccess(res, { ok: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
      sendError(res, 409, 'RESUME_DELETE_CONFLICT', '제안 매칭 또는 투입 이력이 연결되어 있어 인력을 삭제할 수 없습니다.');
      return;
    }

    next(error);
  }
});
