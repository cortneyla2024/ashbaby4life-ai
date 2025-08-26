'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/context/AuthContext';
import { WidgetProvider } from '@/context/WidgetContext';
import { SearchProvider } from '@/context/SearchContext';
import { CommunityProvider } from '@/context/CommunityContext';
import { MarketplaceProvider } from '@/context/MarketplaceContext';
import { MediaProvider } from '@/context/MediaContext';
import { NewsProvider } from '@/context/NewsContext';
import { ProductivityProvider } from '@/context/ProductivityContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { LearningProvider } from '@/context/LearningContext';
import { EventsProvider } from '@/context/EventsContext';
import { DeviceMonitoringProvider } from '@/context/DeviceMonitoringContext';
import { SyncProvider } from '@/context/SyncContext';
import { PluginProvider } from '@/context/PluginContext';
import { CivicServicesProvider } from '@/context/CivicServicesContext';
import { ARVRProvider } from '@/context/ARVRContext';
import { FamilyAdminProvider } from '@/context/FamilyAdminContext';
import { ToasterProvider } from '@/components/ui/Toaster';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
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
          <WidgetProvider>
            <SearchProvider>
              <CommunityProvider>
                <MarketplaceProvider>
                  <MediaProvider>
                    <NewsProvider>
                      <ProductivityProvider>
                        <FinanceProvider>
                          <LearningProvider>
                            <EventsProvider>
                              <DeviceMonitoringProvider>
                                <SyncProvider>
                                  <PluginProvider>
                                    <CivicServicesProvider>
                                      <ARVRProvider>
                                        <FamilyAdminProvider>
                                          <ToasterProvider>
                                            {children}
                                          </ToasterProvider>
                                        </FamilyAdminProvider>
                                      </ARVRProvider>
                                    </CivicServicesProvider>
                                  </PluginProvider>
                                </SyncProvider>
                              </DeviceMonitoringProvider>
                            </EventsProvider>
                          </LearningProvider>
                        </FinanceProvider>
                      </ProductivityProvider>
                    </NewsProvider>
                  </MediaProvider>
                </MarketplaceProvider>
              </CommunityProvider>
            </SearchProvider>
          </WidgetProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
