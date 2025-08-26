import { useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';
import { useTelemetry } from './useTelemetry';
import { useLocalStorage } from './useLocalStorage';
import { useSettings } from './useSettings';

const useFileUploader = () => {
  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadQueue, setUploadQueue] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);

  const uploadQueueRef = useRef([]);
  const abortControllerRef = useRef(null);

  // Hooks
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const { trackEvent } = useTelemetry();
  const { getItem, setItem } = useLocalStorage();
  const { settings } = useSettings();

  // Configuration
  const config = {
    maxConcurrentUploads: 3,
    chunkSize: 1024 * 1024, // 1MB chunks
    retryAttempts: 3,
    retryDelay: 1000,
    uploadTimeout: 30000,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['*/*']
  };

  // Upload single file
  const uploadFile = useCallback(async (file, options = {}) => {
    try {
      const uploadId = generateUploadId();
      const uploadData = {
        id: uploadId,
        file,
        metadata: options.metadata || {},
        privacy: options.privacy || 'private',
        tags: options.tags || [],
        category: options.category || 'general',
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        userId: user?.id
      };

      // Add to uploads
      setUploads(prev => [...prev, uploadData]);
      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

      // Start upload
      const result = await performUpload(uploadData, options);
      
      // Update status
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, ...result } : u
      ));

      if (result.success) {
        showNotification('File uploaded successfully', 'success');
        trackEvent('file_uploaded', { 
          fileId: uploadId, 
          fileName: file.name, 
          fileSize: file.size,
          fileType: file.type 
        });
        
        // Add to history
        await addToHistory(result);
      } else {
        setFailedUploads(prev => [...prev, { ...uploadData, error: result.error }]);
        showNotification(`Upload failed: ${result.error}`, 'error');
      }

      return result;

    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification('Upload failed', 'error');
      return { success: false, error: error.message };
    }
  }, [user, showNotification, trackEvent]);

  // Upload multiple files
  const uploadMultiple = useCallback(async (files, options = {}) => {
    try {
      setIsUploading(true);
      const results = [];

      // Process files in batches
      const batches = chunkArray(files, config.maxConcurrentUploads);
      
      for (const batch of batches) {
        const batchPromises = batch.map(fileData => 
          uploadFile(fileData.file, { ...options, ...fileData })
        );
        
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(r => r.value || { success: false, error: 'Upload failed' }));
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        showNotification(`${successful.length} files uploaded successfully`, 'success');
      }

      if (failed.length > 0) {
        showNotification(`${failed.length} files failed to upload`, 'error');
      }

      trackEvent('batch_upload_completed', { 
        total: files.length, 
        successful: successful.length, 
        failed: failed.length 
      });

      return results;

    } catch (error) {
      console.error('Error uploading multiple files:', error);
      showNotification('Batch upload failed', 'error');
      return files.map(() => ({ success: false, error: error.message }));
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, showNotification, trackEvent]);

  // Perform actual upload
  const performUpload = async (uploadData, options = {}) => {
    const { file, metadata, privacy, tags, category } = uploadData;
    
    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('privacy', privacy);
      formData.append('tags', JSON.stringify(tags));
      formData.append('category', category);
      formData.append('userId', user?.id || 'anonymous');

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Upload with progress tracking
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update progress to 100%
      setUploadProgress(prev => ({ ...prev, [uploadData.id]: 100 }));

      return {
        success: true,
        fileId: result.fileId,
        url: result.url,
        metadata: result.metadata,
        uploadedAt: new Date().toISOString()
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Upload cancelled' };
      }
      return { success: false, error: error.message };
    }
  };

  // Upload with progress tracking
  const uploadWithProgress = useCallback(async (file, options = {}) => {
    const uploadId = generateUploadId();
    
    // Create upload data
    const uploadData = {
      id: uploadId,
      file,
      metadata: options.metadata || {},
      privacy: options.privacy || 'private',
      tags: options.tags || [],
      category: options.category || 'general',
      status: 'uploading',
      progress: 0,
      createdAt: new Date().toISOString(),
      userId: user?.id
    };

    setUploads(prev => [...prev, uploadData]);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[uploadId] || 0;
          const newProgress = Math.min(current + Math.random() * 10, 90);
          return { ...prev, [uploadId]: newProgress };
        });
      }, 500);

      // Perform upload
      const result = await performUpload(uploadData, options);
      
      clearInterval(progressInterval);

      // Set progress to 100% on success
      if (result.success) {
        setUploadProgress(prev => ({ ...prev, [uploadId]: 100 }));
      }

      // Update upload status
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, ...result, status: result.success ? 'completed' : 'failed' } : u
      ));

      return result;

    } catch (error) {
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: 'failed', error: error.message } : u
      ));
      return { success: false, error: error.message };
    }
  }, [user]);

  // Cancel upload
  const cancelUpload = useCallback((uploadId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setUploads(prev => prev.map(u => 
      u.id === uploadId ? { ...u, status: 'cancelled' } : u
    ));

    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[uploadId];
      return newProgress;
    });

    showNotification('Upload cancelled', 'info');
  }, [showNotification]);

  // Retry failed upload
  const retryUpload = useCallback(async (uploadId) => {
    const failedUpload = failedUploads.find(u => u.id === uploadId);
    if (!failedUpload) return;

    // Remove from failed uploads
    setFailedUploads(prev => prev.filter(u => u.id !== uploadId));

    // Retry upload
    const result = await uploadFile(failedUpload.file, {
      metadata: failedUpload.metadata,
      privacy: failedUpload.privacy,
      tags: failedUpload.tags,
      category: failedUpload.category
    });

    if (result.success) {
      showNotification('Upload retry successful', 'success');
    }
  }, [failedUploads, uploadFile, showNotification]);

  // Get upload status
  const getUploadStatus = useCallback((uploadId) => {
    return uploads.find(u => u.id === uploadId);
  }, [uploads]);

  // Get upload progress
  const getUploadProgress = useCallback((uploadId) => {
    return uploadProgress[uploadId] || 0;
  }, [uploadProgress]);

  // Get upload history
  const getUploadHistory = useCallback(async (limit = 50) => {
    try {
      const history = await getItem('upload_history') || [];
      return history.slice(-limit);
    } catch (error) {
      console.error('Error getting upload history:', error);
      return [];
    }
  }, [getItem]);

  // Add to history
  const addToHistory = async (uploadResult) => {
    try {
      const history = await getItem('upload_history') || [];
      const newEntry = {
        id: uploadResult.fileId,
        fileName: uploadResult.metadata?.name || 'Unknown',
        fileSize: uploadResult.metadata?.size || 0,
        fileType: uploadResult.metadata?.type || 'unknown',
        uploadedAt: uploadResult.uploadedAt,
        category: uploadResult.metadata?.category || 'general',
        url: uploadResult.url
      };

      const newHistory = [...history, newEntry].slice(-100); // Keep last 100
      await setItem('upload_history', newHistory);
      setUploadHistory(newHistory);

    } catch (error) {
      console.error('Error adding to upload history:', error);
    }
  };

  // Clear upload history
  const clearUploadHistory = useCallback(async () => {
    try {
      await setItem('upload_history', []);
      setUploadHistory([]);
      showNotification('Upload history cleared', 'success');
    } catch (error) {
      console.error('Error clearing upload history:', error);
      showNotification('Error clearing history', 'error');
    }
  }, [setItem, showNotification]);

  // Delete uploaded file
  const deleteFile = useCallback(async (fileId) => {
    try {
      const response = await fetch(`/api/upload/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Remove from uploads
      setUploads(prev => prev.filter(u => u.id !== fileId));
      
      // Remove from history
      const history = await getItem('upload_history') || [];
      const newHistory = history.filter(h => h.id !== fileId);
      await setItem('upload_history', newHistory);
      setUploadHistory(newHistory);

      showNotification('File deleted successfully', 'success');
      trackEvent('file_deleted', { fileId });

      return { success: true };

    } catch (error) {
      console.error('Error deleting file:', error);
      showNotification('Error deleting file', 'error');
      return { success: false, error: error.message };
    }
  }, [user, getItem, setItem, showNotification, trackEvent]);

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

      // Update in uploads
      setUploads(prev => prev.map(u => 
        u.id === fileId ? { ...u, metadata: { ...u.metadata, ...result.metadata } } : u
      ));

      showNotification('File metadata updated', 'success');
      return { success: true, metadata: result.metadata };

    } catch (error) {
      console.error('Error updating file metadata:', error);
      showNotification('Error updating metadata', 'error');
      return { success: false, error: error.message };
    }
  }, [user, showNotification]);

  // Search files
  const searchFiles = useCallback(async (query, filters = {}) => {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await fetch(`/api/upload/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      return results;

    } catch (error) {
      console.error('Error searching files:', error);
      return { files: [], total: 0 };
    }
  }, [user]);

  // Utility functions
  const generateUploadId = () => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const validateFile = (file) => {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (file.size > config.maxFileSize) {
      return { isValid: false, error: 'File too large' };
    }

    if (config.allowedTypes[0] !== '*/*') {
      const isAllowed = config.allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return { isValid: false, error: 'File type not allowed' };
      }
    }

    return { isValid: true };
  };

  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    // State
    uploads,
    isUploading,
    uploadProgress,
    uploadQueue,
    failedUploads,
    uploadHistory,

    // Methods
    uploadFile,
    uploadMultiple,
    uploadWithProgress,
    cancelUpload,
    retryUpload,
    getUploadStatus,
    getUploadProgress,
    getUploadHistory,
    clearUploadHistory,
    deleteFile,
    updateFileMetadata,
    searchFiles,

    // Utilities
    formatFileSize,
    config
  };
};

export default useFileUploader;
