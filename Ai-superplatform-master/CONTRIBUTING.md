# Contributing to steward-omni-max

Thank you for your interest in contributing to steward-omni-max! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We are committed to providing a welcoming and inclusive environment for all contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Setup** the development environment
4. **Create** a feature branch
5. **Make** your changes
6. **Test** your changes
7. **Submit** a pull request

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/steward-omni-max.git
cd steward-omni-max

# Setup development environment
make setup

# Create feature branch
git checkout -b feature/your-feature-name

# Start development
make up PROFILE=free
```

## 📋 Development Guidelines

### Code Standards

#### TypeScript
- **Strict Mode:** All TypeScript files must use strict mode
- **No `any`:** Use proper types, avoid `any` type
- **Interfaces:** Prefer interfaces over types for object shapes
- **Exports:** Use named exports over default exports

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name?: string;
}

export const createUser = (data: User): Promise<User> => {
  // implementation
};

// ❌ Avoid
export default function createUser(data: any) {
  // implementation
}
```

#### React Components
- **Functional Components:** Use functional components with hooks
- **Props Interface:** Define props interface for each component
- **Error Boundaries:** Wrap components in error boundaries where appropriate
- **Accessibility:** Include proper ARIA labels and semantic HTML

```typescript
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </button>
  );
};
```

#### Testing
- **Coverage:** Maintain 90%+ test coverage
- **Unit Tests:** Test individual functions and components
- **Integration Tests:** Test component interactions
- **E2E Tests:** Test user workflows with Playwright

```typescript
// ✅ Good test example
describe('Button Component', () => {
  it('should render with correct props', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
```

### Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

#### Examples
```bash
feat(auth): add OAuth2 provider support
fix(api): resolve database connection timeout
docs(readme): update installation instructions
test(components): add unit tests for Button component
```

### Pull Request Process

1. **Create** a feature branch from `main`
2. **Make** your changes following the guidelines
3. **Test** your changes thoroughly
4. **Update** documentation if needed
5. **Submit** a pull request with a clear description

#### PR Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Accessibility requirements met
```

## 🏗️ Project Structure

### Apps
- `apps/web/` - Next.js web application
- `apps/api/` - NestJS API server
- `apps/broker/` - Job broker and automation
- `apps/ext/` - Browser extension
- `apps/mobile/` - React Native mobile app
- `apps/desktop/` - Tauri desktop app
- `apps/docs/` - Docusaurus documentation

### Packages
- `packages/ui/` - Design system components
- `packages/types/` - Shared TypeScript types
- `packages/config/` - Shared configuration
- `packages/connectors/` - External service connectors
- `packages/agents/` - AI agent implementations
- `packages/guards/` - Authorization and security
- `packages/media/` - Audio and video processing
- `packages/crdt/` - Conflict resolution and sync

## 🧪 Testing

### Running Tests
```bash
# All tests
make test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Accessibility tests
pnpm test:axe
```

### Test Coverage
- **Minimum:** 90% coverage required
- **Target:** 95% coverage
- **Tools:** Jest for unit tests, Playwright for E2E

### Testing Guidelines
- **Unit Tests:** Test individual functions and components
- **Integration Tests:** Test component interactions and API endpoints
- **E2E Tests:** Test complete user workflows
- **Accessibility Tests:** Ensure WCAG AA compliance

## 🔒 Security

### Security Guidelines
- **Input Validation:** Validate all user inputs
- **Authentication:** Use secure authentication methods
- **Authorization:** Implement proper access controls
- **Data Protection:** Encrypt sensitive data
- **Dependencies:** Keep dependencies updated

### Reporting Security Issues
- **Email:** security@steward-omni-max.org
- **Process:** We follow responsible disclosure
- **Response:** We aim to respond within 48 hours

## 📚 Documentation

### Documentation Standards
- **Clear:** Write clear, concise documentation
- **Complete:** Include all necessary information
- **Current:** Keep documentation up to date
- **Accessible:** Use plain language and examples

### Documentation Types
- **API Documentation:** OpenAPI/Swagger specs
- **Component Documentation:** Storybook stories
- **Architecture Documentation:** ADRs and diagrams
- **User Documentation:** Guides and tutorials

## 🚀 Deployment

### Development Deployment
```bash
# Start development environment
make up PROFILE=free

# Access services
# Web: http://localhost:3000
# API: http://localhost:4000
# Docs: http://localhost:3001
```

### Production Deployment
```bash
# Build production images
make release PROFILE=free

# Deploy to production
make deploy PROFILE=free
```

## 🤝 Community

### Getting Help
- **Documentation:** Check the docs first
- **Issues:** Search existing issues
- **Discussions:** Use GitHub Discussions
- **Chat:** Join our community chat

### Recognition
- **Contributors:** All contributors are recognized
- **Hall of Fame:** Special recognition for significant contributions
- **Badges:** Earn badges for different contribution types

## 📄 License

By contributing to steward-omni-max, you agree that your contributions will be licensed under the same license as the project (AGPL-3.0).

## 🙏 Acknowledgments

Thank you to all contributors who make steward-omni-max possible! Your contributions help create a better, more accessible, and more secure platform for everyone.

---

**Together, we build the future of privacy-first AI assistance.**
