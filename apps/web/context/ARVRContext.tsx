'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface ARExperience {
  id: string;
  name: string;
  description: string;
  type: 'overlay' | 'immersive' | 'interactive';
  category: 'wellness' | 'education' | 'entertainment' | 'productivity' | 'social';
  assets: {
    models: string[];
    textures: string[];
    sounds: string[];
    scripts: string[];
  };
  settings: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    opacity: number;
    visible: boolean;
  };
  interactions: ARInteraction[];
  createdAt: Date;
  updatedAt: Date;
}

interface ARInteraction {
  id: string;
  type: 'tap' | 'drag' | 'pinch' | 'voice' | 'gesture';
  trigger: string;
  action: string;
  parameters: Record<string, any>;
}

interface VRExperience {
  id: string;
  name: string;
  description: string;
  type: 'room' | 'environment' | 'simulation' | 'game';
  category: 'wellness' | 'education' | 'entertainment' | 'productivity' | 'social';
  assets: {
    scenes: string[];
    models: string[];
    textures: string[];
    sounds: string[];
    scripts: string[];
  };
  settings: {
    lighting: {
      ambient: { r: number; g: number; b: number };
      directional: { r: number; g: number; b: number; intensity: number };
    };
    physics: {
      gravity: number;
      collisionDetection: boolean;
    };
    audio: {
      spatial: boolean;
      volume: number;
    };
  };
  interactions: VRInteraction[];
  createdAt: Date;
  updatedAt: Date;
}

interface VRInteraction {
  id: string;
  type: 'controller' | 'hand' | 'voice' | 'gaze';
  trigger: string;
  action: string;
  parameters: Record<string, any>;
}

interface ARVRState {
  arExperiences: ARExperience[];
  vrExperiences: VRExperience[];
  activeARExperience: ARExperience | null;
  activeVRExperience: VRExperience | null;
  deviceCapabilities: {
    arSupported: boolean;
    vrSupported: boolean;
    webXRSupported: boolean;
    deviceType: 'mobile' | 'desktop' | 'headset' | 'unknown';
  };
  session: {
    isActive: boolean;
    startTime: Date | null;
    duration: number;
    performance: {
      fps: number;
      latency: number;
      memoryUsage: number;
    };
  };
  isLoading: boolean;
  error: string | null;
}

type ARVRAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AR_EXPERIENCES'; payload: ARExperience[] }
  | { type: 'ADD_AR_EXPERIENCE'; payload: ARExperience }
  | { type: 'UPDATE_AR_EXPERIENCE'; payload: ARExperience }
  | { type: 'DELETE_AR_EXPERIENCE'; payload: string }
  | { type: 'SET_VR_EXPERIENCES'; payload: VRExperience[] }
  | { type: 'ADD_VR_EXPERIENCE'; payload: VRExperience }
  | { type: 'UPDATE_VR_EXPERIENCE'; payload: VRExperience }
  | { type: 'DELETE_VR_EXPERIENCE'; payload: string }
  | { type: 'SET_ACTIVE_AR_EXPERIENCE'; payload: ARExperience | null }
  | { type: 'SET_ACTIVE_VR_EXPERIENCE'; payload: VRExperience | null }
  | { type: 'SET_DEVICE_CAPABILITIES'; payload: ARVRState['deviceCapabilities'] }
  | { type: 'START_SESSION'; payload: { type: 'ar' | 'vr'; experienceId: string } }
  | { type: 'END_SESSION' }
  | { type: 'UPDATE_SESSION_PERFORMANCE'; payload: ARVRState['session']['performance'] };

// Initial state
const initialState: ARVRState = {
  arExperiences: [],
  vrExperiences: [],
  activeARExperience: null,
  activeVRExperience: null,
  deviceCapabilities: {
    arSupported: false,
    vrSupported: false,
    webXRSupported: false,
    deviceType: 'unknown',
  },
  session: {
    isActive: false,
    startTime: null,
    duration: 0,
    performance: {
      fps: 0,
      latency: 0,
      memoryUsage: 0,
    },
  },
  isLoading: false,
  error: null,
};

// Reducer
function arvrReducer(state: ARVRState, action: ARVRAction): ARVRState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AR_EXPERIENCES':
      return { ...state, arExperiences: action.payload };
    case 'ADD_AR_EXPERIENCE':
      return { ...state, arExperiences: [...state.arExperiences, action.payload] };
    case 'UPDATE_AR_EXPERIENCE':
      return {
        ...state,
        arExperiences: state.arExperiences.map((exp) =>
          exp.id === action.payload.id ? action.payload : exp
        ),
      };
    case 'DELETE_AR_EXPERIENCE':
      return {
        ...state,
        arExperiences: state.arExperiences.filter((exp) => exp.id !== action.payload),
      };
    case 'SET_VR_EXPERIENCES':
      return { ...state, vrExperiences: action.payload };
    case 'ADD_VR_EXPERIENCE':
      return { ...state, vrExperiences: [...state.vrExperiences, action.payload] };
    case 'UPDATE_VR_EXPERIENCE':
      return {
        ...state,
        vrExperiences: state.vrExperiences.map((exp) =>
          exp.id === action.payload.id ? action.payload : exp
        ),
      };
    case 'DELETE_VR_EXPERIENCE':
      return {
        ...state,
        vrExperiences: state.vrExperiences.filter((exp) => exp.id !== action.payload),
      };
    case 'SET_ACTIVE_AR_EXPERIENCE':
      return { ...state, activeARExperience: action.payload };
    case 'SET_ACTIVE_VR_EXPERIENCE':
      return { ...state, activeVRExperience: action.payload };
    case 'SET_DEVICE_CAPABILITIES':
      return { ...state, deviceCapabilities: action.payload };
    case 'START_SESSION':
      return {
        ...state,
        session: {
          ...state.session,
          isActive: true,
          startTime: new Date(),
          duration: 0,
        },
      };
    case 'END_SESSION':
      return {
        ...state,
        session: {
          ...state.session,
          isActive: false,
          startTime: null,
          duration: 0,
        },
      };
    case 'UPDATE_SESSION_PERFORMANCE':
      return {
        ...state,
        session: {
          ...state.session,
          performance: action.payload,
        },
      };
    default:
      return state;
  }
}

// Context
interface ARVRContextType {
  state: ARVRState;
  dispatch: React.Dispatch<ARVRAction>;
  // AR Experience actions
  createARExperience: (experienceData: Omit<ARExperience, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateARExperience: (id: string, experienceData: Partial<ARExperience>) => Promise<void>;
  deleteARExperience: (id: string) => Promise<void>;
  getARExperience: (id: string) => ARExperience | undefined;
  // VR Experience actions
  createVRExperience: (experienceData: Omit<VRExperience, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateVRExperience: (id: string, experienceData: Partial<VRExperience>) => Promise<void>;
  deleteVRExperience: (id: string) => Promise<void>;
  getVRExperience: (id: string) => VRExperience | undefined;
  // Session actions
  startARSession: (experienceId: string) => Promise<void>;
  startVRSession: (experienceId: string) => Promise<void>;
  endSession: () => void;
  // Device actions
  checkDeviceCapabilities: () => Promise<void>;
  // Utility actions
  exportExperience: (id: string, type: 'ar' | 'vr', format: 'json' | 'gltf') => Promise<string>;
  importExperience: (data: string, type: 'ar' | 'vr', format: 'json' | 'gltf') => Promise<void>;
}

const ARVRContext = createContext<ARVRContextType | undefined>(undefined);

// Provider
export function ARVRProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(arvrReducer, initialState);

  // Check device capabilities on mount
  useEffect(() => {
    checkDeviceCapabilities();
  }, []);

  // Load experiences from localStorage
  useEffect(() => {
    const loadExperiences = () => {
      try {
        const savedAR = localStorage.getItem('careconnect_ar_experiences');
        const savedVR = localStorage.getItem('careconnect_vr_experiences');
        
        if (savedAR) {
          const arExperiences = JSON.parse(savedAR).map((exp: any) => ({
            ...exp,
            createdAt: new Date(exp.createdAt),
            updatedAt: new Date(exp.updatedAt),
          }));
          dispatch({ type: 'SET_AR_EXPERIENCES', payload: arExperiences });
        }
        
        if (savedVR) {
          const vrExperiences = JSON.parse(savedVR).map((exp: any) => ({
            ...exp,
            createdAt: new Date(exp.createdAt),
            updatedAt: new Date(exp.updatedAt),
          }));
          dispatch({ type: 'SET_VR_EXPERIENCES', payload: vrExperiences });
        }
      } catch (error) {
        console.error('Error loading AR/VR experiences:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load experiences' });
      }
    };

    loadExperiences();
  }, []);

  // Save experiences to localStorage
  useEffect(() => {
    localStorage.setItem('careconnect_ar_experiences', JSON.stringify(state.arExperiences));
  }, [state.arExperiences]);

  useEffect(() => {
    localStorage.setItem('careconnect_vr_experiences', JSON.stringify(state.vrExperiences));
  }, [state.vrExperiences]);

  // AR Experience actions
  const createARExperience = async (experienceData: Omit<ARExperience, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newExperience: ARExperience = {
        ...experienceData,
        id: `ar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_AR_EXPERIENCE', payload: newExperience });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error creating AR experience:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create AR experience' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateARExperience = async (id: string, experienceData: Partial<ARExperience>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const experience = state.arExperiences.find((exp) => exp.id === id);
      if (!experience) {
        throw new Error('AR experience not found');
      }
      
      const updatedExperience: ARExperience = {
        ...experience,
        ...experienceData,
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'UPDATE_AR_EXPERIENCE', payload: updatedExperience });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error updating AR experience:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update AR experience' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteARExperience = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'DELETE_AR_EXPERIENCE', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error deleting AR experience:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete AR experience' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getARExperience = (id: string) => {
    return state.arExperiences.find((exp) => exp.id === id);
  };

  // VR Experience actions
  const createVRExperience = async (experienceData: Omit<VRExperience, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newExperience: VRExperience = {
        ...experienceData,
        id: `vr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'ADD_VR_EXPERIENCE', payload: newExperience });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error creating VR experience:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create VR experience' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateVRExperience = async (id: string, experienceData: Partial<VRExperience>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const experience = state.vrExperiences.find((exp) => exp.id === id);
      if (!experience) {
        throw new Error('VR experience not found');
      }
      
      const updatedExperience: VRExperience = {
        ...experience,
        ...experienceData,
        updatedAt: new Date(),
      };
      
      dispatch({ type: 'UPDATE_VR_EXPERIENCE', payload: updatedExperience });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error updating VR experience:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update VR experience' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteVRExperience = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'DELETE_VR_EXPERIENCE', payload: id });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error deleting VR experience:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete VR experience' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getVRExperience = (id: string) => {
    return state.vrExperiences.find((exp) => exp.id === id);
  };

  // Session actions
  const startARSession = async (experienceId: string) => {
    try {
      const experience = getARExperience(experienceId);
      if (!experience) {
        throw new Error('AR experience not found');
      }
      
      dispatch({ type: 'SET_ACTIVE_AR_EXPERIENCE', payload: experience });
      dispatch({ type: 'START_SESSION', payload: { type: 'ar', experienceId } });
    } catch (error) {
      console.error('Error starting AR session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start AR session' });
    }
  };

  const startVRSession = async (experienceId: string) => {
    try {
      const experience = getVRExperience(experienceId);
      if (!experience) {
        throw new Error('VR experience not found');
      }
      
      dispatch({ type: 'SET_ACTIVE_VR_EXPERIENCE', payload: experience });
      dispatch({ type: 'START_SESSION', payload: { type: 'vr', experienceId } });
    } catch (error) {
      console.error('Error starting VR session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start VR session' });
    }
  };

  const endSession = () => {
    dispatch({ type: 'END_SESSION' });
    dispatch({ type: 'SET_ACTIVE_AR_EXPERIENCE', payload: null });
    dispatch({ type: 'SET_ACTIVE_VR_EXPERIENCE', payload: null });
  };

  // Device actions
  const checkDeviceCapabilities = async () => {
    try {
      const capabilities = {
        arSupported: false,
        vrSupported: false,
        webXRSupported: false,
        deviceType: 'unknown' as const,
      };

      // Check WebXR support
      if ('xr' in navigator) {
        capabilities.webXRSupported = true;
        
                // Check AR support
        try {
          if ((navigator as any).xr && typeof (navigator as any).xr.isSessionSupported === 'function') {
            const arSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
            capabilities.arSupported = arSupported;
          }
        } catch (error) {
          capabilities.arSupported = false;
        }

        // Check VR support
        try {
          if ((navigator as any).xr && typeof (navigator as any).xr.isSessionSupported === 'function') {
            const vrSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
            capabilities.vrSupported = vrSupported;
          }
        } catch (error) {
          capabilities.vrSupported = false;
        }
      }

      // Detect device type
      const userAgent = navigator.userAgent.toLowerCase();
      if (/mobile|android|iphone|ipad/.test(userAgent)) {
        capabilities.deviceType = 'mobile' as any;
      } else if (/oculus|vive|quest/.test(userAgent)) {
        capabilities.deviceType = 'headset' as any;
      } else {
        capabilities.deviceType = 'desktop' as any;
      }

      dispatch({ type: 'SET_DEVICE_CAPABILITIES', payload: capabilities });
    } catch (error) {
      console.error('Error checking device capabilities:', error);
    }
  };

  // Utility actions
  const exportExperience = async (id: string, type: 'ar' | 'vr', format: 'json' | 'gltf'): Promise<string> => {
    try {
      let experience;
      if (type === 'ar') {
        experience = getARExperience(id);
      } else {
        experience = getVRExperience(id);
      }

      if (!experience) {
        throw new Error('Experience not found');
      }

      if (format === 'json') {
        return JSON.stringify(experience, null, 2);
      } else {
        // Simple GLTF export (placeholder)
        return JSON.stringify({
          asset: { version: '2.0' },
          scene: 0,
          scenes: [{ nodes: [] }],
          nodes: [],
          meshes: [],
          materials: [],
          textures: [],
          images: [],
          accessors: [],
          bufferViews: [],
          buffers: [],
        });
      }
    } catch (error) {
      console.error('Error exporting experience:', error);
      throw new Error('Failed to export experience');
    }
  };

  const importExperience = async (data: string, type: 'ar' | 'vr', format: 'json' | 'gltf'): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      let experienceData;
      if (format === 'json') {
        experienceData = JSON.parse(data);
      } else {
        // Simple GLTF import (placeholder)
        const gltf = JSON.parse(data);
        experienceData = {
          name: 'Imported Experience',
          description: 'Imported from GLTF file',
          type: type === 'ar' ? 'overlay' : 'room',
          category: 'entertainment',
          assets: { models: [], textures: [], sounds: [], scripts: [] },
          settings: type === 'ar' ? {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            opacity: 1,
            visible: true,
          } : {
            lighting: { ambient: { r: 0.5, g: 0.5, b: 0.5 }, directional: { r: 1, g: 1, b: 1, intensity: 1 } },
            physics: { gravity: 9.8, collisionDetection: true },
            audio: { spatial: true, volume: 1 },
          },
          interactions: [],
        };
      }

      if (type === 'ar') {
        await createARExperience(experienceData);
      } else {
        await createVRExperience(experienceData);
      }
      
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error importing experience:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import experience' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: ARVRContextType = {
    state,
    dispatch,
    createARExperience,
    updateARExperience,
    deleteARExperience,
    getARExperience,
    createVRExperience,
    updateVRExperience,
    deleteVRExperience,
    getVRExperience,
    startARSession,
    startVRSession,
    endSession,
    checkDeviceCapabilities,
    exportExperience,
    importExperience,
  };

  return <ARVRContext.Provider value={value}>{children}</ARVRContext.Provider>;
}

// Hook
export function useARVR() {
  const context = useContext(ARVRContext);
  if (context === undefined) {
    throw new Error('useARVR must be used within an ARVRProvider');
  }
  return context;
}
