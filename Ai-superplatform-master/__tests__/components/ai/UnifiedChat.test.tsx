import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import UnifiedChat from '@/components/ai/UnifiedChat'

// Mock the API calls
jest.mock('@/lib/ai', () => ({
  generateAIResponse: jest.fn(),
}))

describe('UnifiedChat', () => {
  const setupFetchMock = () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, user: { id: '1', name: 'Test User' } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, persona: { personaName: 'Companion', communicationStyle: 'Balanced' } })
      })
      .mockResolvedValue({
        json: () => Promise.resolve({ success: true, response: 'Hello! How can I help you today?', functions: [] })
      })
  }

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    // Setup default fetch mock
    setupFetchMock()
  })

  const waitForAuthentication = async () => {
    await waitFor(() => {
      expect(screen.queryByText('Authentication Required')).not.toBeInTheDocument()
    })
  }

  it('renders the chat interface after authentication', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    expect(screen.getByText('AI Life Companion')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message... (Press Enter to send)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('displays welcome message when no messages exist', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    expect(screen.getByText('Welcome to your AI Life Companion!')).toBeInTheDocument()
    expect(screen.getByText("I'm here to help with your goals, health, finances, and personal growth.")).toBeInTheDocument()
  })

  it('allows typing in the input field', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    fireEvent.change(input, { target: { value: 'Hello, AI!' } })
    
    expect(input).toHaveValue('Hello, AI!')
  })

  it('sends message when Send button is clicked', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    const sendButton = screen.getByRole('button', { name: 'Send' })
    
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }),
        body: JSON.stringify({
          message: 'Hello',
          context: 'Unified conversational interface'
        })
      }))
    })
  })

  it('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup()
    
    // Setup fetch mock with chat response
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, user: { id: '1', name: 'Test User' } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, persona: { personaName: 'Companion', communicationStyle: 'Balanced' } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, response: 'Hello! How can I help you today?' })
      })

    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    
    await user.type(input, 'Hello')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/ai/chat', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        }),
        body: JSON.stringify({
          message: 'Hello',
          context: 'Unified conversational interface'
        })
      }))
    })
  })

  it('disables send button when input is empty', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const sendButton = screen.getByRole('button', { name: 'Send' })
    expect(sendButton).toBeDisabled()
  })

  it('disables send button when loading', async () => {
    // Setup fetch mock with slow response
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, user: { id: '1', name: 'Test User' } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, persona: { personaName: 'Companion', communicationStyle: 'Balanced' } })
      })
      .mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    const sendButton = screen.getByRole('button', { name: 'Send' })
    
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(sendButton).toBeDisabled()
    })
  })

  it('displays loading indicator when sending message', async () => {
    // Setup fetch mock with slow response
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, user: { id: '1', name: 'Test User' } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, persona: { personaName: 'Companion', communicationStyle: 'Balanced' } })
      })
      .mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    const sendButton = screen.getByRole('button', { name: 'Send' })
    
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Send')).toBeInTheDocument()
    })
  })

  it('displays user message after sending', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    const sendButton = screen.getByRole('button', { name: 'Send' })
    
    fireEvent.change(input, { target: { value: 'Hello, AI!' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument()
    })
  })

  it('displays AI response after receiving', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    const sendButton = screen.getByRole('button', { name: 'Send' })
    
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    // Setup fetch mock with error response
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, user: { id: '1', name: 'Test User' } })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, persona: { personaName: 'Companion', communicationStyle: 'Balanced' } })
      })
      .mockRejectedValue(new Error('API Error'))

    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    const sendButton = screen.getByRole('button', { name: 'Send' })
    
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Send')).toBeInTheDocument()
    })
  })

  it('shows example prompts in welcome message', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    expect(screen.getByText(/Log my mood as a 7 today/)).toBeInTheDocument()
    expect(screen.getByText(/Add \$25 for lunch to my expenses/)).toBeInTheDocument()
    expect(screen.getByText(/Show me my financial summary/)).toBeInTheDocument()
    expect(screen.getByText(/I need help with stress management/)).toBeInTheDocument()
  })

  it('maintains chat history', async () => {
    render(<UnifiedChat />)
    
    await waitForAuthentication()
    
    const input = screen.getByPlaceholderText('Type your message... (Press Enter to send)')
    const sendButton = screen.getByRole('button', { name: 'Send' })
    
    // Send first message
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument()
    })
    
    // Send second message
    fireEvent.change(input, { target: { value: 'How are you?' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('How are you?')).toBeInTheDocument()
    })
  })
})
