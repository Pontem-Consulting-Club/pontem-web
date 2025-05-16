const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  console.log(process.env.DATABASE_URL);
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
}; 