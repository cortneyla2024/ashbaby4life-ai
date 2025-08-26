import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render with default props', () => {
      render(<Card>Card content</Card>);
      
      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg border bg-card text-card-foreground shadow-sm');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-class">Custom Card</Card>);
      
      const card = screen.getByText('Custom Card');
      expect(card).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Ref Card</Card>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should pass through additional props', () => {
      render(<Card data-testid="card" aria-label="Test card">Props Card</Card>);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-label', 'Test card');
    });
  });

  describe('CardHeader', () => {
    it('should render with default props', () => {
      render(<CardHeader>Header content</CardHeader>);
      
      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex flex-col space-y-1.5 p-6');
    });

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header">Custom Header</CardHeader>);
      
      const header = screen.getByText('Custom Header');
      expect(header).toHaveClass('custom-header');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Ref Header</CardHeader>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardTitle', () => {
    it('should render with default props', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Card Title');
      expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight');
    });

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Custom Title</CardTitle>);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(<CardTitle ref={ref}>Ref Title</CardTitle>);
      
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });

  describe('CardDescription', () => {
    it('should render with default props', () => {
      render(<CardDescription>Card Description</CardDescription>);
      
      const description = screen.getByText('Card Description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm text-muted-foreground');
    });

    it('should apply custom className', () => {
      render(<CardDescription className="custom-description">Custom Description</CardDescription>);
      
      const description = screen.getByText('Custom Description');
      expect(description).toHaveClass('custom-description');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(<CardDescription ref={ref}>Ref Description</CardDescription>);
      
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });

  describe('CardContent', () => {
    it('should render with default props', () => {
      render(<CardContent>Content</CardContent>);
      
      const content = screen.getByText('Content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6 pt-0');
    });

    it('should apply custom className', () => {
      render(<CardContent className="custom-content">Custom Content</CardContent>);
      
      const content = screen.getByText('Custom Content');
      expect(content).toHaveClass('custom-content');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Ref Content</CardContent>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardFooter', () => {
    it('should render with default props', () => {
      render(<CardFooter>Footer content</CardFooter>);
      
      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex items-center p-6 pt-0');
    });

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer">Custom Footer</CardFooter>);
      
      const footer = screen.getByText('Custom Footer');
      expect(footer).toHaveClass('custom-footer');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Ref Footer</CardFooter>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Card Composition', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Title');
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Action');
    });

    it('should handle nested card components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Outer Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Inner Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Nested content</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      );

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveTextContent('Outer Card');
      expect(headings[1]).toHaveTextContent('Inner Card');
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });

    it('should handle empty card components', () => {
      render(
        <Card>
          <CardHeader />
          <CardContent />
          <CardFooter />
        </Card>
      );

      const cards = screen.getAllByRole('generic');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should handle card with only title', () => {
      render(
        <Card>
          <CardTitle>Title Only</CardTitle>
        </Card>
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title Only');
    });

    it('should handle card with only content', () => {
      render(
        <Card>
          <CardContent>Content Only</CardContent>
        </Card>
      );

      expect(screen.getByText('Content Only')).toBeInTheDocument();
    });

    it('should handle card with only footer', () => {
      render(
        <Card>
          <CardFooter>Footer Only</CardFooter>
        </Card>
      );

      expect(screen.getByText('Footer Only')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Sub Title</CardTitle>
              </CardHeader>
            </Card>
          </CardContent>
        </Card>
      );

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(2);
    });

    it('should pass through aria attributes', () => {
      render(
        <Card aria-label="Test card" role="article">
          <CardTitle aria-describedby="description">Accessible Title</CardTitle>
          <CardDescription id="description">Accessible description</CardDescription>
        </Card>
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Test card');
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveAttribute('aria-describedby', 'description');
    });
  });
});
