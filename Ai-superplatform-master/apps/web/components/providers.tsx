'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';
// TODO: Replace with actual package import when available
// import { AuthProvider } from '@vitality/auth';

// Temporary mock implementation
const AuthProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
// import { AnalyticsProvider } from '@vitality/analytics';
// import { NotificationsProvider } from '@vitality/notifications';
// import { EmotionDetectionProvider } from '@vitality/emotion-detection';
// import { VoiceProcessingProvider } from '@vitality/voice-processing';
// import { CollaborationProvider } from '@vitality/collaboration';
// import { FileStorageProvider } from '@vitality/file-storage';
// import { HealthTrackingProvider } from '@vitality/health-tracking';
// import { FinancialTrackingProvider } from '@vitality/financial-tracking';
// import { LearningTrackingProvider } from '@vitality/learning-tracking';
// import { GoalTrackingProvider } from '@vitality/goal-tracking';
// import { SocialNetworkProvider } from '@vitality/social-network';
// import { GovernmentResourcesProvider } from '@vitality/government-resources';
// import { LifeHacksProvider } from '@vitality/life-hacks';
// import { DocumentManagementProvider } from '@vitality/document-management';
// import { AutomationProvider } from '@vitality/automation';
// import { OptimizationProvider } from '@vitality/optimization';
// import { SecurityProvider } from '@vitality/security';
// import { MonitoringProvider } from '@vitality/monitoring';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

