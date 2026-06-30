export const shorthands = undefined;

export function up(pgm) {
  pgm.addColumns('offers', {
    proposal_title: {
      type: 'varchar(255)'
    },
    proposal_manager_name: {
      type: 'varchar(100)'
    },
    proposal_amount: {
      type: 'numeric(18,2)'
    },
    expected_start_date: {
      type: 'date'
    },
    expected_duration_months: {
      type: 'integer'
    },
    strategy_memo: {
      type: 'text'
    }
  });

  pgm.createIndex('offers', 'expected_start_date');
}

export function down(pgm) {
  pgm.dropIndex('offers', 'expected_start_date');
  pgm.dropColumns('offers', [
    'proposal_title',
    'proposal_manager_name',
    'proposal_amount',
    'expected_start_date',
    'expected_duration_months',
    'strategy_memo'
  ]);
}
