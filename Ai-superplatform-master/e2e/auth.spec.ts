import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form', async ({ page }) => {
    // Navigate to login
    await page.click('text=Login')
    
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should display signup form', async ({ page }) => {
    // Navigate to signup
    await page.click('text=Sign Up')
    
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('should validate required fields on login', async ({ page }) => {
    await page.click('text=Login')
    await page.click('text=Sign In')
    
    // Should show validation errors
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should validate email format on login', async ({ page }) => {
    await page.click('text=Login')
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Sign In')
    
    await expect(page.getByText('Invalid email format')).toBeVisible()
  })

  test('should validate required fields on signup', async ({ page }) => {
    await page.click('text=Sign Up')
    await page.click('text=Create Account')
    
    // Should show validation errors
    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Username is required')).toBeVisible()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should validate password strength on signup', async ({ page }) => {
    await page.click('text=Sign Up')
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="username-input"]', 'testuser')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'weak')
    await page.click('text=Create Account')
    
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Login')
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('text=Sign In')
    
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })

  test('should successfully register new user', async ({ page }) => {
    const testEmail = `test${Date.now()}@example.com`
    const testUsername = `testuser${Date.now()}`
    
    await page.click('text=Sign Up')
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="username-input"]', testUsername)
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Create Account')
    
    // Should redirect to dashboard or show success message
    await expect(page.getByText('Account created successfully')).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    // First create a user
    const testEmail = `test${Date.now()}@example.com`
    const testUsername = `testuser${Date.now()}`
    
    await page.click('text=Sign Up')
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="username-input"]', testUsername)
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Create Account')
    
    // Wait for account creation
    await page.waitForSelector('text=Account created successfully')
    
    // Now login
    await page.click('text=Login')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Sign In')
    
    // Should redirect to dashboard
    await expect(page.getByText('AI Life Companion')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    const testEmail = `test${Date.now()}@example.com`
    const testUsername = `testuser${Date.now()}`
    
    await page.click('text=Sign Up')
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="username-input"]', testUsername)
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Create Account')
    
    await page.waitForSelector('text=Account created successfully')
    
    await page.click('text=Login')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Sign In')
    
    // Now logout
    await page.click('[data-testid="logout-button"]')
    
    // Should redirect to home page
    await expect(page.getByText('Get started by creating an account')).toBeVisible()
  })

  test('should persist login state', async ({ page }) => {
    // Login
    const testEmail = `test${Date.now()}@example.com`
    const testUsername = `testuser${Date.now()}`
    
    await page.click('text=Sign Up')
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="username-input"]', testUsername)
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Create Account')
    
    await page.waitForSelector('text=Account created successfully')
    
    await page.click('text=Login')
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Sign In')
    
    // Refresh page
    await page.reload()
    
    // Should still be logged in
    await expect(page.getByText('AI Life Companion')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/auth/login', route => route.abort())
    
    await page.click('text=Login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Sign In')
    
    await expect(page.getByText('Network error. Please try again.')).toBeVisible()
  })
})
