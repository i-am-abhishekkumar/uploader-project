const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const {
  getAllDocuments,
  getDocumentById,
  insertDocument,
  deleteDocument
} = require('./database');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Routes

// Upload a PDF file
app.post('/documents/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { filename, path: filepath, size: filesize } = req.file;
    const originalFilename = req.file.originalname;

    // Save to database
    insertDocument(originalFilename, filepath, filesize, (err, document) => {
      if (err) {
        // Delete uploaded file if database insert fails
        fs.unlinkSync(filepath);
        return res.status(500).json({
          success: false,
          message: 'Error saving document metadata: ' + err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        document: document
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file: ' + error.message
    });
  }
});

// Get all documents
app.get('/documents', (req, res) => {
  getAllDocuments((err, documents) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching documents: ' + err.message
      });
    }

    res.json({
      success: true,
      documents: documents
    });
  });
});

// Download a specific file
app.get('/documents/:id', (req, res) => {
  const documentId = parseInt(req.params.id);

  getDocumentById(documentId, (err, document) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching document: ' + err.message
      });
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.filepath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.filename}"`);
    res.setHeader('Content-Length', document.filesize);

    const fileStream = fs.createReadStream(document.filepath);
    fileStream.pipe(res);
  });
});

// Delete a document
app.delete('/documents/:id', (req, res) => {
  const documentId = parseInt(req.params.id);

  getDocumentById(documentId, (err, document) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching document: ' + err.message
      });
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    // Delete from database
    deleteDocument(documentId, (err, deleted) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting document: ' + err.message
        });
      }

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    });
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit'
      });
    }
  }

  res.status(400).json({
    success: false,
    message: error.message || 'An error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

