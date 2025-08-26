/**
 * Edge Worker for steward-omni-max
 * Handles request validation, feature flags, and edge-side processing
 */

// Feature flags configuration
const FEATURE_FLAGS = {
  'ai.local-only': true,
  'connectors.paid-disabled': true,
  'privacy.strict-mode': true,
  'offline-first.enabled': true,
  'auto-update.enabled': true,
};

// Request validation rules
const VALIDATION_RULES = {
  maxBodySize: 10 * 1024 * 1024, // 10MB
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  requiredHeaders: ['user-agent', 'content-type'],
  blockedUserAgents: ['bot', 'crawler', 'spider'],
};

/**
 * Main request handler
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // Validate request
    const validationResult = validateRequest(request);
    if (!validationResult.valid) {
      return new Response(JSON.stringify({
        error: 'Request validation failed',
        details: validationResult.reasons
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check feature flags
    const featureFlags = getFeatureFlags(request);
    
    // Process request based on path
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/health')) {
      return handleHealthCheck(request);
    }
    
    if (url.pathname.startsWith('/api/feature-flags')) {
      return handleFeatureFlags(request, featureFlags);
    }
    
    if (url.pathname.startsWith('/api/validate')) {
      return handleValidation(request);
    }
    
    // Forward to origin for other requests
    return fetch(request);
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Validate incoming request
 */
function validateRequest(request) {
  const reasons = [];
  
  // Check method
  if (!VALIDATION_RULES.allowedMethods.includes(request.method)) {
    reasons.push(`Method ${request.method} not allowed`);
  }
  
  // Check user agent
  const userAgent = request.headers.get('user-agent') || '';
  const isBlocked = VALIDATION_RULES.blockedUserAgents.some(blocked => 
    userAgent.toLowerCase().includes(blocked)
  );
  if (isBlocked) {
    reasons.push('Blocked user agent');
  }
  
  // Check content length
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > VALIDATION_RULES.maxBodySize) {
    reasons.push('Request body too large');
  }
  
  // Check required headers
  for (const header of VALIDATION_RULES.requiredHeaders) {
    if (!request.headers.get(header)) {
      reasons.push(`Missing required header: ${header}`);
    }
  }
  
  return {
    valid: reasons.length === 0,
    reasons
  };
}

/**
 * Get feature flags for request
 */
function getFeatureFlags(request) {
  const flags = { ...FEATURE_FLAGS };
  
  // Override based on request headers or query params
  const url = new URL(request.url);
  const overrideFlags = url.searchParams.get('flags');
  
  if (overrideFlags) {
    try {
      const overrides = JSON.parse(overrideFlags);
      Object.assign(flags, overrides);
    } catch (e) {
      // Ignore invalid flag overrides
    }
  }
  
  return flags;
}

/**
 * Handle health check requests
 */
async function handleHealthCheck(request) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    edge: true
  };
  
  return new Response(JSON.stringify(health), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle feature flags requests
 */
async function handleFeatureFlags(request, flags) {
  return new Response(JSON.stringify({
    flags,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Handle validation requests
 */
async function handleValidation(request) {
  const validationResult = validateRequest(request);
  
  return new Response(JSON.stringify({
    valid: validationResult.valid,
    reasons: validationResult.reasons,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
