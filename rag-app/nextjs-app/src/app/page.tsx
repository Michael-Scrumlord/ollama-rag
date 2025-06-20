"use client";

import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import ChatInput from '../components/ChatInput';
import ChatMessages, { Message } from '../components/ChatMessages';
import ResetButton from '../components/ResetButton';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Function to handle sending a message
  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const llmMessage: Message = {
        id: Date.now().toString() + '-llm',
        text: data.reply || "Sorry, I couldn't get a response.",
        sender: 'llm',
      };
      setMessages((prevMessages) => [...prevMessages, llmMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: 'Error: Could not connect to the chatbot. Please try again.',
        sender: 'llm',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle resetting the conversation
  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Reset successful:', data.message);
      setMessages([]); // Clear messages on the client

    } catch (error) {
      console.error('Failed to reset conversation:', error);
      // Optionally, show an error message to the user
      const errorMessage: Message = {
        id: Date.now().toString() + '-reset-error',
        text: 'Error: Could not reset conversation. Please try again.',
        sender: 'llm',
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Head>
        <title>RAG App</title>
        <meta name="description" content="Retrieval Augmented Generation App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: 'auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          RAG Application
        </h1>

        <ChatMessages messages={messages} />
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        <ResetButton onReset={handleReset} isLoading={isResetting} />

      </main>
    </>
  );
}
