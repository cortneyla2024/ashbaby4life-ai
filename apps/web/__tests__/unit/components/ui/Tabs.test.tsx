import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

// Mock Radix UI Tabs to avoid complex interactions in unit tests
jest.mock('@radix-ui/react-tabs', () => ({
  Root: ({ children, defaultValue, value, onValueChange, ...props }: any) => (
    <div data-testid="tabs-root" {...props}>
      {children}
    </div>
  ),
  List: React.forwardRef(({ children, className, ...props }: any, ref) => (
    <div ref={ref} data-testid="tabs-list" className={className} {...props}>
      {children}
    </div>
  )),
  Trigger: React.forwardRef(({ children, value, className, ...props }: any, ref) => (
    <button
      ref={ref}
      data-testid="tabs-trigger"
      data-value={value}
      className={className}
      onClick={() => props.onClick?.()}
      {...props}
    >
      {children}
    </button>
  )),
  Content: React.forwardRef(({ children, value, className, ...props }: any, ref) => (
    <div ref={ref} data-testid="tabs-content" data-value={value} className={className} {...props}>
      {children}
    </div>
  )),
}));

describe('Tabs', () => {
  describe('Tabs Root', () => {
    it('should render with default props', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      
      expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
    });

    it('should pass through additional props', () => {
      render(
        <Tabs data-testid="custom-tabs" aria-label="Test tabs">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      
      const tabsRoot = screen.getByTestId('custom-tabs');
      expect(tabsRoot).toHaveAttribute('aria-label', 'Test tabs');
    });

    it('should render with children', () => {
      render(
        <Tabs>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-content')).toBeInTheDocument();
    });
  });

  describe('TabsList', () => {
    it('should render with default styling', () => {
      render(
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass('inline-flex', 'h-10', 'items-center', 'justify-center', 'rounded-md', 'bg-muted', 'p-1', 'text-muted-foreground');
    });

    it('should apply custom className', () => {
      render(
        <TabsList className="custom-tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      );
      
      const tabsList = screen.getByTestId('tabs-list');
      expect(tabsList).toHaveClass('custom-tabs-list');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <TabsList ref={ref}>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      );
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should pass through additional props', () => {
      render(
        <TabsList data-testid="custom-list" aria-label="Tab list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      );
      
      const tabsList = screen.getByTestId('custom-list');
      expect(tabsList).toHaveAttribute('aria-label', 'Tab list');
    });

    it('should render multiple triggers', () => {
      render(
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
      );
      
      const triggers = screen.getAllByTestId('tabs-trigger');
      expect(triggers).toHaveLength(3);
      expect(triggers[0]).toHaveTextContent('Tab 1');
      expect(triggers[1]).toHaveTextContent('Tab 2');
      expect(triggers[2]).toHaveTextContent('Tab 3');
    });
  });

  describe('TabsTrigger', () => {
    it('should render with default styling', () => {
      render(<TabsTrigger value="tab1">Tab 1</TabsTrigger>);
      
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveClass('inline-flex', 'items-center', 'justify-center', 'whitespace-nowrap', 'rounded-sm', 'px-3', 'py-1.5', 'text-sm', 'font-medium');
    });

    it('should render with correct value', () => {
      render(<TabsTrigger value="tab1">Tab 1</TabsTrigger>);
      
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveAttribute('data-value', 'tab1');
    });

    it('should render with children', () => {
      render(<TabsTrigger value="tab1">Custom Tab Label</TabsTrigger>);
      
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveTextContent('Custom Tab Label');
    });

    it('should apply custom className', () => {
      render(<TabsTrigger value="tab1" className="custom-trigger">Tab 1</TabsTrigger>);
      
      const trigger = screen.getByTestId('tabs-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<TabsTrigger ref={ref} value="tab1">Tab 1</TabsTrigger>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(<TabsTrigger value="tab1" onClick={handleClick}>Tab 1</TabsTrigger>);
      
      const trigger = screen.getByTestId('tabs-trigger');
      fireEvent.click(trigger);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should pass through additional props', () => {
      render(<TabsTrigger value="tab1" data-testid="custom-trigger" aria-label="Custom tab">Tab 1</TabsTrigger>);
      
      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Custom tab');
    });

    it('should be accessible', () => {
      render(<TabsTrigger value="tab1" aria-label="First tab">Tab 1</TabsTrigger>);
      
      const trigger = screen.getByLabelText('First tab');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('TabsContent', () => {
    it('should render with default styling', () => {
      render(<TabsContent value="tab1">Content 1</TabsContent>);
      
      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveClass('mt-2', 'ring-offset-background', 'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring', 'focus-visible:ring-offset-2');
    });

    it('should render with correct value', () => {
      render(<TabsContent value="tab1">Content 1</TabsContent>);
      
      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveAttribute('data-value', 'tab1');
    });

    it('should render with children', () => {
      render(<TabsContent value="tab1">Custom content with <strong>bold text</strong></TabsContent>);
      
      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveTextContent('Custom content with');
      expect(content.querySelector('strong')).toHaveTextContent('bold text');
    });

    it('should apply custom className', () => {
      render(<TabsContent value="tab1" className="custom-content">Content 1</TabsContent>);
      
      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveClass('custom-content');
    });

    it('should forward ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<TabsContent ref={ref} value="tab1">Content 1</TabsContent>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should pass through additional props', () => {
      render(<TabsContent value="tab1" data-testid="custom-content" aria-label="Tab content">Content 1</TabsContent>);
      
      const content = screen.getByTestId('custom-content');
      expect(content).toHaveAttribute('aria-label', 'Tab content');
    });

    it('should render complex content', () => {
      render(
        <TabsContent value="tab1">
          <div>
            <h2>Title</h2>
            <p>Paragraph content</p>
            <button>Action</button>
          </div>
        </TabsContent>
      );
      
      const content = screen.getByTestId('tabs-content');
      expect(content).toHaveTextContent('Title');
      expect(content).toHaveTextContent('Paragraph content');
      expect(content.querySelector('button')).toHaveTextContent('Action');
    });
  });

  describe('Complete Tabs Integration', () => {
    it('should render a complete tabs component', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p>Account settings content</p>
          </TabsContent>
          <TabsContent value="tab2">
            <p>Password settings content</p>
          </TabsContent>
        </Tabs>
      );
      
      expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
      expect(screen.getAllByTestId('tabs-trigger')).toHaveLength(2);
      expect(screen.getAllByTestId('tabs-content')).toHaveLength(2);
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByText('Account settings content')).toBeInTheDocument();
      expect(screen.getByText('Password settings content')).toBeInTheDocument();
    });

    it('should handle multiple tabs with different content types', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Form</TabsTrigger>
            <TabsTrigger value="tab2">List</TabsTrigger>
            <TabsTrigger value="tab3">Chart</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <input placeholder="Enter name" />
            <button>Submit</button>
          </TabsContent>
          <TabsContent value="tab2">
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </TabsContent>
          <TabsContent value="tab3">
            <div>Chart placeholder</div>
          </TabsContent>
        </Tabs>
      );
      
      expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Chart placeholder')).toBeInTheDocument();
    });
  });
});
