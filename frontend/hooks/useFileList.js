import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useTelemetry } from './useTelemetry';
import { useLocalStorage } from './useLocalStorage';

const useFileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    privacy: '',
    tags: [],
    dateRange: null,
    sizeRange: null
  });
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const { trackEvent } = useTelemetry();
  const { getItem, setItem } = useLocalStorage();

  // Load files
  const loadFiles = useCallback(async (options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        sortBy: options.sortBy || sortBy,
        sortOrder: options.sortOrder || sortOrder,
        ...filters
      });

      if (searchQuery) {
        params.append('q', searchQuery);
      }

      const response = await fetch(`/api/upload/user/files?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      
      setFiles(data.files);
      setPagination(prev => ({
        ...prev,
        page: data.page || prev.page,
        total: data.total
      }));

      trackEvent('files_loaded', { count: data.files.length, filters });

    } catch (error) {
      console.error('Error loading files:', error);
      setError(error.message);
      showNotification('Error loading files', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, pagination.page, pagination.limit, sortBy, sortOrder, filters, searchQuery, trackEvent, showNotification]);

  // Search files
  const searchFiles = useCallback(async (query, searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        q: query,
        ...searchFilters
      });

      const response = await fetch(`/api/upload/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      setFiles(data.files);
      setPagination(prev => ({
        ...prev,
        total: data.total
      }));

      trackEvent('files_searched', { query, results: data.files.length });

    } catch (error) {
      console.error('Error searching files:', error);
      setError(error.message);
      showNotification('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, trackEvent, showNotification]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Update sort
  const updateSort = useCallback((newSortBy, newSortOrder = 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Update search query
  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Delete file
  const deleteFile = useCallback(async (fileId) => {
    try {
      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Remove from local state
      setFiles(prev => prev.filter(file => file.id !== fileId));
      
      showNotification('File deleted successfully', 'success');
      trackEvent('file_deleted', { fileId });

    } catch (error) {
      console.error('Error deleting file:', error);
      showNotification('Error deleting file', 'error');
    }
  }, [user, showNotification, trackEvent]);

  // Update file metadata
  const updateFileMetadata = useCallback(async (fileId, metadata) => {
    try {
      const response = await fetch(`/api/upload/${fileId}/metadata`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });

      if (!response.ok) {
        throw new Error('Failed to update metadata');
      }

      const result = await response.json();

      // Update in local state
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, ...result.file } : file
      ));

      showNotification('File metadata updated', 'success');
      trackEvent('file_metadata_updated', { fileId });

      return result;

    } catch (error) {
      console.error('Error updating file metadata:', error);
      showNotification('Error updating metadata', 'error');
      throw error;
    }
  }, [user, showNotification, trackEvent]);

  // Get file categories
  const getFileCategories = useCallback(() => {
    const categories = [...new Set(files.map(file => file.category))];
    return categories.sort();
  }, [files]);

  // Get file tags
  const getFileTags = useCallback(() => {
    const allTags = files.flatMap(file => file.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  }, [files]);

  // Get file statistics
  const getFileStats = useCallback(() => {
    const stats = {
      total: files.length,
      totalSize: files.reduce((sum, file) => sum + file.fileSize, 0),
      byCategory: {},
      byType: {},
      byPrivacy: {}
    };

    files.forEach(file => {
      // By category
      stats.byCategory[file.category] = (stats.byCategory[file.category] || 0) + 1;
      
      // By type
      const type = file.mimeType.split('/')[0];
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // By privacy
      stats.byPrivacy[file.privacy] = (stats.byPrivacy[file.privacy] || 0) + 1;
    });

    return stats;
  }, [files]);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Get file icon
  const getFileIcon = useCallback((mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('text/') || mimeType.includes('document')) return '📄';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📁';
  }, []);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, loadFiles]);

  // Reload when filters/sort change
  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [filters, sortBy, sortOrder, pagination.page, pagination.limit, loadFiles]);

  // Search when query changes
  useEffect(() => {
    if (user && searchQuery) {
      const timeoutId = setTimeout(() => {
        searchFiles(searchQuery, filters);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, filters, user, searchFiles]);

  return {
    // State
    files,
    loading,
    error,
    filters,
    sortBy,
    sortOrder,
    pagination,
    searchQuery,

    // Methods
    loadFiles,
    searchFiles,
    updateFilters,
    updateSort,
    updatePagination,
    updateSearchQuery,
    deleteFile,
    updateFileMetadata,

    // Utilities
    getFileCategories,
    getFileTags,
    getFileStats,
    formatFileSize,
    getFileIcon
  };
};

export default useFileList;
