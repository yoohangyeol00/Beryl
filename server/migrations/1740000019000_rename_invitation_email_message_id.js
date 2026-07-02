export const shorthands = undefined;

export function up(pgm) {
  pgm.renameColumn('user_invitations', 'resend_message_id', 'email_message_id');
}

export function down(pgm) {
  pgm.renameColumn('user_invitations', 'email_message_id', 'resend_message_id');
}
