# Design Document: Patient Portal - Medical Document Management System

## 1. Tech Stack Choices

### Q1. What frontend framework did you use and why?

**Answer:** I chose **React** for the frontend framework.

**Reasons:**
- **Component-based architecture**: React's component model makes it easy to build reusable UI components (upload form, file list, file item)
- **Large ecosystem**: Extensive library support (e.g., axios for API calls, react-toastify for notifications)
- **Developer experience**: Great tooling (Create React App, hot reload, excellent debugging tools)
- **Industry standard**: Widely used, making it easier for other developers to understand and maintain
- **State management**: Built-in state management is sufficient for this application's needs
- **Performance**: Virtual DOM ensures efficient updates when file lists change

### Q2. What backend framework did you choose and why?

**Answer:** I chose **Node.js with Express** for the backend framework.

**Reasons:**
- **JavaScript ecosystem**: Same language as frontend, allowing code sharing and easier context switching
- **Lightweight and fast**: Express is minimal and performant, perfect for REST APIs
- **File handling**: Excellent support for file uploads via `multer` middleware
- **Rapid development**: Quick setup and development cycle
- **Middleware ecosystem**: Rich middleware options for validation, error handling, CORS
- **Async/await support**: Modern JavaScript features make handling file I/O operations clean and readable
- **Local development**: Easy to run locally without complex configuration

### Q3. What database did you choose and why?

**Answer:** I chose **SQLite** for the database.

**Reasons:**
- **Zero configuration**: No separate database server needed, perfect for local development
- **File-based**: Database is a single file, easy to backup and version control
- **ACID compliance**: Ensures data integrity for file metadata
- **Sufficient for requirements**: Handles the metadata storage needs perfectly (id, filename, filepath, filesize, created_at)
- **Lightweight**: Minimal overhead, fast for small to medium datasets
- **Easy migration**: Can easily migrate to PostgreSQL later if needed (similar SQL syntax)
- **No external dependencies**: Reduces setup complexity for the assignment

### Q4. If you were to support 1,000 users, what changes would you consider?

**Answer:** For 1,000 users, I would consider the following changes:

1. **Database Migration:**
   - Move from SQLite to **PostgreSQL** or **MySQL** for better concurrency and performance
   - Add database connection pooling
   - Implement proper indexing on frequently queried fields (user_id, created_at)

2. **File Storage:**
   - Move from local file system to **cloud storage** (AWS S3, Google Cloud Storage, or Azure Blob Storage)
   - Implement CDN for faster file downloads
   - Add file versioning and backup strategies

3. **Authentication & Authorization:**
   - Implement proper user authentication (JWT tokens, OAuth)
   - Add user-specific file access control
   - Implement role-based access control (patients, doctors, admins)

4. **Scalability:**
   - Add **caching layer** (Redis) for frequently accessed metadata
   - Implement **load balancing** for multiple server instances
   - Use **message queues** (RabbitMQ, AWS SQS) for async file processing

5. **Performance:**
   - Add **pagination** for file lists
   - Implement **file compression** for storage optimization
   - Add **search and filtering** capabilities

6. **Security:**
   - Implement **file scanning** for malware/virus detection
   - Add **rate limiting** to prevent abuse
   - Encrypt sensitive files at rest
   - Implement **audit logging** for compliance

7. **Monitoring & Logging:**
   - Add application monitoring (e.g., New Relic, Datadog)
   - Implement structured logging
   - Set up error tracking (e.g., Sentry)

8. **API Enhancements:**
   - Add **bulk operations** (upload multiple files, delete multiple files)
   - Implement **file preview** functionality
   - Add **metadata search** capabilities

---

## 2. Architecture Overview

### System Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTP Requests (REST API)
       │
       ▼
┌─────────────────┐
│  Express Server  │
│   (Node.js)      │
└──────┬───────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│   SQLite    │   │  File System │
│  Database   │   │  (uploads/)  │
│ (metadata)  │   │   (PDFs)     │
└─────────────┘   └──────────────┘
```

### Architecture Description

1. **Frontend (React):**
   - User interacts with React components in the browser
   - Makes HTTP requests to backend API using axios
   - Displays file list, handles upload form, shows success/error messages

2. **Backend (Express):**
   - Receives HTTP requests from frontend
   - Validates requests (file type, size limits)
   - Interacts with SQLite database to store/retrieve metadata
   - Handles file operations (save to disk, read from disk, delete)
   - Returns JSON responses or file streams

3. **Database (SQLite):**
   - Stores file metadata: id, filename, filepath, filesize, created_at
   - Provides fast lookups for file information
   - Maintains referential integrity

4. **File Storage (Local File System):**
   - Stores actual PDF files in `uploads/` directory
   - Files are saved with unique names to prevent conflicts
   - Original filenames are preserved in database

### Data Flow

**Upload Flow:**
1. User selects PDF file in React frontend
2. Frontend sends POST request with FormData to `/documents/upload`
3. Express receives request, validates file (PDF only, size check)
4. Express saves file to `uploads/` directory with unique name
5. Express saves metadata (filename, filepath, size, timestamp) to SQLite
6. Express returns success response with file metadata
7. Frontend updates file list and shows success message

**Download Flow:**
1. User clicks download button in frontend
2. Frontend sends GET request to `/documents/:id`
3. Express queries SQLite for file metadata by ID
4. Express reads file from `uploads/` directory
5. Express sends file as response with appropriate headers
6. Browser downloads the file

**List Flow:**
1. Frontend sends GET request to `/documents`
2. Express queries SQLite for all file metadata
3. Express returns JSON array of file metadata
4. Frontend renders file list

**Delete Flow:**
1. User clicks delete button in frontend
2. Frontend sends DELETE request to `/documents/:id`
3. Express queries SQLite for file metadata by ID
4. Express deletes file from `uploads/` directory
5. Express deletes metadata from SQLite
6. Express returns success response
7. Frontend updates file list

---

## 3. API Specification

### Base URL
```
http://localhost:5000
```

### Endpoint 1: Upload a PDF

**URL:** `/documents/upload`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

**Request:**
```bash
curl -X POST http://localhost:5000/documents/upload \
  -F "file=@/path/to/document.pdf"
```

**Response (Success - 201 Created):**
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

**Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "message": "Only PDF files are allowed"
}
```

**Description:**  
Accepts a PDF file via multipart form data, saves it to the `uploads/` directory, stores metadata in the database, and returns the document information.

---

### Endpoint 2: List All Documents

**URL:** `/documents`  
**Method:** `GET`

**Request:**
```bash
curl -X GET http://localhost:5000/documents
```

**Response (Success - 200 OK):**
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

**Description:**  
Returns a JSON array of all documents with their metadata (id, filename, filepath, filesize, created_at).

---

### Endpoint 3: Download a File

**URL:** `/documents/:id`  
**Method:** `GET`

**Request:**
```bash
curl -X GET http://localhost:5000/documents/1 \
  -o downloaded-file.pdf
```

**Response (Success - 200 OK):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="prescription.pdf"`
- File stream as response body

**Response (Error - 404 Not Found):**
```json
{
  "success": false,
  "message": "Document not found"
}
```

**Description:**  
Retrieves the file metadata from the database, reads the file from disk, and streams it to the client with appropriate headers for download.

---

### Endpoint 4: Delete a File

**URL:** `/documents/:id`  
**Method:** `DELETE`

**Request:**
```bash
curl -X DELETE http://localhost:5000/documents/1
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Response (Error - 404 Not Found):**
```json
{
  "success": false,
  "message": "Document not found"
}
```

**Description:**  
Deletes the file from the `uploads/` directory and removes its metadata from the database.

---

## 4. Data Flow Description

### Q5. Describe the step-by-step process of what happens when a file is uploaded and when it is downloaded.

#### File Upload Process:

1. **User Interaction:**
   - User selects a PDF file using the file input in the React frontend
   - User clicks the "Upload" button

2. **Frontend Processing:**
   - React component creates a `FormData` object
   - Appends the selected file to FormData
   - Sends POST request to `/documents/upload` using axios
   - Shows loading state to user

3. **Backend Reception:**
   - Express server receives the request
   - `multer` middleware extracts the file from the request
   - Validation middleware checks:
     - File exists
     - File is PDF (MIME type: `application/pdf`)
     - File size is within limits (e.g., 10MB)

4. **File Storage:**
   - Generate unique filename: `timestamp-originalfilename.pdf`
   - Save file to `uploads/` directory using `fs.writeFileSync()` or `multer`
   - Get file size using `fs.statSync()`

5. **Database Storage:**
   - Open SQLite database connection
   - Insert record into `documents` table with:
     - `filename`: Original filename
     - `filepath`: Path to saved file
     - `filesize`: Size in bytes
     - `created_at`: Current timestamp
   - Get the inserted row ID

6. **Response:**
   - Express returns JSON response with:
     - Success status
     - Document metadata including the new ID
   - HTTP status code: 201 Created

7. **Frontend Update:**
   - React receives the response
   - Updates the file list state
   - Shows success message to user
   - Resets the upload form

#### File Download Process:

1. **User Interaction:**
   - User clicks the "Download" button next to a file in the list
   - Frontend extracts the document ID from the file item

2. **Frontend Request:**
   - React sends GET request to `/documents/:id`
   - Optionally opens the URL in a new window/tab for direct download

3. **Backend Processing:**
   - Express extracts the document ID from URL parameters
   - Query SQLite database for document with matching ID
   - If not found, return 404 error
   - If found, read file metadata (especially `filepath`)

4. **File Retrieval:**
   - Check if file exists at the stored filepath using `fs.existsSync()`
   - If file doesn't exist, return 404 error
   - Read file from disk using `fs.readFileSync()` or create read stream

5. **Response:**
   - Set HTTP headers:
     - `Content-Type: application/pdf`
     - `Content-Disposition: attachment; filename="originalfilename.pdf"`
     - `Content-Length: filesize`
   - Stream file content as response body
   - HTTP status code: 200 OK

6. **Browser Handling:**
   - Browser receives the file stream
   - Initiates download with the original filename
   - File is saved to user's default download location
   - Frontend may show a success message

---

## 5. Assumptions

### Q6. What assumptions did you make while building this?

1. **Single User System:**
   - No authentication/authorization required
   - All files belong to a single user
   - No user-specific access control needed

2. **File Size Limits:**
   - Maximum file size: **10MB** per PDF
   - Reasonable for medical documents while preventing abuse
   - Can be easily adjusted in backend configuration

3. **File Type Validation:**
   - Only PDF files are accepted
   - Validation based on MIME type (`application/pdf`)
   - File extension validation as secondary check

4. **File Naming:**
   - Files are saved with unique names (timestamp prefix) to prevent conflicts
   - Original filename is preserved in database for display
   - No special character sanitization beyond basic handling

5. **Concurrency:**
   - Single-threaded Node.js handles requests sequentially per process
   - SQLite handles concurrent reads well
   - File system operations are synchronous for simplicity
   - For production, would need async file operations and connection pooling

6. **Error Handling:**
   - Basic error handling for file operations
   - Database errors are caught and returned as JSON responses
   - Frontend shows user-friendly error messages

7. **Storage:**
   - Files stored in local `uploads/` directory
   - No backup or redundancy implemented
   - No file compression or optimization

8. **Security:**
   - No virus/malware scanning
   - No encryption at rest
   - CORS enabled for localhost development
   - No rate limiting implemented

9. **Performance:**
   - No pagination for file list (assumes reasonable number of files)
   - No caching implemented
   - Direct file serving (no CDN)

10. **Development Environment:**
    - Application runs on `localhost`
    - Backend on port 5000
    - Frontend on port 3000 (default React port)
    - Development mode (no production optimizations)

11. **Database:**
    - SQLite database file created automatically
    - No migrations system (simple schema)
    - No database backup strategy

12. **Browser Compatibility:**
    - Modern browsers with ES6+ support
    - File API support required
    - No IE11 support

---

## Summary

This design provides a solid foundation for a medical document management system that can be easily extended for production use. The chosen tech stack balances simplicity, development speed, and maintainability while meeting all the core requirements of the assignment.

