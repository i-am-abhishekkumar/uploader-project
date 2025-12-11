import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_BASE_URL = 'http://localhost:5001';

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/documents`);
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      toast.error('Failed to fetch documents: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      const response = await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('File uploaded successfully!');
        setSelectedFile(null);
        e.target.reset();
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/${doc.id}`, {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded successfully!');
    } catch (error) {
      toast.error('Download failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/documents/${docId}`);
      if (response.data.success) {
        toast.success('Document deleted successfully!');
        fetchDocuments();
      }
    } catch (error) {
      toast.error('Delete failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="container">
        <header className="header">
          <h1>Patient Portal</h1>
          <p className="subtitle">Medical Document Management System</p>
        </header>

        <div className="upload-section">
          <h2>Upload Document</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="file-input-wrapper">
              <input
                type="file"
                id="file-input"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="file-input"
              />
              <label htmlFor="file-input" className="file-label">
                {selectedFile ? selectedFile.name : 'Choose PDF File'}
              </label>
            </div>
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="upload-button"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        <div className="documents-section">
          <h2>Your Documents</h2>
          {loading ? (
            <div className="loading">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <p>No documents uploaded yet.</p>
              <p>Upload your first document using the form above.</p>
            </div>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-item">
                  <div className="document-info">
                    <h3 className="document-name">{doc.filename}</h3>
                    <div className="document-meta">
                      <span className="meta-item">
                        <strong>Size:</strong> {formatFileSize(doc.filesize)}
                      </span>
                      <span className="meta-item">
                        <strong>Uploaded:</strong> {formatDate(doc.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="document-actions">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="action-button download-button"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="action-button delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

