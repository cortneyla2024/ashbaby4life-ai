import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useFileUploader } from '../hooks/useFileUploader';
import { useNotifications } from '../hooks/useNotifications';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { useTelemetry } from '../hooks/useTelemetry';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useLoading } from '../hooks/useLoading';
import { useTheme } from '../hooks/useTheme';
import { useAI } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';
import Notification from './Notification';
import ErrorBoundary from './ErrorBoundary';

const UploadWidget = ({
  isOpen = false,
  onClose = () => {},
  onUploadComplete = () => {},
  maxFiles = 10,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  allowedTypes = ['*/*'],
  autoProcess = true,
  privacyLevel = 'private',
  tags = [],
  category = 'general'
}) => {
  // State management
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [processingFiles, setProcessingFiles] = useState([]);
  const [fileMetadata, setFileMetadata] = useState({});
  const [privacySettings, setPrivacySettings] = useState({});
  const [customTags, setCustomTags] = useState(tags);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState({});
  const [thumbnails, setThumbnails] = useState({});
  const [transcripts, setTranscripts] = useState({});

  // Refs
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const uploadQueueRef = useRef([]);

  // Hooks
  const { uploadFile, uploadMultiple, getUploadStatus } = useFileUploader();
  const { showNotification } = useNotifications();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { trackEvent } = useTelemetry();
  const { getItem, setItem } = useLocalStorage();
  const { isLoading, setLoading } = useLoading();
  const { theme } = useTheme();
  const { ai, processFile } = useAI();

  // Configuration
  const supportedTypes = {
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'application/json',
      'application/xml'
    ],
    images: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/tiff'
    ],
    audio: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/webm'
    ],
    video: [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov'
    ],
    archives: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/gzip'
    ]
  };

  // Initialize component
  useEffect(() => {
    if (isOpen) {
      loadUploadHistory();
      initializePrivacySettings();
    }
  }, [isOpen]);

  // Load upload history
  const loadUploadHistory = async () => {
    try {
      const history = await getItem('upload_history') || [];
      setUploadQueue(history.slice(-10)); // Last 10 uploads
    } catch (error) {
      console.error('Error loading upload history:', error);
    }
  };

  // Initialize privacy settings
  const initializePrivacySettings = () => {
    const defaultPrivacy = {
      autoEncrypt: settings.privacy?.autoEncrypt || false,
      allowAIProcessing: settings.privacy?.allowAIProcessing || true,
      allowMetadataExtraction: settings.privacy?.allowMetadataExtraction || true,
      allowThumbnailGeneration: settings.privacy?.allowThumbnailGeneration || true,
      allowTranscriptGeneration: settings.privacy?.allowTranscriptGeneration || true
    };
    setPrivacySettings(defaultPrivacy);
  };

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Process selected files
  const handleFiles = async (files) => {
    try {
      setLoading(true);
      
      // Validate files
      const validFiles = await validateFiles(files);
      if (validFiles.length === 0) {
        showNotification('No valid files selected', 'warning');
        return;
      }

      // Add files to selection
      const newFiles = validFiles.map(file => ({
        id: generateFileId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        status: 'pending',
        progress: 0,
        metadata: {},
        tags: [...customTags],
        privacy: privacyLevel,
        category
      }));

      setSelectedFiles(prev => [...prev, ...newFiles]);

      // Auto-process if enabled
      if (autoProcess) {
        await processSelectedFiles(newFiles);
      }

      showNotification(`${validFiles.length} files added for upload`, 'success');
      trackEvent('files_selected', { count: validFiles.length, types: validFiles.map(f => f.type) });

    } catch (error) {
      console.error('Error handling files:', error);
      showNotification('Error processing files', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Validate files
  const validateFiles = async (files) => {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name} exceeds maximum file size`);
        continue;
      }

      // Check file type
      if (allowedTypes[0] !== '*/*') {
        const isAllowed = allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', ''));
          }
          return file.type === type;
        });

        if (!isAllowed) {
          errors.push(`${file.name} is not an allowed file type`);
          continue;
        }
      }

      // Check for duplicates
      const isDuplicate = selectedFiles.some(f => 
        f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
      );

      if (isDuplicate) {
        errors.push(`${file.name} is already selected`);
        continue;
      }

      validFiles.push(file);
    }

    // Show errors
    if (errors.length > 0) {
      showNotification(`Some files were skipped: ${errors.join(', ')}`, 'warning');
    }

    return validFiles;
  };

  // Process selected files
  const processSelectedFiles = async (files) => {
    try {
      setIsProcessing(true);
      setProcessingFiles(files.map(f => f.id));

      for (const fileData of files) {
        await processFileData(fileData);
      }

      showNotification('All files processed successfully', 'success');
      trackEvent('files_processed', { count: files.length });

    } catch (error) {
      console.error('Error processing files:', error);
      showNotification('Error processing files', 'error');
    } finally {
      setIsProcessing(false);
      setProcessingFiles([]);
    }
  };

  // Process individual file
  const processFileData = async (fileData) => {
    try {
      // Update status
      setSelectedFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'processing' } : f
      ));

      // Extract metadata
      const metadata = await extractMetadata(fileData.file);
      setFileMetadata(prev => ({ ...prev, [fileData.id]: metadata }));

      // Generate thumbnail for images/videos
      if (privacySettings.allowThumbnailGeneration && isImageOrVideo(fileData.type)) {
        const thumbnail = await generateThumbnail(fileData.file);
        setThumbnails(prev => ({ ...prev, [fileData.id]: thumbnail }));
      }

      // Extract text from documents
      if (privacySettings.allowMetadataExtraction && isDocument(fileData.type)) {
        const text = await extractText(fileData.file);
        setExtractedText(prev => ({ ...prev, [fileData.id]: text }));
      }

      // Generate transcript for audio/video
      if (privacySettings.allowTranscriptGeneration && isAudioOrVideo(fileData.type)) {
        const transcript = await generateTranscript(fileData.file);
        setTranscripts(prev => ({ ...prev, [fileData.id]: transcript }));
      }

      // AI processing
      if (privacySettings.allowAIProcessing && ai) {
        const aiAnalysis = await processFile(fileData.file, {
          extractKeywords: true,
          generateSummary: true,
          suggestTags: true,
          categorize: true
        });

        // Update file data with AI insights
        setSelectedFiles(prev => prev.map(f => 
          f.id === fileData.id ? { 
            ...f, 
            aiAnalysis,
            tags: [...f.tags, ...(aiAnalysis.suggestedTags || [])]
          } : f
        ));
      }

      // Update status
      setSelectedFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'processed' } : f
      ));

    } catch (error) {
      console.error(`Error processing file ${fileData.name}:`, error);
      setSelectedFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'error', error: error.message } : f
      ));
    }
  };

  // Extract metadata
  const extractMetadata = async (file) => {
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      extension: file.name.split('.').pop().toLowerCase()
    };

    // Add file-specific metadata
    if (isImage(file.type)) {
      const imageData = await getImageMetadata(file);
      Object.assign(metadata, imageData);
    } else if (isAudio(file.type)) {
      const audioData = await getAudioMetadata(file);
      Object.assign(metadata, audioData);
    } else if (isVideo(file.type)) {
      const videoData = await getVideoMetadata(file);
      Object.assign(metadata, videoData);
    }

    return metadata;
  };

  // Generate thumbnail
  const generateThumbnail = async (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxSize = 200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Extract text from documents
  const extractText = async (file) => {
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      return await file.text();
    }
    
    // For other document types, we'd need specialized libraries
    // This is a placeholder for PDF, Word, etc.
    return '';
  };

  // Generate transcript
  const generateTranscript = async (file) => {
    // This would use the AI audio processing capabilities
    // For now, return a placeholder
    return 'Transcript generation not yet implemented';
  };

  // Upload files
  const uploadFiles = async () => {
    try {
      setLoading(true);
      
      const filesToUpload = selectedFiles.filter(f => f.status === 'processed' || f.status === 'pending');
      
      if (filesToUpload.length === 0) {
        showNotification('No files ready for upload', 'warning');
        return;
      }

      // Prepare upload data
      const uploadData = filesToUpload.map(fileData => ({
        file: fileData.file,
        metadata: {
          ...fileData,
          ...fileMetadata[fileData.id],
          thumbnail: thumbnails[fileData.id],
          extractedText: extractedText[fileData.id],
          transcript: transcripts[fileData.id],
          aiAnalysis: fileData.aiAnalysis
        },
        privacy: privacySettings,
        tags: fileData.tags,
        category: fileData.category
      }));

      // Upload files
      const results = await uploadMultiple(uploadData, {
        onProgress: (fileId, progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        }
      });

      // Handle results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        showNotification(`${successful.length} files uploaded successfully`, 'success');
        trackEvent('files_uploaded', { count: successful.length });
        
        // Call completion callback
        onUploadComplete(successful);
        
        // Save to history
        await saveToHistory(successful);
      }

      if (failed.length > 0) {
        showNotification(`${failed.length} files failed to upload`, 'error');
      }

      // Clear selection
      setSelectedFiles([]);
      setFileMetadata({});
      setThumbnails({});
      setExtractedText({});
      setTranscripts({});
      setUploadProgress({});

    } catch (error) {
      console.error('Error uploading files:', error);
      showNotification('Error uploading files', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save to history
  const saveToHistory = async (uploads) => {
    try {
      const history = await getItem('upload_history') || [];
      const newHistory = [...history, ...uploads.map(u => ({
        id: u.id,
        name: u.metadata.name,
        type: u.metadata.type,
        size: u.metadata.size,
        uploadedAt: new Date().toISOString(),
        category: u.metadata.category
      }))];

      // Keep only last 100 entries
      const trimmedHistory = newHistory.slice(-100);
      await setItem('upload_history', trimmedHistory);
      setUploadQueue(trimmedHistory.slice(-10));

    } catch (error) {
      console.error('Error saving upload history:', error);
    }
  };

  // Remove file from selection
  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    setFileMetadata(prev => {
      const newMetadata = { ...prev };
      delete newMetadata[fileId];
      return newMetadata;
    });
    setThumbnails(prev => {
      const newThumbnails = { ...prev };
      delete newThumbnails[fileId];
      return newThumbnails;
    });
    setExtractedText(prev => {
      const newText = { ...prev };
      delete newText[fileId];
      return newText;
    });
    setTranscripts(prev => {
      const newTranscripts = { ...prev };
      delete newTranscripts[fileId];
      return newTranscripts;
    });
  };

  // Update file tags
  const updateFileTags = (fileId, tags) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, tags } : f
    ));
  };

  // Update file privacy
  const updateFilePrivacy = (fileId, privacy) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, privacy } : f
    ));
  };

  // Utility functions
  const generateFileId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (isImage(type)) return '🖼️';
    if (isAudio(type)) return '🎵';
    if (isVideo(type)) return '🎥';
    if (isDocument(type)) return '📄';
    if (isArchive(type)) return '📦';
    return '📁';
  };

  const isImage = (type) => type.startsWith('image/');
  const isAudio = (type) => type.startsWith('audio/');
  const isVideo = (type) => type.startsWith('video/');
  const isDocument = (type) => supportedTypes.documents.includes(type);
  const isArchive = (type) => supportedTypes.archives.includes(type);
  const isImageOrVideo = (type) => isImage(type) || isVideo(type);
  const isAudioOrVideo = (type) => isAudio(type) || isVideo(type);

  // Placeholder functions for metadata extraction
  const getImageMetadata = async (file) => ({ width: 0, height: 0 });
  const getAudioMetadata = async (file) => ({ duration: 0, bitrate: 0 });
  const getVideoMetadata = async (file) => ({ duration: 0, width: 0, height: 0 });

  if (!isOpen) return null;

  return (
    <ErrorBoundary>
      <Modal isOpen={isOpen} onClose={onClose} size="large">
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upload Files
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop files or click to browse
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col p-6 space-y-6">
            {/* Drop Zone */}
            <div
              ref={dropZoneRef}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept={allowedTypes.join(',')}
              />
              
              <div className="space-y-4">
                <div className="text-6xl">📁</div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Supports documents, images, audio, video, and archives
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Privacy & Processing Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(privacySettings).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <button
                    onClick={uploadFiles}
                    disabled={isLoading || isProcessing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Uploading...' : 'Upload All'}
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedFiles.map((fileData) => (
                    <div
                      key={fileData.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="text-2xl">{getFileIcon(fileData.type)}</div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {fileData.name}
                          </p>
                          <button
                            onClick={() => removeFile(fileData.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                          <span>{formatFileSize(fileData.size)}</span>
                          <span>{fileData.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            fileData.status === 'processed' ? 'bg-green-100 text-green-800' :
                            fileData.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            fileData.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {fileData.status}
                          </span>
                        </div>

                        {/* Progress bar */}
                        {uploadProgress[fileData.id] !== undefined && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[fileData.id]}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {fileData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {fileData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload History */}
            {uploadQueue.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Uploads
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadQueue.slice(-5).map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="text-lg">{getFileIcon(upload.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {upload.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(upload.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </ErrorBoundary>
  );
};

export default UploadWidget;
