import { createHash, randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { config } from '../config.js';
import { pool } from '../db.js';
import { getCurrentCompanyId, getCurrentUserId, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendInvitationEmail } from '../services/email.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { createCompanyScopedRouter } from './companyScopedRouter.js';

export const companyMembersRouter = createCompanyScopedRouter();

type InvitationRole = 'companyUser';
type CompanyMemberType = 'employee' | 'reviewer' | 'manager';

const editableMemberTypes = new Set<CompanyMemberType>(['employee', 'reviewer', 'manager']);

interface InvitationRow {
  id: string;
  company_member_id: string;
  email: string;
  role: InvitationRole;
  status: string;
  expires_at: string;
  sent_at: string | null;
}

interface CompanyMemberRow {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  member_type: string;
  status: string;
  user_id: string | null;
  assigned_jobs: string | number;
  invitation_id: string | null;
  invitation_status: string | null;
  invitation_role: InvitationRole | null;
  invited_at: string | null;
  sent_at: string | null;
  expires_at: string | null;
  accepted_at: string | null;
  invited_by_user_id: string | null;
  invited_by_name: string | null;
  invited_by_email: string | null;
}

interface CompanyMemberInvitationHistoryRow {
  id: string;
  company_member_id: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string;
  status: string;
  invited_at: string;
  sent_at: string | null;
  expires_at: string;
  accepted_at: string | null;
  canceled_at: string | null;
}

interface CompanyMemberAssigneeRow {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  member_type: string;
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeMemberType(value: string): CompanyMemberType {
  return editableMemberTypes.has(value as CompanyMemberType) ? (value as CompanyMemberType) : 'employee';
}

function getInvitationEmailFailureMessage(error: unknown) {
  if (!config.brevoApiKey || !config.brevoSenderEmail) {
    const missingKeys = [
      !config.brevoApiKey ? 'BREVO_API_KEY' : '',
      !config.brevoSenderEmail ? 'BREVO_SENDER_EMAIL' : ''
    ].filter(Boolean);

    return `초대 메일 발송 설정이 없습니다. .env에 ${missingKeys.join(', ')} 값을 설정해주세요.`;
  }

  if (!config.isProduction && error instanceof Error && error.message) {
    return `초대 메일 발송에 실패했습니다. ${error.message}`;
  }

  return '초대 메일 발송에 실패했습니다. 메일 설정을 확인해주세요.';
}

async function ensureCompanyMemberManager(req: AuthenticatedRequest, res: Response): Promise<boolean> {
  if (req.auth?.user.role === 'systemAdmin') return true;

  if (req.auth?.member?.memberType === 'manager') return true;

  sendError(res, 403, 'COMPANY_MEMBER_MANAGER_REQUIRED', '회사 구성원/권한 관리는 관리자만 사용할 수 있습니다.');
  return false;
}

function createInvitationToken() {
  return randomBytes(32).toString('base64url');
}

function hashInvitationToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function toInvitationResponse(row: InvitationRow) {
  return {
    id: row.id,
    companyMemberId: row.company_member_id,
    email: row.email,
    role: row.role,
    status: row.status,
    expiresAt: row.expires_at,
    sentAt: row.sent_at
  };
}

function toCompanyMemberResponse(row: CompanyMemberRow) {
  return {
    id: row.id,
    name: row.name,
    department: row.department,
    position: row.position,
    email: row.email,
    phone: row.phone,
    memberType: row.member_type,
    status: row.status,
    userId: row.user_id,
    assignedJobs: Number(row.assigned_jobs ?? 0),
    invitation: row.invitation_id
      ? {
          id: row.invitation_id,
          status: row.invitation_status,
          role: row.invitation_role,
          invitedAt: row.invited_at,
          sentAt: row.sent_at,
          expiresAt: row.expires_at,
          acceptedAt: row.accepted_at,
          invitedBy: row.invited_by_user_id
            ? {
                id: row.invited_by_user_id,
                name: row.invited_by_name,
                email: row.invited_by_email
              }
            : null
        }
      : null
  };
}

function toCompanyMemberInvitationHistoryResponse(row: CompanyMemberInvitationHistoryRow) {
  return {
    id: row.id,
    companyMemberId: row.company_member_id,
    name: row.name,
    department: row.department,
    position: row.position,
    email: row.email,
    status: row.status,
    invitedAt: row.invited_at,
    sentAt: row.sent_at,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    canceledAt: row.canceled_at
  };
}

function toCompanyMemberAssigneeResponse(row: CompanyMemberAssigneeRow) {
  return {
    id: row.id,
    name: row.name,
    department: row.department,
    position: row.position,
    memberType: row.member_type
  };
}

companyMembersRouter.get('/assignees', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const currentCompanyId = getCurrentCompanyId(authReq);

  try {
    const result = await pool.query<CompanyMemberAssigneeRow>(
      `
        select id, name, department, position, member_type
        from company_members
        where company_id = $1
          and status = 'active'
          and member_type in ('employee', 'reviewer', 'manager')
        order by
          case member_type
            when 'manager' then 0
            when 'reviewer' then 1
            else 2
          end,
          name asc
      `,
      [currentCompanyId]
    );

    sendSuccess(res, {
      items: result.rows.map(toCompanyMemberAssigneeResponse),
      total: result.rowCount ?? result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

companyMembersRouter.get('/invitations', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!(await ensureCompanyMemberManager(authReq, res))) return;

  const currentCompanyId = getCurrentCompanyId(authReq);

  try {
    const result = await pool.query<CompanyMemberInvitationHistoryRow>(
      `
        select
          ui.id,
          ui.company_member_id,
          cm.name,
          cm.department,
          cm.position,
          ui.email,
          ui.status,
          ui.created_at as invited_at,
          ui.sent_at,
          ui.expires_at,
          ui.accepted_at,
          case when ui.status = 'revoked' then ui.updated_at else null end as canceled_at
        from user_invitations ui
        join company_members cm on cm.id = ui.company_member_id
        where ui.company_id = $1
          and cm.member_type <> 'contact'
        order by ui.created_at desc
      `,
      [currentCompanyId]
    );

    sendSuccess(res, {
      items: result.rows.map(toCompanyMemberInvitationHistoryResponse),
      total: result.rowCount ?? result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

companyMembersRouter.get('/', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!(await ensureCompanyMemberManager(authReq, res))) return;

  const currentCompanyId = getCurrentCompanyId(authReq);
  const query = asRecord(req.query);
  const q = getString(query.q);
  const status = getString(query.status);
  const values: unknown[] = [currentCompanyId];
  const conditions = [
    "cm.company_id = $1",
    "cm.member_type <> 'contact'",
    `
      not (
        cm.user_id is null
        and not exists (
          select 1
          from user_invitations active_invitation
          where active_invitation.company_member_id = cm.id
            and active_invitation.status in ('pending', 'accepted')
        )
        and exists (
          select 1
          from user_invitations hidden_invitation
          where hidden_invitation.company_member_id = cm.id
            and hidden_invitation.status = 'revoked'
        )
      )
    `
  ];

  if (status) {
    values.push(status);
    conditions.push(`cm.status = $${values.length}`);
  }

  if (q) {
    values.push(`%${q}%`);
    conditions.push(`
      (
        cm.name ilike $${values.length}
        or cm.department ilike $${values.length}
        or cm.position ilike $${values.length}
        or cm.email ilike $${values.length}
        or cm.phone ilike $${values.length}
      )
    `);
  }

  try {
    const result = await pool.query<CompanyMemberRow>(
      `
        select
          cm.id,
          cm.name,
          cm.department,
          cm.position,
          cm.email,
          cm.phone,
          cm.member_type,
          cm.status,
          cm.user_id,
          coalesce(job_counts.assigned_jobs, 0) as assigned_jobs,
          latest_invitation.id as invitation_id,
          latest_invitation.status as invitation_status,
          latest_invitation.role as invitation_role,
          latest_invitation.created_at as invited_at,
          latest_invitation.sent_at,
          latest_invitation.expires_at,
          latest_invitation.accepted_at,
          inviter.id as invited_by_user_id,
          inviter.name as invited_by_name,
          inviter.email as invited_by_email
        from company_members cm
        left join lateral (
          select count(*) as assigned_jobs
          from jobs j
          where j.internal_owner_member_id = cm.id
        ) job_counts on true
        left join lateral (
          select
            ui.id,
            ui.status,
            ui.role,
            ui.created_at,
            ui.sent_at,
            ui.expires_at,
            ui.accepted_at,
            ui.created_by_user_id
          from user_invitations ui
          where ui.company_member_id = cm.id
          order by
            case ui.status
              when 'accepted' then 0
              when 'pending' then 1
              else 2
            end,
            ui.accepted_at desc nulls last,
            ui.created_at desc
          limit 1
        ) latest_invitation on true
        left join users inviter on inviter.id = latest_invitation.created_by_user_id
        where ${conditions.join('\n          and ')}
        order by
          case cm.status
            when 'invited' then 0
            when 'active' then 1
            else 2
          end,
          cm.updated_at desc
      `,
      values
    );

    sendSuccess(res, {
      items: result.rows.map(toCompanyMemberResponse),
      total: result.rowCount ?? result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

companyMembersRouter.patch('/:memberId', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!(await ensureCompanyMemberManager(authReq, res))) return;

  const currentCompanyId = getCurrentCompanyId(authReq);
  const memberId = getString(req.params.memberId);
  const body = asRecord(req.body);
  const department = getString(body.department) || null;
  const position = getString(body.position) || null;
  const phone = getString(body.phone) || null;
  const memberTypeInput = getString(body.memberType);
  const memberType = memberTypeInput ? normalizeMemberType(memberTypeInput) : null;

  if (!memberId) {
    sendError(res, 400, 'VALIDATION_ERROR', '사용자 ID가 필요합니다.');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    const result = await client.query<{ id: string; user_id: string | null }>(
      `
        update company_members
        set department = $1,
            position = $2,
            phone = $3,
            member_type = coalesce($6, member_type),
            updated_at = now()
        where id = $4
          and company_id = $5
          and member_type <> 'contact'
        returning id, user_id
      `,
      [department, position, phone, memberId, currentCompanyId, memberType]
    );
    const member = result.rows[0];

    if (!member) {
      await client.query('rollback');
      sendError(res, 404, 'COMPANY_MEMBER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    await client.query('commit');
    sendSuccess(res, { id: member.id });
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    next(error);
  } finally {
    client.release();
  }
});

companyMembersRouter.patch('/:memberId/cancel-invitation', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!(await ensureCompanyMemberManager(authReq, res))) return;

  const currentCompanyId = getCurrentCompanyId(authReq);
  const memberId = getString(req.params.memberId);

  if (!memberId) {
    sendError(res, 400, 'VALIDATION_ERROR', '사용자 ID가 필요합니다.');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    const memberResult = await client.query<{ id: string }>(
      `
        update company_members
        set status = 'inactive',
            updated_at = now()
        where id = $1
          and company_id = $2
          and member_type <> 'contact'
          and status = 'invited'
        returning id
      `,
      [memberId, currentCompanyId]
    );
    const member = memberResult.rows[0];

    if (!member) {
      await client.query('rollback');
      sendError(res, 404, 'COMPANY_MEMBER_INVITATION_NOT_FOUND', '취소할 초대 대기 사용자를 찾을 수 없습니다.');
      return;
    }

    await client.query(
      `
        update user_invitations
        set status = 'revoked',
            updated_at = now()
        where company_id = $1
          and company_member_id = $2
          and status = 'pending'
      `,
      [currentCompanyId, memberId]
    );

    await client.query('commit');
    sendSuccess(res, { id: member.id });
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    next(error);
  } finally {
    client.release();
  }
});

companyMembersRouter.patch('/:memberId/deactivate', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!(await ensureCompanyMemberManager(authReq, res))) return;

  const currentCompanyId = getCurrentCompanyId(authReq);
  const memberId = getString(req.params.memberId);

  if (!memberId) {
    sendError(res, 400, 'VALIDATION_ERROR', '사용자 ID가 필요합니다.');
    return;
  }

  try {
    const result = await pool.query<{ id: string }>(
      `
        update company_members
        set status = 'inactive',
            updated_at = now()
        where id = $1
          and company_id = $2
          and member_type <> 'contact'
          and status = 'active'
        returning id
      `,
      [memberId, currentCompanyId]
    );
    const member = result.rows[0];

    if (!member) {
      sendError(res, 404, 'COMPANY_MEMBER_NOT_FOUND', '비활성화할 활성 사용자를 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, { id: member.id });
  } catch (error) {
    next(error);
  }
});

companyMembersRouter.patch('/:memberId/activate', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!(await ensureCompanyMemberManager(authReq, res))) return;

  const currentCompanyId = getCurrentCompanyId(authReq);
  const memberId = getString(req.params.memberId);

  if (!memberId) {
    sendError(res, 400, 'VALIDATION_ERROR', '사용자 ID가 필요합니다.');
    return;
  }

  try {
    const result = await pool.query<{ id: string }>(
      `
        update company_members
        set status = 'active',
            updated_at = now()
        where id = $1
          and company_id = $2
          and member_type <> 'contact'
          and status = 'inactive'
          and user_id is not null
        returning id
      `,
      [memberId, currentCompanyId]
    );
    const member = result.rows[0];

    if (!member) {
      sendError(res, 404, 'COMPANY_MEMBER_NOT_FOUND', '활성화할 비활성 계정을 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, { id: member.id });
  } catch (error) {
    next(error);
  }
});

companyMembersRouter.post('/invitations', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  if (!(await ensureCompanyMemberManager(authReq, res))) return;

  const body = asRecord(req.body);
  const name = getString(body.name);
  const email = normalizeEmail(getString(body.email));
  const department = getString(body.department) || null;
  const position = getString(body.position) || null;
  const phone = getString(body.phone) || null;
  const roleInput = getString(body.role);
  const role: InvitationRole = 'companyUser';
  const memberType = normalizeMemberType(getString(body.memberType));

  if (roleInput && roleInput !== role) {
    sendError(res, 400, 'INVALID_INVITATION_ROLE', '회사 사용자 초대는 companyUser 권한만 사용할 수 있습니다.');
    return;
  }

  if (!name || !email) {
    sendError(res, 400, 'VALIDATION_ERROR', '이름과 이메일은 필수입니다.');
    return;
  }

  if (!isValidEmail(email)) {
    sendError(res, 400, 'INVALID_EMAIL', '이메일 형식이 올바르지 않습니다.');
    return;
  }

  const currentCompanyId = getCurrentCompanyId(authReq);
  const currentUserId = getCurrentUserId(authReq);
  const invitationToken = createInvitationToken();
  const tokenHash = hashInvitationToken(invitationToken);
  const client = await pool.connect();

  try {
    await client.query('begin');

    const companyResult = await client.query<{ name: string }>('select name from companies where id = $1 limit 1', [
      currentCompanyId
    ]);
    const companyName = companyResult.rows[0]?.name;

    if (!companyName) {
      await client.query('rollback');
      sendError(res, 404, 'COMPANY_NOT_FOUND', '소속 기업 정보를 찾을 수 없습니다.');
      return;
    }

    const existingUser = await client.query<{ id: string }>('select id from users where email = $1 limit 1', [email]);

    if (existingUser.rowCount) {
      await client.query('rollback');
      sendError(res, 409, 'USER_EMAIL_ALREADY_EXISTS', '이미 가입된 이메일입니다.');
      return;
    }

    const existingMember = await client.query<{ id: string }>(
      `
        select id
        from company_members
        where company_id = $1
          and lower(email) = lower($2)
        limit 1
      `,
      [currentCompanyId, email]
    );

    const memberResult = existingMember.rows[0]
      ? await client.query<{ id: string }>(
          `
            update company_members
            set name = $1,
                department = $2,
                position = $3,
                phone = $4,
                member_type = $6,
                status = 'invited',
                updated_at = now()
            where id = $5
            returning id
          `,
          [name, department, position, phone, existingMember.rows[0].id, memberType]
        )
      : await client.query<{ id: string }>(
          `
            insert into company_members (
              company_id,
              name,
              department,
              position,
              email,
              phone,
              member_type,
              status
            )
            values ($1, $2, $3, $4, $5, $6, $7, 'invited')
            returning id
          `,
          [currentCompanyId, name, department, position, email, phone, memberType]
        );

    const companyMemberId = memberResult.rows[0].id;

    await client.query(
      `
        update user_invitations
        set status = 'revoked',
            updated_at = now()
        where company_id = $1
          and lower(email) = lower($2)
          and status = 'pending'
      `,
      [currentCompanyId, email]
    );

    const invitationResult = await client.query<InvitationRow>(
      `
        insert into user_invitations (
          company_id,
          company_member_id,
          email,
          role,
          token_hash,
          status,
          expires_at,
          created_by_user_id
        )
        values ($1, $2, $3, $4, $5, 'pending', now() + ($6::text || ' hours')::interval, $7)
        returning id, company_member_id, email, role, status, expires_at, sent_at
      `,
      [currentCompanyId, companyMemberId, email, role, tokenHash, config.invitationTtlHours, currentUserId]
    );

    await client.query('commit');

    const invitation = invitationResult.rows[0];

    try {
      const emailResult = await sendInvitationEmail({
        to: email,
        name,
        companyName,
        token: invitationToken
      });

      const sentResult = await pool.query<InvitationRow>(
        `
          update user_invitations
          set email_message_id = $1,
              sent_at = now(),
              updated_at = now()
          where id = $2
          returning id, company_member_id, email, role, status, expires_at, sent_at
        `,
        [emailResult.messageId, invitation.id]
      );

      sendSuccess(res, toInvitationResponse(sentResult.rows[0]), 201);
    } catch (error) {
      console.error('Failed to send company member invitation email:', error);

      await pool.query(
        `
          update user_invitations
          set status = 'revoked',
              updated_at = now()
          where id = $1
        `,
        [invitation.id]
      );

      sendError(res, 502, 'INVITATION_EMAIL_FAILED', getInvitationEmailFailureMessage(error));
    }
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    next(error);
  } finally {
    client.release();
  }
});
