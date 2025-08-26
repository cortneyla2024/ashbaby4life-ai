const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const { PrismaClient } = require('@prisma/client');
const { validateInput, sanitize } = require('../utils/validation');
const { applyRateLimit } = require('../middleware/rateLimit');
const auth = require('../middleware/auth');
const AIUtils = require('../utils/ai');

const router = express.Router();
const prisma = new PrismaClient();
const aiUtils = new AIUtils();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const uploadDir = path.join(process.cwd(), 'uploads', userId);
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/json',
    'application/xml',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/webm',
    // Video
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/avi',
    'video/mov',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10 // Max 10 files per request
  }
});

// Upload file
router.post('/', 
  auth.optional,
  applyRateLimit('upload'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validate and sanitize input
      const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
      const privacy = sanitize.html(req.body.privacy || 'private');
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const category = sanitize.html(req.body.category || 'general');
      const userId = req.user?.id || req.body.userId || 'anonymous';

      // Generate file ID
      const fileId = uuidv4();
      
      // Extract file metadata
      const fileMetadata = await extractFileMetadata(req.file);
      
      // Generate thumbnail for images/videos
      let thumbnail = null;
      if (isImageOrVideo(req.file.mimetype)) {
        thumbnail = await generateThumbnail(req.file.path, fileId);
      }

      // Extract text from documents
      let extractedText = null;
      if (isDocument(req.file.mimetype)) {
        extractedText = await extractTextFromDocument(req.file.path);
      }

      // Generate transcript for audio/video
      let transcript = null;
      if (isAudioOrVideo(req.file.mimetype)) {
        transcript = await generateTranscript(req.file.path);
      }

      // AI processing
      let aiAnalysis = null;
      if (req.body.allowAIProcessing !== 'false') {
        aiAnalysis = await processFileWithAI(req.file.path, {
          extractKeywords: true,
          generateSummary: true,
          suggestTags: true,
          categorize: true
        });
      }

      // Create file record in database
      const fileRecord = await prisma.fileRecord.create({
        data: {
          id: fileId,
          userId,
          filename: req.file.originalname,
          originalName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          extension: path.extname(req.file.originalname).toLowerCase(),
          privacy,
          category,
          tags: tags,
          metadata: {
            ...fileMetadata,
            thumbnail,
            extractedText,
            transcript,
            aiAnalysis
          },
          uploadedAt: new Date(),
          lastAccessed: new Date(),
          accessCount: 0,
          isEncrypted: privacy === 'private',
          checksum: await calculateChecksum(req.file.path)
        }
      });

      // Index file for search
      await indexFileForSearch(fileRecord);

      // Return success response
      res.status(201).json({
        success: true,
        fileId: fileRecord.id,
        url: `/api/upload/${fileRecord.id}/download`,
        metadata: fileRecord.metadata,
        message: 'File uploaded successfully'
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up uploaded file if database operation failed
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Upload failed'
      });
    }
  }
);

// Upload multiple files
router.post('/batch',
  auth.optional,
  applyRateLimit('upload'),
  upload.array('files', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const results = [];
      const userId = req.user?.id || req.body.userId || 'anonymous';

      for (const file of req.files) {
        try {
          // Extract metadata
          const fileMetadata = await extractFileMetadata(file);
          
          // Generate file ID
          const fileId = uuidv4();
          
          // Generate thumbnail
          let thumbnail = null;
          if (isImageOrVideo(file.mimetype)) {
            thumbnail = await generateThumbnail(file.path, fileId);
          }

          // Extract text
          let extractedText = null;
          if (isDocument(file.mimetype)) {
            extractedText = await extractTextFromDocument(file.path);
          }

          // Generate transcript
          let transcript = null;
          if (isAudioOrVideo(file.mimetype)) {
            transcript = await generateTranscript(file.path);
          }

          // AI processing
          let aiAnalysis = null;
          if (req.body.allowAIProcessing !== 'false') {
            aiAnalysis = await processFileWithAI(file.path, {
              extractKeywords: true,
              generateSummary: true,
              suggestTags: true,
              categorize: true
            });
          }

          // Create file record
          const fileRecord = await prisma.fileRecord.create({
            data: {
              id: fileId,
              userId,
              filename: file.originalname,
              originalName: file.originalname,
              filePath: file.path,
              fileSize: file.size,
              mimeType: file.mimetype,
              extension: path.extname(file.originalname).toLowerCase(),
              privacy: req.body.privacy || 'private',
              category: req.body.category || 'general',
              tags: req.body.tags ? JSON.parse(req.body.tags) : [],
              metadata: {
                ...fileMetadata,
                thumbnail,
                extractedText,
                transcript,
                aiAnalysis
              },
              uploadedAt: new Date(),
              lastAccessed: new Date(),
              accessCount: 0,
              isEncrypted: req.body.privacy === 'private',
              checksum: await calculateChecksum(file.path)
            }
          });

          // Index file
          await indexFileForSearch(fileRecord);

          results.push({
            success: true,
            fileId: fileRecord.id,
            filename: file.originalname,
            url: `/api/upload/${fileRecord.id}/download`
          });

        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          
          // Clean up file
          try {
            await fs.unlink(file.path);
          } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
          }

          results.push({
            success: false,
            filename: file.originalname,
            error: fileError.message
          });
        }
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      res.status(200).json({
        success: true,
        results,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length
        }
      });

    } catch (error) {
      console.error('Batch upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Batch upload failed'
      });
    }
  }
);

// Get file by ID
router.get('/:fileId',
  auth.optional,
  async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user?.id || 'anonymous';

      const fileRecord = await prisma.fileRecord.findFirst({
        where: {
          id: fileId,
          OR: [
            { userId },
            { privacy: 'public' }
          ]
        }
      });

      if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Update access count and last accessed
      await prisma.fileRecord.update({
        where: { id: fileId },
        data: {
          accessCount: { increment: 1 },
          lastAccessed: new Date()
        }
      });

      res.json({
        success: true,
        file: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          fileSize: fileRecord.fileSize,
          mimeType: fileRecord.mimeType,
          extension: fileRecord.extension,
          privacy: fileRecord.privacy,
          category: fileRecord.category,
          tags: fileRecord.tags,
          metadata: fileRecord.metadata,
          uploadedAt: fileRecord.uploadedAt,
          lastAccessed: fileRecord.lastAccessed,
          accessCount: fileRecord.accessCount,
          url: `/api/upload/${fileRecord.id}/download`
        }
      });

    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get file'
      });
    }
  }
);

// Download file
router.get('/:fileId/download',
  auth.optional,
  async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user?.id || 'anonymous';

      const fileRecord = await prisma.fileRecord.findFirst({
        where: {
          id: fileId,
          OR: [
            { userId },
            { privacy: 'public' }
          ]
        }
      });

      if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Check if file exists
      try {
        await fs.access(fileRecord.filePath);
      } catch {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      // Update access count
      await prisma.fileRecord.update({
        where: { id: fileId },
        data: {
          accessCount: { increment: 1 },
          lastAccessed: new Date()
        }
      });

      // Stream file
      res.setHeader('Content-Type', fileRecord.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
      res.setHeader('Content-Length', fileRecord.fileSize);

      const fileStream = require('fs').createReadStream(fileRecord.filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Download failed'
      });
    }
  }
);

// Update file metadata
router.put('/:fileId/metadata',
  auth.required,
  async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Validate input
      const validatedUpdates = validateInput(updates, {
        tags: 'array',
        category: 'string',
        privacy: 'string',
        metadata: 'object'
      });

      const fileRecord = await prisma.fileRecord.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Update file record
      const updatedFile = await prisma.fileRecord.update({
        where: { id: fileId },
        data: {
          tags: validatedUpdates.tags || fileRecord.tags,
          category: validatedUpdates.category || fileRecord.category,
          privacy: validatedUpdates.privacy || fileRecord.privacy,
          metadata: {
            ...fileRecord.metadata,
            ...validatedUpdates.metadata
          }
        }
      });

      res.json({
        success: true,
        file: updatedFile,
        message: 'File metadata updated successfully'
      });

    } catch (error) {
      console.error('Update metadata error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update metadata'
      });
    }
  }
);

// Delete file
router.delete('/:fileId',
  auth.required,
  async (req, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.id;

      const fileRecord = await prisma.fileRecord.findFirst({
        where: {
          id: fileId,
          userId
        }
      });

      if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete file from disk
      try {
        await fs.unlink(fileRecord.filePath);
      } catch (diskError) {
        console.error('Error deleting file from disk:', diskError);
      }

      // Delete from database
      await prisma.fileRecord.delete({
        where: { id: fileId }
      });

      // Remove from search index
      await removeFromSearchIndex(fileId);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete file'
      });
    }
  }
);

// Search files
router.get('/search',
  auth.optional,
  async (req, res) => {
    try {
      const { q, category, privacy, tags, limit = 20, offset = 0 } = req.query;
      const userId = req.user?.id || 'anonymous';

      // Build search query
      const where = {
        OR: [
          { userId },
          { privacy: 'public' }
        ]
      };

      if (q) {
        where.OR.push(
          { filename: { contains: q, mode: 'insensitive' } },
          { originalName: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q] } }
        );
      }

      if (category) {
        where.category = category;
      }

      if (privacy) {
        where.privacy = privacy;
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        where.tags = { hasSome: tagArray };
      }

      // Execute search
      const [files, total] = await Promise.all([
        prisma.fileRecord.findMany({
          where,
          orderBy: { uploadedAt: 'desc' },
          take: parseInt(limit),
          skip: parseInt(offset),
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            extension: true,
            privacy: true,
            category: true,
            tags: true,
            metadata: true,
            uploadedAt: true,
            lastAccessed: true,
            accessCount: true
          }
        }),
        prisma.fileRecord.count({ where })
      ]);

      res.json({
        success: true,
        files: files.map(file => ({
          ...file,
          url: `/api/upload/${file.id}/download`
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Search failed'
      });
    }
  }
);

// Get user's files
router.get('/user/files',
  auth.required,
  async (req, res) => {
    try {
      const { limit = 50, offset = 0, category } = req.query;
      const userId = req.user.id;

      const where = { userId };
      if (category) {
        where.category = category;
      }

      const [files, total] = await Promise.all([
        prisma.fileRecord.findMany({
          where,
          orderBy: { uploadedAt: 'desc' },
          take: parseInt(limit),
          skip: parseInt(offset)
        }),
        prisma.fileRecord.count({ where })
      ]);

      res.json({
        success: true,
        files: files.map(file => ({
          ...file,
          url: `/api/upload/${file.id}/download`
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

    } catch (error) {
      console.error('Get user files error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user files'
      });
    }
  }
);

// Utility functions
async function extractFileMetadata(file) {
  const metadata = {
    name: file.originalname,
    size: file.size,
    type: file.mimetype,
    extension: path.extname(file.originalname).toLowerCase(),
    uploadedAt: new Date().toISOString()
  };

  // Add file-specific metadata
  if (isImage(file.mimetype)) {
    try {
      const imageInfo = await sharp(file.path).metadata();
      metadata.width = imageInfo.width;
      metadata.height = imageInfo.height;
      metadata.format = imageInfo.format;
    } catch (error) {
      console.error('Error extracting image metadata:', error);
    }
  } else if (isAudio(file.mimetype)) {
    try {
      const audioInfo = await getAudioMetadata(file.path);
      metadata.duration = audioInfo.duration;
      metadata.bitrate = audioInfo.bitrate;
    } catch (error) {
      console.error('Error extracting audio metadata:', error);
    }
  } else if (isVideo(file.mimetype)) {
    try {
      const videoInfo = await getVideoMetadata(file.path);
      metadata.duration = videoInfo.duration;
      metadata.width = videoInfo.width;
      metadata.height = videoInfo.height;
    } catch (error) {
      console.error('Error extracting video metadata:', error);
    }
  }

  return metadata;
}

async function generateThumbnail(filePath, fileId) {
  try {
    const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', `${fileId}.jpg`);
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });

    if (isImage(path.extname(filePath))) {
      await sharp(filePath)
        .resize(200, 200, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    } else if (isVideo(path.extname(filePath))) {
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .screenshots({
            timestamps: ['00:00:01'],
            filename: `${fileId}.jpg`,
            folder: path.dirname(thumbnailPath),
            size: '200x200'
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    return `/uploads/thumbnails/${fileId}.jpg`;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
}

async function extractTextFromDocument(filePath) {
  try {
    const extension = path.extname(filePath).toLowerCase();
    
    if (extension === '.txt' || extension === '.md') {
      return await fs.readFile(filePath, 'utf8');
    }
    
    // For other document types, we'd need specialized libraries
    // This is a placeholder for PDF, Word, etc.
    return '';
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

async function generateTranscript(filePath) {
  try {
    // This would use the AI audio processing capabilities
    // For now, return a placeholder
    return 'Transcript generation not yet implemented';
  } catch (error) {
    console.error('Error generating transcript:', error);
    return '';
  }
}

async function processFileWithAI(filePath, options) {
  try {
    if (!aiUtils.isConnected) {
      return null;
    }

    const analysis = await aiUtils.processFile(filePath, options);
    return analysis;
  } catch (error) {
    console.error('Error processing file with AI:', error);
    return null;
  }
}

async function calculateChecksum(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch (error) {
    console.error('Error calculating checksum:', error);
    return null;
  }
}

async function indexFileForSearch(fileRecord) {
  try {
    // This would integrate with a search engine like Elasticsearch or Meilisearch
    // For now, we'll use the database for basic search
    console.log('File indexed for search:', fileRecord.id);
  } catch (error) {
    console.error('Error indexing file:', error);
  }
}

async function removeFromSearchIndex(fileId) {
  try {
    // Remove from search index
    console.log('File removed from search index:', fileId);
  } catch (error) {
    console.error('Error removing from search index:', error);
  }
}

async function getAudioMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const stream = metadata.streams.find(s => s.codec_type === 'audio');
        resolve({
          duration: metadata.format.duration,
          bitrate: metadata.format.bit_rate
        });
      }
    });
  });
}

async function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          duration: metadata.format.duration,
          width: videoStream?.width,
          height: videoStream?.height
        });
      }
    });
  });
}

// Helper functions
function isImage(mimeType) {
  return mimeType.startsWith('image/');
}

function isAudio(mimeType) {
  return mimeType.startsWith('audio/');
}

function isVideo(mimeType) {
  return mimeType.startsWith('video/');
}

function isDocument(mimeType) {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/json',
    'application/xml'
  ];
  return documentTypes.includes(mimeType);
}

function isImageOrVideo(mimeType) {
  return isImage(mimeType) || isVideo(mimeType);
}

function isAudioOrVideo(mimeType) {
  return isAudio(mimeType) || isVideo(mimeType);
}

module.exports = router;
