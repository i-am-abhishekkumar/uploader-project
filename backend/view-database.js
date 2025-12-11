const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

// Open database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database\n');
    viewData();
  }
});

function viewData() {
  // Get all documents
  db.all('SELECT * FROM documents ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      db.close();
      return;
    }

    if (rows.length === 0) {
      console.log('No documents found in the database.');
      console.log('The table exists but is empty.\n');
    } else {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`Total Documents: ${rows.length}`);
      console.log('═══════════════════════════════════════════════════════════════\n');

      rows.forEach((row, index) => {
        console.log(`Document #${index + 1}:`);
        console.log(`  ID:         ${row.id}`);
        console.log(`  Filename:   ${row.filename}`);
        console.log(`  Filepath:   ${row.filepath}`);
        console.log(`  Size:       ${formatBytes(row.filesize)}`);
        console.log(`  Created:    ${new Date(row.created_at).toLocaleString()}`);
        console.log('');
      });
    }

    // Show table structure
    db.all("PRAGMA table_info(documents)", [], (err, columns) => {
      if (!err) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('Table Structure: documents');
        console.log('═══════════════════════════════════════════════════════════════');
        columns.forEach(col => {
          console.log(`  ${col.name.padEnd(15)} ${col.type.padEnd(20)} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
        });
        console.log('');
      }
      db.close();
    });
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

