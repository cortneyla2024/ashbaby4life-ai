import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard')
  })

  test('should display dashboard after successful login', async ({ page }) => {
    // First login
    await page.goto('/')
    await page.click('text=Login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('text=Sign In')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('should display user profile information', async ({ page }) => {
    await expect(page.getByText('Test User')).toBeVisible()
    await expect(page.getByText('test@example.com')).toBeVisible()
  })

  test('should display navigation menu', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible()
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('AI Chat')).toBeVisible()
    await expect(page.getByText('Goals')).toBeVisible()
    await expect(page.getByText('Health')).toBeVisible()
    await expect(page.getByText('Finance')).toBeVisible()
    await expect(page.getByText('Settings')).toBeVisible()
  })

  test('should display quick stats cards', async ({ page }) => {
    await expect(page.getByText('Goals Completed')).toBeVisible()
    await expect(page.getByText('Health Score')).toBeVisible()
    await expect(page.getByText('Financial Health')).toBeVisible()
    await expect(page.getByText('AI Sessions')).toBeVisible()
  })

  test('should display recent activities', async ({ page }) => {
    await expect(page.getByText('Recent Activities')).toBeVisible()
    // Check for activity items
    await expect(page.locator('[data-testid="activity-item"]')).toHaveCount(5)
  })

  test('should display upcoming tasks', async ({ page }) => {
    await expect(page.getByText('Upcoming Tasks')).toBeVisible()
    // Check for task items
    await expect(page.locator('[data-testid="task-item"]')).toHaveCount(3)
  })

  test('should allow navigation to different sections', async ({ page }) => {
    // Navigate to AI Chat
    await page.click('text=AI Chat')
    await expect(page).toHaveURL('/ai-chat')
    await expect(page.getByText('AI Life Companion')).toBeVisible()

    // Navigate to Goals
    await page.click('text=Goals')
    await expect(page).toHaveURL('/goals')
    await expect(page.getByText('Your Goals')).toBeVisible()

    // Navigate to Health
    await page.click('text=Health')
    await expect(page).toHaveURL('/health')
    await expect(page.getByText('Health Dashboard')).toBeVisible()

    // Navigate to Finance
    await page.click('text=Finance')
    await expect(page).toHaveURL('/finance')
    await expect(page.getByText('Financial Overview')).toBeVisible()
  })

  test('should allow user to logout', async ({ page }) => {
    // Click on user menu
    await page.click('[data-testid="user-menu"]')
    
    // Click logout
    await page.click('text=Logout')
    
    // Should redirect to login page
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Welcome to Hope')).toBeVisible()
  })

  test('should display notifications', async ({ page }) => {
    // Check for notification bell
    await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible()
    
    // Click on notification bell
    await page.click('[data-testid="notification-bell"]')
    
    // Should show notification panel
    await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible()
  })

  test('should allow search functionality', async ({ page }) => {
    // Check for search input
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
    
    // Type in search
    await page.fill('[data-testid="search-input"]', 'goal')
    
    // Should show search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
  })

  test('should display responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check for mobile menu button
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    
    // Click mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    
    // Should show mobile navigation
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible()
  })

  test('should handle dark mode toggle', async ({ page }) => {
    // Check for theme toggle
    await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible()
    
    // Click theme toggle
    await page.click('[data-testid="theme-toggle"]')
    
    // Should apply dark mode classes
    await expect(page.locator('html')).toHaveClass(/dark/)
    
    // Click again to toggle back
    await page.click('[data-testid="theme-toggle"]')
    
    // Should remove dark mode classes
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('should display loading states', async ({ page }) => {
    // Trigger a loading action (e.g., refresh data)
    await page.click('[data-testid="refresh-data"]')
    
    // Should show loading spinner
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
    
    // Wait for loading to complete
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible()
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Simulate an error by intercepting API calls
    await page.route('**/api/dashboard/stats', route => {
      route.fulfill({ status: 500, body: 'Internal Server Error' })
    })
    
    // Refresh the page to trigger the error
    await page.reload()
    
    // Should show error message
    await expect(page.getByText('Something went wrong')).toBeVisible()
    await expect(page.getByText('Please try again later')).toBeVisible()
  })

  test('should allow quick actions', async ({ page }) => {
    // Check for quick action buttons
    await expect(page.getByText('Add Goal')).toBeVisible()
    await expect(page.getByText('Start AI Chat')).toBeVisible()
    await expect(page.getByText('Log Health')).toBeVisible()
    
    // Click on Add Goal
    await page.click('text=Add Goal')
    
    // Should open goal creation modal
    await expect(page.locator('[data-testid="goal-modal"]')).toBeVisible()
    
    // Close modal
    await page.click('[data-testid="close-modal"]')
    
    // Modal should be hidden
    await expect(page.locator('[data-testid="goal-modal"]')).not.toBeVisible()
  })

  test('should display progress charts', async ({ page }) => {
    // Check for progress charts
    await expect(page.locator('[data-testid="goals-progress-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="health-progress-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="finance-progress-chart"]')).toBeVisible()
  })

  test('should allow data export', async ({ page }) => {
    // Click on export button
    await page.click('[data-testid="export-data"]')
    
    // Should show export options
    await expect(page.getByText('Export as PDF')).toBeVisible()
    await expect(page.getByText('Export as CSV')).toBeVisible()
    
    // Click on PDF export
    await page.click('text=Export as PDF')
    
    // Should trigger download
    const downloadPromise = page.waitForEvent('download')
    await downloadPromise
  })
})
