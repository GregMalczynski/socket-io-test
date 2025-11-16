import { useState, useEffect } from "react";
import { useSocket } from "./hooks/useSocket";

const App = () => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const { isConnected, error, emit, on, off } = useSocket();

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages(prev => [...prev, {
        id: `${data.sender}-${data.timestamp}`,
        text: data.message,
        sender: data.sender,
        timestamp: data.timestamp,
        isMine: false
      }]);
    };

    on("receive_message", handleMessage);

    return () => {
      off("receive_message", handleMessage);
    };
  }, [on, off]);

  const sendMessage = async () => {
    if (!text.trim() || !isConnected || isSending) return;

    setIsSending(true);

    const messageData = {
      message: text.trim(),
      timestamp: Date.now()
    };

    emit("send_message", messageData, (response) => {
      setIsSending(false);
      
      if (response?.success) {
        setMessages(prev => [...prev, {
          id: `me-${Date.now()}`,
          text: text.trim(),
          isMine: true,
          timestamp: Date.now()
        }]);
        setText("");
      } else {
        alert(`Error: ${response?.error || 'Failed to send'}`);
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Real-time Chat</h2>
      
      {/* Status Bar */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '10px',
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        borderRadius: '4px'
      }}>
        {isConnected ? 'Connected' : 'Disconnected'}
        {error && <span style={{ marginLeft: '10px', color: 'red' }}>Error: {error}</span>}
      </div>

      {/* Messages */}
      <div style={{ 
        height: '400px', 
        overflow: 'auto', 
        border: '1px solid #ddd', 
        padding: '15px',
        marginBottom: '10px',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999' }}>No messages yet...</p>
        )}
        {messages.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              textAlign: msg.isMine ? 'right' : 'left',
              margin: '10px 0'
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: msg.isMine ? '#007bff' : '#e9ecef',
              color: msg.isMine ? 'white' : 'black',
              maxWidth: '70%',
              wordWrap: 'break-word'
            }}>
              <strong>{msg.isMine ? 'You' : msg.sender}</strong>
              <div>{msg.text}</div>
              <small style={{ fontSize: '0.75em', opacity: 0.8 }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isConnected || isSending}
          placeholder="Type a message..."
          style={{ 
            flex: 1, 
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <button 
          onClick={sendMessage}
          disabled={!isConnected || !text.trim() || isSending}
          style={{ 
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: isConnected && text.trim() && !isSending ? 'pointer' : 'not-allowed',
            opacity: isConnected && text.trim() && !isSending ? 1 : 0.5
          }}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default App;