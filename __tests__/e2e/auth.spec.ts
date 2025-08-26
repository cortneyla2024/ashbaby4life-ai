import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display login page with all required elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page).toHaveTitle(/Login/i);
    
    // Check for login form elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check for navigation links
    await expect(page.getByRole('link', { name: /don't have an account/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
  });

  test('should display signup page with all required elements', async ({ page }) => {
    await page.goto('/signup');
    
    // Check page title
    await expect(page).toHaveTitle(/Sign Up/i);
    
    // Check for signup form elements
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    
    // Check for navigation links
    await expect(page.getByRole('link', { name: /already have an account/i })).toBeVisible();
  });

  test('should successfully sign up a new user', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill out the signup form
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByLabel(/confirm password/i).fill('Password123!');
    
    // Submit the form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for successful signup and redirect
    await expect(page).toHaveURL('/dashboard');
    
    // Check that user is logged in
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should show validation errors for invalid signup data', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/full name is required/i)).toBeVisible();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
    
    // Fill with invalid data
    await page.getByLabel(/full name/i).fill('A');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('123');
    await page.getByLabel(/confirm password/i).fill('456');
    
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for specific validation errors
    await expect(page.getByText(/full name must be at least 2 characters/i)).toBeVisible();
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill out the login form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for successful login and redirect
    await expect(page).toHaveURL('/dashboard');
    
    // Check that user is logged in
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should navigate between login and signup pages', async ({ page }) => {
    // Start at login page
    await page.goto('/login');
    
    // Navigate to signup
    await page.getByRole('link', { name: /don't have an account/i }).click();
    await expect(page).toHaveURL('/signup');
    
    // Navigate back to login
    await page.getByRole('link', { name: /already have an account/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should successfully logout user', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Find and click logout button (assuming it's in a user menu or header)
    await page.getByRole('button', { name: /logout/i }).click();
    
    // Should be redirected to login page
    await expect(page).toHaveURL('/login');
    
    // Should not be able to access dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect authenticated users away from auth pages', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Try to access login page again
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');
    
    // Try to access signup page
    await page.goto('/signup');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected pages
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
    
    await page.goto('/profile');
    await expect(page).toHaveURL('/login');
    
    await page.goto('/settings');
    await expect(page).toHaveURL('/login');
  });

  test('should handle password visibility toggle', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.getByLabel(/password/i);
    
    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click password visibility toggle
    await page.getByRole('button', { name: /toggle password visibility/i }).click();
    
    // Password should be visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await page.getByRole('button', { name: /toggle password visibility/i }).click();
    
    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    await page.getByRole('link', { name: /forgot password/i }).click();
    
    // Should be on forgot password page
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();
    
    // Fill email
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();
    
    // Should show success message
    await expect(page.getByText(/reset link sent/i)).toBeVisible();
  });
});
