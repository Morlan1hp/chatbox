import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    // 从本地存储加载聊天历史
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveChat = () => {
    if (messages.length > 0) {
      const newChat = {
        id: Date.now(),
        title: messages[0].text.substring(0, 30) + '...',
        messages: messages
      };
      const updatedHistory = [...chatHistory, newChat];
      setChatHistory(updatedHistory);
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
      setCurrentChatId(newChat.id);
    }
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  const startNewChat = () => {
    saveChat();
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);
      const userMessage = { text: input, isUser: true };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput('');

      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-8d4670a5026e4524b7358cc134a3817b'
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {"role": "system", "content": "你是一个有帮助的助手。"},
              {"role": "user", "content": input}
            ],
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error('API请求失败');
        }

        const data = await response.json();
        let botReply = data.choices[0].message.content;
        
        botReply = botReply.replace(/\\n/g, '\n')
                           .replace(/\\/g, '')
                           .replace(/`/g, '')
                           .replace(/\*\*/g, '')
                           .trim();

        const botMessage = { text: botReply, isUser: false };
        setMessages(prevMessages => {
          const newMessages = [...prevMessages, botMessage];
          if (!currentChatId) {
            saveChat();
          } else {
            const updatedHistory = chatHistory.map(chat => 
              chat.id === currentChatId ? {...chat, messages: newMessages} : chat
            );
            setChatHistory(updatedHistory);
            localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
          }
          return newMessages;
        });
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = { text: "抱歉,发生了错误。请稍后再试。", isUser: false };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container">
      <Head>
        <title>ChatAI 应用</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="chat-layout">
        <div className="chat-history">
          <button onClick={startNewChat} className="new-chat-button">新建聊天</button>
          {chatHistory.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => loadChat(chat.id)}
            >
              {chat.title}
            </div>
          ))}
        </div>
        <main className="main">
          <div className="chat-container">
            <div className="messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.isUser ? 'user' : 'bot'}`}>
                  {message.text}
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <span className="loading-dots">正在思考</span>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入您的消息..."
                className="chat-input"
                disabled={isLoading}
              />
              <button type="submit" className="send-button" disabled={isLoading}>
                {isLoading ? '发送中...' : '发送'}
              </button>
            </form>
          </div>
        </main>
      </div>

      <style jsx global>{`
        body {
          font-family: 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          min-height: 100vh;
          background-color: #f0f0f0;
        }
        .chat-layout {
          display: flex;
          height: 100vh;
        }
        .chat-history {
          width: 250px;
          background-color: #2c3e50;
          color: white;
          padding: 1rem;
          overflow-y: auto;
        }
        .new-chat-button {
          width: 100%;
          padding: 0.5rem;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 1rem;
        }
        .chat-history-item {
          padding: 0.5rem;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        .chat-history-item:hover, .chat-history-item.active {
          background-color: #34495e;
        }
        .main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }
        .chat-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .messages {
          flex-grow: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        .message {
          margin-bottom: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          max-width: 80%;
          line-height: 1.5;
          font-size: 1rem;
        }
        .user {
          background-color: #007bff;
          color: white;
          align-self: flex-end;
          margin-left: auto;
        }
        .bot {
          background-color: #f1f0f0;
          color: #333;
          align-self: flex-start;
        }
        .input-form {
          display: flex;
          padding: 1rem;
          background-color: #f8f9fa;
        }
        .chat-input {
          flex-grow: 1;
          padding: 0.5rem;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 1rem;
          font-family: 'Roboto', sans-serif;
        }
        .send-button {
          margin-left: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          font-family: 'Roboto', sans-serif;
          transition: background-color 0.2s;
        }
        .send-button:hover {
          background-color: #0056b3;
        }
        @keyframes ellipsis {
          0% { content: '.'; }
          33% { content: '..'; }
          66% { content: '...'; }
        }
        .loading-dots::after {
          content: '.';
          display: inline-block;
          animation: ellipsis 1.5s infinite;
          width: 1em;
          text-align: left;
        }
      `}</style>
    </div>
  );
}