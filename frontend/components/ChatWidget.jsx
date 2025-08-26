import React, { useState, useRef, useEffect } from 'react';
import { useAIResponse } from '../hooks/useAIResponse';
import { useTelemetry } from '../hooks/useTelemetry';
import { useAuth } from '../hooks/useAuth';

// Icons
import { 
    MessageIcon, 
    SendIcon, 
    CloseIcon, 
    MinimizeIcon, 
    MaximizeIcon,
    MicIcon,
    StopIcon,
    AttachmentIcon,
    SmileIcon,
    SettingsIcon
} from '../assets/icons';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isAttaching, setIsAttaching] = useState(false);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const { sendMessage, isLoading } = useAIResponse();
    const { trackEvent } = useTelemetry();
    const { isAuthenticated, user } = useAuth();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = {
                id: 'welcome',
                type: 'ai',
                content: `Hello${user?.name ? ` ${user.name}` : ''}! I'm your CareConnect AI companion. How can I help you today?`,
                timestamp: new Date().toISOString(),
                sender: 'ai'
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, user?.name]);

    const handleToggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            trackEvent('chat_widget_opened');
        } else {
            trackEvent('chat_widget_closed');
        }
    };

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
        trackEvent('chat_widget_minimized', { isMinimized: !isMinimized });
    };

    const handleSendMessage = async (content, type = 'text') => {
        if (!content.trim() && type === 'text') return;

        const userMessage = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date().toISOString(),
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        trackEvent('chat_message_sent', { type, contentLength: content.length });

        try {
            const response = await sendMessage(content, type);
            
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                type: 'text',
                content: response.content,
                timestamp: new Date().toISOString(),
                sender: 'ai',
                metadata: response.metadata
            };

            setMessages(prev => [...prev, aiMessage]);
            trackEvent('chat_message_received', { 
                responseLength: response.content.length,
                responseTime: response.responseTime 
            });
        } catch (error) {
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString(),
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMessage]);
            trackEvent('chat_message_error', { error: error.message });
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputValue);
        }
    };

    const handleVoiceRecord = () => {
        if (isRecording) {
            // Stop recording
            setIsRecording(false);
            trackEvent('chat_voice_stopped');
            // Handle voice processing
        } else {
            // Start recording
            setIsRecording(true);
            trackEvent('chat_voice_started');
            // Handle voice recording
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            trackEvent('chat_file_uploaded', { 
                fileName: file.name, 
                fileSize: file.size, 
                fileType: file.type 
            });
            // Handle file processing
            handleSendMessage(file, 'file');
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const renderMessage = (message) => {
        const isUser = message.sender === 'user';
        
        return (
            <div key={message.id} className={`message ${isUser ? 'user' : 'ai'}`}>
                <div className="message-avatar">
                    {isUser ? (
                        <div className="user-avatar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                <span>{user?.name?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                    ) : (
                        <div className="ai-avatar">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <path d="M4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="10" cy="10" r="2" fill="currentColor"/>
                            </svg>
                        </div>
                    )}
                </div>
                <div className="message-content">
                    <div className="message-text">
                        {message.type === 'file' ? (
                            <div className="file-message">
                                <AttachmentIcon />
                                <span>{message.content.name}</span>
                            </div>
                        ) : (
                            <p>{message.content}</p>
                        )}
                    </div>
                    <div className="message-timestamp">
                        {formatTimestamp(message.timestamp)}
                    </div>
                </div>
            </div>
        );
    };

    if (!isOpen) {
        return (
            <div className="chat-widget-closed">
                <button
                    className="chat-toggle-button"
                    onClick={handleToggleChat}
                    aria-label="Open chat"
                >
                    <MessageIcon />
                    <span className="notification-dot"></span>
                </button>
            </div>
        );
    }

    return (
        <div className={`chat-widget ${isMinimized ? 'minimized' : ''}`}>
            {/* Chat Header */}
            <div className="chat-header">
                <div className="chat-title">
                    <div className="ai-avatar">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="10" cy="10" r="2" fill="currentColor"/>
                        </svg>
                    </div>
                    <div className="title-text">
                        <h3>CareConnect AI</h3>
                        <span className="status">Online</span>
                    </div>
                </div>
                <div className="chat-actions">
                    <button
                        className="chat-action"
                        onClick={handleMinimize}
                        aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
                    >
                        {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
                    </button>
                    <button
                        className="chat-action"
                        onClick={handleToggleChat}
                        aria-label="Close chat"
                    >
                        <CloseIcon />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Messages */}
                    <div className="chat-messages">
                        {messages.map(renderMessage)}
                        {isTyping && (
                            <div className="message ai typing">
                                <div className="message-avatar">
                                    <div className="ai-avatar">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                                            <path d="M4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            <circle cx="10" cy="10" r="2" fill="currentColor"/>
                                        </svg>
                                    </div>
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="chat-input">
                        <form onSubmit={handleSubmit} className="input-form">
                            <div className="input-actions">
                                <button
                                    type="button"
                                    className="input-action"
                                    onClick={handleAttachmentClick}
                                    aria-label="Attach file"
                                >
                                    <AttachmentIcon />
                                </button>
                                <button
                                    type="button"
                                    className="input-action"
                                    onClick={() => setIsAttaching(!isAttaching)}
                                    aria-label="Add emoji"
                                >
                                    <SmileIcon />
                                </button>
                            </div>
                            <div className="input-wrapper">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="message-input"
                                    rows="1"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="input-actions">
                                <button
                                    type="button"
                                    className={`input-action voice-button ${isRecording ? 'recording' : ''}`}
                                    onClick={handleVoiceRecord}
                                    aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                                >
                                    {isRecording ? <StopIcon /> : <MicIcon />}
                                </button>
                                <button
                                    type="submit"
                                    className="send-button"
                                    disabled={!inputValue.trim() || isLoading}
                                    aria-label="Send message"
                                >
                                    <SendIcon />
                                </button>
                            </div>
                        </form>
                        
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            accept="image/*,text/*,.pdf,.doc,.docx"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatWidget;
