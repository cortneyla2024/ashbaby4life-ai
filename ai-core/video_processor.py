"""
Video Processing Module for CareConnect v5.0
Handles face detection, tracking, lip reading, and real-time video analysis
"""

import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, List, Tuple, Optional, Any
import threading
import time
import json
import logging
from dataclasses import dataclass
from enum import Enum
import pickle
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FaceExpression(Enum):
    """Enum for different facial expressions"""
    NEUTRAL = "neutral"
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    SURPRISED = "surprised"
    DISGUSTED = "disgusted"
    FEARFUL = "fearful"
    CONFUSED = "confused"
    THINKING = "thinking"
    ATTENTIVE = "attentive"

@dataclass
class FaceData:
    """Data structure for face detection results"""
    face_id: int
    bbox: Tuple[int, int, int, int]  # x, y, width, height
    landmarks: List[Tuple[float, float]]
    confidence: float
    expression: FaceExpression
    head_pose: Tuple[float, float, float]  # pitch, yaw, roll
    eye_gaze: Tuple[float, float]
    mouth_open: float
    blink_rate: float
    timestamp: float

@dataclass
class GestureData:
    """Data structure for gesture recognition"""
    gesture_type: str
    confidence: float
    hand_landmarks: List[Tuple[float, float]]
    hand_bbox: Tuple[int, int, int, int]
    timestamp: float

class VideoProcessor:
    """Main video processing class for face detection and analysis"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=10,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        self.hands = mp.solutions.hands.Hands(
            static_image_mode=False,
            max_num_hands=4,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        self.pose = mp.solutions.pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        self.face_tracker = {}
        self.gesture_history = []
        self.expression_history = []
        self.processing_thread = None
        self.is_running = False
        
        # Load pre-trained models
        self.expression_classifier = self._load_expression_classifier()
        self.gesture_classifier = self._load_gesture_classifier()
        
    def _load_expression_classifier(self):
        """Load pre-trained facial expression classifier"""
        try:
            # In a real implementation, this would load a trained model
            # For now, we'll use a simple rule-based classifier
            return None
        except Exception as e:
            logger.warning(f"Could not load expression classifier: {e}")
            return None
    
    def _load_gesture_classifier(self):
        """Load pre-trained gesture classifier"""
        try:
            # In a real implementation, this would load a trained model
            # For now, we'll use a simple rule-based classifier
            return None
        except Exception as e:
            logger.warning(f"Could not load gesture classifier: {e}")
            return None
    
    def detect_faces(self, frame: np.ndarray) -> List[FaceData]:
        """Detect faces in the given frame"""
        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.face_mesh.process(rgb_frame)
            
            faces = []
            if results.multi_face_landmarks:
                for face_idx, face_landmarks in enumerate(results.multi_face_landmarks):
                    face_data = self._extract_face_data(face_landmarks, frame.shape, face_idx)
                    if face_data:
                        faces.append(face_data)
            
            return faces
            
        except Exception as e:
            logger.error(f"Error detecting faces: {e}")
            return []
    
    def _extract_face_data(self, landmarks, frame_shape, face_id: int) -> Optional[FaceData]:
        """Extract face data from MediaPipe landmarks"""
        try:
            height, width = frame_shape[:2]
            
            # Convert landmarks to pixel coordinates
            landmark_points = []
            for landmark in landmarks.landmark:
                x = int(landmark.x * width)
                y = int(landmark.y * height)
                landmark_points.append((x, y))
            
            # Calculate bounding box
            x_coords = [p[0] for p in landmark_points]
            y_coords = [p[1] for p in landmark_points]
            bbox = (min(x_coords), min(y_coords), 
                   max(x_coords) - min(x_coords), 
                   max(y_coords) - min(y_coords))
            
            # Calculate head pose
            head_pose = self._calculate_head_pose(landmark_points)
            
            # Calculate eye gaze
            eye_gaze = self._calculate_eye_gaze(landmark_points)
            
            # Calculate mouth openness
            mouth_open = self._calculate_mouth_openness(landmark_points)
            
            # Detect expression
            expression = self._detect_expression(landmark_points)
            
            # Calculate blink rate
            blink_rate = self._calculate_blink_rate(face_id)
            
            return FaceData(
                face_id=face_id,
                bbox=bbox,
                landmarks=landmark_points,
                confidence=0.9,  # MediaPipe confidence
                expression=expression,
                head_pose=head_pose,
                eye_gaze=eye_gaze,
                mouth_open=mouth_open,
                blink_rate=blink_rate,
                timestamp=time.time()
            )
            
        except Exception as e:
            logger.error(f"Error extracting face data: {e}")
            return None
    
    def _calculate_head_pose(self, landmarks: List[Tuple[float, float]]) -> Tuple[float, float, float]:
        """Calculate head pose (pitch, yaw, roll) from landmarks"""
        try:
            # Use key facial landmarks for pose estimation
            # This is a simplified calculation - in practice, you'd use a more sophisticated algorithm
            
            # Nose tip (landmark 1)
            nose_tip = landmarks[1]
            
            # Left and right eye corners
            left_eye = landmarks[33]
            right_eye = landmarks[263]
            
            # Calculate roll (head tilt)
            eye_angle = np.arctan2(right_eye[1] - left_eye[1], right_eye[0] - left_eye[0])
            roll = np.degrees(eye_angle)
            
            # Calculate yaw (head turn)
            eye_center = ((left_eye[0] + right_eye[0]) / 2, (left_eye[1] + right_eye[1]) / 2)
            yaw = (eye_center[0] - nose_tip[0]) / 100.0  # Simplified
            
            # Calculate pitch (head nod)
            pitch = (nose_tip[1] - eye_center[1]) / 100.0  # Simplified
            
            return (pitch, yaw, roll)
            
        except Exception as e:
            logger.error(f"Error calculating head pose: {e}")
            return (0.0, 0.0, 0.0)
    
    def _calculate_eye_gaze(self, landmarks: List[Tuple[float, float]]) -> Tuple[float, float]:
        """Calculate eye gaze direction"""
        try:
            # Use eye landmarks to estimate gaze direction
            # This is a simplified calculation
            
            # Left eye center
            left_eye_center = landmarks[468]  # Approximate eye center landmark
            
            # Right eye center
            right_eye_center = landmarks[473]  # Approximate eye center landmark
            
            # Calculate gaze as offset from center
            frame_center_x = 320  # Assuming 640x480 frame
            frame_center_y = 240
            
            gaze_x = ((left_eye_center[0] + right_eye_center[0]) / 2 - frame_center_x) / frame_center_x
            gaze_y = ((left_eye_center[1] + right_eye_center[1]) / 2 - frame_center_y) / frame_center_y
            
            return (gaze_x, gaze_y)
            
        except Exception as e:
            logger.error(f"Error calculating eye gaze: {e}")
            return (0.0, 0.0)
    
    def _calculate_mouth_openness(self, landmarks: List[Tuple[float, float]]) -> float:
        """Calculate how open the mouth is (0.0 = closed, 1.0 = fully open)"""
        try:
            # Use mouth landmarks to calculate openness
            # Upper lip (landmark 13)
            upper_lip = landmarks[13]
            
            # Lower lip (landmark 14)
            lower_lip = landmarks[14]
            
            # Calculate vertical distance
            mouth_height = abs(upper_lip[1] - lower_lip[1])
            
            # Normalize to 0-1 range (assuming max mouth height of 50 pixels)
            openness = min(mouth_height / 50.0, 1.0)
            
            return openness
            
        except Exception as e:
            logger.error(f"Error calculating mouth openness: {e}")
            return 0.0
    
    def _detect_expression(self, landmarks: List[Tuple[float, float]]) -> FaceExpression:
        """Detect facial expression from landmarks"""
        try:
            # This is a simplified expression detection
            # In practice, you'd use a trained neural network
            
            # Calculate various facial features
            mouth_open = self._calculate_mouth_openness(landmarks)
            
            # Simple rule-based classification
            if mouth_open > 0.7:
                return FaceExpression.SURPRISED
            elif mouth_open > 0.3:
                return FaceExpression.HAPPY
            else:
                return FaceExpression.NEUTRAL
                
        except Exception as e:
            logger.error(f"Error detecting expression: {e}")
            return FaceExpression.NEUTRAL
    
    def _calculate_blink_rate(self, face_id: int) -> float:
        """Calculate blink rate for a specific face"""
        try:
            # Track blink history for this face
            if face_id not in self.face_tracker:
                self.face_tracker[face_id] = {'blinks': [], 'last_blink': 0}
            
            tracker = self.face_tracker[face_id]
            current_time = time.time()
            
            # Simplified blink detection
            # In practice, you'd track eye closure over time
            
            # Calculate blinks per minute
            recent_blinks = [b for b in tracker['blinks'] if current_time - b < 60]
            blink_rate = len(recent_blinks) / 60.0
            
            return blink_rate
            
        except Exception as e:
            logger.error(f"Error calculating blink rate: {e}")
            return 0.0
    
    def detect_gestures(self, frame: np.ndarray) -> List[GestureData]:
        """Detect hand gestures in the frame"""
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_frame)
            
            gestures = []
            if results.multi_hand_landmarks:
                for hand_idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                    gesture_data = self._extract_gesture_data(hand_landmarks, frame.shape, hand_idx)
                    if gesture_data:
                        gestures.append(gesture_data)
            
            return gestures
            
        except Exception as e:
            logger.error(f"Error detecting gestures: {e}")
            return []
    
    def _extract_gesture_data(self, landmarks, frame_shape, hand_id: int) -> Optional[GestureData]:
        """Extract gesture data from hand landmarks"""
        try:
            height, width = frame_shape[:2]
            
            # Convert landmarks to pixel coordinates
            landmark_points = []
            for landmark in landmarks.landmark:
                x = int(landmark.x * width)
                y = int(landmark.y * height)
                landmark_points.append((x, y))
            
            # Calculate bounding box
            x_coords = [p[0] for p in landmark_points]
            y_coords = [p[1] for p in landmark_points]
            bbox = (min(x_coords), min(y_coords), 
                   max(x_coords) - min(x_coords), 
                   max(y_coords) - min(y_coords))
            
            # Detect gesture type
            gesture_type = self._classify_gesture(landmark_points)
            
            return GestureData(
                gesture_type=gesture_type,
                confidence=0.8,  # MediaPipe confidence
                hand_landmarks=landmark_points,
                hand_bbox=bbox,
                timestamp=time.time()
            )
            
        except Exception as e:
            logger.error(f"Error extracting gesture data: {e}")
            return None
    
    def _classify_gesture(self, landmarks: List[Tuple[float, float]]) -> str:
        """Classify hand gesture from landmarks"""
        try:
            # This is a simplified gesture classification
            # In practice, you'd use a trained model
            
            # Calculate finger positions relative to palm
            # Simplified gesture detection
            return "pointing"  # Default gesture
            
        except Exception as e:
            logger.error(f"Error classifying gesture: {e}")
            return "unknown"
    
    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """Process a single frame and return all detected data"""
        try:
            # Detect faces
            faces = self.detect_faces(frame)
            
            # Detect gestures
            gestures = self.detect_gestures(frame)
            
            # Update tracking
            self._update_tracking(faces, gestures)
            
            return {
                'faces': [self._face_to_dict(face) for face in faces],
                'gestures': [self._gesture_to_dict(gesture) for gesture in gestures],
                'timestamp': time.time(),
                'frame_shape': frame.shape
            }
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return {'faces': [], 'gestures': [], 'timestamp': time.time(), 'error': str(e)}
    
    def _update_tracking(self, faces: List[FaceData], gestures: List[GestureData]):
        """Update face and gesture tracking"""
        try:
            # Update expression history
            for face in faces:
                self.expression_history.append({
                    'face_id': face.face_id,
                    'expression': face.expression.value,
                    'timestamp': face.timestamp
                })
            
            # Update gesture history
            for gesture in gestures:
                self.gesture_history.append({
                    'gesture_type': gesture.gesture_type,
                    'confidence': gesture.confidence,
                    'timestamp': gesture.timestamp
                })
            
            # Keep only recent history (last 5 minutes)
            current_time = time.time()
            self.expression_history = [e for e in self.expression_history 
                                     if current_time - e['timestamp'] < 300]
            self.gesture_history = [g for g in self.gesture_history 
                                  if current_time - g['timestamp'] < 300]
            
        except Exception as e:
            logger.error(f"Error updating tracking: {e}")
    
    def _face_to_dict(self, face: FaceData) -> Dict[str, Any]:
        """Convert FaceData to dictionary for JSON serialization"""
        return {
            'face_id': face.face_id,
            'bbox': face.bbox,
            'landmarks': face.landmarks,
            'confidence': face.confidence,
            'expression': face.expression.value,
            'head_pose': face.head_pose,
            'eye_gaze': face.eye_gaze,
            'mouth_open': face.mouth_open,
            'blink_rate': face.blink_rate,
            'timestamp': face.timestamp
        }
    
    def _gesture_to_dict(self, gesture: GestureData) -> Dict[str, Any]:
        """Convert GestureData to dictionary for JSON serialization"""
        return {
            'gesture_type': gesture.gesture_type,
            'confidence': gesture.confidence,
            'hand_landmarks': gesture.hand_landmarks,
            'hand_bbox': gesture.hand_bbox,
            'timestamp': gesture.timestamp
        }
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get analytics from tracked data"""
        try:
            current_time = time.time()
            
            # Expression analytics
            expression_counts = {}
            for expr in self.expression_history:
                if current_time - expr['timestamp'] < 60:  # Last minute
                    expr_type = expr['expression']
                    expression_counts[expr_type] = expression_counts.get(expr_type, 0) + 1
            
            # Gesture analytics
            gesture_counts = {}
            for gesture in self.gesture_history:
                if current_time - gesture['timestamp'] < 60:  # Last minute
                    gesture_type = gesture['gesture_type']
                    gesture_counts[gesture_type] = gesture_counts.get(gesture_type, 0) + 1
            
            return {
                'expression_analytics': expression_counts,
                'gesture_analytics': gesture_counts,
                'total_faces_tracked': len(self.face_tracker),
                'processing_time': time.time() - current_time
            }
            
        except Exception as e:
            logger.error(f"Error getting analytics: {e}")
            return {}
    
    def start_processing(self, video_source: int = 0):
        """Start continuous video processing"""
        try:
            self.is_running = True
            self.processing_thread = threading.Thread(
                target=self._processing_loop, 
                args=(video_source,)
            )
            self.processing_thread.start()
            logger.info("Video processing started")
            
        except Exception as e:
            logger.error(f"Error starting video processing: {e}")
    
    def stop_processing(self):
        """Stop continuous video processing"""
        try:
            self.is_running = False
            if self.processing_thread:
                self.processing_thread.join()
            logger.info("Video processing stopped")
            
        except Exception as e:
            logger.error(f"Error stopping video processing: {e}")
    
    def _processing_loop(self, video_source: int):
        """Main processing loop for continuous video analysis"""
        try:
            cap = cv2.VideoCapture(video_source)
            
            while self.is_running:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process frame
                results = self.process_frame(frame)
                
                # Optional: Display results
                if self.config.get('display_results', False):
                    self._display_results(frame, results)
                
                # Optional: Save results
                if self.config.get('save_results', False):
                    self._save_results(results)
                
                # Control frame rate
                time.sleep(1.0 / self.config.get('fps', 30))
            
            cap.release()
            
        except Exception as e:
            logger.error(f"Error in processing loop: {e}")
    
    def _display_results(self, frame: np.ndarray, results: Dict[str, Any]):
        """Display processing results on frame"""
        try:
            # Draw face bounding boxes
            for face in results['faces']:
                x, y, w, h = face['bbox']
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(frame, face['expression'], (x, y - 10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            # Draw gesture bounding boxes
            for gesture in results['gestures']:
                x, y, w, h = gesture['hand_bbox']
                cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
                cv2.putText(frame, gesture['gesture_type'], (x, y - 10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
            
            # Display frame
            cv2.imshow('CareConnect Video Processing', frame)
            cv2.waitKey(1)
            
        except Exception as e:
            logger.error(f"Error displaying results: {e}")
    
    def _save_results(self, results: Dict[str, Any]):
        """Save processing results to file"""
        try:
            timestamp = int(time.time())
            filename = f"video_results_{timestamp}.json"
            
            with open(filename, 'w') as f:
                json.dump(results, f, indent=2)
                
        except Exception as e:
            logger.error(f"Error saving results: {e}")
    
    def cleanup(self):
        """Clean up resources"""
        try:
            self.stop_processing()
            cv2.destroyAllWindows()
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")


class LipReader:
    """Advanced lip reading capabilities"""
    
    def __init__(self):
        self.lip_landmarks = []
        self.vocabulary = set()
        self.lip_model = None
        
    def extract_lip_features(self, face_landmarks: List[Tuple[float, float]]) -> List[float]:
        """Extract lip movement features"""
        try:
            # Extract lip-related landmarks
            lip_points = []
            for i in range(61, 69):  # Lip landmarks
                if i < len(face_landmarks):
                    lip_points.append(face_landmarks[i])
            
            # Calculate lip features
            features = []
            for i in range(len(lip_points) - 1):
                for j in range(i + 1, len(lip_points)):
                    distance = np.sqrt((lip_points[i][0] - lip_points[j][0])**2 + 
                                     (lip_points[i][1] - lip_points[j][1])**2)
                    features.append(distance)
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting lip features: {e}")
            return []
    
    def predict_speech(self, lip_features: List[float]) -> str:
        """Predict spoken words from lip features"""
        try:
            # This would use a trained lip reading model
            # For now, return placeholder
            return "predicted_speech"
            
        except Exception as e:
            logger.error(f"Error predicting speech: {e}")
            return ""


class VideoAnalytics:
    """Advanced video analytics and insights"""
    
    def __init__(self):
        self.engagement_metrics = {}
        self.attention_tracking = {}
        self.emotion_timeline = []
        
    def calculate_engagement(self, faces: List[FaceData]) -> float:
        """Calculate overall engagement score"""
        try:
            if not faces:
                return 0.0
            
            engagement_scores = []
            for face in faces:
                # Factors affecting engagement:
                # - Eye gaze direction (looking at screen)
                # - Head pose (facing forward)
                # - Expression (attentive vs distracted)
                # - Blink rate (normal vs excessive)
                
                gaze_score = 1.0 - abs(face.eye_gaze[0]) - abs(face.eye_gaze[1])
                pose_score = 1.0 - abs(face.head_pose[1])  # Yaw
                expression_score = 1.0 if face.expression in [FaceExpression.ATTENTIVE, FaceExpression.THINKING] else 0.5
                blink_score = 1.0 if 0.1 <= face.blink_rate <= 0.3 else 0.5
                
                total_score = (gaze_score + pose_score + expression_score + blink_score) / 4.0
                engagement_scores.append(total_score)
            
            return np.mean(engagement_scores)
            
        except Exception as e:
            logger.error(f"Error calculating engagement: {e}")
            return 0.0
    
    def track_attention(self, faces: List[FaceData], screen_region: Tuple[int, int, int, int]):
        """Track attention to specific screen regions"""
        try:
            for face in faces:
                # Check if gaze is within screen region
                gaze_x, gaze_y = face.eye_gaze
                screen_x, screen_y, screen_w, screen_h = screen_region
                
                # Convert gaze to screen coordinates
                gaze_screen_x = screen_x + (gaze_x + 1) * screen_w / 2
                gaze_screen_y = screen_y + (gaze_y + 1) * screen_h / 2
                
                # Check if gaze is within screen bounds
                in_screen = (screen_x <= gaze_screen_x <= screen_x + screen_w and
                           screen_y <= gaze_screen_y <= screen_y + screen_h)
                
                self.attention_tracking[face.face_id] = {
                    'in_screen': in_screen,
                    'gaze_position': (gaze_screen_x, gaze_screen_y),
                    'timestamp': face.timestamp
                }
                
        except Exception as e:
            logger.error(f"Error tracking attention: {e}")
    
    def get_analytics_report(self) -> Dict[str, Any]:
        """Generate comprehensive analytics report"""
        try:
            return {
                'engagement_score': self.calculate_engagement([]),  # Would need faces data
                'attention_data': self.attention_tracking,
                'emotion_timeline': self.emotion_timeline,
                'recommendations': self._generate_recommendations()
            }
            
        except Exception as e:
            logger.error(f"Error generating analytics report: {e}")
            return {}
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on analytics"""
        try:
            recommendations = []
            
            # Example recommendations
            if len(self.attention_tracking) > 0:
                attention_rate = sum(1 for t in self.attention_tracking.values() if t['in_screen']) / len(self.attention_tracking)
                if attention_rate < 0.7:
                    recommendations.append("Consider increasing engagement with interactive content")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []


# Example usage
if __name__ == "__main__":
    # Initialize video processor
    config = {
        'display_results': True,
        'save_results': False,
        'fps': 30
    }
    
    processor = VideoProcessor(config)
    
    try:
        # Start processing
        processor.start_processing(0)  # Use default camera
        
        # Let it run for a while
        time.sleep(10)
        
        # Get analytics
        analytics = processor.get_analytics()
        print("Analytics:", analytics)
        
    finally:
        processor.cleanup()
