import { test, expect } from '@playwright/test';

test.describe('AI Assistant Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Navigate to AI Assistant
    await page.getByRole('link', { name: /ai assistant/i }).click();
    await expect(page).toHaveURL('/ai-assistant');
  });

  test('should display AI assistant interface', async ({ page }) => {
    // Check for main AI assistant elements
    await expect(page.getByRole('heading', { name: /ai assistant/i })).toBeVisible();
    
    // Check for chat interface
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible();
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
    
    // Check for persona selector
    await expect(page.getByLabel(/ai persona/i)).toBeVisible();
  });

  test('should display welcome message on first visit', async ({ page }) => {
    // Check for welcome message
    await expect(page.getByText(/hello! i'm your ai assistant/i)).toBeVisible();
    await expect(page.getByText(/how can i help you today/i)).toBeVisible();
  });

  test('should send and receive messages', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Type a message
    await messageInput.fill('Hello, how are you?');
    
    // Send the message
    await sendButton.click();
    
    // Check that user message appears
    await expect(page.getByText('Hello, how are you?')).toBeVisible();
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
    
    // Check that AI responded
    const aiMessages = page.locator('[data-testid="ai-message"]');
    await expect(aiMessages).toHaveCount(1);
  });

  test('should handle empty message submission', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Try to send empty message
    await sendButton.click();
    
    // Should not add any new messages
    const userMessages = page.locator('[data-testid="user-message"]');
    await expect(userMessages).toHaveCount(0);
  });

  test('should handle long messages', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Type a long message
    const longMessage = 'This is a very long message that should test the AI assistant\'s ability to handle lengthy user input. It contains multiple sentences and should be processed correctly by the system.';
    await messageInput.fill(longMessage);
    
    // Send the message
    await sendButton.click();
    
    // Check that user message appears
    await expect(page.getByText(longMessage)).toBeVisible();
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  });

  test('should change AI persona', async ({ page }) => {
    const personaSelect = page.getByLabel(/ai persona/i);
    
    // Check default persona
    await expect(personaSelect).toHaveValue('financial-advisor');
    
    // Change to different persona
    await personaSelect.selectOption('budget-planner');
    
    // Check that persona changed
    await expect(personaSelect).toHaveValue('budget-planner');
    
    // Send a message to test new persona
    await page.locator('[data-testid="message-input"]').fill('Help me with budgeting');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Wait for AI response with new persona
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  });

  test('should handle multiple messages in conversation', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Send first message
    await messageInput.fill('What is my current balance?');
    await sendButton.click();
    
    // Wait for first AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
    
    // Send second message
    await messageInput.fill('How can I save more money?');
    await sendButton.click();
    
    // Wait for second AI response
    await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(2);
    
    // Send third message
    await messageInput.fill('Show me my recent transactions');
    await sendButton.click();
    
    // Wait for third AI response
    await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(3);
  });

  test('should clear conversation', async ({ page }) => {
    // Send a message first
    await page.locator('[data-testid="message-input"]').fill('Hello');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
    
    // Click clear conversation button
    await page.getByRole('button', { name: /clear conversation/i }).click();
    
    // Confirm clear action if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Check that conversation is cleared
    await expect(page.getByText(/hello! i'm your ai assistant/i)).toBeVisible();
    
    // Check that previous messages are gone
    await expect(page.getByText('Hello')).not.toBeVisible();
  });

  test('should handle financial queries', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Ask about balance
    await messageInput.fill('What is my current account balance?');
    await sendButton.click();
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
    
    // Ask about spending
    await messageInput.fill('How much did I spend this month?');
    await sendButton.click();
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(2);
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    
    // Type message and press Enter to send
    await messageInput.fill('Test message with Enter key');
    await messageInput.press('Enter');
    
    // Check that message was sent
    await expect(page.getByText('Test message with Enter key')).toBeVisible();
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  });

  test('should handle message input focus', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    
    // Click on message input to focus
    await messageInput.click();
    
    // Check that input is focused
    await expect(messageInput).toBeFocused();
    
    // Type some text
    await messageInput.fill('Focused test message');
    
    // Check that text is in input
    await expect(messageInput).toHaveValue('Focused test message');
  });

  test('should handle AI response loading states', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Send a message
    await messageInput.fill('Test loading state');
    await sendButton.click();
    
    // Check for loading indicator
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
    
    // Loading indicator should be gone
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/ai/**', route => {
      route.abort('failed');
    });
    
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Send a message
    await messageInput.fill('Test network error');
    await sendButton.click();
    
    // Check for error message
    await expect(page.getByText(/sorry, i'm having trouble connecting/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
    
    // Restore network
    await page.unroute('**/api/ai/**');
    
    // Click retry
    await page.getByRole('button', { name: /retry/i }).click();
    
    // Should get AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  });

  test('should persist conversation across page reloads', async ({ page }) => {
    // Send a message
    await page.locator('[data-testid="message-input"]').fill('Persistent message');
    await page.getByRole('button', { name: /send/i }).click();
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
    
    // Reload the page
    await page.reload();
    
    // Wait for page to load
    await expect(page).toHaveURL('/ai-assistant');
    
    // Check that conversation is still there
    await expect(page.getByText('Persistent message')).toBeVisible();
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  });

  test('should handle different message types', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Send a question
    await messageInput.fill('What is the weather like?');
    await sendButton.click();
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
    
    // Send a statement
    await messageInput.fill('I need help with my finances');
    await sendButton.click();
    await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(2);
    
    // Send a command
    await messageInput.fill('Show me my budget');
    await sendButton.click();
    await expect(page.locator('[data-testid="ai-message"]')).toHaveCount(3);
  });

  test('should handle special characters in messages', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Send message with special characters
    const specialMessage = 'Test with special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
    await messageInput.fill(specialMessage);
    await sendButton.click();
    
    // Check that message appears correctly
    await expect(page.getByText(specialMessage)).toBeVisible();
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  });

  test('should handle emoji in messages', async ({ page }) => {
    const messageInput = page.locator('[data-testid="message-input"]');
    const sendButton = page.getByRole('button', { name: /send/i });
    
    // Send message with emoji
    const emojiMessage = 'Hello! 😊 How are you? 🎉';
    await messageInput.fill(emojiMessage);
    await sendButton.click();
    
    // Check that message appears correctly
    await expect(page.getByText(emojiMessage)).toBeVisible();
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible();
  });
});
