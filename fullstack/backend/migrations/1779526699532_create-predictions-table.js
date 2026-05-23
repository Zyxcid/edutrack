export const up = (pgm) => {
  pgm.createTable('predictions', {
    id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade'
    },
    input: { type: 'jsonb', notNull: true },
    predicted_score: { type: 'float', notNull: true },
    recommendations: { type: 'jsonb'},
    week_start: {
      type: 'date',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp')
    }
  })

  // Satu user hanya boleh punya satu prediksi per minggu
  pgm.addConstraint('predictions', 'unique_user_week', 'UNIQUE(user_id, week_start)')
}

export const down = (pgm) => {
  pgm.dropTable('predictions')
}