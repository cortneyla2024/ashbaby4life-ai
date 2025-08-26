# Comprehensive Testing Guide

This document provides a complete guide to the testing infrastructure for the Hope Platform, including all test types, how to run them, and how to interpret results.

## Table of Contents

1. [Overview](#overview)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Test Configuration](#test-configuration)
5. [Coverage Reports](#coverage-reports)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Overview

The Hope Platform uses a comprehensive testing strategy that includes:

- **Unit Tests**: Testing individual components and functions in isolation
- **Integration Tests**: Testing how components work together
- **API Tests**: Testing backend API endpoints
- **E2E Tests**: Testing complete user workflows
- **Security Tests**: Vulnerability scanning and security validation
- **Performance Tests**: Load testing and performance benchmarking

## Test Types

### 1. Unit Tests

Unit tests verify that individual functions, components, and modules work correctly in isolation.

**Location**: `__tests__/unit/`
**Framework**: Jest + React Testing Library
**Coverage Target**: 80%+

**Example**:
```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

### 2. Integration Tests

Integration tests verify that multiple components work together correctly.

**Location**: `__tests__/integration/`
**Framework**: Jest + MSW (Mock Service Worker)
**Coverage Target**: 70%+

**Example**:
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { LoginForm } from '@/components/auth/LoginForm'

const server = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({ success: true, token: 'mock-token' }))
  })
)

describe('Login Flow', () => {
  it('should login successfully', async () => {
    render(<LoginForm />)
    // Test complete login flow
  })
})
```

### 3. API Tests

API tests verify that backend endpoints work correctly and return expected responses.

**Location**: `__tests__/api/`
**Framework**: Jest + Supertest
**Coverage Target**: 90%+

**Example**:
```typescript
import request from 'supertest'
import { app } from '@/app'

describe('Auth API', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200)
    
    expect(response.body).toHaveProperty('token')
  })
})
```

### 4. E2E Tests

End-to-end tests verify complete user workflows from start to finish.

**Location**: `e2e/`
**Framework**: Playwright
**Coverage Target**: Critical user paths

**Example**:
```typescript
import { test, expect } from '@playwright/test'

test('complete user registration flow', async ({ page }) => {
  await page.goto('/signup')
  await page.fill('[data-testid="name-input"]', 'Test User')
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="password-input"]', 'password123')
  await page.click('text=Create Account')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('Welcome')).toBeVisible()
})
```

### 5. Security Tests

Security tests scan for vulnerabilities and validate security measures.

**Tools**: npm audit, Snyk, OWASP ZAP
**Frequency**: On every PR and daily

### 6. Performance Tests

Performance tests measure application performance and load handling.

**Tools**: Lighthouse CI, Artillery
**Targets**: Core Web Vitals, Load testing

## Running Tests

### Quick Start

Run all tests with coverage:
```bash
# Using the test runner script
./scripts/test-runner.sh  # Linux/Mac
scripts/test-runner.bat   # Windows

# Or manually
pnpm test
```

### Individual Test Types

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# API tests
pnpm test --testPathPattern="__tests__/api"

# Security tests
pnpm security:audit

# Performance tests
pnpm test:performance
```

### Test Options

```bash
# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests in CI mode (no watch, coverage enabled)
pnpm ci:test

# Run specific test file
pnpm test --testPathPattern="Button.test.tsx"

# Run tests matching a pattern
pnpm test --testNamePattern="login"
```

### Environment Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Setup database** (for integration/API tests):
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

3. **Install Playwright browsers** (for E2E tests):
   ```bash
   npx playwright install
   ```

4. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

## Test Configuration

### Jest Configuration

The main Jest configuration is in `jest.config.js`:

```javascript
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### Playwright Configuration

E2E tests are configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

### Turbo Configuration

The monorepo uses Turbo for efficient test execution:

```json
{
  "pipeline": {
    "test": {
      "dependsOn": ["^test"],
      "outputs": ["coverage/**"]
    },
    "test:unit": {
      "dependsOn": ["^test:unit"],
      "outputs": ["coverage/**"]
    },
    "test:integration": {
      "dependsOn": ["^test:integration"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["^test:e2e"],
      "outputs": ["test-results/**", "playwright-report/**"]
    }
  }
}
```

## Coverage Reports

### Coverage Types

1. **Line Coverage**: Percentage of code lines executed
2. **Branch Coverage**: Percentage of conditional branches executed
3. **Function Coverage**: Percentage of functions called
4. **Statement Coverage**: Percentage of statements executed

### Coverage Targets

- **Unit Tests**: 80%+ overall coverage
- **Integration Tests**: 70%+ overall coverage
- **API Tests**: 90%+ overall coverage

### Viewing Coverage

```bash
# Generate coverage report
pnpm test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html
```

### Coverage Reports Location

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Report**: `coverage/coverage-final.json`

## CI/CD Integration

### GitHub Actions

The project uses GitHub Actions for continuous testing:

```yaml
name: Comprehensive Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm test:unit
```

### Test Workflow

1. **Unit Tests** → **Integration Tests** → **API Tests** → **E2E Tests** → **Security Tests** → **Performance Tests**

2. **Artifacts**: Test results, coverage reports, and performance metrics are uploaded as artifacts

3. **Notifications**: Test results are commented on PRs and sent to Slack/Discord

### Pre-commit Hooks

Husky and lint-staged ensure code quality:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. **Tests failing due to missing dependencies**:
   ```bash
   pnpm install
   pnpm db:generate
   ```

2. **E2E tests failing due to missing browsers**:
   ```bash
   npx playwright install
   ```

3. **Database connection issues**:
   ```bash
   # Check if database is running
   pnpm db:studio
   
   # Reset database
   pnpm db:push --force-reset
   ```

4. **Memory issues with large test suites**:
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" pnpm test
   ```

### Debug Mode

```bash
# Run tests in debug mode
pnpm test:debug

# Run specific test in debug mode
pnpm test --testNamePattern="login" --verbose
```

### Performance Issues

```bash
# Run tests with performance profiling
NODE_OPTIONS="--prof" pnpm test

# Analyze performance data
node --prof-process isolate-*.log > processed.txt
```

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**:
   ```typescript
   describe('UserService', () => {
     it('should create user', async () => {
       // Arrange
       const userData = { name: 'John', email: 'john@example.com' }
       
       // Act
       const result = await userService.createUser(userData)
       
       // Assert
       expect(result).toHaveProperty('id')
       expect(result.name).toBe(userData.name)
     })
   })
   ```

2. **Use descriptive test names**:
   ```typescript
   // Good
   it('should return 401 when invalid credentials provided')
   
   // Bad
   it('should work')
   ```

3. **Test one thing at a time**:
   ```typescript
   // Good - separate tests
   it('should validate email format')
   it('should validate password strength')
   it('should create user when valid data provided')
   
   // Bad - testing multiple things
   it('should handle user registration')
   ```

4. **Use proper assertions**:
   ```typescript
   // Good
   expect(user).toHaveProperty('id')
   expect(response.status).toBe(200)
   expect(screen.getByText('Welcome')).toBeInTheDocument()
   
   // Bad
   expect(user).toBeTruthy()
   ```

### Test Organization

1. **Group related tests**:
   ```typescript
   describe('Authentication', () => {
     describe('Login', () => {
       it('should login with valid credentials')
       it('should fail with invalid credentials')
     })
     
     describe('Registration', () => {
       it('should register new user')
       it('should fail with existing email')
     })
   })
   ```

2. **Use setup and teardown**:
   ```typescript
   describe('UserService', () => {
     beforeEach(() => {
       // Setup test database
     })
     
     afterEach(() => {
       // Clean up test data
     })
   })
   ```

### Mocking

1. **Mock external dependencies**:
   ```typescript
   jest.mock('@/lib/api', () => ({
     fetchUser: jest.fn()
   }))
   ```

2. **Use MSW for API mocking**:
   ```typescript
   const server = setupServer(
     rest.get('/api/user', (req, res, ctx) => {
       return res(ctx.json({ id: 1, name: 'John' }))
     })
   )
   ```

### Performance Testing

1. **Test critical user paths**:
   - User registration/login
   - Core application features
   - Data-heavy operations

2. **Set realistic performance targets**:
   - Page load time < 3 seconds
   - API response time < 500ms
   - Database queries < 100ms

3. **Monitor performance trends**:
   - Track performance over time
   - Set up alerts for performance regressions
   - Use performance budgets

## Contributing

When adding new tests:

1. **Follow existing patterns** and conventions
2. **Add tests for new features** before merging
3. **Update documentation** if needed
4. **Ensure coverage targets** are met
5. **Run full test suite** before submitting PR

## Support

For testing-related issues:

1. Check the troubleshooting section above
2. Review existing test examples
3. Consult the testing documentation
4. Open an issue with detailed information

---

**Remember**: Good tests are an investment in code quality and developer productivity. Write tests that are maintainable, reliable, and provide value to the development process.
