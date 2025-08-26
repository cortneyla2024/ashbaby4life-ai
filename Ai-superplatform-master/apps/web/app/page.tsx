import { Metadata } from 'next';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { AICompanion } from '@/components/sections/ai-companion';
import { LifeOptimization } from '@/components/sections/life-optimization';
import { HealthTracking } from '@/components/sections/health-tracking';
import { FinancialManagement } from '@/components/sections/financial-management';
import { LearningTracking } from '@/components/sections/learning-tracking';
import { SocialNetwork } from '@/components/sections/social-network';
import { GovernmentResources } from '@/components/sections/government-resources';
import { LifeHacks } from '@/components/sections/life-hacks';
import { DocumentManagement } from '@/components/sections/document-management';
import { Automation } from '@/components/sections/automation';
import { Testimonials } from '@/components/sections/testimonials';
import { Pricing } from '@/components/sections/pricing';
import { CTA } from '@/components/sections/cta';

export const metadata: Metadata = {
  title: 'Vitality AI - Your Complete Life Companion',
  description: 'The ultimate AI-powered platform for life optimization, health tracking, financial management, learning, and personal growth. Your complete life companion.',
  openGraph: {
    title: 'Vitality AI - Your Complete Life Companion',
    description: 'The ultimate AI-powered platform for life optimization, health tracking, financial management, learning, and personal growth.',
    url: 'http://localhost:3000',
    siteName: 'Vitality AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vitality AI - Your Complete Life Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitality AI - Your Complete Life Companion',
    description: 'The ultimate AI-powered platform for life optimization, health tracking, financial management, learning, and personal growth.',
    images: ['/og-image.png'],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <AICompanion />
      <LifeOptimization />
      <HealthTracking />
      <FinancialManagement />
      <LearningTracking />
      <SocialNetwork />
      <GovernmentResources />
      <LifeHacks />
      <DocumentManagement />
      <Automation />
      <Testimonials />
      <Pricing />
      <CTA />
    </div>
  );
}

