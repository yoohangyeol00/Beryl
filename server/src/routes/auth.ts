import { createHash } from 'crypto';
import { Router, type Request, type Response } from 'express';
import { hashPassword, verifyPassword } from '../auth/password.js';
import {
  clearSessionCookie,
  createSessionToken,
  getCookieValue,
  getSessionExpiresAt,
  hashSessionToken,
  setSessionCookie
} from '../auth/session.js';
import { config } from '../config.js';
import { pool } from '../db.js';
import { requireAuth, type AuthenticatedRequest, type AuthRole } from '../middleware/auth.js';
import { normalizeBusinessNumber, verifyBusinessStatus } from '../services/businessVerification.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

export const authRouter = Router();

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  company_id: string | null;
  password_hash: string;
  status: string;
  company_name: string | null;
  company_business_registration_no: string | null;
  company_type: string | null;
  company_representative_name: string | null;
  company_address: string | null;
  company_contact_phone: string | null;
  company_contact_email: string | null;
  company_status: string | null;
  company_logo_url: string | null;
  company_supports_buyer: boolean | null;
  company_supports_supplier: boolean | null;
  member_id: string | null;
  member_name: string | null;
  member_department: string | null;
  member_position: string | null;
  member_email: string | null;
  member_phone: string | null;
  member_type: string | null;
}

interface CompanyResponse {
  id: string;
  name: string;
  businessRegistrationNo: string | null;
  companyType: string | null;
  representativeName: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: string | null;
  logoUrl: string | null;
  supportsBuyer: boolean;
  supportsSupplier: boolean;
}

interface MemberResponse {
  id: string;
  name: string;
  department: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  memberType: string;
}

interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  companyId: string | null;
}

interface AuthResponse {
  user: UserResponse;
  company: CompanyResponse | null;
  member: MemberResponse | null;
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

function getBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashInvitationToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function toAuthResponse(row: UserRow): AuthResponse {
  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      companyId: row.company_id
    },
    company:
      row.company_id && row.company_name
          ? {
            id: row.company_id,
            name: row.company_name,
            businessRegistrationNo: row.company_business_registration_no,
            companyType: row.company_type,
            representativeName: row.company_representative_name,
            address: row.company_address,
            contactPhone: row.company_contact_phone,
            contactEmail: row.company_contact_email,
            status: row.company_status,
            logoUrl: row.company_logo_url,
            supportsBuyer: row.company_supports_buyer ?? true,
            supportsSupplier: row.company_supports_supplier ?? true
          }
        : null,
    member: row.member_id
      ? {
          id: row.member_id,
          name: row.member_name ?? row.name,
          department: row.member_department,
          position: row.member_position,
          email: row.member_email,
          phone: row.member_phone,
          memberType: row.member_type ?? 'employee'
        }
      : null
  };
}

async function findUserForAuthResponse(userId: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    `
      select
        u.id,
        u.email,
        u.name,
        u.role,
        u.company_id,
        u.password_hash,
        u.status,
        c.name as company_name,
        c.business_registration_no as company_business_registration_no,
        c.company_type,
        c.representative_name as company_representative_name,
        c.address as company_address,
        c.contact_phone as company_contact_phone,
        c.contact_email as company_contact_email,
        c.status as company_status,
        c.logo_url as company_logo_url,
        c.supports_buyer as company_supports_buyer,
        c.supports_supplier as company_supports_supplier,
        cm.id as member_id,
        cm.name as member_name,
        cm.department as member_department,
        cm.position as member_position,
        cm.email as member_email,
        cm.phone as member_phone,
        cm.member_type
      from users u
      left join companies c on c.id = u.company_id
      left join company_members cm on cm.user_id = u.id
      where u.id = $1
      limit 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

async function createSessionForUser(res: Response, userId: string): Promise<void> {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiresAt();

  await pool.query(
    `
      insert into auth_sessions (user_id, token_hash, expires_at)
      values ($1, $2, $3)
    `,
    [userId, tokenHash, expiresAt]
  );

  setSessionCookie(res, token, expiresAt);
}

authRouter.post('/signup', async (req, res, next) => {
  const body = asRecord(req.body);

  if ('role' in body) {
    sendError(res, 400, 'ROLE_NOT_ALLOWED', '회원가입 요청에는 role을 포함할 수 없습니다.');
    return;
  }

  const name = getString(body.name);
  const email = normalizeEmail(getString(body.email));
  const password = getString(body.password);
  const passwordConfirm = getString(body.passwordConfirm);
  const company = asRecord(body.company);
  const companyName = getString(company.name);
  const businessRegistrationNoInput = getString(company.businessRegistrationNo);
  const businessRegistrationNo = businessRegistrationNoInput ? normalizeBusinessNumber(businessRegistrationNoInput) : null;
  const businessRegistrationNoVerified = getBoolean(company.businessRegistrationNoVerified);
  const supportsBuyer = getBoolean(company.supportsBuyer);
  const supportsSupplier = getBoolean(company.supportsSupplier);

  if (!name || !email || !password || !passwordConfirm || !companyName || !businessRegistrationNo) {
    sendError(res, 400, 'VALIDATION_ERROR', '이름, 이메일, 비밀번호, 기업명, 사업자등록번호는 필수입니다.');
    return;
  }

  if (!supportsBuyer && !supportsSupplier) {
    sendError(res, 400, 'COMPANY_PERSPECTIVE_REQUIRED', '발주기관 또는 공급기관 중 하나 이상을 선택해주세요.');
    return;
  }

  if (!isValidEmail(email)) {
    sendError(res, 400, 'INVALID_EMAIL', '이메일 형식이 올바르지 않습니다.');
    return;
  }

  if (password.length < 8) {
    sendError(res, 400, 'WEAK_PASSWORD', '비밀번호는 8자 이상이어야 합니다.');
    return;
  }

  if (password !== passwordConfirm) {
    sendError(res, 400, 'PASSWORD_MISMATCH', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    return;
  }

  if (businessRegistrationNo.length !== 10) {
    sendError(res, 400, 'INVALID_BUSINESS_REGISTRATION_NO', '사업자등록번호는 숫자 10자리로 입력해주세요.');
    return;
  }

  if (!businessRegistrationNoVerified) {
    sendError(res, 400, 'BUSINESS_REGISTRATION_NOT_VERIFIED', '사업자등록번호 인증을 완료해주세요.');
    return;
  }

  try {
    const verification = await verifyBusinessStatus(businessRegistrationNo);

    if (!verification.verified) {
      sendError(
        res,
        400,
        'BUSINESS_REGISTRATION_NOT_ACTIVE',
        verification.statusMessage || '유효한 사업자등록번호가 아닙니다.'
      );
      return;
    }
  } catch (error) {
    sendError(
      res,
      error instanceof Error && error.message.includes('서비스 키') ? 400 : 502,
      'BUSINESS_REGISTRATION_VERIFICATION_FAILED',
      error instanceof Error ? error.message : '사업자등록번호 인증에 실패했습니다.'
    );
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    const existingUser = await client.query('select id from users where email = $1 limit 1', [email]);

    if (existingUser.rowCount) {
      await client.query('rollback');
      sendError(res, 409, 'EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다.');
      return;
    }

    if (businessRegistrationNo) {
      const existingCompany = await client.query('select id from companies where business_registration_no = $1 limit 1', [
      businessRegistrationNo
      ]);

      if (existingCompany.rowCount) {
        await client.query('rollback');
        sendError(res, 409, 'COMPANY_ALREADY_EXISTS', '이미 등록된 기업 식별값입니다.');
        return;
      }
    }

    const companyResult = await client.query<{ id: string; name: string }>(
      `
        insert into companies (name, business_registration_no, supports_buyer, supports_supplier)
        values ($1, $2, $3, $4)
        returning id, name
      `,
      [companyName, businessRegistrationNo, supportsBuyer, supportsSupplier]
    );
    const createdCompany = companyResult.rows[0];
    const passwordHash = await hashPassword(password);
    const userResult = await client.query<{ id: string }>(
      `
        insert into users (company_id, email, name, password_hash, role, status)
        values ($1, $2, $3, $4, 'companyUser', 'active')
        returning id
      `,
      [createdCompany.id, email, name, passwordHash]
    );
    const createdUser = userResult.rows[0];

    await client.query(
      `
        insert into company_members (company_id, user_id, name, email, member_type, status)
        values ($1, $2, $3, $4, 'manager', 'active')
      `,
      [createdCompany.id, createdUser.id, name, email]
    );

    await client.query('commit');
    await createSessionForUser(res, createdUser.id);

    const responseUser = await findUserForAuthResponse(createdUser.id);

    if (!responseUser) {
      sendError(res, 500, 'AUTH_RESPONSE_NOT_FOUND', '가입된 사용자 정보를 불러오지 못했습니다.');
      return;
    }

    sendSuccess(res, toAuthResponse(responseUser), 201);
  } catch (error) {
    await client.query('rollback');
    next(error);
  } finally {
    client.release();
  }
});

authRouter.get('/invitations/accept', async (req: Request, res: Response, next) => {
  const token = getString(req.query.token);

  if (!token) {
    sendError(res, 400, 'INVITATION_TOKEN_REQUIRED', '초대 토큰이 필요합니다.');
    return;
  }

  try {
    const result = await pool.query<{
      id: string;
      email: string;
      expires_at: string;
      company_name: string;
      member_name: string;
      member_department: string | null;
      member_position: string | null;
    }>(
      `
        select
          ui.id,
          ui.email,
          ui.expires_at,
          c.name as company_name,
          cm.name as member_name,
          cm.department as member_department,
          cm.position as member_position
        from user_invitations ui
        join companies c on c.id = ui.company_id
        join company_members cm on cm.id = ui.company_member_id
        where ui.token_hash = $1
          and ui.status = 'pending'
        limit 1
      `,
      [hashInvitationToken(token)]
    );
    const invitation = result.rows[0];

    if (!invitation) {
      sendError(res, 404, 'INVITATION_NOT_FOUND', '유효한 초대 링크를 찾을 수 없습니다.');
      return;
    }

    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      await pool.query("update user_invitations set status = 'expired', updated_at = now() where id = $1", [
        invitation.id
      ]);
      sendError(res, 410, 'INVITATION_EXPIRED', '만료된 초대 링크입니다. 다시 초대를 요청해주세요.');
      return;
    }

    sendSuccess(res, {
      email: invitation.email,
      name: invitation.member_name,
      companyName: invitation.company_name,
      department: invitation.member_department,
      position: invitation.member_position,
      expiresAt: invitation.expires_at
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/invitations/accept', async (req: Request, res: Response, next) => {
  const body = asRecord(req.body);
  const token = getString(body.token);
  const password = getString(body.password);
  const passwordConfirm = getString(body.passwordConfirm);

  if (!token || !password || !passwordConfirm) {
    sendError(res, 400, 'VALIDATION_ERROR', '초대 토큰과 비밀번호를 입력해주세요.');
    return;
  }

  if (password.length < 8) {
    sendError(res, 400, 'WEAK_PASSWORD', '비밀번호는 8자 이상이어야 합니다.');
    return;
  }

  if (password !== passwordConfirm) {
    sendError(res, 400, 'PASSWORD_MISMATCH', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    const invitationResult = await client.query<{
      id: string;
      company_id: string;
      company_member_id: string;
      email: string;
      role: AuthRole;
      expires_at: string;
      member_name: string;
      member_user_id: string | null;
    }>(
      `
        select
          ui.id,
          ui.company_id,
          ui.company_member_id,
          ui.email,
          ui.role,
          ui.expires_at,
          cm.name as member_name,
          cm.user_id as member_user_id
        from user_invitations ui
        join company_members cm on cm.id = ui.company_member_id
        where ui.token_hash = $1
          and ui.status = 'pending'
        limit 1
        for update
      `,
      [hashInvitationToken(token)]
    );
    const invitation = invitationResult.rows[0];

    if (!invitation) {
      await client.query('rollback');
      sendError(res, 404, 'INVITATION_NOT_FOUND', '유효한 초대 링크를 찾을 수 없습니다.');
      return;
    }

    if (new Date(invitation.expires_at).getTime() <= Date.now()) {
      await client.query("update user_invitations set status = 'expired', updated_at = now() where id = $1", [
        invitation.id
      ]);
      await client.query('commit');
      sendError(res, 410, 'INVITATION_EXPIRED', '만료된 초대 링크입니다. 다시 초대를 요청해주세요.');
      return;
    }

    if (invitation.member_user_id) {
      await client.query('rollback');
      sendError(res, 409, 'INVITATION_ALREADY_ACCEPTED', '이미 수락된 초대입니다.');
      return;
    }

    const existingUser = await client.query('select id from users where email = $1 limit 1', [invitation.email]);

    if (existingUser.rowCount) {
      await client.query('rollback');
      sendError(res, 409, 'EMAIL_ALREADY_EXISTS', '이미 가입된 이메일입니다.');
      return;
    }

    const passwordHash = await hashPassword(password);
    const userResult = await client.query<{ id: string }>(
      `
        insert into users (company_id, email, name, password_hash, role, status)
        values ($1, $2, $3, $4, $5, 'active')
        returning id
      `,
      [invitation.company_id, invitation.email, invitation.member_name, passwordHash, invitation.role]
    );
    const createdUser = userResult.rows[0];

    await client.query(
      `
        update company_members
        set user_id = $1,
            status = 'active',
            updated_at = now()
        where id = $2
      `,
      [createdUser.id, invitation.company_member_id]
    );

    await client.query(
      `
        update user_invitations
        set status = 'accepted',
            accepted_at = now(),
            accepted_user_id = $1,
            updated_at = now()
        where id = $2
      `,
      [createdUser.id, invitation.id]
    );

    await client.query('commit');
    await createSessionForUser(res, createdUser.id);

    const responseUser = await findUserForAuthResponse(createdUser.id);

    if (!responseUser) {
      sendError(res, 500, 'AUTH_RESPONSE_NOT_FOUND', '가입된 사용자 정보를 불러오지 못했습니다.');
      return;
    }

    sendSuccess(res, toAuthResponse(responseUser), 201);
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    next(error);
  } finally {
    client.release();
  }
});

authRouter.post('/login', async (req, res, next) => {
  const body = asRecord(req.body);
  const email = normalizeEmail(getString(body.email));
  const password = getString(body.password);

  if (!email || !password) {
    sendError(res, 400, 'VALIDATION_ERROR', '이메일과 비밀번호를 입력해주세요.');
    return;
  }

  try {
    const result = await pool.query<UserRow>(
      `
        select
          u.id,
          u.email,
          u.name,
          u.role,
          u.company_id,
          u.password_hash,
          u.status,
          c.name as company_name,
          c.business_registration_no as company_business_registration_no,
          c.company_type,
          c.representative_name as company_representative_name,
          c.address as company_address,
          c.contact_phone as company_contact_phone,
          c.contact_email as company_contact_email,
          c.status as company_status,
          c.logo_url as company_logo_url,
          c.supports_buyer as company_supports_buyer,
          c.supports_supplier as company_supports_supplier,
          cm.id as member_id,
          cm.name as member_name,
          cm.department as member_department,
          cm.position as member_position,
          cm.email as member_email,
          cm.phone as member_phone,
          cm.member_type
        from users u
        left join companies c on c.id = u.company_id
        left join company_members cm on cm.user_id = u.id
        where u.email = $1
        limit 1
      `,
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      sendError(res, 401, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    if (user.status !== 'active') {
      sendError(res, 403, 'USER_NOT_ACTIVE', '탈퇴 처리된 계정입니다.');
      return;
    }

    await pool.query('update users set last_login_at = now(), updated_at = now() where id = $1', [user.id]);
    await createSessionForUser(res, user.id);

    sendSuccess(res, toAuthResponse(user));
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const token = getCookieValue(req.headers.cookie, config.sessionCookieName);

    if (token) {
      await pool.query('delete from auth_sessions where token_hash = $1', [hashSessionToken(token)]);
    }

    clearSessionCookie(res);
    sendSuccess(res, { ok: true });
  } catch (error) {
    next(error);
  }
});

authRouter.delete('/me', requireAuth, async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.auth?.user.id;

  if (!userId) {
    sendError(res, 401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('begin');

    await client.query(
      `
        update users
        set status = 'inactive',
            updated_at = now()
        where id = $1
      `,
      [userId]
    );
    await client.query(
      `
        update company_members
        set status = 'inactive',
            updated_at = now()
        where user_id = $1
      `,
      [userId]
    );
    await client.query('delete from auth_sessions where user_id = $1', [userId]);

    await client.query('commit');

    clearSessionCookie(res);
    sendSuccess(res, { ok: true });
  } catch (error) {
    await client.query('rollback');
    next(error);
  } finally {
    client.release();
  }
});

authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.auth) {
    sendError(res, 401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
    return;
  }

  sendSuccess(res, authReq.auth);
});

authRouter.patch('/me', requireAuth, async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const body = asRecord(req.body);
  const name = getString(body.name);
  const email = normalizeEmail(getString(body.email));
  const department = getString(body.department) || null;
  const position = getString(body.position) || null;
  const phone = getString(body.phone) || null;

  if (!authReq.auth?.user.id) {
    sendError(res, 401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
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

  const client = await pool.connect();

  try {
    await client.query('begin');

    const existingUser = await client.query('select id from users where email = $1 and id <> $2 limit 1', [
      email,
      authReq.auth.user.id
    ]);

    if (existingUser.rowCount) {
      await client.query('rollback');
      sendError(res, 409, 'EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다.');
      return;
    }

    const result = await client.query<{ company_id: string | null }>(
      `
        update users
        set name = $1,
            email = $2,
            updated_at = now()
        where id = $3
        returning company_id
      `,
      [name, email, authReq.auth.user.id]
    );
    const companyId = result.rows[0]?.company_id;

    if (companyId) {
      await client.query(
        `
          insert into company_members (
            company_id,
            user_id,
            name,
            department,
            position,
            email,
            phone,
            member_type,
            status
          )
          values ($1, $2, $3, $4, $5, $6, $7, 'manager', 'active')
          on conflict (user_id)
          do update set
            name = excluded.name,
            department = excluded.department,
            position = excluded.position,
            email = excluded.email,
            phone = excluded.phone,
            updated_at = now()
        `,
        [companyId, authReq.auth.user.id, name, department, position, email, phone]
      );
    }

    await client.query('commit');

    const nextUser = await findUserForAuthResponse(authReq.auth.user.id);

    if (!nextUser) {
      sendError(res, 404, 'USER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다.');
      return;
    }

    sendSuccess(res, toAuthResponse(nextUser));
  } catch (error) {
    await client.query('rollback');
    next(error);
  } finally {
    client.release();
  }
});

authRouter.patch('/me/password', requireAuth, async (req: Request, res: Response, next) => {
  const authReq = req as AuthenticatedRequest;
  const body = asRecord(req.body);
  const currentPassword = getString(body.currentPassword);
  const newPassword = getString(body.newPassword);

  if (!authReq.auth?.user.id) {
    sendError(res, 401, 'UNAUTHENTICATED', '로그인이 필요합니다.');
    return;
  }

  if (!currentPassword || !newPassword) {
    sendError(res, 400, 'VALIDATION_ERROR', '현재 비밀번호와 새 비밀번호를 입력해주세요.');
    return;
  }

  if (newPassword.length < 8) {
    sendError(res, 400, 'WEAK_PASSWORD', '새 비밀번호는 8자 이상이어야 합니다.');
    return;
  }

  try {
    const result = await pool.query<{ password_hash: string }>('select password_hash from users where id = $1 limit 1', [
      authReq.auth.user.id
    ]);
    const user = result.rows[0];

    if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
      sendError(res, 401, 'INVALID_PASSWORD', '현재 비밀번호가 올바르지 않습니다.');
      return;
    }

    const nextPasswordHash = await hashPassword(newPassword);

    await pool.query('update users set password_hash = $1, updated_at = now() where id = $2', [
      nextPasswordHash,
      authReq.auth.user.id
    ]);

    sendSuccess(res, { ok: true });
  } catch (error) {
    next(error);
  }
});
