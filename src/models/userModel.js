const db = require('./db');

const createUser = (email, passwordHash, callback) => {
  const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.run(sql, [email, passwordHash], function (err) {
    callback(err, this ? this.lastID : null);
  });
};

const findUserByEmail = (email, callback) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], (err, row) => {
    callback(err, row);
  });
};

module.exports = {
  createUser,
  findUserByEmail,
};

