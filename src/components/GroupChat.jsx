import { useState, useRef, useEffect } from 'react';

function GroupChat({ user, messages, onSend }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview({ url: ev.target.result, type: 'photo' });
      reader.readAsDataURL(f);
    } else if (f.type.startsWith('video/')) {
      setPreview({ url: URL.createObjectURL(f), type: 'video' });
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !preview) return;
    onSend({
      sender: user.name,
      role: user.role,
      text: text.trim(),
      ...(preview && { media: preview }),
    });
    setText('');
    setFile(null);
    setPreview(null);
  };

  const removePreview = () => {
    setFile(null);
    setPreview(null);
  };

  const roleColors = {
    parent: '#E8B4D4',
    staff: '#A8C9A0',
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Group Chat</h2>
        <p>Community chat between parents and staff</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg) => {
            const isMe = msg.sender === user.name;
            return (
              <div key={msg.id} className={`chat-bubble-row ${isMe ? 'me' : ''}`}>
                <div className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>
                  <div className="chat-bubble-header">
                    <span className="chat-sender" style={{ color: roleColors[msg.role] || '#475569' }}>
                      {msg.sender}
                    </span>
                    <span className="chat-role-tag" style={{ background: roleColors[msg.role] || '#475569' }}>
                      {msg.role}
                    </span>
                  </div>
                  {msg.media && (
                    <div className="chat-media">
                      {msg.media.type === 'photo' ? (
                        <img src={msg.media.url} alt="Shared" />
                      ) : (
                        <video src={msg.media.url} controls />
                      )}
                    </div>
                  )}
                  {msg.text && <p className="chat-text">{msg.text}</p>}
                  <span className="chat-time">{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          {preview && (
            <div className="chat-preview">
              {preview.type === 'photo' ? (
                <img src={preview.url} alt="Preview" />
              ) : (
                <video src={preview.url} />
              )}
              <button type="button" className="chat-preview-remove" onClick={removePreview}>✕</button>
            </div>
          )}
          <div className="chat-input-row">
            <label htmlFor="chat-file" className="chat-attach-btn">📎</label>
            <input
              type="file"
              id="chat-file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="file-input-hidden"
            />
            <input
              type="text"
              className="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit" className="chat-send-btn" disabled={!text.trim() && !preview}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GroupChat;
