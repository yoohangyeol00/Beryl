import { config } from '../config.js';

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type SendInvitationEmailInput = {
  to: string;
  name: string;
  companyName: string;
  token: string;
};

type ResendEmailResponse = {
  id?: string;
  message?: string;
};

const resendEmailEndpoint = 'https://api.resend.com/emails';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function assertEmailConfig() {
  if (!config.resendApiKey) {
    throw new Error('RESEND_API_KEY is required to send email.');
  }

  if (!config.invitationFromEmail) {
    throw new Error('INVITATION_FROM_EMAIL is required to send invitation email.');
  }
}

export function buildInvitationAcceptUrl(token: string) {
  const url = new URL('/invitations/accept', config.clientOrigin);
  url.searchParams.set('token', token);
  return url.toString();
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  assertEmailConfig();

  const response = await fetch(resendEmailEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: config.invitationFromEmail,
      to,
      subject,
      html,
      text
    })
  });

  const result = (await response.json().catch(() => ({}))) as ResendEmailResponse;

  if (!response.ok) {
    throw new Error(result.message || `Resend email request failed with status ${response.status}.`);
  }

  if (!result.id) {
    throw new Error('Resend email response did not include message id.');
  }

  return {
    messageId: result.id
  };
}

export async function sendInvitationEmail({ to, name, companyName, token }: SendInvitationEmailInput) {
  const invitationUrl = buildInvitationAcceptUrl(token);
  const subject = `[BERYL] ${companyName}에서 사용자 초대를 보냈습니다`;
  const escapedName = escapeHtml(name);
  const escapedCompanyName = escapeHtml(companyName);
  const escapedInvitationUrl = escapeHtml(invitationUrl);

  return sendEmail({
    to,
    subject,
    text: `${name}님, ${companyName}에서 BERYL 사용자로 초대했습니다. 아래 링크에서 비밀번호를 설정하고 초대를 수락해주세요. ${invitationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2933;">
        <h1 style="font-size: 20px; margin-bottom: 16px;">BERYL 사용자 초대</h1>
        <p>${escapedName}님,</p>
        <p><strong>${escapedCompanyName}</strong>에서 BERYL 사용자로 초대했습니다.</p>
        <p>아래 버튼을 눌러 비밀번호를 설정하고 초대를 수락해주세요.</p>
        <p style="margin: 24px 0;">
          <a href="${escapedInvitationUrl}" style="display: inline-block; padding: 12px 18px; background: #006c4c; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 700;">
            초대 수락하기
          </a>
        </p>
        <p style="font-size: 13px; color: #52605d;">버튼이 동작하지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요.</p>
        <p style="font-size: 13px; word-break: break-all;">${escapedInvitationUrl}</p>
      </div>
    `
  });
}
