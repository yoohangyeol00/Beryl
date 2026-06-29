export const shorthands = undefined;

export function up(pgm) {
  pgm.alterColumn('rfp_files', 'uploaded_at', {
    default: pgm.func('now()')
  });
}

export function down(pgm) {
  pgm.alterColumn('rfp_files', 'uploaded_at', {
    default: null
  });
}
