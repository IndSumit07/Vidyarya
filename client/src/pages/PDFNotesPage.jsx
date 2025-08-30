import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { FiUpload, FiSearch, FiDownload, FiEye, FiEdit, FiTrash2, FiTag, FiBookOpen } from 'react-icons/fi';

const PDFNotesPage = () => {
  const { backendUrl, isLoggedIn, userData } = useContext(AppContext);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPdf, setEditingPdf] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: '',
    tags: '',
    isPublic: false
  });

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Economics', 'Literature', 'General'
  ];

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllPDFs();
    }
  }, [isLoggedIn, currentPage, searchTerm, selectedSubject]);

  const fetchAllPDFs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/pdf/all`, {
        params: {
          page: currentPage,
          limit: 12,
          search: searchTerm,
          subject: selectedSubject
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setPdfs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      toast.error('Failed to fetch PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', uploadForm.title || file.name.replace('.pdf', ''));
    formData.append('description', uploadForm.description);
    formData.append('subject', uploadForm.subject || 'General');
    formData.append('tags', uploadForm.tags);
    formData.append('isPublic', uploadForm.isPublic);

    try {
      setUploading(true);
      const response = await axios.post(`${backendUrl}/api/pdf/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('PDF uploaded successfully!');
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          subject: '',
          tags: '',
          isPublic: false
        });
        fetchAllPDFs();
      } else {
        toast.error(response.data.message || 'Failed to upload PDF');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload PDF';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleView = (cloudinaryUrl, filename) => {
    window.open(cloudinaryUrl, '_blank');
    toast.success('Opening PDF in new tab');
  };

  const handleDownload = async (pdfId, filename) => {
    try {
      const response = await axios.get(`${backendUrl}/api/pdf/${pdfId}`, {
        withCredentials: true
      });
      if (response.data.success) {
        const pdf = response.data.data;
        
        const link = document.createElement('a');
        link.href = pdf.cloudinaryUrl;
        link.setAttribute('download', filename);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success('Download started!');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(`${backendUrl}/api/pdf/${editingPdf._id}`, {
        title: editingPdf.title,
        description: editingPdf.description,
        subject: editingPdf.subject,
        tags: editingPdf.tags.join(','),
        isPublic: editingPdf.isPublic
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success('PDF updated successfully!');
        setShowEditModal(false);
        setEditingPdf(null);
        fetchAllPDFs();
      }
    } catch (error) {
      console.error('Error updating PDF:', error);
      toast.error('Failed to update PDF');
    }
  };

  const handleDelete = async (pdfId) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        const response = await axios.delete(`${backendUrl}/api/pdf/${pdfId}`, {
          withCredentials: true
        });
        if (response.data.success) {
          toast.success('PDF deleted successfully!');
          fetchAllPDFs();
        }
      } catch (error) {
        console.error('Error deleting PDF:', error);
        toast.error('Failed to delete PDF');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Please Login</h1>
          <p className="text-gray-600">You need to be logged in to access PDF notes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PDF Notes</h1>
          <p className="text-gray-600">Upload, organize, and share your study materials</p>
        </div>

        {/* Upload Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 mx-auto transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <FiUpload className="text-2xl" />
            Upload PDF Notes
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search PDFs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* PDFs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-lg">Loading PDFs...</p>
            </div>
          ) : pdfs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FiBookOpen className="text-8xl text-gray-400 mx-auto mb-6" />
              <p className="text-gray-600 text-lg">No PDFs found. Upload your first PDF notes!</p>
            </div>
          ) : (
            pdfs.map((pdf) => (
              <div key={pdf._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                        {pdf.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {pdf.description || 'No description'}
                      </p>
                    </div>
                    {pdf.uploadedBy._id === userData?.id && (
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => {
                            setEditingPdf(pdf);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(pdf._id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiTag />
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {pdf.subject}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Size: {formatFileSize(pdf.fileSize)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Uploaded: {formatDate(pdf.createdAt)}
                    </div>
                    <div className="text-sm text-gray-500">
                      By: {pdf.uploadedBy.name}
                    </div>
                  </div>

                  {pdf.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {pdf.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiEye />
                        {pdf.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiDownload />
                        {pdf.downloadCount}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(pdf.cloudinaryUrl, pdf.originalName)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(pdf._id, pdf.originalName)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-6 py-3 text-gray-600 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-6 py-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Upload PDF Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={uploadForm.subject}
                  onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., math, algebra, equations"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={uploadForm.isPublic}
                  onChange={(e) => setUploadForm({...uploadForm, isPublic: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Make this PDF public
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Edit PDF</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingPdf.title}
                  onChange={(e) => setEditingPdf({...editingPdf, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingPdf.description}
                  onChange={(e) => setEditingPdf({...editingPdf, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={editingPdf.subject}
                  onChange={(e) => setEditingPdf({...editingPdf, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingPdf.tags.join(', ')}
                  onChange={(e) => setEditingPdf({...editingPdf, tags: e.target.value.split(',').map(tag => tag.trim())})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsPublic"
                  checked={editingPdf.isPublic}
                  onChange={(e) => setEditingPdf({...editingPdf, isPublic: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="editIsPublic" className="text-sm text-gray-700">
                  Make this PDF public
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPdf(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFNotesPage;