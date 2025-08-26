import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn()

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}))

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(),
  createGain: jest.fn(),
  createAnalyser: jest.fn(),
  createMediaStreamSource: jest.fn(),
  createScriptProcessor: jest.fn(),
  createBiquadFilter: jest.fn(),
  createDelay: jest.fn(),
  createConvolver: jest.fn(),
  createDynamicsCompressor: jest.fn(),
  createPanner: jest.fn(),
  createStereoPanner: jest.fn(),
  createWaveShaper: jest.fn(),
  createPeriodicWave: jest.fn(),
  createChannelSplitter: jest.fn(),
  createChannelMerger: jest.fn(),
  createMediaElementSource: jest.fn(),
  createMediaStreamDestination: jest.fn(),
  createIIRFilter: jest.fn(),
  createConstantSource: jest.fn(),
  createWorklet: jest.fn(),
  createAudioWorklet: jest.fn(),
  createOscillatorNode: jest.fn(),
  createGainNode: jest.fn(),
  createAnalyserNode: jest.fn(),
  createMediaStreamSourceNode: jest.fn(),
  createScriptProcessorNode: jest.fn(),
  createBiquadFilterNode: jest.fn(),
  createDelayNode: jest.fn(),
  createConvolverNode: jest.fn(),
  createDynamicsCompressorNode: jest.fn(),
  createPannerNode: jest.fn(),
  createStereoPannerNode: jest.fn(),
  createWaveShaperNode: jest.fn(),
  createPeriodicWaveNode: jest.fn(),
  createChannelSplitterNode: jest.fn(),
  createChannelMergerNode: jest.fn(),
  createMediaElementSourceNode: jest.fn(),
  createMediaStreamDestinationNode: jest.fn(),
  createIIRFilterNode: jest.fn(),
  createConstantSourceNode: jest.fn(),
  createWorkletNode: jest.fn(),
  createAudioWorkletNode: jest.fn(),
  destination: {
    connect: jest.fn(),
  },
  currentTime: 0,
  sampleRate: 44100,
  state: 'running',
  onstatechange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  resume: jest.fn(),
  suspend: jest.fn(),
  close: jest.fn(),
}))

// Mock Tone.js
jest.mock('tone', () => ({
  Transport: {
    start: jest.fn(),
    stop: jest.fn(),
    bpm: { value: 120 },
    timeSignature: [4, 4],
  },
  Synth: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
  })),
  Piano: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
  })),
  Sampler: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    triggerAttackRelease: jest.fn(),
    triggerAttack: jest.fn(),
    triggerRelease: jest.fn(),
  })),
  Reverb: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    wet: { value: 0.3 },
  })),
  Delay: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    delayTime: { value: 0.5 },
    feedback: { value: 0.3 },
  })),
  Distortion: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    distortion: { value: 0.8 },
  })),
  Filter: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    frequency: { value: 1000 },
    type: 'lowpass',
  })),
  LFO: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 1 },
  })),
  Envelope: jest.fn().mockImplementation(() => ({
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 1,
  })),
  Frequency: jest.fn(),
  Time: jest.fn(),
  Note: jest.fn(),
  Scale: jest.fn(),
  Chord: jest.fn(),
  Interval: jest.fn(),
  Tonal: {
    Note: {
      get: jest.fn(),
      transpose: jest.fn(),
    },
    Scale: {
      get: jest.fn(),
      detect: jest.fn(),
    },
    Chord: {
      get: jest.fn(),
      detect: jest.fn(),
    },
  },
}))

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
  })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas'),
  })),
  BoxGeometry: jest.fn(),
  SphereGeometry: jest.fn(),
  PlaneGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  MeshPhongMaterial: jest.fn(),
  Mesh: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    rotation: { set: jest.fn() },
    scale: { set: jest.fn() },
  })),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
  })),
  AmbientLight: jest.fn(),
  PointLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
  })),
  Vector3: jest.fn().mockImplementation((x, y, z) => ({ x, y, z })),
  Color: jest.fn(),
  Clock: jest.fn().mockImplementation(() => ({
    getDelta: jest.fn().mockReturnValue(0.016),
    getElapsedTime: jest.fn().mockReturnValue(0),
  })),
}))

// Suppress console warnings during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
