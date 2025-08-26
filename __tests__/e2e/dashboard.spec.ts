import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard with all main sections', async ({ page }) => {
    // Check for main dashboard elements
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    
    // Check for navigation menu
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /finance/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /ai assistant/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
    
    // Check for user menu
    await expect(page.getByRole('button', { name: /user menu/i })).toBeVisible();
  });

  test('should display financial overview cards', async ({ page }) => {
    // Check for financial summary cards
    await expect(page.getByText(/total balance/i)).toBeVisible();
    await expect(page.getByText(/monthly income/i)).toBeVisible();
    await expect(page.getByText(/monthly expenses/i)).toBeVisible();
    await expect(page.getByText(/savings rate/i)).toBeVisible();
    
    // Check that values are displayed (even if 0)
    await expect(page.getByText(/\$[\d,]+/)).toBeVisible();
  });

  test('should display recent transactions', async ({ page }) => {
    // Check for transactions section
    await expect(page.getByRole('heading', { name: /recent transactions/i })).toBeVisible();
    
    // Check for transaction list or empty state
    const transactionList = page.locator('[data-testid="transactions-list"]');
    const emptyState = page.getByText(/no transactions yet/i);
    
    // Either transactions should be visible or empty state
    await expect(transactionList.or(emptyState)).toBeVisible();
  });

  test('should display quick actions', async ({ page }) => {
    // Check for quick action buttons
    await expect(page.getByRole('button', { name: /add transaction/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create budget/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add account/i })).toBeVisible();
  });

  test('should navigate to finance section', async ({ page }) => {
    // Click on finance link
    await page.getByRole('link', { name: /finance/i }).click();
    
    // Should be on finance page
    await expect(page).toHaveURL('/finance');
    await expect(page.getByRole('heading', { name: /finance/i })).toBeVisible();
  });

  test('should navigate to AI assistant section', async ({ page }) => {
    // Click on AI assistant link
    await page.getByRole('link', { name: /ai assistant/i }).click();
    
    // Should be on AI assistant page
    await expect(page).toHaveURL('/ai-assistant');
    await expect(page.getByRole('heading', { name: /ai assistant/i })).toBeVisible();
  });

  test('should navigate to profile section', async ({ page }) => {
    // Click on profile link
    await page.getByRole('link', { name: /profile/i }).click();
    
    // Should be on profile page
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });

  test('should open user menu and show options', async ({ page }) => {
    // Click user menu button
    await page.getByRole('button', { name: /user menu/i }).click();
    
    // Check for menu options
    await expect(page.getByRole('menuitem', { name: /profile/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /settings/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /logout/i })).toBeVisible();
  });

  test('should add a new transaction from dashboard', async ({ page }) => {
    // Click add transaction button
    await page.getByRole('button', { name: /add transaction/i }).click();
    
    // Should open transaction modal or navigate to transaction page
    const modal = page.locator('[data-testid="transaction-modal"]');
    const transactionPage = page.getByRole('heading', { name: /add transaction/i });
    
    await expect(modal.or(transactionPage)).toBeVisible();
    
    // Fill transaction details
    await page.getByLabel(/description/i).fill('Test Transaction');
    await page.getByLabel(/amount/i).fill('100');
    await page.getByLabel(/category/i).selectOption('Food');
    await page.getByLabel(/type/i).selectOption('expense');
    
    // Submit transaction
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show success message
    await expect(page.getByText(/transaction added successfully/i)).toBeVisible();
    
    // Should return to dashboard or update transaction list
    await expect(page.getByText(/test transaction/i)).toBeVisible();
  });

  test('should create a new budget from dashboard', async ({ page }) => {
    // Click create budget button
    await page.getByRole('button', { name: /create budget/i }).click();
    
    // Should open budget modal or navigate to budget page
    const modal = page.locator('[data-testid="budget-modal"]');
    const budgetPage = page.getByRole('heading', { name: /create budget/i });
    
    await expect(modal.or(budgetPage)).toBeVisible();
    
    // Fill budget details
    await page.getByLabel(/name/i).fill('Monthly Budget');
    await page.getByLabel(/amount/i).fill('2000');
    await page.getByLabel(/category/i).selectOption('General');
    
    // Submit budget
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show success message
    await expect(page.getByText(/budget created successfully/i)).toBeVisible();
  });

  test('should add a new account from dashboard', async ({ page }) => {
    // Click add account button
    await page.getByRole('button', { name: /add account/i }).click();
    
    // Should open account modal or navigate to account page
    const modal = page.locator('[data-testid="account-modal"]');
    const accountPage = page.getByRole('heading', { name: /add account/i });
    
    await expect(modal.or(accountPage)).toBeVisible();
    
    // Fill account details
    await page.getByLabel(/name/i).fill('Savings Account');
    await page.getByLabel(/type/i).selectOption('savings');
    await page.getByLabel(/balance/i).fill('5000');
    
    // Submit account
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show success message
    await expect(page.getByText(/account added successfully/i)).toBeVisible();
  });

  test('should display notifications', async ({ page }) => {
    // Check for notifications area
    const notificationsArea = page.locator('[data-testid="notifications-area"]');
    
    if (await notificationsArea.isVisible()) {
      // If notifications exist, check their structure
      await expect(notificationsArea).toBeVisible();
    } else {
      // If no notifications, check for empty state
      await expect(page.getByText(/no notifications/i)).toBeVisible();
    }
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile menu is accessible
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Open mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Check that navigation links are visible in mobile menu
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /finance/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /ai assistant/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
  });

  test('should refresh dashboard data', async ({ page }) => {
    // Get initial data
    const initialBalance = await page.locator('[data-testid="total-balance"]').textContent();
    
    // Refresh the page
    await page.reload();
    
    // Wait for dashboard to load again
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    
    // Check that data is still displayed
    await expect(page.locator('[data-testid="total-balance"]')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Navigate to dashboard (should show loading initially)
    await page.goto('/dashboard');
    
    // Check for loading indicators
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    const skeletonLoader = page.locator('[data-testid="skeleton-loader"]');
    
    // Either loading spinner or skeleton should be visible initially
    await expect(loadingSpinner.or(skeletonLoader)).toBeVisible();
    
    // Wait for content to load
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    
    // Loading indicators should be gone
    await expect(loadingSpinner).not.toBeVisible();
    await expect(skeletonLoader).not.toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network error by intercepting API calls
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Should show error message
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
    
    // Restore network
    await page.unroute('**/api/**');
    
    // Click retry
    await page.getByRole('button', { name: /retry/i }).click();
    
    // Should load successfully
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
