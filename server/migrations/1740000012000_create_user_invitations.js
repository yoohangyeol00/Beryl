export const shorthands = undefined;

export function up(pgm) {
  pgm.createTable('user_invitations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    company_id: {
      type: 'uuid',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    company_member_id: {
      type: 'uuid',
      notNull: true,
      references: 'company_members(id)',
      onDelete: 'cascade'
    },
    email: {
      type: 'varchar(255)',
      notNull: true
    },
    role: {
      type: 'varchar(30)',
      notNull: true,
      default: 'companyUser'
    },
    token_hash: {
      type: 'text',
      notNull: true,
      unique: true
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'pending'
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true
    },
    accepted_at: {
      type: 'timestamptz'
    },
    accepted_user_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'set null'
    },
    created_by_user_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'set null'
    },
    resend_message_id: {
      type: 'varchar(255)'
    },
    sent_at: {
      type: 'timestamptz'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.addConstraint('user_invitations', 'user_invitations_role_check', {
    check: "role in ('systemAdmin', 'companyUser')"
  });
  pgm.addConstraint('user_invitations', 'user_invitations_status_check', {
    check: "status in ('pending', 'accepted', 'expired', 'revoked')"
  });
  pgm.createIndex('user_invitations', 'company_id');
  pgm.createIndex('user_invitations', 'company_member_id');
  pgm.createIndex('user_invitations', 'email');
  pgm.createIndex('user_invitations', 'expires_at');
  pgm.createIndex('user_invitations', ['company_id', 'email', 'status']);
}

export function down(pgm) {
  pgm.dropTable('user_invitations');
}
