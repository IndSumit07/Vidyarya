import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { FiX, FiUpload } from 'react-icons/fi';
import axios from 'axios';

const UploadLectureModal = ({ onClose, onSuccess, backendUrl }) => {
  const { userData } = useContext(AppContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    tags: '',
    isPublic: true
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Common subjects for suggestions
  const commonSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Economics', 'Literature',
    'Engineering', 'Medicine', 'Arts', 'Music', 'Sports'
  ];

  // Common topics for suggestions
  const commonTopics = [
    'Algebra', 'Calculus', 'Mechanics', 'Thermodynamics', 'Organic Chemistry',
    'Programming', 'Data Structures', 'Algorithms', 'Web Development',
    'Literature Analysis', 'World History', 'Economic Theory'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (100MB limit)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.title || !formData.description || !formData.subject || !formData.topic) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('topic', formData.topic);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('isPublic', formData.isPublic);
      // ✅ Add uploaderName instead of teacherName
      formDataToSend.append('uploaderName', userData?.name || 'Unknown User');

      const response = await axios.post(`${backendUrl}/api/lecture/upload`, formDataToSend, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Lecture uploaded successfully!');
        onSuccess(response.data.lecture); // ✅ pass lecture back
        resetForm();
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to upload lecture');
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      topic: '',
      tags: '',
      isPublic: true
    });
    setFile(null);
  };

  const getFileTypeIcon = (fileName) => {
    if (!fileName) return '📁';
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'ppt':
      case 'pptx': return '📊';
      case 'doc':
      case 'docx': return '📝';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Upload New Lecture</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {file ? (
                  <div className="space-y-2">
                    <div className="text-4xl">{getFileTypeIcon(file.name)}</div>
                    <div className="font-medium text-gray-800">{file.name}</div>
                    <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>
                      {' '}or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, PPT, DOC, Video, or Image files up to 100MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter lecture title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the lecture content"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Subject and Topic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics"
                list="subjects"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <datalist id="subjects">
                {commonSubjects.map((subject, index) => (
                  <option key={index} value={subject} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g., Calculus"
                list="topics"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <datalist id="topics">
                {commonTopics.map((topic, index) => (
                  <option key={index} value={topic} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., calculus, derivatives, limits"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add relevant tags to help students find your lecture
            </p>
          </div>

          {/* Visibility */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              id="isPublic"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              Make this lecture public
            </label>
          </div>

          {/* ✅ Uploaded By (not Teacher Info) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="font-medium text-gray-800">{userData?.name}</div>
                <div className="text-sm text-gray-500">
                  Uploaded by • {userData?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload size={16} />
                  Upload Lecture
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadLectureModal;
