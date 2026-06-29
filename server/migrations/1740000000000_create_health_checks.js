export const shorthands = undefined;

export function up(pgm) {
  pgm.createTable('health_checks', {
    id: 'id',
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });
}

export function down(pgm) {
  pgm.dropTable('health_checks');
}
