import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Send, Trash2, Shield, Users, MessageSquare } from 'lucide-react';

export default function ChatPanel() {
  const { chatMessages, sendChatMessage, deleteChatMessage, listenersCount } = useSocket();
  const { user, isAuthenticated, isModerator } = useAuth();
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    if (!isAuthenticated) {
      setError('Please sign in to chat in the lounge.');
      return;
    }

    try {
      setSending(true);
      setError(null);
      await sendChatMessage(input.trim());
      setInput('');
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msgId) => {
    if (confirm('Delete this message for all listeners?')) {
      try {
        await deleteChatMessage(msgId);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '520px',
        overflow: 'hidden',
        background: 'rgba(18, 22, 34, 0.85)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={18} color="#A78BFA" />
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFF' }}>
            Lounge Community Chat
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
          <span className="badge-live-dot"></span>
          <span>{listenersCount} connected</span>
        </div>
      </div>

      {/* Messages List */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {chatMessages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            No messages yet. Say hello to the lounge!
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = user?.id === msg.userId;
            const isMsgAdmin = msg.user?.role === 'ADMIN';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}
              >
                <img
                  src={
                    msg.user?.avatarUrl ||
                    'https://api.dicebear.com/7.x/identicon/svg?seed=' + (msg.user?.username || 'user')
                  }
                  alt={msg.user?.username}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    flexShrink: 0,
                    border: isMsgAdmin ? '1px solid #A78BFA' : '1px solid var(--border-glass)',
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '3px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: isMsgAdmin ? '#C4B5FD' : '#E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {msg.user?.username || 'Listener'}
                      {isMsgAdmin && (
                        <Shield size={12} color="#A78BFA" title="Lounge Administrator" />
                      )}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {formatTime(msg.createdAt)}
                    </span>

                    {/* Delete for moderator/admin */}
                    {isModerator && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          marginLeft: 'auto',
                          padding: '2px',
                          opacity: 0.6,
                        }}
                        title="Delete message"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                      background: isMe ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input or Guest sign-in prompt */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(11, 13, 19, 0.6)',
        }}
      >
        {error && (
          <div
            style={{
              fontSize: '12px',
              color: '#F87171',
              marginBottom: '8px',
              padding: '4px 8px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send message to lounge..."
              maxLength={500}
              style={{ height: '40px', fontSize: '13px' }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-primary"
              style={{
                width: '40px',
                height: '40px',
                padding: 0,
                flexShrink: 0,
                opacity: sending || !input.trim() ? 0.6 : 1,
              }}
              title="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Sign in to participate in the lounge chat.</span>
          </div>
        )}
      </div>
    </div>
  );
}
