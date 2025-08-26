import { z } from 'zod';

// Voice processing result
export interface VoiceResult {
  text: string;
  confidence: number;
  timestamp: Date;
  duration: number;
  language?: string;
}

// Speech synthesis options
export interface SpeechOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

// Voice processing service
export class VoiceProcessingService {
  private static instance: VoiceProcessingService;
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isRecording = false;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  static getInstance(): VoiceProcessingService {
    if (!VoiceProcessingService.instance) {
      VoiceProcessingService.instance = new VoiceProcessingService();
    }
    return VoiceProcessingService.instance;
  }

  // Initialize speech recognition
  private initRecognition(): SpeechRecognition | null {
    if (typeof window === 'undefined') return null;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    return recognition;
  }

  // Initialize speech synthesis
  private initSynthesis(): SpeechSynthesis | null {
    if (typeof window === 'undefined') return null;

    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported');
      return null;
    }

    return window.speechSynthesis;
  }

  // Start voice recording
  async startRecording(): Promise<void> {
    if (this.isRecording) return;

    this.recognition = this.initRecognition();
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not initialized'));
        return;
      }

      this.recognition.onstart = () => {
        this.isRecording = true;
        resolve();
      };

      this.recognition.onerror = (event) => {
        this.isRecording = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isRecording = false;
      };

      this.recognition.start();
    });
  }

  // Stop voice recording
  async stopRecording(): Promise<VoiceResult> {
    if (!this.isRecording || !this.recognition) {
      throw new Error('Not currently recording');
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not initialized'));
        return;
      }

      let finalTranscript = '';
      let confidence = 0;
      let startTime = Date.now();

      this.recognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const isFinal = event.results[i].isFinal;

          if (isFinal) {
            finalTranscript += transcript;
            confidence = Math.max(confidence, event.results[i][0].confidence);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        const duration = Date.now() - startTime;

        resolve({
          text: finalTranscript.trim(),
          confidence,
          timestamp: new Date(),
          duration,
          language: 'en-US'
        });
      };

      this.recognition.stop();
    });
  }

  // Speak text
  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    this.synthesis = this.initSynthesis();
    if (!this.synthesis) {
      throw new Error('Speech synthesis not available');
    }

    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not initialized'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.language || 'en-US';

      // Set voice if specified
      if (options.voice) {
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.name === options.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.currentUtterance = utterance;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  // Stop speaking
  stopSpeaking(): void {
    if (this.isSpeaking && this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return [];
    }

    return window.speechSynthesis.getVoices();
  }

  // Check if speech recognition is supported
  isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  // Check if speech synthesis is supported
  isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!window.speechSynthesis;
  }

  // Get recording status
  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  // Get speaking status
  getSpeakingStatus(): boolean {
    return this.isSpeaking;
  }

  // Convert text to speech and get audio data (simplified)
  async textToSpeech(text: string, options: SpeechOptions = {}): Promise<ArrayBuffer> {
    // This is a simplified implementation
    // In a real app, you might use a TTS service or generate audio locally
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.language || 'en-US';

    // For demo purposes, return a mock audio buffer
    // In reality, you'd capture the audio output
    return new ArrayBuffer(1024);
  }

  // Process audio input (simplified)
  async processAudioInput(audioData: ArrayBuffer): Promise<VoiceResult> {
    // This is a simplified implementation
    // In a real app, you'd process the audio data
    return {
      text: 'Processed audio input',
      confidence: 0.8,
      timestamp: new Date(),
      duration: 1000,
      language: 'en-US'
    };
  }

  // Get voice analysis
  analyzeVoice(audioData: ArrayBuffer): {
    pitch: number;
    volume: number;
    speed: number;
    clarity: number;
  } {
    // Simplified voice analysis
    return {
      pitch: 0.5,
      volume: 0.7,
      speed: 1.0,
      clarity: 0.8
    };
  }
}

// Export singleton instance
export const voiceProcessingService = VoiceProcessingService.getInstance();

// React hook for voice processing
export function useVoiceProcessing() {
  return {
    startRecording: voiceProcessingService.startRecording.bind(voiceProcessingService),
    stopRecording: voiceProcessingService.stopRecording.bind(voiceProcessingService),
    speak: voiceProcessingService.speak.bind(voiceProcessingService),
    stopSpeaking: voiceProcessingService.stopSpeaking.bind(voiceProcessingService),
    getAvailableVoices: voiceProcessingService.getAvailableVoices.bind(voiceProcessingService),
    isRecognitionSupported: voiceProcessingService.isRecognitionSupported.bind(voiceProcessingService),
    isSynthesisSupported: voiceProcessingService.isSynthesisSupported.bind(voiceProcessingService),
    getRecordingStatus: voiceProcessingService.getRecordingStatus.bind(voiceProcessingService),
    getSpeakingStatus: voiceProcessingService.getSpeakingStatus.bind(voiceProcessingService),
    textToSpeech: voiceProcessingService.textToSpeech.bind(voiceProcessingService),
    processAudioInput: voiceProcessingService.processAudioInput.bind(voiceProcessingService),
    analyzeVoice: voiceProcessingService.analyzeVoice.bind(voiceProcessingService),
  };
}
