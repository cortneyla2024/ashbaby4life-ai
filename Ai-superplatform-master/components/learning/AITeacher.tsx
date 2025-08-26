"use client";

import React, { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: string;
}

const AITeacher: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [knowledgeContext, setKnowledgeContext] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth-token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async() => {
    if (!inputMessage.trim() || !token) {
return;
}

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isAI: false,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          context: knowledgeContext,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isAI: true,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        isAI: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="container mx-auto p-8 bg-gray-950 text-white rounded-xl shadow-2xl min-h-screen flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
          AI Teacher
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Your personal AI learning companion. Ask questions, explore topics, and enhance your knowledge with intelligent, contextual responses.
        </p>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Knowledge Context */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Learning Context (Optional)
          </label>
          <textarea
            value={knowledgeContext}
            onChange={(e) => setKnowledgeContext(e.target.value)}
            className="w-full h-20 bg-gray-800 text-white border border-gray-700 rounded-lg p-3 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Add context about what you're learning or studying..."
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-gray-900 rounded-xl p-6 mb-6 overflow-y-auto max-h-96">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">🎓</div>
              <p>Start a conversation with your AI teacher!</p>
              <p className="text-sm mt-2">Ask questions about any topic you&apos;re studying.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isAI ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.isAI
                        ? "bg-gray-700 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-white px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full h-16 bg-gray-800 text-white border border-gray-700 rounded-lg p-3 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ask your AI teacher anything..."
              disabled={isLoading || !token}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim() || !token}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Send
            </button>
            <button
              onClick={clearChat}
              disabled={messages.length === 0}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {!token && (
          <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-lg mt-6">
            Please log in to chat with your AI teacher.
          </div>
        )}

        {/* Quick Questions */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-300">Quick Questions</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Explain quantum physics in simple terms",
              "How do neural networks work?",
              "What is the history of jazz music?",
              "Help me understand calculus",
            ].map((question) => (
              <button
                key={question}
                onClick={() => setInputMessage(question)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
