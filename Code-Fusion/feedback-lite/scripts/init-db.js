const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, '..', 'feedback.db');
const db = new sqlite3.Database(dbPath);

// Create Feedback table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'resolved'))
  )`);
  
  console.log('Database initialized successfully!');
  console.log('Database location:', dbPath);
});

db.close();