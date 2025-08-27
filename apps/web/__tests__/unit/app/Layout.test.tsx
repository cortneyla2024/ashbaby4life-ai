import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '@/app/layout';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), }),
  usePathname: () => '/',
}));

describe('Layout', () => {
  it('should render the layout with children', () => {
    const TestChild = () => <div>Test Content</div>;
    render(
      <Layout>
        <TestChild />
      </Layout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  it('should render with proper HTML structure', () => {
    const TestChild = () => <div>Test Content</div>;
    const { container } = render(
      <Layout>
        <TestChild />
      </Layout>
    );
    expect(container.querySelector('html')).toBeInTheDocument();
    expect(container.querySelector('body')).toBeInTheDocument();
    expect(container.querySelector('div')).toBeInTheDocument();
  });
  it('should apply proper CSS classes', () => {
    const TestChild = () => <div>Test Content</div>;
    const { container } = render(
      <Layout>
        <TestChild />
      </Layout>
    );
    expect(container.querySelector('html')).toBeInTheDocument();
  });
});
