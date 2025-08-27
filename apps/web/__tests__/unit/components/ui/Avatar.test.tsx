import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';

describe('Avatar', () => {
  it('should render with default props', () => {
    const { container } = render(<Avatar />);
    const avatar = container.querySelector('[class*="relative flex h-10 w-10"]');
    expect(avatar).toBeInTheDocument();
  });
  it('should render with custom className', () => {
    const { container } = render(<Avatar className="custom-avatar" />);
    const avatar = container.querySelector('.custom-avatar');
    expect(avatar).toBeInTheDocument();
  });
});

describe('AvatarFallback', () => {
  it('should render with children within Avatar', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
  it('should apply custom className within Avatar', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback className="custom-fallback">JD</AvatarFallback>
      </Avatar>
    );
    const fallback = container.querySelector('.custom-fallback');
    expect(fallback).toBeInTheDocument();
  });
});

describe('Avatar Composition', () => {
  it('should render avatar with fallback', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
