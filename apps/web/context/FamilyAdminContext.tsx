'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types
interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: 'admin' | 'member' | 'child' | 'guardian' | 'caregiver';
  permissions: string[];
  isActive: boolean;
  joinedAt: Date;
  invitedBy: string;
  consentGiven: boolean;
  consentDate?: Date;
  emergencyContact: boolean;
  canManageOthers: boolean;
  canViewHealthData: boolean;
  canViewFinancialData: boolean;
  canViewLearningData: boolean;
  canViewCreativeData: boolean;
  canViewSocialData: boolean;
  canViewAutomationData: boolean;
}

interface Family {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: FamilyMember[];
  settings: {
    privacyLevel: 'private' | 'family' | 'extended' | 'public';
    dataSharing: {
      health: boolean;
      finance: boolean;
      learning: boolean;
      creative: boolean;
      social: boolean;
      automation: boolean;
    };
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      inApp: boolean;
    };
    emergencyContacts: string[];
    maxMembers: number;
    allowInvites: boolean;
    requireConsent: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Invitation {
  id: string;
  familyId: string;
  email: string;
  role: FamilyMember['role'];
  permissions: string[];
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
}

interface ConsentRecord {
  id: string;
  familyId: string;
  memberId: string;
  type: 'data_sharing' | 'emergency_contact' | 'health_access' | 'financial_access' | 'location_tracking';
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  details: string;
}

interface FamilyAdminState {
  families: Family[];
  currentFamily: Family | null;
  invitations: Invitation[];
  consentRecords: ConsentRecord[];
  isLoading: boolean;
  error: string | null;
  settings: {
    defaultPrivacyLevel: 'private' | 'family' | 'extended' | 'public';
    defaultDataSharing: {
      health: boolean;
      finance: boolean;
      learning: boolean;
      creative: boolean;
      social: boolean;
      automation: boolean;
    };
    requireConsent: boolean;
    consentExpiryDays: number;
    maxFamilyMembers: number;
    allowMultipleFamilies: boolean;
  };
}

type FamilyAdminAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAMILIES'; payload: Family[] }
  | { type: 'ADD_FAMILY'; payload: Family }
  | { type: 'UPDATE_FAMILY'; payload: Family }
  | { type: 'REMOVE_FAMILY'; payload: string }
  | { type: 'SET_CURRENT_FAMILY'; payload: Family | null }
  | { type: 'ADD_FAMILY_MEMBER'; payload: { familyId: string; member: FamilyMember } }
  | { type: 'UPDATE_FAMILY_MEMBER'; payload: { familyId: string; member: FamilyMember } }
  | { type: 'REMOVE_FAMILY_MEMBER'; payload: { familyId: string; memberId: string } }
  | { type: 'SET_INVITATIONS'; payload: Invitation[] }
  | { type: 'ADD_INVITATION'; payload: Invitation }
  | { type: 'UPDATE_INVITATION'; payload: Invitation }
  | { type: 'REMOVE_INVITATION'; payload: string }
  | { type: 'SET_CONSENT_RECORDS'; payload: ConsentRecord[] }
  | { type: 'ADD_CONSENT_RECORD'; payload: ConsentRecord }
  | { type: 'UPDATE_CONSENT_RECORD'; payload: ConsentRecord }
  | { type: 'REMOVE_CONSENT_RECORD'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Partial<FamilyAdminState['settings']> };

// Initial state
const initialState: FamilyAdminState = {
  families: [],
  currentFamily: null,
  invitations: [],
  consentRecords: [],
  isLoading: false,
  error: null,
  settings: {
    defaultPrivacyLevel: 'family',
    defaultDataSharing: {
      health: true,
      finance: false,
      learning: true,
      creative: true,
      social: false,
      automation: false,
    },
    requireConsent: true,
    consentExpiryDays: 365,
    maxFamilyMembers: 10,
    allowMultipleFamilies: true,
  },
};

// Reducer
function familyAdminReducer(state: FamilyAdminState, action: FamilyAdminAction): FamilyAdminState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FAMILIES':
      return { ...state, families: action.payload };
    case 'ADD_FAMILY':
      return { ...state, families: [...state.families, action.payload] };
    case 'UPDATE_FAMILY':
      return {
        ...state,
        families: state.families.map((family) =>
          family.id === action.payload.id ? action.payload : family
        ),
      };
    case 'REMOVE_FAMILY':
      return {
        ...state,
        families: state.families.filter((family) => family.id !== action.payload),
      };
    case 'SET_CURRENT_FAMILY':
      return { ...state, currentFamily: action.payload };
    case 'ADD_FAMILY_MEMBER':
      return {
        ...state,
        families: state.families.map((family) =>
          family.id === action.payload.familyId
            ? { ...family, members: [...family.members, action.payload.member] }
            : family
        ),
      };
    case 'UPDATE_FAMILY_MEMBER':
      return {
        ...state,
        families: state.families.map((family) =>
          family.id === action.payload.familyId
            ? {
                ...family,
                members: family.members.map((member) =>
                  member.id === action.payload.member.id ? action.payload.member : member
                ),
              }
            : family
        ),
      };
    case 'REMOVE_FAMILY_MEMBER':
      return {
        ...state,
        families: state.families.map((family) =>
          family.id === action.payload.familyId
            ? {
                ...family,
                members: family.members.filter((member) => member.id !== action.payload.memberId),
              }
            : family
        ),
      };
    case 'SET_INVITATIONS':
      return { ...state, invitations: action.payload };
    case 'ADD_INVITATION':
      return { ...state, invitations: [...state.invitations, action.payload] };
    case 'UPDATE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.map((invitation) =>
          invitation.id === action.payload.id ? action.payload : invitation
        ),
      };
    case 'REMOVE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.filter((invitation) => invitation.id !== action.payload),
      };
    case 'SET_CONSENT_RECORDS':
      return { ...state, consentRecords: action.payload };
    case 'ADD_CONSENT_RECORD':
      return { ...state, consentRecords: [...state.consentRecords, action.payload] };
    case 'UPDATE_CONSENT_RECORD':
      return {
        ...state,
        consentRecords: state.consentRecords.map((record) =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    case 'REMOVE_CONSENT_RECORD':
      return {
        ...state,
        consentRecords: state.consentRecords.filter((record) => record.id !== action.payload),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

// Context
interface FamilyAdminContextType {
  state: FamilyAdminState;
  dispatch: React.Dispatch<FamilyAdminAction>;
  // Family management
  createFamily: (family: Omit<Family, 'id' | 'members' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFamily: (id: string, updates: Partial<Family>) => Promise<void>;
  deleteFamily: (id: string) => Promise<void>;
  getFamily: (id: string) => Family | undefined;
  setCurrentFamily: (family: Family | null) => void;
  // Member management
  addMember: (familyId: string, member: Omit<FamilyMember, 'id' | 'joinedAt'>) => Promise<void>;
  updateMember: (familyId: string, memberId: string, updates: Partial<FamilyMember>) => Promise<void>;
  removeMember: (familyId: string, memberId: string) => Promise<void>;
  getMember: (familyId: string, memberId: string) => FamilyMember | undefined;
  // Invitation management
  sendInvitation: (familyId: string, email: string, role: FamilyMember['role'], permissions: string[]) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  declineInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  getInvitation: (id: string) => Invitation | undefined;
  // Consent management
  grantConsent: (familyId: string, memberId: string, type: ConsentRecord['type'], details?: string) => Promise<void>;
  revokeConsent: (familyId: string, memberId: string, type: ConsentRecord['type']) => Promise<void>;
  getConsentRecord: (familyId: string, memberId: string, type: ConsentRecord['type']) => ConsentRecord | undefined;
  // Permission management
  checkPermission: (familyId: string, memberId: string, permission: string) => boolean;
  updatePermissions: (familyId: string, memberId: string, permissions: string[]) => Promise<void>;
  // Utility
  exportFamilyData: (familyId: string, format: 'json' | 'csv') => Promise<string>;
  importFamilyData: (data: string, format: 'json' | 'csv') => Promise<void>;
}

export const FamilyAdminContext = createContext<FamilyAdminContextType | undefined>(undefined);

// Provider
export function FamilyAdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(familyAdminReducer, initialState);

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('careconnect_family_settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          dispatch({ type: 'SET_SETTINGS', payload: settings });
        }
      } catch (error) {
        console.error('Error loading family admin settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('careconnect_family_settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Family management
  const createFamily = async (family: Omit<Family, 'id' | 'members' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newFamily: Family = {
        ...family,
        id: `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        members: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: 'ADD_FAMILY', payload: newFamily });
    } catch (error) {
      console.error('Error creating family:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create family' });
    }
  };

  const updateFamily = async (id: string, updates: Partial<Family>) => {
    try {
      const family = state.families.find((f) => f.id === id);
      if (!family) {
        throw new Error('Family not found');
      }

      const updatedFamily = { ...family, ...updates, updatedAt: new Date() };
      dispatch({ type: 'UPDATE_FAMILY', payload: updatedFamily });
    } catch (error) {
      console.error('Error updating family:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update family' });
    }
  };

  const deleteFamily = async (id: string) => {
    try {
      dispatch({ type: 'REMOVE_FAMILY', payload: id });
    } catch (error) {
      console.error('Error deleting family:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete family' });
    }
  };

  const getFamily = (id: string) => {
    return state.families.find((family) => family.id === id);
  };

  const setCurrentFamily = (family: Family | null) => {
    dispatch({ type: 'SET_CURRENT_FAMILY', payload: family });
  };

  // Member management
  const addMember = async (familyId: string, member: Omit<FamilyMember, 'id' | 'joinedAt'>) => {
    try {
      const newMember: FamilyMember = {
        ...member,
        id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        joinedAt: new Date(),
      };

      dispatch({ type: 'ADD_FAMILY_MEMBER', payload: { familyId, member: newMember } });
    } catch (error) {
      console.error('Error adding member:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add member' });
    }
  };

  const updateMember = async (familyId: string, memberId: string, updates: Partial<FamilyMember>) => {
    try {
      const family = state.families.find((f) => f.id === familyId);
      if (!family) {
        throw new Error('Family not found');
      }

      const member = family.members.find((m) => m.id === memberId);
      if (!member) {
        throw new Error('Member not found');
      }

      const updatedMember = { ...member, ...updates };
      dispatch({ type: 'UPDATE_FAMILY_MEMBER', payload: { familyId, member: updatedMember } });
    } catch (error) {
      console.error('Error updating member:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update member' });
    }
  };

  const removeMember = async (familyId: string, memberId: string) => {
    try {
      dispatch({ type: 'REMOVE_FAMILY_MEMBER', payload: { familyId, memberId } });
    } catch (error) {
      console.error('Error removing member:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove member' });
    }
  };

  const getMember = (familyId: string, memberId: string) => {
    const family = state.families.find((f) => f.id === familyId);
    return family?.members.find((m) => m.id === memberId);
  };

  // Invitation management
  const sendInvitation = async (familyId: string, email: string, role: FamilyMember['role'], permissions: string[]) => {
    try {
      const invitation: Invitation = {
        id: `invitation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        familyId,
        email,
        role,
        permissions,
        invitedBy: 'current_user', // In a real app, this would be the current user's ID
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      };

      dispatch({ type: 'ADD_INVITATION', payload: invitation });
    } catch (error) {
      console.error('Error sending invitation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send invitation' });
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      const invitation = state.invitations.find((i) => i.id === invitationId);
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      const updatedInvitation = { ...invitation, status: 'accepted' as const, acceptedAt: new Date() };
      dispatch({ type: 'UPDATE_INVITATION', payload: updatedInvitation });

      // Add member to family
      const member: Omit<FamilyMember, 'id' | 'joinedAt'> = {
        userId: 'current_user', // In a real app, this would be the current user's ID
        familyId: invitation.familyId,
        role: invitation.role,
        permissions: invitation.permissions,
        isActive: true,
        invitedBy: invitation.invitedBy,
        consentGiven: true,
        consentDate: new Date(),
        emergencyContact: false,
        canManageOthers: invitation.role === 'admin',
        canViewHealthData: invitation.permissions.includes('health'),
        canViewFinancialData: invitation.permissions.includes('finance'),
        canViewLearningData: invitation.permissions.includes('learning'),
        canViewCreativeData: invitation.permissions.includes('creative'),
        canViewSocialData: invitation.permissions.includes('social'),
        canViewAutomationData: invitation.permissions.includes('automation'),
      };

      await addMember(invitation.familyId, member);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to accept invitation' });
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const invitation = state.invitations.find((i) => i.id === invitationId);
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      const updatedInvitation = { ...invitation, status: 'declined' as const, declinedAt: new Date() };
      dispatch({ type: 'UPDATE_INVITATION', payload: updatedInvitation });
    } catch (error) {
      console.error('Error declining invitation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to decline invitation' });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      dispatch({ type: 'REMOVE_INVITATION', payload: invitationId });
    } catch (error) {
      console.error('Error canceling invitation:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cancel invitation' });
    }
  };

  const getInvitation = (id: string) => {
    return state.invitations.find((invitation) => invitation.id === id);
  };

  // Consent management
  const grantConsent = async (familyId: string, memberId: string, type: ConsentRecord['type'], details?: string) => {
    try {
      const consentRecord: ConsentRecord = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        familyId,
        memberId,
        type,
        granted: true,
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + state.settings.consentExpiryDays * 24 * 60 * 60 * 1000),
        details: details || '',
      };

      dispatch({ type: 'ADD_CONSENT_RECORD', payload: consentRecord });
    } catch (error) {
      console.error('Error granting consent:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to grant consent' });
    }
  };

  const revokeConsent = async (familyId: string, memberId: string, type: ConsentRecord['type']) => {
    try {
      const record = state.consentRecords.find(
        (r) => r.familyId === familyId && r.memberId === memberId && r.type === type
      );
      if (!record) {
        throw new Error('Consent record not found');
      }

      const updatedRecord = { ...record, revokedAt: new Date() };
      dispatch({ type: 'UPDATE_CONSENT_RECORD', payload: updatedRecord });
    } catch (error) {
      console.error('Error revoking consent:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to revoke consent' });
    }
  };

  const getConsentRecord = (familyId: string, memberId: string, type: ConsentRecord['type']) => {
    return state.consentRecords.find(
      (r) => r.familyId === familyId && r.memberId === memberId && r.type === type
    );
  };

  // Permission management
  const checkPermission = (familyId: string, memberId: string, permission: string): boolean => {
    const member = getMember(familyId, memberId);
    if (!member) return false;

    // Admin has all permissions
    if (member.role === 'admin') return true;

    // Check specific permissions
    return member.permissions.includes(permission);
  };

  const updatePermissions = async (familyId: string, memberId: string, permissions: string[]) => {
    try {
      await updateMember(familyId, memberId, { permissions });
    } catch (error) {
      console.error('Error updating permissions:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update permissions' });
    }
  };

  // Utility
  const exportFamilyData = async (familyId: string, format: 'json' | 'csv'): Promise<string> => {
    try {
      const family = getFamily(familyId);
      if (!family) {
        throw new Error('Family not found');
      }

      const data = {
        family,
        members: family.members,
        invitations: state.invitations.filter((i) => i.familyId === familyId),
        consentRecords: state.consentRecords.filter((c) => c.familyId === familyId),
        exportDate: new Date().toISOString(),
      };

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // Simple CSV conversion
        const csvRows = [
          'Type,ID,Name,Role,Status',
          `Family,${family.id},${family.name},Admin,Active`,
          ...family.members.map((member) =>
            `Member,${member.id},${member.userId},${member.role},${member.isActive ? 'Active' : 'Inactive'}`
          ),
        ];
        return csvRows.join('\n');
      }
    } catch (error) {
      console.error('Error exporting family data:', error);
      throw new Error('Failed to export family data');
    }
  };

  const importFamilyData = async (data: string, format: 'json' | 'csv'): Promise<void> => {
    try {
      if (format === 'json') {
        const importData = JSON.parse(data);
        
        if (importData.family) {
          await createFamily(importData.family);
        }
        
        if (importData.members) {
          for (const member of importData.members) {
            await addMember(importData.family.id, member);
          }
        }
      }
      // CSV import would be more complex and depends on the specific format
    } catch (error) {
      console.error('Error importing family data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import family data' });
    }
  };

  const value: FamilyAdminContextType = {
    state,
    dispatch,
    createFamily,
    updateFamily,
    deleteFamily,
    getFamily,
    setCurrentFamily,
    addMember,
    updateMember,
    removeMember,
    getMember,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    getInvitation,
    grantConsent,
    revokeConsent,
    getConsentRecord,
    checkPermission,
    updatePermissions,
    exportFamilyData,
    importFamilyData,
  };

  return <FamilyAdminContext.Provider value={value}>{children}</FamilyAdminContext.Provider>;
}

// Hook
export function useFamilyAdmin() {
  const context = useContext(FamilyAdminContext);
  if (context === undefined) {
    throw new Error('useFamilyAdmin must be used within a FamilyAdminProvider');
  }
  return context;
}
