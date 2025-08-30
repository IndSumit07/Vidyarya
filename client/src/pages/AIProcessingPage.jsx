import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import {
  FiUpload,
  FiFileText,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiBookOpen,
  FiHelpCircle,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBrain,
  FiZap
} from 'react-icons/fi';
import axios from 'axios';

const AIProcessingPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [aiProcessedPDFs, setAiProcessedPDFs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: '',
    tags: '',
    uploaderName: '',
    file: null
  });

  // Fetch AI processed PDFs on mount
  useEffect(() => {
    fetchAIProcessedPDFs();
  }, []);

  // Fetch all AI processed PDFs
  const fetchAIProcessedPDFs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/ai-processing/`);
      if (response.data.success) {
        setAiProcessedPDFs(response.data.aiProcessedPDFs);
      }
    } catch (error) {
      console.error('Error fetching AI processed PDFs:', error);
      toast.error('Failed to load AI processed content');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadForm(prev => ({ ...prev, file }));
    } else if (file) {
      toast.error('Please select a PDF file');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
  };

  // Upload PDF for AI processing
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!uploadForm.title || !uploadForm.subject || !uploadForm.uploaderName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('pdf', uploadForm.file);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('subject', uploadForm.subject);
      formData.append('tags', uploadForm.tags);
      formData.append('uploaderName', uploadForm.uploaderName);

      const response = await axios.post(`${backendUrl}/api/ai-processing/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('PDF uploaded for AI processing! Content will be generated in the background.');
        setShowUploadModal(false);
        resetUploadForm();
        fetchAIProcessedPDFs(); // Refresh the list
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload PDF for processing');
    } finally {
      setUploading(false);
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      description: '',
      subject: '',
      tags: '',
      uploaderName: '',
      file: null
    });
  };

  // View AI generated content
  const handleViewContent = (content) => {
    setSelectedContent(content);
    setShowContentModal(true);
  };

  // Delete AI processed PDF
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this AI processed content?')) {
      try {
        const response = await axios.delete(`${backendUrl}/api/ai-processing/${id}`);
        if (response.data.success) {
          toast.success('AI processed content deleted successfully');
          fetchAIProcessedPDFs(); // Refresh the list
        }
      } catch (error) {
        console.error('Error deleting AI processed PDF:', error);
        toast.error('Failed to delete AI processed content');
      }
    }
  };

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { icon: <FiCheckCircle size={16} />, color: 'text-green-600' };
      case 'processing':
        return { icon: <FiClock size={16} />, color: 'text-yellow-600' };
      case 'failed':
        return { icon: <FiAlertCircle size={16} />, color: 'text-red-600' };
      default:
        return { icon: <FiHelpCircle size={16} />, color: 'text-gray-600' };
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'AI Content Ready';
      case 'processing':
        return 'Generating AI Content...';
      case 'failed':
        return 'AI Generation Failed';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🧠 AI PDF Processing
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Upload PDFs to generate AI-powered study materials. Original PDFs are not stored - only the generated content is saved.
          </p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-gray-800">Smart Summaries</h3>
              <p className="text-sm text-gray-600">AI-generated comprehensive summaries</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl mb-2">❓</div>
              <h3 className="font-semibold text-gray-800">Auto Quizzes</h3>
              <p className="text-sm text-gray-600">Multiple choice questions with explanations</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl mb-2">🃏</div>
              <h3 className="font-semibold text-gray-800">Flashcards</h3>
              <p className="text-sm text-gray-600">Interactive learning cards</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl mb-2">🔑</div>
              <h3 className="font-semibold text-gray-800">Key Points</h3>
              <p className="text-sm text-gray-600">Main takeaways highlighted</p>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Process PDF with AI</h2>
            <p className="text-gray-600 mb-6">
              Upload any PDF and watch AI create comprehensive study materials in seconds!
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 mx-auto transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiUpload size={24} /> Start AI Processing
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Supports PDF files up to 50MB • Original PDFs are not stored
            </p>
          </div>
        </div>

        {/* AI Processed Content List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">AI Generated Content</h3>
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold text-purple-600">{aiProcessedPDFs.length}</span> items
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading AI processed content...</p>
            </div>
          ) : aiProcessedPDFs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No AI Processed Content Yet</h3>
              <p className="text-gray-600 mb-4">
                Upload your first PDF to start generating AI-powered study materials!
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <FiUpload size={20} /> Process First PDF
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiProcessedPDFs.map((content) => (
                <div key={content._id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {/* Content Icon */}
                  <div className="p-4 text-center border-b border-gray-100">
                    <div className="text-4xl mb-2">🧠</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">AI Generated</div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{content.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{content.description}</p>

                    <div className="space-y-2 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-2">
                        <FiFileText size={14} />
                        <span>{content.originalFileName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Subject: {content.subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>By: {content.uploaderName}</span>
                      </div>
                    </div>

                    {/* AI Status */}
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(content.status).icon}
                        <span className={`text-sm font-medium ${getStatusIcon(content.status).color}`}>
                          {getStatusText(content.status)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {content.status === 'completed' && (
                        <button
                          onClick={() => handleViewContent(content)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <FiEye size={14} /> View Content
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(content._id)}
                        className="flex-1 px-3 py-2 border border-red-300 hover:bg-red-50 text-red-600 rounded text-sm transition-colors flex items-center justify-center gap-2"
                        title="Delete Content"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Process PDF with AI</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-6">
              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    {uploadForm.file ? (
                      <div className="space-y-2">
                        <FiFileText className="mx-auto h-12 w-12 text-green-500" />
                        <div className="text-green-600 font-medium">
                          {uploadForm.file.name}
                        </div>
                        <p className="text-xs text-gray-500">
                          Click to change file • {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="text-gray-600">
                          <span className="font-medium text-purple-600 hover:text-purple-500">
                            Click to upload PDF
                          </span>
                          {' '}or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF files up to 50MB • Original file will not be stored
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {uploadForm.file && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: <span className="font-medium">{uploadForm.file.name}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleInputChange}
                  placeholder="Enter PDF title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleInputChange}
                  placeholder="Describe the PDF content"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={uploadForm.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Physics, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={uploadForm.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., calculus, derivatives, limits"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Uploader Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="uploaderName"
                  value={uploadForm.uploaderName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiZap size={16} />
                      Process with AI
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Viewer Modal */}
      {showContentModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">AI Generated Content</h2>
              <button
                onClick={() => setShowContentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Summary */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiBookOpen size={20} /> Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedContent.summary}</p>
                </div>
              </div>

              {/* Key Points */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedContent.keyPoints.map((point, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quizzes */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiHelpCircle size={20} /> Quizzes
                </h3>
                <div className="space-y-4">
                  {selectedContent.quizzes.map((quiz, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3">
                        {index + 1}. {quiz.question}
                      </h4>
                      <div className="space-y-2 mb-3">
                        {quiz.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`quiz-${index}`}
                              id={`quiz-${index}-${optIndex}`}
                              className="text-purple-600"
                            />
                            <label htmlFor={`quiz-${index}-${optIndex}`} className="text-gray-700">
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          <strong>Correct Answer:</strong> {quiz.correctAnswer}
                        </p>
                        {quiz.explanation && (
                          <p className="text-sm text-green-700 mt-1">
                            <strong>Explanation:</strong> {quiz.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flashcards */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Flashcards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedContent.flashcards.map((card, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-2">Card {index + 1}</div>
                        <div className="font-medium text-gray-800 mb-2">{card.front}</div>
                        <div className="text-sm text-gray-600 border-t pt-2">{card.back}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIProcessingPage;
