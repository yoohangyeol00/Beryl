export const shorthands = undefined;

export function up(pgm) {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('companies', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    name: {
      type: 'varchar(255)',
      notNull: true
    },
    business_registration_no: {
      type: 'varchar(50)',
      unique: true
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

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    company_id: {
      type: 'uuid',
      references: 'companies(id)',
      onDelete: 'restrict'
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true
    },
    name: {
      type: 'varchar(100)',
      notNull: true
    },
    password_hash: {
      type: 'text',
      notNull: true
    },
    role: {
      type: 'varchar(30)',
      notNull: true,
      default: 'companyUser'
    },
    status: {
      type: 'varchar(30)',
      notNull: true,
      default: 'active'
    },
    last_login_at: {
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

  pgm.addConstraint('users', 'users_role_check', {
    check: "role in ('systemAdmin', 'companyUser')"
  });
  pgm.addConstraint('users', 'users_status_check', {
    check: "status in ('active', 'inactive', 'locked')"
  });
  pgm.createIndex('users', 'company_id');

  pgm.createTable('auth_sessions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade'
    },
    token_hash: {
      type: 'text',
      notNull: true,
      unique: true
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createIndex('auth_sessions', 'user_id');
  pgm.createIndex('auth_sessions', 'expires_at');
}

export function down(pgm) {
  pgm.dropTable('auth_sessions');
  pgm.dropTable('users');
  pgm.dropTable('companies');
}
