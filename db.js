const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Postgres uses SERIAL instead of AUTOINCREMENT, and BOOLEAN instead of INTEGER for done
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT false
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) AS n FROM tasks');
  if (parseInt(rows[0].n) === 0) {
    await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2), ($3, $4), ($5, $6)',
      ['Buy groceries', false, 'Walk the dog', false, 'Finish assignment', false]
    );
  }
}

init().catch((err) => {
  console.error('Failed to initialize database:', err);
});

module.exports = pool; // routes will use pool.query(...) instead of db.prepare(...)