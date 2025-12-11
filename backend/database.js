const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

// Create and initialize database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      filesize INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Database table initialized');
    }
  });
}

// Get all documents
function getAllDocuments(callback) {
  db.all('SELECT * FROM documents ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}

// Get document by ID
function getDocumentById(id, callback) {
  db.get('SELECT * FROM documents WHERE id = ?', [id], (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row);
    }
  });
}

// Insert new document
function insertDocument(filename, filepath, filesize, callback) {
  db.run(
    'INSERT INTO documents (filename, filepath, filesize) VALUES (?, ?, ?)',
    [filename, filepath, filesize],
    function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, {
          id: this.lastID,
          filename,
          filepath,
          filesize,
          created_at: new Date().toISOString()
        });
      }
    }
  );
}

// Delete document by ID
function deleteDocument(id, callback) {
  db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
    if (err) {
      callback(err, false);
    } else {
      callback(null, this.changes > 0);
    }
  });
}

// Close database connection
function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
  });
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  insertDocument,
  deleteDocument,
  closeDatabase
};

