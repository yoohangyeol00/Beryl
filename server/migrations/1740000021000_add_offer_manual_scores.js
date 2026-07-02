export const shorthands = undefined;

export function up(pgm) {
  pgm.addColumns('offers', {
    technical_score: {
      type: 'numeric(5,2)'
    },
    price_score: {
      type: 'numeric(5,2)'
    }
  });
}

export function down(pgm) {
  pgm.dropColumns('offers', ['technical_score', 'price_score']);
}
