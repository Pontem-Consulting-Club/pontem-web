const bcrypt = require('bcrypt');
const db = require('../src/db');

const createAdminUser = async () => {
  const username = 'admin';
  const password = 'pontemuc';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO "Users" (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );

    console.log('Admin user created:', result.rows[0]);
  } catch (error) {
    console.error('Error creating admin user:', error.message, error.stack);
  } finally {
    process.exit();
  }
};

createAdminUser(); 