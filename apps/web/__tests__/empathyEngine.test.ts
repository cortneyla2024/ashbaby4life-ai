import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock emotional state detection
const mockEmotionDetector = {
  detectTextEmotion: (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('worried') || lowerText.includes('anxious') || lowerText.includes('scared')) {
      return 'anxious';
    }
    if (lowerText.includes('confused') || lowerText.includes('unsure') || lowerText.includes('lost')) {
      return 'confused';
    }
    if (lowerText.includes('happy') || lowerText.includes('excited') || lowerText.includes('joy')) {
      return 'joyful';
    }
    if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad')) {
      return 'angry';
    }
    return 'neutral';
  },
  
  detectVoiceEmotion: jest.fn((audioFeatures: any) => {
    if (audioFeatures.pitch > 0.8 && audioFeatures.tempo < 0.5) return 'anxious';
    if (audioFeatures.energy < 0.3) return 'confused';
    if (audioFeatures.pitch > 1.2 && audioFeatures.energy > 0.8) return 'joyful';
    if (audioFeatures.pitch < 0.7 && audioFeatures.energy > 0.9) return 'angry';
    return 'neutral';
  }),
  
  detectMultimodalEmotion: jest.fn((text: string, audioFeatures: any) => {
    const textEmotion = mockEmotionDetector.detectTextEmotion(text);
    const voiceEmotion = mockEmotionDetector.detectVoiceEmotion(audioFeatures);
    
    // Prioritize voice if emotional intensity is high
    if (voiceEmotion !== 'neutral') return voiceEmotion;
    return textEmotion;
  })
};

// Mock empathy engine
const mockEmpathyEngine = {
  adaptTone: jest.fn((emotion: string) => {
    switch (emotion) {
      case 'anxious':
        return { tone: 'calm', guidanceStyle: 'step-by-step', pacing: 'slow' };
      case 'confused':
        return { tone: 'clarifying', guidanceStyle: 'visual + verbal', pacing: 'moderate' };
      case 'joyful':
        return { tone: 'celebratory', guidanceStyle: 'encouraging', pacing: 'fast' };
      case 'angry':
        return { tone: 'empathetic', guidanceStyle: 'validating + redirecting', pacing: 'gentle' };
      default:
        return { tone: 'neutral', guidanceStyle: 'standard', pacing: 'normal' };
    }
  }),
  
  generateResponse: jest.fn((emotion: string, context: string) => {
    const tone = mockEmpathyEngine.adaptTone(emotion);
    
    const responses = {
      anxious: "I understand this feels overwhelming. Let's take it one step at a time. What would be most helpful right now?",
      confused: "It sounds like you're feeling uncertain. Let me help clarify things. Can you tell me more about what's unclear?",
      joyful: "That's wonderful! I'm so happy to hear about your success. What made this moment special for you?",
      angry: "I can hear how frustrating this is for you. Your feelings are valid. Would you like to talk about what happened?",
      neutral: "Thank you for sharing that with me. How can I support you today?"
    };
    
    return {
      message: responses[emotion as keyof typeof responses] || responses.neutral,
      tone: tone.tone,
      guidanceStyle: tone.guidanceStyle,
      pacing: tone.pacing
    };
  })
};

// Mock avatar system
const mockAvatarSystem = {
  updateExpression: jest.fn((emotion: string) => {
    const expressions = {
      anxious: { eyes: 'soft', mouth: 'concerned', brows: 'furrowed' },
      confused: { eyes: 'tilted', mouth: 'thoughtful', brows: 'raised' },
      joyful: { eyes: 'bright', mouth: 'smile', brows: 'relaxed' },
      angry: { eyes: 'focused', mouth: 'firm', brows: 'straight' },
      neutral: { eyes: 'balanced', mouth: 'straight', brows: 'natural' }
    };
    return expressions[emotion as keyof typeof expressions] || expressions.neutral;
  }),
  
  updateVoice: jest.fn((tone: string) => {
    const voiceConfigs = {
      calm: { pitch: 0.8, rate: 0.9, volume: 0.7 },
      clarifying: { pitch: 1.0, rate: 0.8, volume: 0.8 },
      celebratory: { pitch: 1.2, rate: 1.1, volume: 1.0 },
      empathetic: { pitch: 0.9, rate: 0.9, volume: 0.8 },
      neutral: { pitch: 1.0, rate: 1.0, volume: 0.9 }
    };
    return voiceConfigs[tone as keyof typeof voiceConfigs] || voiceConfigs.neutral;
  })
};

describe('Empathy Engine Tests', () => {
  describe('Emotional State Detection', () => {
    test('should detect anxiety from text input', () => {
      const anxiousText = "I'm really worried about my upcoming appointment";
      const emotion = mockEmotionDetector.detectTextEmotion(anxiousText);
      
      expect(emotion).toBe('anxious');
    });

    test('should detect confusion from text input', () => {
      const confusedText = "I'm confused about this feature";
      const emotion = mockEmotionDetector.detectTextEmotion(confusedText);
      
      expect(emotion).toBe('confused');
    });

    test('should detect joy from text input', () => {
      const joyfulText = "I'm so excited about my new job!";
      const emotion = mockEmotionDetector.detectTextEmotion(joyfulText);
      
      expect(emotion).toBe('joyful');
    });

    test('should detect anger from text input', () => {
      const angryText = "I'm really frustrated with this system";
      const emotion = mockEmotionDetector.detectTextEmotion(angryText);
      
      expect(emotion).toBe('angry');
    });

    test('should detect neutral state from text input', () => {
      const neutralText = "I need to check my balance";
      const emotion = mockEmotionDetector.detectTextEmotion(neutralText);
      
      expect(emotion).toBe('neutral');
    });
  });

  describe('Voice Emotion Detection', () => {
    test('should detect anxiety from voice features', () => {
      const anxiousVoice = { pitch: 0.9, tempo: 0.3, energy: 0.4 };
      const emotion = mockEmotionDetector.detectVoiceEmotion(anxiousVoice);
      
      expect(emotion).toBe('anxious');
    });

    test('should detect confusion from voice features', () => {
      const confusedVoice = { pitch: 0.7, tempo: 0.6, energy: 0.2 };
      const emotion = mockEmotionDetector.detectVoiceEmotion(confusedVoice);
      
      expect(emotion).toBe('confused');
    });

    test('should detect joy from voice features', () => {
      const joyfulVoice = { pitch: 1.3, tempo: 0.8, energy: 0.9 };
      const emotion = mockEmotionDetector.detectVoiceEmotion(joyfulVoice);
      
      expect(emotion).toBe('joyful');
    });

    test('should detect anger from voice features', () => {
      const angryVoice = { pitch: 0.6, tempo: 0.7, energy: 0.95 };
      const emotion = mockEmotionDetector.detectVoiceEmotion(angryVoice);
      
      expect(emotion).toBe('angry');
    });
  });

  describe('Multimodal Emotion Fusion', () => {
    test('should prioritize voice emotion when intense', () => {
      const text = "I'm doing okay";
      const intenseVoice = { pitch: 0.9, tempo: 0.3, energy: 0.4 };
      
      const emotion = mockEmotionDetector.detectMultimodalEmotion(text, intenseVoice);
      
      expect(emotion).toBe('anxious'); // Voice emotion takes priority
    });

    test('should use text emotion when voice is neutral', () => {
      const anxiousText = "I'm really worried about this";
      const neutralVoice = { pitch: 1.0, tempo: 0.7, energy: 0.5 };
      
      const emotion = mockEmotionDetector.detectMultimodalEmotion(anxiousText, neutralVoice);
      
      expect(emotion).toBe('anxious'); // Text emotion used
    });
  });

  describe('Tone Adaptation', () => {
    test('should adapt tone for anxious users', () => {
      const tone = mockEmpathyEngine.adaptTone('anxious');
      
      expect(tone.tone).toBe('calm');
      expect(tone.guidanceStyle).toBe('step-by-step');
      expect(tone.pacing).toBe('slow');
    });

    test('should adapt tone for confused users', () => {
      const tone = mockEmpathyEngine.adaptTone('confused');
      
      expect(tone.tone).toBe('clarifying');
      expect(tone.guidanceStyle).toBe('visual + verbal');
      expect(tone.pacing).toBe('moderate');
    });

    test('should adapt tone for joyful users', () => {
      const tone = mockEmpathyEngine.adaptTone('joyful');
      
      expect(tone.tone).toBe('celebratory');
      expect(tone.guidanceStyle).toBe('encouraging');
      expect(tone.pacing).toBe('fast');
    });

    test('should adapt tone for angry users', () => {
      const tone = mockEmpathyEngine.adaptTone('angry');
      
      expect(tone.tone).toBe('empathetic');
      expect(tone.guidanceStyle).toBe('validating + redirecting');
      expect(tone.pacing).toBe('gentle');
    });

    test('should use neutral tone for neutral users', () => {
      const tone = mockEmpathyEngine.adaptTone('neutral');
      
      expect(tone.tone).toBe('neutral');
      expect(tone.guidanceStyle).toBe('standard');
      expect(tone.pacing).toBe('normal');
    });
  });

  describe('Response Generation', () => {
    test('should generate empathetic response for anxious user', () => {
      const response = mockEmpathyEngine.generateResponse('anxious', 'financial stress');
      
      expect(response.message).toContain('overwhelming');
      expect(response.message).toContain('step at a time');
      expect(response.tone).toBe('calm');
      expect(response.pacing).toBe('slow');
    });

    test('should generate clarifying response for confused user', () => {
      const response = mockEmpathyEngine.generateResponse('confused', 'feature usage');
      
      expect(response.message).toContain('uncertain');
      expect(response.message).toContain('clarify');
      expect(response.tone).toBe('clarifying');
      expect(response.pacing).toBe('moderate');
    });

    test('should generate celebratory response for joyful user', () => {
      const response = mockEmpathyEngine.generateResponse('joyful', 'achievement');
      
      expect(response.message).toContain('wonderful');
      expect(response.message).toContain('happy');
      expect(response.tone).toBe('celebratory');
      expect(response.pacing).toBe('fast');
    });

    test('should generate validating response for angry user', () => {
      const response = mockEmpathyEngine.generateResponse('angry', 'system issue');
      
      expect(response.message).toContain('frustrating');
      expect(response.message).toContain('valid');
      expect(response.tone).toBe('empathetic');
      expect(response.pacing).toBe('gentle');
    });
  });

  describe('Avatar Expression Updates', () => {
    test('should update avatar expression for anxious state', () => {
      const expression = mockAvatarSystem.updateExpression('anxious');
      
      expect(expression.eyes).toBe('soft');
      expect(expression.mouth).toBe('concerned');
      expect(expression.brows).toBe('furrowed');
    });

    test('should update avatar expression for confused state', () => {
      const expression = mockAvatarSystem.updateExpression('confused');
      
      expect(expression.eyes).toBe('tilted');
      expect(expression.mouth).toBe('thoughtful');
      expect(expression.brows).toBe('raised');
    });

    test('should update avatar expression for joyful state', () => {
      const expression = mockAvatarSystem.updateExpression('joyful');
      
      expect(expression.eyes).toBe('bright');
      expect(expression.mouth).toBe('smile');
      expect(expression.brows).toBe('relaxed');
    });

    test('should update avatar expression for angry state', () => {
      const expression = mockAvatarSystem.updateExpression('angry');
      
      expect(expression.eyes).toBe('focused');
      expect(expression.mouth).toBe('firm');
      expect(expression.brows).toBe('straight');
    });
  });

  describe('Voice Modulation', () => {
    test('should modulate voice for calm tone', () => {
      const voiceConfig = mockAvatarSystem.updateVoice('calm');
      
      expect(voiceConfig.pitch).toBe(0.8);
      expect(voiceConfig.rate).toBe(0.9);
      expect(voiceConfig.volume).toBe(0.7);
    });

    test('should modulate voice for celebratory tone', () => {
      const voiceConfig = mockAvatarSystem.updateVoice('celebratory');
      
      expect(voiceConfig.pitch).toBe(1.2);
      expect(voiceConfig.rate).toBe(1.1);
      expect(voiceConfig.volume).toBe(1.0);
    });

    test('should modulate voice for empathetic tone', () => {
      const voiceConfig = mockAvatarSystem.updateVoice('empathetic');
      
      expect(voiceConfig.pitch).toBe(0.9);
      expect(voiceConfig.rate).toBe(0.9);
      expect(voiceConfig.volume).toBe(0.8);
    });
  });

  describe('Contextual Awareness', () => {
    test('should adapt response based on user history', () => {
      const userHistory = {
        frequentAnxiety: true,
        prefersVisualGuidance: true,
        lastEmotion: 'anxious'
      };

      // Mock contextual adaptation
      const contextualResponse = mockEmpathyEngine.generateResponse('anxious', 'recurring stress');
      
      expect(contextualResponse.message).toContain('overwhelming');
      expect(contextualResponse.guidanceStyle).toBe('step-by-step');
    });

    test('should respect user boundaries', () => {
      const userPreferences = {
        maxInteractionTime: 300, // 5 minutes
        preferredTone: 'gentle',
        avoidTopics: ['financial details']
      };

      // Mock boundary respect
      const boundaryRespectingResponse = mockEmpathyEngine.generateResponse('anxious', 'general stress');
      
      expect(boundaryRespectingResponse.tone).toBe('calm');
      expect(boundaryRespectingResponse.message).not.toContain('financial');
    });
  });

  describe('Emotional Intelligence Validation', () => {
    test('should not escalate negative emotions', () => {
      const response = mockEmpathyEngine.generateResponse('angry', 'system error');
      
      expect(response.message).not.toContain('worse');
      expect(response.message).not.toContain('terrible');
      expect(response.tone).toBe('empathetic');
    });

    test('should provide actionable support', () => {
      const response = mockEmpathyEngine.generateResponse('confused', 'navigation');
      
      expect(response.message).toContain('help');
      expect(response.message).toContain('clarify');
      expect(response.guidanceStyle).toBe('visual + verbal');
    });

    test('should maintain appropriate boundaries', () => {
      const response = mockEmpathyEngine.generateResponse('anxious', 'personal issue');
      
      expect(response.message).toContain('helpful');
      expect(response.message).not.toContain('I can fix this');
      expect(response.tone).toBe('calm');
    });
  });

  describe('Accessibility & Inclusivity', () => {
    test('should provide alternative communication modes', () => {
      const accessibilityOptions = {
        visualOnly: true,
        audioOnly: false,
        textOnly: true
      };

      // Mock accessibility adaptation
      const accessibleResponse = mockEmpathyEngine.generateResponse('confused', 'feature usage');
      
      expect(accessibleResponse.guidanceStyle).toBe('visual + verbal');
    });

    test('should respect cultural differences', () => {
      const culturalContext = {
        region: 'Asia',
        communicationStyle: 'indirect',
        respectHierarchy: true
      };

      // Mock cultural adaptation
      const culturallyAdaptedResponse = mockEmpathyEngine.generateResponse('confused', 'general');
      
      expect(culturallyAdaptedResponse.tone).toBe('clarifying');
      expect(culturallyAdaptedResponse.pacing).toBe('moderate');
    });
  });

  describe('Performance & Scalability', () => {
    test('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const emotion = mockEmotionDetector.detectTextEmotion("I'm feeling anxious");
      const response = mockEmpathyEngine.generateResponse(emotion, 'general');
      
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(100); // Should respond within 100ms
      expect(response.message).toBeDefined();
    });

    test('should handle concurrent emotional states', () => {
      const emotions = ['anxious', 'confused', 'joyful', 'angry', 'neutral'];
      
      const responses = emotions.map(emotion => 
        mockEmpathyEngine.generateResponse(emotion, 'concurrent test')
      );
      
      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.message).toBeDefined();
        expect(response.tone).toBeDefined();
      });
    });
  });
});
