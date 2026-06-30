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

interface InvitationRow {
  id: string;
  company_member_id: string;
  email: string;
  role: InvitationRole;
  status: string;
  expires_at: string;
  sent_at: string | null;
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

companyMembersRouter.post('/invitations', async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const body = asRecord(req.body);
  const name = getString(body.name);
  const email = normalizeEmail(getString(body.email));
  const department = getString(body.department) || null;
  const position = getString(body.position) || null;
  const phone = getString(body.phone) || null;
  const roleInput = getString(body.role);
  const role: InvitationRole = 'companyUser';

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
                member_type = 'employee',
                status = 'active',
                updated_at = now()
            where id = $5
            returning id
          `,
          [name, department, position, phone, existingMember.rows[0].id]
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
            values ($1, $2, $3, $4, $5, $6, 'employee', 'active')
            returning id
          `,
          [currentCompanyId, name, department, position, email, phone]
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
          set resend_message_id = $1,
              sent_at = now(),
              updated_at = now()
          where id = $2
          returning id, company_member_id, email, role, status, expires_at, sent_at
        `,
        [emailResult.messageId, invitation.id]
      );

      sendSuccess(res, toInvitationResponse(sentResult.rows[0]), 201);
    } catch {
      await pool.query(
        `
          update user_invitations
          set status = 'revoked',
              updated_at = now()
          where id = $1
        `,
        [invitation.id]
      );

      sendError(res, 502, 'INVITATION_EMAIL_FAILED', '초대 메일 발송에 실패했습니다. 메일 설정을 확인해주세요.');
    }
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    next(error);
  } finally {
    client.release();
  }
});
