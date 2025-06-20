import React from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'llm';
}

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  return (
    <div className="messages-container">
      {messages.length === 0 && <p className="no-messages">No messages yet. Ask something below!</p>}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message ${msg.sender}`} // Applies 'message' and either 'user' or 'llm' class
        >
          <p>{msg.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
