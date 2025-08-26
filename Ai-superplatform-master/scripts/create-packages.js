const fs = require('fs');
const path = require('path');

const packages = [
  'ai-service',
  'analytics',
  'auth',
  'collaboration',
  'database',
  'design-system',
  'document-management',
  'emotion-detection',
  'file-storage',
  'financial-tracking',
  'goal-tracking',
  'government-resources',
  'health-tracking',
  'learning-tracking',
  'life-hacks',
  'monitoring',
  'notifications',
  'optimization',
  'security',
  'social-network',
  'testing',
  'utils',
  'voice-processing',
  'automation',
  'docs'
];

const basePackageJson = {
  version: "1.0.0",
  private: true,
  main: "./dist/index.js",
  module: "./dist/index.mjs",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  files: ["dist/**"],
  scripts: {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  devDependencies: {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "react": "^18.2.0",
    "tsup": "^8.0.2",
    "typescript": "^5.3.3"
  },
  peerDependencies: {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  keywords: ["vitality", "ai", "platform"],
  author: "Vitality AI Team",
  license: "MIT"
};

const packageConfigs = {
  'ai-service': {
    name: '@vitality/ai-service',
    description: 'AI service integration for Vitality AI',
    dependencies: {
      'axios': '^1.7.2',
      'zod': '^3.23.8'
    }
  },
  'analytics': {
    name: '@vitality/analytics',
    description: 'Analytics and tracking for Vitality AI',
    dependencies: {
      'recharts': '^2.12.7'
    }
  },
  'auth': {
    name: '@vitality/auth',
    description: 'Authentication system for Vitality AI',
    dependencies: {
      'bcryptjs': '^2.4.3',
      'zod': '^3.23.8'
    }
  },
  'collaboration': {
    name: '@vitality/collaboration',
    description: 'Real-time collaboration features',
    dependencies: {
      'peerjs': '^1.5.2',
      'socket.io-client': '^4.8.1'
    }
  },
  'database': {
    name: '@vitality/database',
    description: 'Database layer for Vitality AI',
    dependencies: {
      '@prisma/client': '^5.15.0'
    }
  },
  'design-system': {
    name: '@vitality/design-system',
    description: 'Shared design system components',
    dependencies: {
      '@radix-ui/react-avatar': '^1.0.4',
      '@radix-ui/react-dialog': '^1.0.5',
      '@radix-ui/react-dropdown-menu': '^2.0.6',
      '@radix-ui/react-slot': '^1.0.2',
      '@radix-ui/react-toast': '^1.1.5',
      'class-variance-authority': '^0.7.0',
      'clsx': '^2.1.0',
      'lucide-react': '^0.344.0',
      'tailwind-merge': '^2.2.1'
    }
  },
  'document-management': {
    name: '@vitality/document-management',
    description: 'Document management system',
    dependencies: {
      'react-dropzone': '^14.2.3'
    }
  },
  'emotion-detection': {
    name: '@vitality/emotion-detection',
    description: 'Emotion detection using face-api.js',
    dependencies: {
      'face-api.js': '^0.22.2',
      'react-webcam': '^7.2.0'
    }
  },
  'file-storage': {
    name: '@vitality/file-storage',
    description: 'File storage and management',
    dependencies: {
      'react-dropzone': '^14.2.3'
    }
  },
  'financial-tracking': {
    name: '@vitality/financial-tracking',
    description: 'Financial tracking and management',
    dependencies: {
      'recharts': '^2.12.7'
    }
  },
  'goal-tracking': {
    name: '@vitality/goal-tracking',
    description: 'Goal tracking and achievement',
    dependencies: {
      'date-fns': '^4.1.0'
    }
  },
  'government-resources': {
    name: '@vitality/government-resources',
    description: 'Government resources integration',
    dependencies: {
      'axios': '^1.7.2'
    }
  },
  'health-tracking': {
    name: '@vitality/health-tracking',
    description: 'Health tracking and monitoring',
    dependencies: {
      'recharts': '^2.12.7'
    }
  },
  'learning-tracking': {
    name: '@vitality/learning-tracking',
    description: 'Learning progress tracking',
    dependencies: {
      'date-fns': '^4.1.0'
    }
  },
  'life-hacks': {
    name: '@vitality/life-hacks',
    description: 'Life hacks and tips',
    dependencies: {}
  },
  'monitoring': {
    name: '@vitality/monitoring',
    description: 'System monitoring and health checks',
    dependencies: {
      'axios': '^1.7.2'
    }
  },
  'notifications': {
    name: '@vitality/notifications',
    description: 'Notification system',
    dependencies: {
      'sonner': '^2.0.7'
    }
  },
  'optimization': {
    name: '@vitality/optimization',
    description: 'Life optimization algorithms',
    dependencies: {}
  },
  'security': {
    name: '@vitality/security',
    description: 'Security utilities and validation',
    dependencies: {
      'zod': '^3.23.8'
    }
  },
  'social-network': {
    name: '@vitality/social-network',
    description: 'Social networking features',
    dependencies: {}
  },
  'testing': {
    name: '@vitality/testing',
    description: 'Testing utilities and helpers',
    dependencies: {
      '@testing-library/react': '^14.2.1',
      '@testing-library/jest-dom': '^6.4.2'
    }
  },
  'utils': {
    name: '@vitality/utils',
    description: 'Shared utility functions',
    dependencies: {
      'clsx': '^2.1.1',
      'tailwind-merge': '^3.3.1',
      'date-fns': '^4.1.0'
    }
  },
  'voice-processing': {
    name: '@vitality/voice-processing',
    description: 'Voice processing and speech recognition',
    dependencies: {
      'tone': '^14.7.77'
    }
  },
  'automation': {
    name: '@vitality/automation',
    description: 'Automation and workflow management',
    dependencies: {}
  },
  'docs': {
    name: '@vitality/docs',
    description: 'Documentation and guides',
    dependencies: {}
  }
};

packages.forEach(pkgName => {
  const pkgPath = path.join(__dirname, '..', 'packages', pkgName);
  const packageJsonPath = path.join(pkgPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    const config = packageConfigs[pkgName];
    if (config) {
      const packageJson = {
        ...basePackageJson,
        name: config.name,
        description: config.description,
        dependencies: config.dependencies || {}
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Created package.json for ${pkgName}`);
    }
  }
  
  // Create src directory and index file if they don't exist
  const srcPath = path.join(pkgPath, 'src');
  const indexPath = path.join(srcPath, 'index.ts');
  
  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath, { recursive: true });
  }
  
  if (!fs.existsSync(indexPath)) {
    const config = packageConfigs[pkgName];
    if (config) {
      fs.writeFileSync(indexPath, `// ${config.name} - ${config.description}\n\nexport * from './${pkgName}';\n`);
      console.log(`Created index.ts for ${pkgName}`);
    }
  }
  
  // Create main module file
  const modulePath = path.join(srcPath, `${pkgName}.ts`);
  if (!fs.existsSync(modulePath)) {
    const config = packageConfigs[pkgName];
    if (config) {
      fs.writeFileSync(modulePath, `// ${config.name} module\n\nexport const ${pkgName.replace('-', '')} = {\n  version: '1.0.0',\n  name: '${config.name}'\n};\n`);
      console.log(`Created module file for ${pkgName}`);
    }
  }
});

console.log('Package creation completed!');

