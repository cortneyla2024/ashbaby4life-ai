import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Archive, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  Share,
  Trash2,
  Settings,
  Sparkles,
  Database,
  Shield,
  Zap,
  Clock,
  HardDrive,
  Cloud,
  Tag,
  Hash,
  Camera,
  Mic,
  Monitor,
  Smartphone,
  Tablet,
  Server,
  Globe,
  Users,
  Key,
  Fingerprint,
  Scan,
  Search,
  Filter,
  Grid,
  List,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';

const UniversalUploader = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [completedUploads, setCompletedUploads] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [metadata, setMetadata] = useState({});
  const [vectorIndex, setVectorIndex] = useState([]);
  const [privacyVault, setPrivacyVault] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [filters, setFilters] = useState({
    type: 'all',
    privacy: 'all',
    date: 'all',
    size: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [autoIndexing, setAutoIndexing] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const fileTypes = {
    image: { icon: Image, color: 'bg-purple-100 text-purple-700', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] },
    video: { icon: Video, color: 'bg-red-100 text-red-700', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'] },
    audio: { icon: Music, color: 'bg-green-100 text-green-700', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg'] },
    document: { icon: FileText, color: 'bg-blue-100 text-blue-700', extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'] },
    archive: { icon: Archive, color: 'bg-orange-100 text-orange-700', extensions: ['zip', 'rar', '7z', 'tar', 'gz'] },
    other: { icon: File, color: 'bg-gray-100 text-gray-700', extensions: [] }
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    for (const [type, config] of Object.entries(fileTypes)) {
      if (config.extensions.includes(extension)) {
        return type;
      }
    }
    return 'other';
  };

  const getFileIcon = (filename) => {
    const type = getFileType(filename);
    return fileTypes[type]?.icon || File;
  };

  const getFileColor = (filename) => {
    const type = getFileType(filename);
    return fileTypes[type]?.color || 'bg-gray-100 text-gray-700';
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = useCallback(async (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      status: 'pending',
      progress: 0,
      metadata: {},
      vectorEmbedding: null,
      privacyLevel: privacyMode ? 'private' : 'public',
      tags: [],
      description: '',
      location: 'local',
      encryptionKey: encryptionEnabled ? generateEncryptionKey() : null
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setProcessingQueue(prev => [...prev, ...newFiles]);
    
    // Process files
    for (const fileData of newFiles) {
      await processFile(fileData);
    }
  }, [privacyMode, encryptionEnabled]);

  const processFile = async (fileData) => {
    try {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'processing' } : f
      ));

      // Extract metadata
      const extractedMetadata = await extractMetadata(fileData.file);
      
      // Generate vector embedding
      const vectorEmbedding = autoIndexing ? await generateVectorEmbedding(fileData.file) : null;
      
      // Update file with metadata and embedding
      setFiles(prev => prev.map(f => 
        f.id === fileData.id ? { 
          ...f, 
          status: 'completed',
          metadata: extractedMetadata,
          vectorEmbedding,
          progress: 100
        } : f
      ));

      // Add to completed uploads
      setCompletedUploads(prev => [...prev, fileData.id]);
      
      // Add to vector index
      if (vectorEmbedding) {
        setVectorIndex(prev => [...prev, {
          id: fileData.id,
          embedding: vectorEmbedding,
          metadata: extractedMetadata
        }]);
      }

      // Add to privacy vault if private
      if (fileData.privacyLevel === 'private') {
        setPrivacyVault(prev => [...prev, fileData.id]);
      }

    } catch (error) {
      console.error('Error processing file:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileData.id ? { ...f, status: 'failed', error: error.message } : f
      ));
      setFailedUploads(prev => [...prev, fileData.id]);
    }
  };

  const extractMetadata = async (file) => {
    // Simulate metadata extraction
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      filename: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      dimensions: file.type.startsWith('image/') ? { width: 1920, height: 1080 } : null,
      duration: file.type.startsWith('video/') ? 120 : null,
      bitrate: file.type.startsWith('audio/') ? 320 : null,
      pages: file.type === 'application/pdf' ? 10 : null,
      language: 'en',
      tags: ['uploaded', 'processed'],
      checksum: generateChecksum(file.name),
      created: new Date().toISOString(),
      modified: new Date(file.lastModified).toISOString()
    };
  };

  const generateVectorEmbedding = async (file) => {
    // Simulate vector embedding generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock 768-dimensional vector
    return Array.from({ length: 768 }, () => Math.random() - 0.5);
  };

  const generateEncryptionKey = () => {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  };

  const generateChecksum = (filename) => {
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setCompletedUploads(prev => prev.filter(id => id !== fileId));
    setFailedUploads(prev => prev.filter(id => id !== fileId));
    setVectorIndex(prev => prev.filter(item => item.id !== fileId));
    setPrivacyVault(prev => prev.filter(id => id !== fileId));
  };

  const updateFilePrivacy = (fileId, privacyLevel) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, privacyLevel } : f
    ));

    if (privacyLevel === 'private') {
      setPrivacyVault(prev => [...prev, fileId]);
    } else {
      setPrivacyVault(prev => prev.filter(id => id !== fileId));
    }
  };

  const updateFileTags = (fileId, tags) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, tags } : f
    ));
  };

  const updateFileDescription = (fileId, description) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, description } : f
    ));
  };

  const filteredFiles = files.filter(file => {
    const matchesType = filters.type === 'all' || getFileType(file.name) === filters.type;
    const matchesPrivacy = filters.privacy === 'all' || file.privacyLevel === filters.privacy;
    const matchesSearch = !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesPrivacy && matchesSearch;
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Universal Data & File Uploader
          </h1>
          <p className="text-lg text-gray-600">
            Upload, process, and index any file type with AI-powered metadata extraction and privacy controls
          </p>
        </div>

        {/* Upload Zone */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div
            ref={dropZoneRef}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drag and drop files here
            </h3>
            <p className="text-gray-600 mb-6">
              or click to browse your files
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Privacy and Settings Controls */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  privacyMode
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {privacyMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {privacyMode ? 'Private Mode' : 'Public Mode'}
                </span>
              </button>

              <button
                onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  encryptionEnabled
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {encryptionEnabled ? 'Encrypted' : 'Unencrypted'}
                </span>
              </button>

              <button
                onClick={() => setAutoIndexing(!autoIndexing)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  autoIndexing
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {autoIndexing ? 'Auto-Indexing' : 'Manual Indexing'}
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <File className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Indexed</p>
                <p className="text-2xl font-bold text-gray-900">{vectorIndex.length}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Private Vault</p>
                <p className="text-2xl font-bold text-gray-900">{privacyVault.length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="archive">Archives</option>
              </select>

              <select
                value={filters.privacy}
                onChange={(e) => setFilters(prev => ({ ...prev, privacy: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Privacy</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* File List */}
        {filteredFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {filteredFiles.length} files
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Sort by:</span>
                <select className="border border-gray-300 rounded px-2 py-1">
                  <option>Name</option>
                  <option>Size</option>
                  <option>Date</option>
                  <option>Type</option>
                </select>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onRemove={removeFile}
                    onPrivacyChange={updateFilePrivacy}
                    onTagsChange={updateFileTags}
                    onDescriptionChange={updateFileDescription}
                    getFileIcon={getFileIcon}
                    getFileColor={getFileColor}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <FileListItem
                    key={file.id}
                    file={file}
                    onRemove={removeFile}
                    onPrivacyChange={updateFilePrivacy}
                    onTagsChange={updateFileTags}
                    onDescriptionChange={updateFileDescription}
                    getFileIcon={getFileIcon}
                    getFileColor={getFileColor}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Processing Queue */}
        {processingQueue.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Processing Queue ({processingQueue.length})
            </h3>
            <div className="space-y-2">
              {processingQueue.map((file) => (
                <ProcessingItem key={file.id} file={file} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FileCard = ({ file, onRemove, onPrivacyChange, onTagsChange, onDescriptionChange, getFileIcon, getFileColor, formatFileSize }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const IconComponent = getFileIcon(file.name);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getFileColor(file.name)}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(file.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 truncate" title={file.name}>
          {file.name}
        </h4>
        <p className="text-sm text-gray-500">
          {formatFileSize(file.size)}
        </p>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs ${
            file.privacyLevel === 'private' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {file.privacyLevel}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            file.status === 'completed' 
              ? 'bg-green-100 text-green-700'
              : file.status === 'processing'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {file.status}
          </span>
        </div>

        {file.vectorEmbedding && (
          <div className="flex items-center space-x-1 text-xs text-purple-600">
            <Database className="w-3 h-3" />
            <span>Indexed</span>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-200 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
              <select
                value={file.privacyLevel}
                onChange={(e) => onPrivacyChange(file.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={file.tags.join(', ')}
                onChange={(e) => onTagsChange(file.id, e.target.value.split(',').map(t => t.trim()))}
                placeholder="Enter tags separated by commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={file.description}
                onChange={(e) => onDescriptionChange(file.id, e.target.value)}
                placeholder="Add a description..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMetadata && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <h5 className="text-sm font-medium text-gray-700 mb-2">Metadata</h5>
            <div className="space-y-1 text-xs text-gray-600">
              {Object.entries(file.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FileListItem = ({ file, onRemove, onPrivacyChange, onTagsChange, onDescriptionChange, getFileIcon, getFileColor, formatFileSize }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = getFileIcon(file.name);

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(file.name)}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`px-2 py-1 rounded-full text-xs ${
              file.privacyLevel === 'private' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {file.privacyLevel}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onRemove(file.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 space-y-3"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                  <select
                    value={file.privacyLevel}
                    onChange={(e) => onPrivacyChange(file.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={file.tags.join(', ')}
                    onChange={(e) => onTagsChange(file.id, e.target.value.split(',').map(t => t.trim()))}
                    placeholder="Enter tags separated by commas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={file.description}
                  onChange={(e) => onDescriptionChange(file.id, e.target.value)}
                  placeholder="Add a description..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProcessingItem = ({ file }) => {
  return (
    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        <File className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{file.name}</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${file.progress}%` }}
          />
        </div>
      </div>
      <span className="text-sm text-gray-500">{file.status}</span>
    </div>
  );
};

export default UniversalUploader;
