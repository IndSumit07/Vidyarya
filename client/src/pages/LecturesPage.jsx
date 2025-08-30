import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEye,
  FiDownload,
  FiFile,
  FiCalendar,
  FiUser,
  FiPlay,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import UploadLectureModal from '../components/UploadLectureModal';

const LecturesPage = () => {
  const { backendUrl } = useContext(AppContext);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Fetch all lectures on mount
  useEffect(() => {
    fetchAllLectures();
  }, []);

  // ✅ Fetch all lectures (no filters, no pagination)
  const fetchAllLectures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/lecture/`);
      if (response.data.success) {
        setLectures(response.data.lectures);
      }
    } catch (error) {
      console.error('Error fetching all lectures:', error);
      toast.error('Failed to load lectures');
    } finally {
      setLoading(false);
    }
  };

  // Download lecture
  const handleDownload = async (lectureId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/lecture/download/${lectureId}`
      );

      if (response.data.success) {
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

  // Play video
  const handlePlayVideo = (lecture) => {
    if (lecture.fileType === 'video') {
      setCurrentVideo(lecture);
      setShowVideoModal(true);
    }
  };

  // File type icon
  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'ppt': return '📊';
      case 'doc': return '📝';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      default: return '📁';
    }
  };

  // File size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Date format
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📚 Lecture Library
          </h1>
          <p className="text-gray-600 text-lg">
            Access and share educational content with everyone
          </p>
        </div>

        {/* Upload Button - Always visible */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-3 mx-auto transition-colors text-lg font-semibold"
          >
            <FiPlus size={24} /> Upload New Lecture
          </button>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading lectures...</p>
            </div>
          ) : lectures.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Lectures Found</h3>
              <p className="text-gray-600 mb-4">
                Be the first to upload a lecture!
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <FiPlus size={20} /> Upload First Lecture
              </button>
            </div>
          ) : (
            <>
              {/* Lecture Count */}
              <div className="mb-6 text-center">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-blue-600">{lectures.length}</span> lectures
                </p>
              </div>

              {/* Lecture Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lectures.map((lecture) => (
                  <div key={lecture._id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    {/* Thumbnail or File Icon */}
                    <div className="relative p-4 text-center border-b border-gray-100">
                      {lecture.thumbnailUrl ? (
                        <div className="relative">
                          <img 
                            src={lecture.thumbnailUrl} 
                            alt={lecture.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {lecture.fileType === 'video' && (
                            <button
                              onClick={() => handlePlayVideo(lecture)}
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all group"
                            >
                              <div className="bg-white bg-opacity-90 rounded-full p-3 group-hover:scale-110 transition-transform">
                                <FiPlay size={24} className="text-gray-800 ml-1" />
                              </div>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="text-4xl mb-2">{getFileTypeIcon(lecture.fileType)}</div>
                          <div className="text-xs text-gray-500 uppercase font-semibold">{lecture.fileType}</div>
                          {lecture.fileType === 'video' && (
                            <button
                              onClick={() => handlePlayVideo(lecture)}
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all group"
                            >
                              <div className="bg-white bg-opacity-90 rounded-full p-3 group-hover:scale-110 transition-transform">
                                <FiPlay size={24} className="text-gray-800 ml-1" />
                              </div>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{lecture.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lecture.description}</p>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <FiFile size={14} /><span>{formatFileSize(lecture.fileSize)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUser size={14} /><span>{lecture.userName || 'Anonymous User'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiCalendar size={14} /><span>{formatDate(lecture.createdAt)}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {lecture.tags && lecture.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {lecture.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{tag}</span>
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
                          <FiDownload size={14} /> Download
                        </button>
                        {lecture.fileType === 'video' ? (
                          <button
                            onClick={() => handlePlayVideo(lecture)}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center gap-2"
                            title="Play Video"
                          >
                            <FiPlay size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => window.open(lecture.fileUrl, '_blank')}
                            className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded text-sm transition-colors"
                            title="View"
                          >
                            <FiEye size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
            fetchAllLectures();
          }}
          backendUrl={backendUrl}
        />
      )}

      {/* Video Player Modal */}
      {showVideoModal && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">{currentVideo.title}</h2>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Video Player */}
            <div className="p-4">
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  poster={currentVideo.thumbnailUrl || undefined}
                >
                  <source src={currentVideo.fileUrl} type={`video/${currentVideo.fileUrl.split('.').pop()}`} />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Video Info */}
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">{currentVideo.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Uploaded by: {currentVideo.userName}</span>
                  <span>Views: {currentVideo.views}</span>
                  <span>Downloads: {currentVideo.downloads}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturesPage;
