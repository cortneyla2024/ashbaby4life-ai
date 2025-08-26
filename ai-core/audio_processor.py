"""
Audio Processing Module for CareConnect v5.0
Handles speech synthesis, voice cloning, real-time audio processing, and noise reduction
"""

import numpy as np
import librosa
import soundfile as sf
import pyttsx3
import speech_recognition as sr
from typing import Dict, List, Tuple, Optional, Any, Union
import threading
import time
import json
import logging
import queue
import wave
import pyaudio
from dataclasses import dataclass
from enum import Enum
import pickle
import os
import tempfile
from scipy import signal
from scipy.io import wavfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioQuality(Enum):
    """Audio quality levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    ULTRA = "ultra"

class VoiceType(Enum):
    """Voice types for synthesis"""
    MALE = "male"
    FEMALE = "female"
    NEUTRAL = "neutral"
    CHILD = "child"
    ELDERLY = "elderly"

@dataclass
class AudioConfig:
    """Configuration for audio processing"""
    sample_rate: int = 44100
    channels: int = 1
    chunk_size: int = 1024
    format: int = pyaudio.paFloat32
    quality: AudioQuality = AudioQuality.HIGH
    voice_type: VoiceType = VoiceType.NEUTRAL
    noise_reduction: bool = True
    echo_cancellation: bool = True
    auto_gain_control: bool = True

@dataclass
class AudioFrame:
    """Audio frame data structure"""
    data: np.ndarray
    timestamp: float
    sample_rate: int
    channels: int
    duration: float

@dataclass
class SpeechResult:
    """Speech recognition result"""
    text: str
    confidence: float
    timestamp: float
    language: str
    is_final: bool

class AudioProcessor:
    """Main audio processing class"""
    
    def __init__(self, config: AudioConfig = None):
        self.config = config or AudioConfig()
        self.audio = pyaudio.PyAudio()
        self.recognizer = sr.Recognizer()
        self.tts_engine = pyttsx3.init()
        
        # Audio buffers
        self.input_buffer = queue.Queue()
        self.output_buffer = queue.Queue()
        self.processing_buffer = queue.Queue()
        
        # Processing state
        self.is_recording = False
        self.is_playing = False
        self.is_processing = False
        
        # Threads
        self.recording_thread = None
        self.playback_thread = None
        self.processing_thread = None
        
        # Voice profiles
        self.voice_profiles = {}
        self.current_voice_profile = None
        
        # Initialize components
        self._setup_tts()
        self._setup_noise_reduction()
        self._load_voice_profiles()
        
    def _setup_tts(self):
        """Setup text-to-speech engine"""
        try:
            # Configure TTS engine
            voices = self.tts_engine.getProperty('voices')
            if voices:
                self.tts_engine.setProperty('voice', voices[0].id)
            
            # Set properties based on config
            self.tts_engine.setProperty('rate', 150)  # Speed
            self.tts_engine.setProperty('volume', 0.9)  # Volume
            
        except Exception as e:
            logger.error(f"Error setting up TTS: {e}")
    
    def _setup_noise_reduction(self):
        """Setup noise reduction filters"""
        try:
            # Design noise reduction filter
            # Butterworth bandpass filter for speech frequencies (80Hz - 8000Hz)
            nyquist = self.config.sample_rate / 2
            low_freq = 80 / nyquist
            high_freq = 8000 / nyquist
            
            self.noise_filter_b, self.noise_filter_a = signal.butter(
                4, [low_freq, high_freq], btype='band'
            )
            
        except Exception as e:
            logger.error(f"Error setting up noise reduction: {e}")
    
    def _load_voice_profiles(self):
        """Load voice profiles for voice cloning"""
        try:
            # Load pre-trained voice profiles
            profiles_file = "voice_profiles.json"
            if os.path.exists(profiles_file):
                with open(profiles_file, 'r') as f:
                    self.voice_profiles = json.load(f)
            
            # Create default profiles
            if not self.voice_profiles:
                self.voice_profiles = {
                    'default': {
                        'name': 'Default Voice',
                        'type': VoiceType.NEUTRAL.value,
                        'pitch': 1.0,
                        'rate': 150,
                        'volume': 0.9,
                        'characteristics': {
                            'pitch_range': (0.8, 1.2),
                            'speaking_rate': (120, 180),
                            'clarity': 0.8
                        }
                    },
                    'male': {
                        'name': 'Male Voice',
                        'type': VoiceType.MALE.value,
                        'pitch': 0.8,
                        'rate': 140,
                        'volume': 0.9,
                        'characteristics': {
                            'pitch_range': (0.6, 1.0),
                            'speaking_rate': (110, 170),
                            'clarity': 0.85
                        }
                    },
                    'female': {
                        'name': 'Female Voice',
                        'type': VoiceType.FEMALE.value,
                        'pitch': 1.2,
                        'rate': 160,
                        'volume': 0.9,
                        'characteristics': {
                            'pitch_range': (1.0, 1.4),
                            'speaking_rate': (130, 190),
                            'clarity': 0.9
                        }
                    }
                }
                
                # Save default profiles
                with open(profiles_file, 'w') as f:
                    json.dump(self.voice_profiles, f, indent=2)
                    
        except Exception as e:
            logger.error(f"Error loading voice profiles: {e}")
    
    def start_recording(self, device_index: int = None):
        """Start recording audio from microphone"""
        try:
            if self.is_recording:
                logger.warning("Already recording")
                return
            
            self.is_recording = True
            
            # Open audio stream
            self.input_stream = self.audio.open(
                format=self.config.format,
                channels=self.config.channels,
                rate=self.config.sample_rate,
                input=True,
                input_device_index=device_index,
                frames_per_buffer=self.config.chunk_size,
                stream_callback=self._audio_callback
            )
            
            self.input_stream.start_stream()
            
            # Start recording thread
            self.recording_thread = threading.Thread(target=self._recording_loop)
            self.recording_thread.start()
            
            logger.info("Audio recording started")
            
        except Exception as e:
            logger.error(f"Error starting recording: {e}")
            self.is_recording = False
    
    def stop_recording(self):
        """Stop recording audio"""
        try:
            self.is_recording = False
            
            if hasattr(self, 'input_stream'):
                self.input_stream.stop_stream()
                self.input_stream.close()
            
            if self.recording_thread:
                self.recording_thread.join()
            
            logger.info("Audio recording stopped")
            
        except Exception as e:
            logger.error(f"Error stopping recording: {e}")
    
    def _audio_callback(self, in_data, frame_count, time_info, status):
        """Callback for audio input stream"""
        try:
            if self.is_recording:
                # Convert audio data to numpy array
                audio_data = np.frombuffer(in_data, dtype=np.float32)
                
                # Create audio frame
                frame = AudioFrame(
                    data=audio_data,
                    timestamp=time.time(),
                    sample_rate=self.config.sample_rate,
                    channels=self.config.channels,
                    duration=len(audio_data) / self.config.sample_rate
                )
                
                # Add to input buffer
                self.input_buffer.put(frame)
                
                # Add to processing buffer if processing is enabled
                if self.is_processing:
                    self.processing_buffer.put(frame)
            
            return (in_data, pyaudio.paContinue)
            
        except Exception as e:
            logger.error(f"Error in audio callback: {e}")
            return (in_data, pyaudio.paComplete)
    
    def _recording_loop(self):
        """Main recording loop"""
        try:
            while self.is_recording:
                try:
                    # Get audio frame from buffer
                    frame = self.input_buffer.get(timeout=1.0)
                    
                    # Process audio frame
                    processed_frame = self._process_audio_frame(frame)
                    
                    # Add to output buffer
                    self.output_buffer.put(processed_frame)
                    
                except queue.Empty:
                    continue
                except Exception as e:
                    logger.error(f"Error in recording loop: {e}")
                    
        except Exception as e:
            logger.error(f"Error in recording loop: {e}")
    
    def _process_audio_frame(self, frame: AudioFrame) -> AudioFrame:
        """Process audio frame with noise reduction and enhancement"""
        try:
            processed_data = frame.data.copy()
            
            # Apply noise reduction
            if self.config.noise_reduction:
                processed_data = self._apply_noise_reduction(processed_data)
            
            # Apply echo cancellation
            if self.config.echo_cancellation:
                processed_data = self._apply_echo_cancellation(processed_data)
            
            # Apply auto gain control
            if self.config.auto_gain_control:
                processed_data = self._apply_auto_gain_control(processed_data)
            
            return AudioFrame(
                data=processed_data,
                timestamp=frame.timestamp,
                sample_rate=frame.sample_rate,
                channels=frame.channels,
                duration=frame.duration
            )
            
        except Exception as e:
            logger.error(f"Error processing audio frame: {e}")
            return frame
    
    def _apply_noise_reduction(self, audio_data: np.ndarray) -> np.ndarray:
        """Apply noise reduction filter"""
        try:
            # Apply bandpass filter
            filtered_data = signal.filtfilt(self.noise_filter_b, self.noise_filter_a, audio_data)
            
            # Apply spectral subtraction (simplified)
            # In practice, you'd use more sophisticated noise reduction algorithms
            
            return filtered_data
            
        except Exception as e:
            logger.error(f"Error applying noise reduction: {e}")
            return audio_data
    
    def _apply_echo_cancellation(self, audio_data: np.ndarray) -> np.ndarray:
        """Apply echo cancellation"""
        try:
            # Simplified echo cancellation
            # In practice, you'd use adaptive filters and delay estimation
            
            # For now, just return the original data
            return audio_data
            
        except Exception as e:
            logger.error(f"Error applying echo cancellation: {e}")
            return audio_data
    
    def _apply_auto_gain_control(self, audio_data: np.ndarray) -> np.ndarray:
        """Apply automatic gain control"""
        try:
            # Calculate RMS level
            rms = np.sqrt(np.mean(audio_data**2))
            
            # Target RMS level
            target_rms = 0.1
            
            # Calculate gain
            if rms > 0:
                gain = target_rms / rms
                # Limit gain to prevent clipping
                gain = min(gain, 10.0)
                
                # Apply gain
                audio_data = audio_data * gain
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Error applying auto gain control: {e}")
            return audio_data
    
    def synthesize_speech(self, text: str, voice_profile: str = None) -> np.ndarray:
        """Synthesize speech from text"""
        try:
            # Set voice profile
            if voice_profile and voice_profile in self.voice_profiles:
                profile = self.voice_profiles[voice_profile]
                self.tts_engine.setProperty('rate', profile['rate'])
                self.tts_engine.setProperty('volume', profile['volume'])
                self.current_voice_profile = voice_profile
            else:
                # Use default profile
                self.tts_engine.setProperty('rate', 150)
                self.tts_engine.setProperty('volume', 0.9)
                self.current_voice_profile = 'default'
            
            # Create temporary file for audio output
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_filename = temp_file.name
            
            # Synthesize speech
            self.tts_engine.save_to_file(text, temp_filename)
            self.tts_engine.runAndWait()
            
            # Load synthesized audio
            audio_data, sample_rate = librosa.load(temp_filename, sr=self.config.sample_rate)
            
            # Clean up temporary file
            os.unlink(temp_filename)
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Error synthesizing speech: {e}")
            return np.array([])
    
    def play_audio(self, audio_data: np.ndarray):
        """Play audio data"""
        try:
            if self.is_playing:
                logger.warning("Already playing audio")
                return
            
            self.is_playing = True
            
            # Open output stream
            self.output_stream = self.audio.open(
                format=self.config.format,
                channels=self.config.channels,
                rate=self.config.sample_rate,
                output=True,
                frames_per_buffer=self.config.chunk_size
            )
            
            # Start playback thread
            self.playback_thread = threading.Thread(
                target=self._playback_loop, 
                args=(audio_data,)
            )
            self.playback_thread.start()
            
        except Exception as e:
            logger.error(f"Error playing audio: {e}")
            self.is_playing = False
    
    def _playback_loop(self, audio_data: np.ndarray):
        """Main playback loop"""
        try:
            # Split audio into chunks
            chunk_size = self.config.chunk_size
            chunks = [audio_data[i:i + chunk_size] for i in range(0, len(audio_data), chunk_size)]
            
            for chunk in chunks:
                if not self.is_playing:
                    break
                
                # Pad last chunk if necessary
                if len(chunk) < chunk_size:
                    chunk = np.pad(chunk, (0, chunk_size - len(chunk)))
                
                # Convert to bytes and play
                audio_bytes = chunk.astype(np.float32).tobytes()
                self.output_stream.write(audio_bytes)
            
            # Clean up
            self.output_stream.stop_stream()
            self.output_stream.close()
            self.is_playing = False
            
        except Exception as e:
            logger.error(f"Error in playback loop: {e}")
            self.is_playing = False
    
    def stop_playback(self):
        """Stop audio playback"""
        try:
            self.is_playing = False
            
            if hasattr(self, 'output_stream'):
                self.output_stream.stop_stream()
                self.output_stream.close()
            
            if self.playback_thread:
                self.playback_thread.join()
                
        except Exception as e:
            logger.error(f"Error stopping playback: {e}")
    
    def recognize_speech(self, audio_data: np.ndarray = None, duration: float = 5.0) -> SpeechResult:
        """Recognize speech from audio"""
        try:
            if audio_data is None:
                # Record audio for specified duration
                audio_data = self._record_audio_duration(duration)
            
            # Convert numpy array to audio file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_filename = temp_file.name
            
            # Save audio data
            sf.write(temp_filename, audio_data, self.config.sample_rate)
            
            # Recognize speech
            with sr.AudioFile(temp_filename) as source:
                audio = self.recognizer.record(source)
                
                try:
                    text = self.recognizer.recognize_google(audio)
                    confidence = 0.9  # Google doesn't provide confidence
                    
                except sr.UnknownValueError:
                    text = ""
                    confidence = 0.0
                except sr.RequestError as e:
                    logger.error(f"Speech recognition error: {e}")
                    text = ""
                    confidence = 0.0
            
            # Clean up
            os.unlink(temp_filename)
            
            return SpeechResult(
                text=text,
                confidence=confidence,
                timestamp=time.time(),
                language='en-US',
                is_final=True
            )
            
        except Exception as e:
            logger.error(f"Error recognizing speech: {e}")
            return SpeechResult(
                text="",
                confidence=0.0,
                timestamp=time.time(),
                language='en-US',
                is_final=True
            )
    
    def _record_audio_duration(self, duration: float) -> np.ndarray:
        """Record audio for specified duration"""
        try:
            # Start recording
            self.start_recording()
            
            # Collect audio data
            audio_chunks = []
            start_time = time.time()
            
            while time.time() - start_time < duration:
                try:
                    frame = self.input_buffer.get(timeout=0.1)
                    audio_chunks.append(frame.data)
                except queue.Empty:
                    continue
            
            # Stop recording
            self.stop_recording()
            
            # Combine chunks
            if audio_chunks:
                return np.concatenate(audio_chunks)
            else:
                return np.array([])
                
        except Exception as e:
            logger.error(f"Error recording audio: {e}")
            return np.array([])
    
    def create_voice_profile(self, name: str, audio_samples: List[np.ndarray]) -> bool:
        """Create a new voice profile from audio samples"""
        try:
            # Analyze audio samples to extract voice characteristics
            characteristics = self._analyze_voice_characteristics(audio_samples)
            
            # Create voice profile
            profile = {
                'name': name,
                'type': VoiceType.NEUTRAL.value,
                'pitch': characteristics['pitch'],
                'rate': characteristics['speaking_rate'],
                'volume': 0.9,
                'characteristics': characteristics,
                'created_at': time.time()
            }
            
            # Add to profiles
            self.voice_profiles[name] = profile
            
            # Save to file
            with open("voice_profiles.json", 'w') as f:
                json.dump(self.voice_profiles, f, indent=2)
            
            logger.info(f"Created voice profile: {name}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating voice profile: {e}")
            return False
    
    def _analyze_voice_characteristics(self, audio_samples: List[np.ndarray]) -> Dict[str, Any]:
        """Analyze voice characteristics from audio samples"""
        try:
            # Combine all samples
            combined_audio = np.concatenate(audio_samples)
            
            # Extract pitch
            pitches, magnitudes = librosa.piptrack(y=combined_audio, sr=self.config.sample_rate)
            pitch_values = pitches[magnitudes > np.percentile(magnitudes, 90)]
            avg_pitch = np.mean(pitch_values) if len(pitch_values) > 0 else 220.0
            
            # Extract speaking rate (simplified)
            # In practice, you'd use more sophisticated analysis
            speaking_rate = 150  # Default rate
            
            # Extract clarity (signal-to-noise ratio)
            signal_power = np.mean(combined_audio**2)
            noise_power = np.var(combined_audio - np.mean(combined_audio))
            clarity = signal_power / (signal_power + noise_power) if (signal_power + noise_power) > 0 else 0.8
            
            return {
                'pitch': avg_pitch,
                'speaking_rate': speaking_rate,
                'clarity': clarity,
                'pitch_range': (avg_pitch * 0.8, avg_pitch * 1.2),
                'energy': np.mean(np.abs(combined_audio))
            }
            
        except Exception as e:
            logger.error(f"Error analyzing voice characteristics: {e}")
            return {
                'pitch': 220.0,
                'speaking_rate': 150,
                'clarity': 0.8,
                'pitch_range': (176.0, 264.0),
                'energy': 0.1
            }
    
    def get_available_voices(self) -> List[str]:
        """Get list of available voice profiles"""
        return list(self.voice_profiles.keys())
    
    def get_audio_devices(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get available audio input and output devices"""
        try:
            devices = {
                'input': [],
                'output': []
            }
            
            for i in range(self.audio.get_device_count()):
                device_info = self.audio.get_device_info_by_index(i)
                
                device_data = {
                    'index': i,
                    'name': device_info['name'],
                    'channels': device_info['maxInputChannels'],
                    'sample_rate': int(device_info['defaultSampleRate'])
                }
                
                if device_info['maxInputChannels'] > 0:
                    devices['input'].append(device_data)
                
                if device_info['maxOutputChannels'] > 0:
                    devices['output'].append(device_data)
            
            return devices
            
        except Exception as e:
            logger.error(f"Error getting audio devices: {e}")
            return {'input': [], 'output': []}
    
    def cleanup(self):
        """Clean up resources"""
        try:
            self.stop_recording()
            self.stop_playback()
            
            if hasattr(self, 'audio'):
                self.audio.terminate()
                
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")


class RealTimeSpeechProcessor:
    """Real-time speech processing with continuous recognition"""
    
    def __init__(self, audio_processor: AudioProcessor):
        self.audio_processor = audio_processor
        self.is_processing = False
        self.processing_thread = None
        self.speech_callback = None
        
    def start_continuous_recognition(self, callback=None):
        """Start continuous speech recognition"""
        try:
            if self.is_processing:
                logger.warning("Already processing speech")
                return
            
            self.speech_callback = callback
            self.is_processing = True
            
            # Start processing thread
            self.processing_thread = threading.Thread(target=self._processing_loop)
            self.processing_thread.start()
            
            logger.info("Continuous speech recognition started")
            
        except Exception as e:
            logger.error(f"Error starting continuous recognition: {e}")
    
    def stop_continuous_recognition(self):
        """Stop continuous speech recognition"""
        try:
            self.is_processing = False
            
            if self.processing_thread:
                self.processing_thread.join()
            
            logger.info("Continuous speech recognition stopped")
            
        except Exception as e:
            logger.error(f"Error stopping continuous recognition: {e}")
    
    def _processing_loop(self):
        """Main processing loop for continuous speech recognition"""
        try:
            # Start recording
            self.audio_processor.start_recording()
            
            while self.is_processing:
                try:
                    # Get audio frame
                    frame = self.audio_processor.processing_buffer.get(timeout=1.0)
                    
                    # Process speech
                    result = self.audio_processor.recognize_speech(frame.data)
                    
                    # Call callback if provided
                    if self.speech_callback and result.text:
                        self.speech_callback(result)
                    
                except queue.Empty:
                    continue
                except Exception as e:
                    logger.error(f"Error in processing loop: {e}")
            
            # Stop recording
            self.audio_processor.stop_recording()
            
        except Exception as e:
            logger.error(f"Error in processing loop: {e}")


# Example usage
if __name__ == "__main__":
    # Initialize audio processor
    config = AudioConfig(
        sample_rate=44100,
        channels=1,
        quality=AudioQuality.HIGH,
        noise_reduction=True
    )
    
    processor = AudioProcessor(config)
    
    try:
        # Test speech synthesis
        text = "Hello, this is a test of the CareConnect audio processing system."
        audio_data = processor.synthesize_speech(text, 'female')
        
        # Play synthesized speech
        processor.play_audio(audio_data)
        
        # Wait for playback to complete
        time.sleep(len(audio_data) / config.sample_rate + 1)
        
        # Test speech recognition
        print("Please speak for 5 seconds...")
        result = processor.recognize_speech(duration=5.0)
        print(f"Recognized: {result.text}")
        
    finally:
        processor.cleanup()
