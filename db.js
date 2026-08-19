const Database = require('better-sqlite3');

// This line does two things: if tasks.db doesn't exist, it creates it.
// If it does exist, it just opens it.
const db = new Database('tasks.db');

// CREATE TABLE IF NOT EXISTS = "make this table, unless it's already there"
// This means you can run your app 100 times and it won't error or duplicate the table.
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

// Before seeding example tasks, check if the table is already full.
// Without this check, every restart would add 3 more tasks.
const count = db.prepare('SELECT COUNT(*) AS n FROM tasks').get().n;
if (count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('Buy groceries', 0);
  insert.run('Walk the dog', 0);
  insert.run('Finish assignment', 0);
}

module.exports = db; // so other files (like your routes) can use this same db