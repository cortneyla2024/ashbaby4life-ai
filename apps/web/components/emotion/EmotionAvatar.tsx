'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EmotionalState, EmotionIntensity } from '@/lib/emotion/types';

interface EmotionAvatarProps {
  emotion: EmotionalState;
  intensity: EmotionIntensity;
  size?: 'small' | 'medium' | 'large';
  isAnimating?: boolean;
  className?: string;
}

// SVG path definitions for different facial expressions
const expressionPaths = {
  // Mouth expressions
  mouth: {
    neutral: "M 60 120 Q 100 120 140 120",
    joyful: "M 60 120 Q 100 140 140 120",
    sad: "M 60 120 Q 100 100 140 120",
    angry: "M 60 120 Q 100 110 140 120",
    anxious: "M 60 120 Q 100 125 140 120",
    confused: "M 60 120 Q 100 115 140 120",
    excited: "M 60 120 Q 100 145 140 120",
    calm: "M 60 120 Q 100 125 140 120"
  },
  
  // Eye shapes
  eyes: {
    neutral: { left: 8, right: 8, y: 80 },
    joyful: { left: 6, right: 6, y: 78 },
    sad: { left: 10, right: 10, y: 82 },
    angry: { left: 4, right: 4, y: 78 },
    anxious: { left: 9, right: 9, y: 81 },
    confused: { left: 7, right: 7, y: 79 },
    excited: { left: 5, right: 5, y: 77 },
    calm: { left: 8, right: 8, y: 80 }
  },
  
  // Eyebrow expressions
  brows: {
    neutral: {
      left: "M 50 70 Q 60 65 70 70",
      right: "M 130 70 Q 140 65 150 70"
    },
    joyful: {
      left: "M 50 70 Q 60 68 70 70",
      right: "M 130 70 Q 140 68 150 70"
    },
    sad: {
      left: "M 50 70 Q 60 75 70 70",
      right: "M 130 70 Q 140 75 150 70"
    },
    angry: {
      left: "M 50 70 Q 60 60 70 70",
      right: "M 130 70 Q 140 60 150 70"
    },
    anxious: {
      left: "M 50 70 Q 60 72 70 70",
      right: "M 130 70 Q 140 72 150 70"
    },
    confused: {
      left: "M 50 70 Q 60 68 70 70",
      right: "M 130 70 Q 140 72 150 70"
    },
    excited: {
      left: "M 50 70 Q 60 67 70 70",
      right: "M 130 70 Q 140 67 150 70"
    },
    calm: {
      left: "M 50 70 Q 60 66 70 70",
      right: "M 130 70 Q 140 66 150 70"
    }
  }
};

// Color schemes for different emotions
const emotionColors = {
  neutral: { primary: '#6B7280', accent: '#9CA3AF' },
  joyful: { primary: '#F59E0B', accent: '#FCD34D' },
  sad: { primary: '#3B82F6', accent: '#93C5FD' },
  angry: { primary: '#EF4444', accent: '#FCA5A5' },
  anxious: { primary: '#8B5CF6', accent: '#C4B5FD' },
  confused: { primary: '#10B981', accent: '#6EE7B7' },
  excited: { primary: '#EC4899', accent: '#F9A8D4' },
  calm: { primary: '#06B6D4', accent: '#67E8F9' }
};

// Animation variants
const animationVariants = {
  idle: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  blink: {
    scaleY: [1, 0.1, 1],
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  expression: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

export const EmotionAvatar: React.FC<EmotionAvatarProps> = ({
  emotion,
  intensity,
  size = 'medium',
  isAnimating = true,
  className = ''
}) => {
  const sizeMap = {
    small: { width: 120, height: 120 },
    medium: { width: 200, height: 200 },
    large: { width: 300, height: 300 }
  };

  const { width, height } = sizeMap[size];
  const colors = emotionColors[emotion];
  const intensityMultiplier = intensity === 'high' ? 1.2 : intensity === 'moderate' ? 1.0 : 0.8;

  return (
    <div className={`relative ${className}`}>
      <motion.svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        className="drop-shadow-lg"
        animate={isAnimating ? "idle" : "expression"}
        variants={animationVariants}
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill={colors.primary}
          opacity="0.1"
        />
        
        {/* Main face circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill={colors.primary}
          opacity="0.2"
          animate={{
            scale: isAnimating ? [1, 1.02, 1] : 1
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Face base */}
        <circle
          cx="100"
          cy="100"
          r="70"
          fill="#FEF3C7"
          stroke={colors.primary}
          strokeWidth="2"
        />
        
        {/* Eyes */}
        <motion.g
          animate={isAnimating ? "blink" : "expression"}
          variants={animationVariants}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <circle
            cx="70"
            cy={expressionPaths.eyes[emotion].y}
            r={expressionPaths.eyes[emotion].left * intensityMultiplier}
            fill={colors.accent}
          />
          <circle
            cx="130"
            cy={expressionPaths.eyes[emotion].y}
            r={expressionPaths.eyes[emotion].right * intensityMultiplier}
            fill={colors.accent}
          />
          
          {/* Eye pupils */}
          <circle
            cx="70"
            cy={expressionPaths.eyes[emotion].y}
            r="3"
            fill="#374151"
          />
          <circle
            cx="130"
            cy={expressionPaths.eyes[emotion].y}
            r="3"
            fill="#374151"
          />
        </motion.g>
        
        {/* Eyebrows */}
        <motion.path
          d={expressionPaths.brows[emotion].left}
          stroke={colors.primary}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isAnimating ? [
              expressionPaths.brows[emotion].left,
              expressionPaths.brows[emotion].left.replace('Q 60', 'Q 60'),
              expressionPaths.brows[emotion].left
            ] : expressionPaths.brows[emotion].left
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d={expressionPaths.brows[emotion].right}
          stroke={colors.primary}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isAnimating ? [
              expressionPaths.brows[emotion].right,
              expressionPaths.brows[emotion].right.replace('Q 140', 'Q 140'),
              expressionPaths.brows[emotion].right
            ] : expressionPaths.brows[emotion].right
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Mouth */}
        <motion.path
          d={expressionPaths.mouth[emotion]}
          stroke={colors.primary}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: isAnimating ? [
              expressionPaths.mouth[emotion],
              expressionPaths.mouth[emotion].replace('Q 100', 'Q 100'),
              expressionPaths.mouth[emotion]
            ] : expressionPaths.mouth[emotion]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Cheeks for joyful expression */}
        {emotion === 'joyful' && (
          <motion.circle
            cx="50"
            cy="110"
            r="8"
            fill={colors.accent}
            opacity="0.6"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        {/* Special effects for different emotions */}
        {emotion === 'excited' && (
          <motion.g
            animate={{
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={colors.accent}
              strokeWidth="2"
              opacity="0.5"
            />
          </motion.g>
        )}
        
        {emotion === 'anxious' && (
          <motion.g
            animate={{
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <circle
              cx="100"
              cy="100"
              r="75"
              fill="none"
              stroke={colors.accent}
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="5,5"
            />
          </motion.g>
        )}
      </motion.svg>
      
      {/* Emotion label */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          emotion === 'joyful' || emotion === 'excited' ? 'bg-yellow-100 text-yellow-800' :
          emotion === 'sad' ? 'bg-blue-100 text-blue-800' :
          emotion === 'angry' ? 'bg-red-100 text-red-800' :
          emotion === 'anxious' ? 'bg-purple-100 text-purple-800' :
          emotion === 'confused' ? 'bg-green-100 text-green-800' :
          emotion === 'calm' ? 'bg-cyan-100 text-cyan-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
        </span>
      </div>
    </div>
  );
};
