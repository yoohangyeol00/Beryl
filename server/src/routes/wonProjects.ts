import { type Request, type Response } from 'express';
import { pool } from '../db.js';
import { getCurrentCompanyId, getCurrentUserId, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { createCompanyScopedRouter } from './companyScopedRouter.js';

export const wonProjectsRouter = createCompanyScopedRouter();

type WonProjectStatus = 'preparing' | 'inProgress' | 'atRisk' | 'completed' | 'cancelled';
type HealthStatus = 'normal' | 'watch' | 'risk';
type LogType = 'created' | 'progress' | 'risk' | 'inspection' | 'memo';

interface WonProjectRow {
  id: string;
  contract_id: string | null;
  job_id: string | null;
  name: string;
  status: WonProjectStatus;
  started_at: string | Date | null;
  ended_at: string | Date | null;
  planned_man_months: string | null;
  actual_man_months: string | null;
  buyer_company_id: string;
  buyer_name: string;
  supplier_company_id: string;
  supplier_name: string;
  contract_amount: string | null;
  assignment_count: string;
  assignment_names: string[] | null;
  progress_rate: number | null;
  health_status: HealthStatus | null;
  next_action: string | null;
  latest_log_at: string | Date | null;
}

interface ProjectAssignmentRow {
  id: string;
  resume_id: string;
  name: string;
  role: string | null;
  assigned_from: string | Date | null;
  assigned_to: string | Date | null;
  allocation_rate: string;
  planned_man_months: string | null;
  actual_man_months: string | null;
  status: string;
}

interface ProjectLogRow {
  id: string;
  log_type: LogType;
  title: string;
  body: string | null;
  progress_rate: number | null;
  health_status: HealthStatus | null;
  next_action: string | null;
  created_at: string | Date;
  author_name: string | null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getNullableString(value: unknown): string | null {
  return getString(value) || null;
}

function getNumber(value: unknown): number | null {
  const parsed = Number(getString(value) || value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getDate(value: unknown): string | null {
  const date = getString(value);
  return /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : null;
}

function getProjectStatus(value: unknown, fallback: WonProjectStatus = 'inProgress'): WonProjectStatus {
  const status = getString(value);
  if (status === 'preparing' || status === 'inProgress' || status === 'atRisk' || status === 'completed' || status === 'cancelled') return status;
  return fallback;
}

function getHealthStatus(value: unknown, fallback: HealthStatus = 'normal'): HealthStatus {
  const status = getString(value);
  if (status === 'watch' || status === 'risk') return status;
  return fallback;
}

function getLogType(value: unknown): LogType {
  const type = getString(value);
  if (type === 'created' || type === 'risk' || type === 'inspection' || type === 'memo') return type;
  return 'progress';
}

function getProgressRate(value: unknown, fallback = 0): number {
  const parsed = getNumber(value);
  if (parsed === null) return fallback;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function getPositiveInteger(value: unknown, fallback: number, max?: number): number {
  const parsed = Number(getString(value) || value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

function formatDateValue(value: string | Date | null): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.slice(0, 10);
}

function toWonProject(row: WonProjectRow) {
  return {
    id: row.id,
    contractId: row.contract_id,
    jobId: row.job_id,
    name: row.name,
    status: row.status,
    startedAt: formatDateValue(row.started_at),
    endedAt: formatDateValue(row.ended_at),
    plannedManMonths: row.planned_man_months ? Number(row.planned_man_months) : 0,
    actualManMonths: row.actual_man_months ? Number(row.actual_man_months) : 0,
    buyerCompanyId: row.buyer_company_id,
    buyerName: row.buyer_name,
    supplierCompanyId: row.supplier_company_id,
    supplierName: row.supplier_name,
    contractAmount: row.contract_amount ? Number(row.contract_amount) : 0,
    assignmentCount: Number(row.assignment_count),
    assignmentNames: row.assignment_names ?? [],
    progressRate: row.progress_rate ?? 0,
    healthStatus: row.health_status ?? 'normal',
    nextAction: row.next_action ?? '',
    latestLogAt: formatDateValue(row.latest_log_at)
  };
}

function toAssignment(row: ProjectAssignmentRow) {
  return {
    id: row.id,
    resumeId: row.resume_id,
    name: row.name,
    role: row.role ?? '',
    assignedFrom: formatDateValue(row.assigned_from),
    assignedTo: formatDateValue(row.assigned_to),
    allocationRate: Number(row.allocation_rate),
    plannedManMonths: row.planned_man_months ? Number(row.planned_man_months) : 0,
    actualManMonths: row.actual_man_months ? Number(row.actual_man_months) : 0,
    status: row.status
  };
}

function toLog(row: ProjectLogRow) {
  return {
    id: row.id,
    logType: row.log_type,
    title: row.title,
    body: row.body ?? '',
    progressRate: row.progress_rate,
    healthStatus: row.health_status,
    nextAction: row.next_action ?? '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    authorName: row.author_name ?? ''
  };
}

async function getProjectById(projectId: string, currentCompanyId: string): Promise<WonProjectRow | null> {
  const result = await pool.query<WonProjectRow>(
    `
      select
        wp.id,
        wp.contract_id,
        wp.job_id,
        wp.name,
        wp.status,
        wp.started_at,
        wp.ended_at,
        wp.planned_man_months,
        wp.actual_man_months,
        wp.buyer_company_id,
        buyer.name as buyer_name,
        wp.supplier_company_id,
        supplier.name as supplier_name,
        c.contract_amount::text,
        count(distinct pa.id)::text as assignment_count,
        coalesce(array_remove(array_agg(distinct r.name order by r.name), null), '{}') as assignment_names,
        latest_log.progress_rate,
        latest_log.health_status,
        latest_log.next_action,
        latest_log.created_at as latest_log_at
      from won_projects wp
      join companies buyer on buyer.id = wp.buyer_company_id
      join companies supplier on supplier.id = wp.supplier_company_id
      left join contracts c on c.id = wp.contract_id
      left join project_assignments pa on pa.won_project_id = wp.id
      left join resumes r on r.id = pa.resume_id
      left join lateral (
        select progress_rate, health_status, next_action, created_at
        from won_project_logs
        where won_project_id = wp.id
        order by created_at desc
        limit 1
      ) latest_log on true
      where wp.id = $1
        and (wp.supplier_company_id = $2 or wp.buyer_company_id = $2)
      group by wp.id, buyer.name, supplier.name, c.contract_amount, latest_log.progress_rate, latest_log.health_status, latest_log.next_action, latest_log.created_at
      limit 1
    `,
    [projectId, currentCompanyId]
  );

  return result.rows[0] ?? null;
}

async function insertLog({
  projectId,
  userId,
  logType,
  title,
  body,
  progressRate,
  healthStatus,
  nextAction
}: {
  projectId: string;
  userId: string;
  logType: LogType;
  title: string;
  body?: string | null;
  progressRate?: number | null;
  healthStatus?: HealthStatus | null;
  nextAction?: string | null;
}) {
  await pool.query(
    `
      insert into won_project_logs (
        won_project_id,
        log_type,
        title,
        body,
        progress_rate,
        health_status,
        next_action,
        created_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [projectId, logType, title, body ?? null, progressRate ?? null, healthStatus ?? null, nextAction ?? null, userId]
  );
}

wonProjectsRouter.get('/', async (req: Request, res: Response, next) => {
  const currentCompanyId = getCurrentCompanyId(req as AuthenticatedRequest);
  const query = asRecord(req.query);
  const page = getPositiveInteger(query.page, 1);
  const pageSize = getPositiveInteger(query.pageSize, 50, 100);
  const offset = (page - 1) * pageSize;
  const q = getString(query.q);
  const health = getString(query.healthStatus);
  const values: unknown[] = [currentCompanyId];
  const conditions = ['(wp.supplier_company_id = $1 or wp.buyer_company_id = $1)'];

  if (q) {
    values.push(`%${q}%`);
    conditions.push(`(wp.name ilike $${values.length} or buyer.name ilike $${values.length} or supplier.name ilike $${values.length})`);
  }

  if (health === 'normal' || health === 'watch' || health === 'risk') {
    values.push(health);
    conditions.push(`coalesce(latest_log.health_status, 'normal') = $${values.length}`);
  }

  try {
    const result = await pool.query<WonProjectRow>(
      `
        select
          wp.id,
          wp.contract_id,
          wp.job_id,
          wp.name,
          wp.status,
          wp.started_at,
          wp.ended_at,
          wp.planned_man_months,
          wp.actual_man_months,
          wp.buyer_company_id,
          buyer.name as buyer_name,
          wp.supplier_company_id,
          supplier.name as supplier_name,
          c.contract_amount::text,
          count(distinct pa.id)::text as assignment_count,
          coalesce(array_remove(array_agg(distinct r.name order by r.name), null), '{}') as assignment_names,
          latest_log.progress_rate,
          latest_log.health_status,
          latest_log.next_action,
          latest_log.created_at as latest_log_at
        from won_projects wp
        join companies buyer on buyer.id = wp.buyer_company_id
        join companies supplier on supplier.id = wp.supplier_company_id
        left join contracts c on c.id = wp.contract_id
        left join project_assignments pa on pa.won_project_id = wp.id
        left join resumes r on r.id = pa.resume_id
        left join lateral (
          select progress_rate, health_status, next_action, created_at
          from won_project_logs
          where won_project_id = wp.id
          order by created_at desc
          limit 1
        ) latest_log on true
        where ${conditions.join(' and ')}
        group by wp.id, buyer.name, supplier.name, c.contract_amount, latest_log.progress_rate, latest_log.health_status, latest_log.next_action, latest_log.created_at
        order by coalesce(wp.ended_at, wp.created_at::date) asc, wp.created_at desc
        limit $${values.length + 1}
        offset $${values.length + 2}
      `,
      [...values, pageSize, offset]
    );

    const countResult = await pool.query<{ total: string }>(
      `
        select count(distinct wp.id)::text as total
        from won_projects wp
        join companies buyer on buyer.id = wp.buyer_company_id
        join companies supplier on supplier.id = wp.supplier_company_id
        left join lateral (
          select health_status
          from won_project_logs
          where won_project_id = wp.id
          order by created_at desc
          limit 1
        ) latest_log on true
        where ${conditions.join(' and ')}
      `,
      values
    );

    const summary = {
      total: Number(countResult.rows[0]?.total ?? 0),
      totalAmount: result.rows.reduce((sum, row) => sum + Number(row.contract_amount ?? 0), 0),
      inspectionWaiting: result.rows.filter((row) => row.status === 'completed').length,
      riskProjects: result.rows.filter((row) => (row.health_status ?? 'normal') === 'risk').length,
      endingSoon: result.rows.filter((row) => {
        if (!row.ended_at) return false;
        const endedAt = new Date(row.ended_at);
        const days = Math.ceil((endedAt.getTime() - Date.now()) / 86400000);
        return days >= 0 && days <= 30;
      }).length
    };

    sendSuccess(res, {
      items: result.rows.map(toWonProject),
      total: summary.total,
      summary
    });
  } catch (error) {
    next(error);
  }
});

wonProjectsRouter.get('/:projectId', async (req: Request, res: Response, next) => {
  const currentCompanyId = getCurrentCompanyId(req as AuthenticatedRequest);
  const projectId = getString(req.params.projectId);

  try {
    const project = await getProjectById(projectId, currentCompanyId);
    if (!project) {
      sendError(res, 404, 'WON_PROJECT_NOT_FOUND', '수행 사업을 찾을 수 없습니다.');
      return;
    }

    const assignments = await pool.query<ProjectAssignmentRow>(
      `
        select
          pa.id,
          pa.resume_id,
          r.name,
          pa.role,
          pa.assigned_from,
          pa.assigned_to,
          pa.allocation_rate::text,
          pa.planned_man_months::text,
          pa.actual_man_months::text,
          pa.status
        from project_assignments pa
        join resumes r on r.id = pa.resume_id
        where pa.won_project_id = $1
        order by pa.assigned_from nulls last, r.name
      `,
      [projectId]
    );
    const logs = await pool.query<ProjectLogRow>(
      `
        select l.id, l.log_type, l.title, l.body, l.progress_rate, l.health_status, l.next_action, l.created_at, u.name as author_name
        from won_project_logs l
        left join users u on u.id = l.created_by
        where l.won_project_id = $1
        order by l.created_at desc
      `,
      [projectId]
    );

    sendSuccess(res, {
      ...toWonProject(project),
      assignments: assignments.rows.map(toAssignment),
      logs: logs.rows.map(toLog)
    });
  } catch (error) {
    next(error);
  }
});

wonProjectsRouter.post('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const currentUserId = getCurrentUserId(authReq);
  const body = asRecord(req.body);
  const name = getString(body.name);
  const buyerName = getString(body.buyerName);

  if (!name || !buyerName) {
    sendError(res, 400, 'VALIDATION_ERROR', '사업명과 발주기관은 필수입니다.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(
      `
        insert into companies (name, company_type, status, supports_buyer, supports_supplier)
        select $1, 'public_agency', 'active', true, false
        where not exists (
          select 1 from companies where lower(name) = lower($1)
        )
      `,
      [buyerName]
    );
    const buyerId = (await client.query<{ id: string }>('select id from companies where lower(name) = lower($1) limit 1', [buyerName])).rows[0]?.id;

    if (!buyerId) {
      throw new Error('Buyer company creation failed.');
    }

    const contractAmount = getNumber(body.contractAmount) ?? 0;
    const contractResult = await client.query<{ id: string }>(
      `
        insert into contracts (
          buyer_company_id,
          supplier_company_id,
          status,
          contract_amount,
          started_at,
          ended_at
        )
        values ($1, $2, 'active', $3, $4, $5)
        returning id
      `,
      [buyerId, currentCompanyId, contractAmount, getDate(body.startedAt), getDate(body.endedAt)]
    );
    const projectResult = await client.query<{ id: string }>(
      `
        insert into won_projects (
          contract_id,
          buyer_company_id,
          supplier_company_id,
          name,
          status,
          started_at,
          ended_at,
          planned_man_months,
          actual_man_months
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning id
      `,
      [
        contractResult.rows[0].id,
        buyerId,
        currentCompanyId,
        name,
        getProjectStatus(body.status),
        getDate(body.startedAt),
        getDate(body.endedAt),
        getNumber(body.plannedManMonths),
        getNumber(body.actualManMonths)
      ]
    );
    await client.query(
      `
        update company_relationships
        set relationship_type = 'won_project',
            status = 'active',
            first_activity_date = coalesce(first_activity_date, current_date),
            last_activity_date = current_date,
            updated_at = now()
        where source_company_id = $1
          and target_company_id = $2
          and source_perspective = 'supplier'
          and target_perspective = 'buyer'
      `,
      [currentCompanyId, buyerId]
    );
    await client.query(
      `
        insert into company_relationships (
          source_company_id,
          target_company_id,
          source_perspective,
          target_perspective,
          relationship_type,
          status,
          first_activity_date,
          last_activity_date
        )
        select $1, $2, 'supplier', 'buyer', 'won_project', 'active', current_date, current_date
        where not exists (
          select 1
          from company_relationships
          where source_company_id = $1
            and target_company_id = $2
            and source_perspective = 'supplier'
            and target_perspective = 'buyer'
        )
      `,
      [currentCompanyId, buyerId]
    );
    await client.query(
      `
        insert into won_project_logs (
          won_project_id,
          log_type,
          title,
          body,
          progress_rate,
          health_status,
          next_action,
          created_by
        )
        values ($1, 'created', '수행 사업 등록', $2, $3, $4, $5, $6)
      `,
      [
        projectResult.rows[0].id,
        getNullableString(body.logBody) ?? '신규 수행 사업이 등록되었습니다.',
        getProgressRate(body.progressRate, 0),
        getHealthStatus(body.healthStatus),
        getNullableString(body.nextAction),
        currentUserId
      ]
    );
    await client.query('commit');

    const created = await getProjectById(projectResult.rows[0].id, currentCompanyId);
    sendSuccess(res, created ? toWonProject(created) : { id: projectResult.rows[0].id }, 201);
  } catch (error) {
    await client.query('rollback');
    next(error);
  } finally {
    client.release();
  }
});

wonProjectsRouter.patch('/:projectId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const currentUserId = getCurrentUserId(authReq);
  const projectId = getString(req.params.projectId);
  const body = asRecord(req.body);
  const existing = await getProjectById(projectId, currentCompanyId);

  if (!existing) {
    sendError(res, 404, 'WON_PROJECT_NOT_FOUND', '수행 사업을 찾을 수 없습니다.');
    return;
  }

  try {
    await pool.query(
      `
        update won_projects
        set
          name = $1,
          status = $2,
          started_at = $3,
          ended_at = $4,
          planned_man_months = $5,
          actual_man_months = $6,
          updated_at = now()
        where id = $7
          and (supplier_company_id = $8 or buyer_company_id = $8)
      `,
      [
        getString(body.name) || existing.name,
        getProjectStatus(body.status, existing.status),
        getDate(body.startedAt) ?? formatDateValue(existing.started_at),
        getDate(body.endedAt) ?? formatDateValue(existing.ended_at),
        getNumber(body.plannedManMonths) ?? Number(existing.planned_man_months ?? 0),
        getNumber(body.actualManMonths) ?? Number(existing.actual_man_months ?? 0),
        projectId,
        currentCompanyId
      ]
    );

    if (existing.contract_id && 'contractAmount' in body) {
      await pool.query('update contracts set contract_amount = $1, updated_at = now() where id = $2', [getNumber(body.contractAmount) ?? 0, existing.contract_id]);
    }

    await insertLog({
      projectId,
      userId: currentUserId,
      logType: getLogType(body.logType),
      title: getString(body.logTitle) || '진행 상태 수정',
      body: getNullableString(body.logBody),
      progressRate: getProgressRate(body.progressRate, existing.progress_rate ?? 0),
      healthStatus: getHealthStatus(body.healthStatus, existing.health_status ?? 'normal'),
      nextAction: getNullableString(body.nextAction)
    });

    const updated = await getProjectById(projectId, currentCompanyId);
    sendSuccess(res, updated ? toWonProject(updated) : { id: projectId });
  } catch (error) {
    next(error);
  }
});

wonProjectsRouter.get('/:projectId/assignments', async (req: Request, res: Response, next) => {
  const currentCompanyId = getCurrentCompanyId(req as AuthenticatedRequest);
  const projectId = getString(req.params.projectId);

  try {
    const project = await getProjectById(projectId, currentCompanyId);
    if (!project) {
      sendError(res, 404, 'WON_PROJECT_NOT_FOUND', '수행 사업을 찾을 수 없습니다.');
      return;
    }

    const result = await pool.query<ProjectAssignmentRow>(
      `
        select pa.id, pa.resume_id, r.name, pa.role, pa.assigned_from, pa.assigned_to, pa.allocation_rate::text, pa.planned_man_months::text, pa.actual_man_months::text, pa.status
        from project_assignments pa
        join resumes r on r.id = pa.resume_id
        where pa.won_project_id = $1
        order by pa.assigned_from nulls last, r.name
      `,
      [projectId]
    );
    sendSuccess(res, { items: result.rows.map(toAssignment), total: result.rows.length });
  } catch (error) {
    next(error);
  }
});

wonProjectsRouter.post('/:projectId/logs', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);
  const currentUserId = getCurrentUserId(authReq);
  const projectId = getString(req.params.projectId);
  const body = asRecord(req.body);
  const title = getString(body.title);

  if (!title) {
    sendError(res, 400, 'VALIDATION_ERROR', '로그 제목은 필수입니다.');
    return;
  }

  try {
    const project = await getProjectById(projectId, currentCompanyId);
    if (!project) {
      sendError(res, 404, 'WON_PROJECT_NOT_FOUND', '수행 사업을 찾을 수 없습니다.');
      return;
    }

    await insertLog({
      projectId,
      userId: currentUserId,
      logType: getLogType(body.logType),
      title,
      body: getNullableString(body.body),
      progressRate: 'progressRate' in body ? getProgressRate(body.progressRate, project.progress_rate ?? 0) : null,
      healthStatus: 'healthStatus' in body ? getHealthStatus(body.healthStatus, project.health_status ?? 'normal') : null,
      nextAction: getNullableString(body.nextAction)
    });

    const logs = await pool.query<ProjectLogRow>(
      `
        select l.id, l.log_type, l.title, l.body, l.progress_rate, l.health_status, l.next_action, l.created_at, u.name as author_name
        from won_project_logs l
        left join users u on u.id = l.created_by
        where l.won_project_id = $1
        order by l.created_at desc
      `,
      [projectId]
    );

    sendSuccess(res, { items: logs.rows.map(toLog), total: logs.rows.length }, 201);
  } catch (error) {
    next(error);
  }
});
