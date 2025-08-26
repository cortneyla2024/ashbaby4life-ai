const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');
const { validateInput } = require('../middleware/validation');
const AIService = require('../services/AIService');
const { rateLimit } = require('../middleware/rateLimit');

// Initialize AI service
const aiService = new AIService();

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many AI requests from this IP, please try again later.'
});

/**
 * @route POST /api/ai/chat
 * @desc Send a message to the AI and get a response
 * @access Private
 */
router.post('/chat', verifyAuth, aiRateLimit, validateInput, async (req, res) => {
  try {
    const { message, context, persona, options } = req.body;
    const userId = req.user.id;

    const response = await aiService.chat({
      message,
      context,
      persona: persona || 'default',
      userId,
      options: options || {}
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI chat request'
    });
  }
});

/**
 * @route POST /api/ai/generate
 * @desc Generate content using AI (text, code, etc.)
 * @access Private
 */
router.post('/generate', verifyAuth, aiRateLimit, validateInput, async (req, res) => {
  try {
    const { prompt, type, options } = req.body;
    const userId = req.user.id;

    const result = await aiService.generate({
      prompt,
      type: type || 'text',
      userId,
      options: options || {}
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

/**
 * @route POST /api/ai/analyze
 * @desc Analyze text, images, or other content
 * @access Private
 */
router.post('/analyze', verifyAuth, aiRateLimit, async (req, res) => {
  try {
    const { content, type, analysisType } = req.body;
    const userId = req.user.id;

    const analysis = await aiService.analyze({
      content,
      type: type || 'text',
      analysisType: analysisType || 'general',
      userId
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze content'
    });
  }
});

/**
 * @route POST /api/ai/translate
 * @desc Translate text between languages
 * @access Private
 */
router.post('/translate', verifyAuth, aiRateLimit, validateInput, async (req, res) => {
  try {
    const { text, from, to, context } = req.body;
    const userId = req.user.id;

    const translation = await aiService.translate({
      text,
      from: from || 'auto',
      to: to || 'en',
      context,
      userId
    });

    res.json({
      success: true,
      data: translation
    });
  } catch (error) {
    console.error('AI translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to translate text'
    });
  }
});

/**
 * @route POST /api/ai/summarize
 * @desc Summarize text content
 * @access Private
 */
router.post('/summarize', verifyAuth, aiRateLimit, validateInput, async (req, res) => {
  try {
    const { text, length, style } = req.body;
    const userId = req.user.id;

    const summary = await aiService.summarize({
      text,
      length: length || 'medium',
      style: style || 'informative',
      userId
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('AI summarization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to summarize text'
    });
  }
});

/**
 * @route POST /api/ai/classify
 * @desc Classify text or content into categories
 * @access Private
 */
router.post('/classify', verifyAuth, aiRateLimit, validateInput, async (req, res) => {
  try {
    const { content, categories, confidence } = req.body;
    const userId = req.user.id;

    const classification = await aiService.classify({
      content,
      categories: categories || [],
      confidence: confidence || 0.7,
      userId
    });

    res.json({
      success: true,
      data: classification
    });
  } catch (error) {
    console.error('AI classification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to classify content'
    });
  }
});

/**
 * @route POST /api/ai/extract
 * @desc Extract structured data from text
 * @access Private
 */
router.post('/extract', verifyAuth, aiRateLimit, validateInput, async (req, res) => {
  try {
    const { text, entities, format } = req.body;
    const userId = req.user.id;

    const extracted = await aiService.extract({
      text,
      entities: entities || ['names', 'dates', 'locations'],
      format: format || 'json',
      userId
    });

    res.json({
      success: true,
      data: extracted
    });
  } catch (error) {
    console.error('AI extraction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to extract data'
    });
  }
});

/**
 * @route POST /api/ai/sentiment
 * @desc Analyze sentiment of text
 * @access Private
 */
router.post('/sentiment', verifyAuth, aiRateLimit, validateInput, async (req, res) => {
  try {
    const { text, detailed } = req.body;
    const userId = req.user.id;

    const sentiment = await aiService.analyzeSentiment({
      text,
      detailed: detailed || false,
      userId
    });

    res.json({
      success: true,
      data: sentiment
    });
  } catch (error) {
    console.error('AI sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sentiment'
    });
  }
});

/**
 * @route POST /api/ai/embed
 * @desc Generate embeddings for text
 * @access Private
 */
router.post('/embed', verifyAuth, aiRateLimit, validateInput, async (req, res) => {
  try {
    const { text, model } = req.body;
    const userId = req.user.id;

    const embedding = await aiService.embed({
      text,
      model: model || 'default',
      userId
    });

    res.json({
      success: true,
      data: embedding
    });
  } catch (error) {
    console.error('AI embedding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate embedding'
    });
  }
});

/**
 * @route GET /api/ai/models
 * @desc Get available AI models
 * @access Private
 */
router.get('/models', verifyAuth, async (req, res) => {
  try {
    const models = await aiService.getAvailableModels();
    
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available models'
    });
  }
});

/**
 * @route GET /api/ai/status
 * @desc Get AI service status
 * @access Private
 */
router.get('/status', verifyAuth, async (req, res) => {
  try {
    const status = await aiService.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get AI status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI status'
    });
  }
});

/**
 * @route POST /api/ai/train
 * @desc Train or fine-tune AI model
 * @access Private (Admin only)
 */
router.post('/train', verifyAuth, aiRateLimit, async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }

    const { data, model, parameters } = req.body;

    const trainingJob = await aiService.train({
      data,
      model: model || 'default',
      parameters: parameters || {},
      userId: req.user.id
    });

    res.json({
      success: true,
      data: trainingJob
    });
  } catch (error) {
    console.error('AI training error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start training'
    });
  }
});

/**
 * @route GET /api/ai/training/:jobId
 * @desc Get training job status
 * @access Private (Admin only)
 */
router.get('/training/:jobId', verifyAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }

    const { jobId } = req.params;
    const status = await aiService.getTrainingStatus(jobId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get training status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get training status'
    });
  }
});

/**
 * @route POST /api/ai/feedback
 * @desc Submit feedback for AI responses
 * @access Private
 */
router.post('/feedback', verifyAuth, validateInput, async (req, res) => {
  try {
    const { responseId, rating, feedback, category } = req.body;
    const userId = req.user.id;

    await aiService.submitFeedback({
      responseId,
      rating,
      feedback,
      category: category || 'general',
      userId
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

module.exports = router;
