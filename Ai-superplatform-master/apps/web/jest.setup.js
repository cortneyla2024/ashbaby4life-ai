import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    img: (props) => <img {...props} />,
    svg: ({ children, ...props }) => <svg {...props}>{children}</svg>,
    path: (props) => <path {...props} />,
    circle: (props) => <circle {...props} />,
    rect: (props) => <rect {...props} />,
    g: ({ children, ...props }) => <g {...props}>{children}</g>,
    animatePresence: ({ children }) => children,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    themes: ['light', 'dark', 'system'],
  }),
  ThemeProvider: ({ children }) => children,
}));

// Mock react-query
jest.mock('react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }) => children,
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: jest.fn(),
  Toaster: () => null,
}));

// Mock face-api.js
jest.mock('face-api.js', () => ({
  loadTinyFaceDetectorModel: jest.fn(),
  loadFaceExpressionModel: jest.fn(),
  detectSingleFace: jest.fn(),
  TinyFaceDetectorOptions: {},
}));

// Mock PeerJS
jest.mock('peerjs', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    call: jest.fn(),
    answer: jest.fn(),
    close: jest.fn(),
    destroy: jest.fn(),
  }));
});

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock @vitality packages
jest.mock('@vitality/auth', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('@vitality/ai-service', () => ({
  useAIService: () => ({
    generateResponse: jest.fn(),
    streamResponse: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('@vitality/emotion-detection', () => ({
  EmotionDetectionProvider: ({ children }) => children,
  useEmotionDetection: () => ({
    detectEmotion: jest.fn(),
    currentEmotion: null,
  }),
}));

jest.mock('@vitality/voice-processing', () => ({
  VoiceProcessingProvider: ({ children }) => children,
  useVoiceProcessing: () => ({
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    isRecording: false,
    transcript: '',
  }),
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => ({
    url,
    method: 'GET',
    headers: new Map(),
    json: jest.fn().mockResolvedValue({}),
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      json: jest.fn().mockResolvedValue(data),
      status: options?.status || 200,
    })),
  },
}));


