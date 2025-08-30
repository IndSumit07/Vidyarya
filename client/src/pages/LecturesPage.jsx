import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiPlus, FiEye, FiDownload, FiEdit, FiTrash2, FiFile, FiCalendar, FiUser } from 'react-icons/fi';
import axios from 'axios';
import UploadLectureModal from '../components/UploadLectureModal';

const LecturesPage = () => {
  const { backendUrl, isLoggedIn, userData } = useContext(AppContext);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
    searchLectures();
  }, []);

  // Fetch subjects list
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/lecture/subjects`);
      if (response.data.success) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch topics based on selected subject
  const fetchTopics = async (subject) => {
    if (!subject) {
      setTopics([]);
      return;
    }
    try {
      const response = await axios.get(`${backendUrl}/api/lecture/subjects/${subject}/topics`);
      if (response.data.success) {
        setTopics(response.data.topics);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  // Search lectures
  const searchLectures = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      if (searchQuery) params.append('query', searchQuery);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedTopic) params.append('topic', selectedTopic);
      if (selectedFileType) params.append('fileType', selectedFileType);

      const response = await axios.get(`${backendUrl}/api/lecture/search?${params}`);
      
      if (response.data.success) {
        setLectures(response.data.lectures);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error searching lectures:', error);
      toast.error('Failed to search lectures');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    searchLectures(1);
  };

  // Handle subject change
  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setSelectedTopic('');
    setTopics([]);
    if (subject) {
      fetchTopics(subject);
    }
    searchLectures(1);
  };

  // Handle filters
  const handleFilterChange = () => {
    setCurrentPage(1);
    searchLectures(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedFileType('');
    setTopics([]);
    setCurrentPage(1);
    searchLectures(1);
  };

  // Download lecture
  const handleDownload = async (lectureId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/lecture/download/${lectureId}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started!');
      }
    } catch (error) {
      console.error('Error downloading lecture:', error);
      toast.error('Failed to download lecture');
    }
  };

  // Get file type icon
  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'ppt':
        return '📊';
      case 'doc':
        return '📝';
      case 'video':
        return '🎥';
      case 'image':
        return '🖼️';
      default:
        return '📁';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📚 Lecture Library</h1>
          <p className="text-gray-600 text-lg">Search and discover educational content from teachers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search lectures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Topic Filter */}
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedSubject}
            >
              <option value="">All Topics</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic}>{topic}</option>
              ))}
            </select>

            {/* File Type Filter */}
            <select
              value={selectedFileType}
              onChange={(e) => {
                setSelectedFileType(e.target.value);
                handleFilterChange();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="ppt">PowerPoint</option>
              <option value="doc">Document</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
            
            {isLoggedIn && userData?.role === 'teacher' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FiPlus size={20} />
                Upload Lecture
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching lectures...</p>
            </div>
          ) : lectures.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Lectures Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedSubject || selectedTopic || selectedFileType
                  ? 'Try adjusting your search criteria'
                  : 'Be the first to upload a lecture!'}
              </p>
              {isLoggedIn && userData?.role === 'teacher' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FiPlus size={20} />
                  Upload First Lecture
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lectures.map((lecture) => (
                  <div key={lecture._id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    {/* File Type Icon */}
                    <div className="p-4 text-center border-b border-gray-100">
                      <div className="text-4xl mb-2">{getFileTypeIcon(lecture.fileType)}</div>
                      <div className="text-xs text-gray-500 uppercase font-semibold">{lecture.fileType}</div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{lecture.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lecture.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <FiFile size={14} />
                          <span>{formatFileSize(lecture.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUser size={14} />
                          <span>{lecture.teacherName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiCalendar size={14} />
                          <span>{formatDate(lecture.createdAt)}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {lecture.tags && lecture.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {lecture.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                          {lecture.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{lecture.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleDownload(lecture._id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-2"
                        >
                          <FiDownload size={14} />
                          Download
                        </button>
                        <button
                          onClick={() => window.open(lecture.fileUrl, '_blank')}
                          className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded text-sm transition-colors"
                          title="View"
                        >
                          <FiEye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => searchLectures(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => searchLectures(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => searchLectures(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadLectureModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            searchLectures();
          }}  
          backendUrl={backendUrl}
        />
      )}
    </div>
  );
};

export default LecturesPage;


