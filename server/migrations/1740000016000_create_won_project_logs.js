export const shorthands = undefined;

export function up(pgm) {
  pgm.createTable('won_project_logs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    won_project_id: {
      type: 'uuid',
      notNull: true,
      references: 'won_projects(id)',
      onDelete: 'cascade'
    },
    log_type: {
      type: 'varchar(30)',
      notNull: true,
      default: 'progress'
    },
    title: {
      type: 'varchar(255)',
      notNull: true
    },
    body: {
      type: 'text'
    },
    progress_rate: {
      type: 'integer'
    },
    health_status: {
      type: 'varchar(30)'
    },
    next_action: {
      type: 'text'
    },
    created_by: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'set null'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.addConstraint('won_project_logs', 'won_project_logs_type_check', {
    check: "log_type in ('created', 'progress', 'risk', 'inspection', 'memo')"
  });
  pgm.addConstraint('won_project_logs', 'won_project_logs_progress_rate_check', {
    check: 'progress_rate is null or (progress_rate >= 0 and progress_rate <= 100)'
  });
  pgm.addConstraint('won_project_logs', 'won_project_logs_health_status_check', {
    check: "health_status is null or health_status in ('normal', 'watch', 'risk')"
  });
  pgm.createIndex('won_project_logs', 'won_project_id');
  pgm.createIndex('won_project_logs', 'created_at');
}

export function down(pgm) {
  pgm.dropTable('won_project_logs');
}
