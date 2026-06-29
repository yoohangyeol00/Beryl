export const shorthands = undefined;

export function up(pgm) {
  pgm.addColumns('companies', {
    supports_buyer: {
      type: 'boolean',
      notNull: true,
      default: true
    },
    supports_supplier: {
      type: 'boolean',
      notNull: true,
      default: true
    }
  });
}

export function down(pgm) {
  pgm.dropColumn('companies', 'supports_supplier');
  pgm.dropColumn('companies', 'supports_buyer');
}
