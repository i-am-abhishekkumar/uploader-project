# Patient Portal - Medical Document Management System

A full-stack web application that allows users to upload, view, download, and delete medical documents (PDFs). Built with React frontend and Node.js/Express backend, using SQLite for metadata storage.

## Project Overview

This application provides a simple yet functional patient portal for managing medical documents. Users can:

- ✅ Upload PDF files (with validation)
- ✅ View all uploaded documents in a list
- ✅ Download any document
- ✅ Delete documents when no longer needed

The application follows a clean architecture with separation of concerns between frontend, backend, and database layers.

## Tech Stack

- **Frontend:** React 18.2.0
- **Backend:** Node.js with Express 4.18.2
- **Database:** SQLite 3
- **File Upload:** Multer
- **HTTP Client:** Axios
- **Notifications:** React Toastify

## Project Structure

```
uploader-project/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── database.js        # SQLite database operations
│   ├── package.json       # Backend dependencies
│   ├── uploads/           # Directory for uploaded PDFs (created automatically)
│   └── database.sqlite    # SQLite database file (created automatically)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json       # Frontend dependencies
├── design.md              # Design document with architecture and decisions
└── README.md              # This file
```

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) - comes with Node.js

You can verify your installation by running:
```bash
node --version
npm --version
```

## How to Run Locally

### Step 1: Clone or Download the Repository

```bash
cd uploader-project
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Start the Backend Server

```bash
npm start
```

The backend server will start on `http://localhost:5000`

**Note:** The first time you run the server, it will automatically:
- Create the SQLite database file (`database.sqlite`)
- Create the `uploads/` directory for storing PDF files
- Initialize the `documents` table

### Step 4: Install Frontend Dependencies

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
```

### Step 5: Start the Frontend Development Server

```bash
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

### Step 6: Use the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Choose PDF File" to select a PDF document
3. Click "Upload" to upload the file
4. View your uploaded documents in the list below
5. Click "Download" to download a file
6. Click "Delete" to remove a document

## API Documentation

The backend API runs on `http://localhost:5000`. All endpoints return JSON responses.

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. Upload a PDF File

**Endpoint:** `POST /documents/upload`

**Request:**
```bash
curl -X POST http://localhost:5000/documents/upload \
  -F "file=@/path/to/your/document.pdf"
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "document": {
    "id": 1,
    "filename": "prescription.pdf",
    "filepath": "uploads/1234567890-prescription.pdf",
    "filesize": 245678,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Only PDF files are allowed"
}
```

---

#### 2. List All Documents

**Endpoint:** `GET /documents`

**Request:**
```bash
curl -X GET http://localhost:5000/documents
```

**Response (Success - 200):**
```json
{
  "success": true,
  "documents": [
    {
      "id": 1,
      "filename": "prescription.pdf",
      "filepath": "uploads/1234567890-prescription.pdf",
      "filesize": 245678,
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "filename": "test-results.pdf",
      "filepath": "uploads/1234567891-test-results.pdf",
      "filesize": 189234,
      "created_at": "2024-01-15T11:15:00.000Z"
    }
  ]
}
```

---

#### 3. Download a File

**Endpoint:** `GET /documents/:id`

**Request:**
```bash
curl -X GET http://localhost:5000/documents/1 \
  -o downloaded-file.pdf
```

**Response (Success - 200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="prescription.pdf"`
- File stream as response body

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Document not found"
}
```

---

#### 4. Delete a Document

**Endpoint:** `DELETE /documents/:id`

**Request:**
```bash
curl -X DELETE http://localhost:5000/documents/1
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Document not found"
}
```

---

## Example API Calls (Postman)

### Upload File
1. Method: `POST`
2. URL: `http://localhost:5000/documents/upload`
3. Body: Select `form-data`
4. Key: `file` (type: File)
5. Value: Select a PDF file from your computer
6. Click "Send"

### List Documents
1. Method: `GET`
2. URL: `http://localhost:5000/documents`
3. Click "Send"

### Download File
1. Method: `GET`
2. URL: `http://localhost:5000/documents/1` (replace 1 with actual document ID)
3. Click "Send"
4. Save the response as a file

### Delete File
1. Method: `DELETE`
2. URL: `http://localhost:5000/documents/1` (replace 1 with actual document ID)
3. Click "Send"

## Features

### Frontend Features
- ✅ Modern, responsive UI with gradient design
- ✅ File upload with drag-and-drop style interface
- ✅ Real-time file list updates
- ✅ File size and date formatting
- ✅ Success/error notifications using toast messages
- ✅ Confirmation dialog for delete operations
- ✅ Loading states for better UX
- ✅ Mobile-responsive design

### Backend Features
- ✅ RESTful API design
- ✅ File validation (PDF only, 10MB limit)
- ✅ Secure file storage with unique filenames
- ✅ SQLite database for metadata
- ✅ Error handling and validation
- ✅ CORS enabled for frontend communication
- ✅ Automatic directory creation

## Database Schema

The `documents` table has the following structure:

| Column     | Type      | Description                    |
|------------|-----------|--------------------------------|
| id         | INTEGER   | Primary key, auto-increment    |
| filename   | TEXT      | Original filename              |
| filepath   | TEXT      | Path to stored file            |
| filesize   | INTEGER   | File size in bytes             |
| created_at | DATETIME  | Upload timestamp               |

## Configuration

### File Size Limit
Default: **10MB** per file

To change the limit, edit `backend/server.js`:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 // Change this value
}
```

### Port Configuration
- Backend: `5000` (change via `PORT` environment variable)
- Frontend: `3000` (default React port)

To change backend port:
```bash
PORT=3001 npm start
```

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# Or change the port in server.js
```

**Database errors:**
- Ensure you have write permissions in the `backend/` directory
- Delete `database.sqlite` and restart the server to recreate it

**File upload fails:**
- Check that the `uploads/` directory exists and is writable
- Verify file is a valid PDF
- Check file size is under 10MB

### Frontend Issues

**Cannot connect to backend:**
- Ensure backend is running on `http://localhost:5000`
- Check CORS settings in `backend/server.js`
- Verify API_BASE_URL in `frontend/src/App.js`

**Dependencies not installing:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development

### Running in Development Mode

**Backend with auto-reload:**
```bash
cd backend
npm run dev  # Requires nodemon (installed as dev dependency)
```

**Frontend:**
```bash
cd frontend
npm start  # Auto-reloads on file changes
```

## Security Considerations

⚠️ **Note:** This is a development/demo application. For production use, consider:

- User authentication and authorization
- File encryption at rest
- Virus/malware scanning
- Rate limiting
- Input sanitization
- HTTPS/TLS encryption
- Secure file storage (cloud storage)
- Database connection pooling
- Environment variables for sensitive data

## Future Enhancements

- User authentication and multi-user support
- File preview functionality
- Search and filter documents
- Bulk upload/download
- File categories/tags
- Cloud storage integration (AWS S3, etc.)
- File versioning
- Audit logging
- Email notifications

## License

This project is created for assignment purposes.

## Author Abhishek Kumar 

Full Stack Developer Intern Assignment

---


