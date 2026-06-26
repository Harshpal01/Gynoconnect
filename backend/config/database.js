const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
  user: process.env.PGUSER || process.env.DB_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.PGDATABASE || process.env.DB_NAME || 'hospital_appointments',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
};

const pool = new Pool(config);

function formatQuery(text, params = []) {
  if (!Array.isArray(params) || params.length === 0) {
    return text;
  }

  let formatted = '';
  let paramIndex = 0;

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '?') {
      paramIndex += 1;
      formatted += `$${paramIndex}`;
    } else {
      formatted += text[i];
    }
  }

  return formatted;
}

async function execute(text, params = []) {
  const sql = text.trim();
  const values = Array.isArray(params) ? params : [params];
  const queryText = formatQuery(sql, values);
  const hasReturning = /\breturning\b/i.test(queryText);
  const finalQuery = /^\s*insert\b/i.test(queryText) && !hasReturning ? `${queryText} RETURNING id` : queryText;

  const result = await pool.query(finalQuery, values);

  if (/^\s*select\b/i.test(queryText)) {
    return [result.rows, result.fields];
  }

  if (/^\s*insert\b/i.test(queryText)) {
    return [{ insertId: result.rows?.[0]?.id ?? null, affectedRows: result.rowCount, rowCount: result.rowCount, rows: result.rows }, result.fields];
  }

  return [{ affectedRows: result.rowCount, rowCount: result.rowCount, rows: result.rows }, result.fields];
}

async function query(text, params = []) {
  const sql = text.trim();
  const values = Array.isArray(params) ? params : [params];
  const queryText = formatQuery(sql, values);
  const result = await pool.query(queryText, values);
  return result.rows;
}

async function getConnection() {
  return pool.connect();
}

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err.message);
});

getConnection()
  .then((client) => {
    client.release();
    console.log('Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

module.exports = {
  pool: {
    ...pool,
    execute,
    query,
    getConnection,
  },
  poolPromise: pool,
};
