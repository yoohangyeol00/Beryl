exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('health_checks', {
    id: 'id',
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('health_checks');
};
