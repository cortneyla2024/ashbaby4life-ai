import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EducationPage from '@/app/education/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
}));
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('EducationPage', () => {
  beforeEach(() => {
    render(<EducationPage />);
  });

  it('should render the education hub with correct title', () => {
    const badges = screen.getAllByText('Education Hub');
    expect(badges.length).toBeGreaterThan(0);
    expect(screen.getByText(/AI-powered learning with personalized teaching/)).toBeInTheDocument();
  });

  it('should display all tabs', () => {
    const myCoursesElements = screen.getAllByText('My Courses');
    expect(myCoursesElements.length).toBeGreaterThan(0);
    expect(screen.getByText('AI Teaching')).toBeInTheDocument();
    expect(screen.getByText('Video Conferencing')).toBeInTheDocument();
    const progressElements = screen.getAllByText('Progress');
    expect(progressElements.length).toBeGreaterThan(0);
  });

  it('should show education hub badge in header', () => {
    const badges = screen.getAllByText('Education Hub');
    expect(badges.length).toBeGreaterThan(0);
  });
});
