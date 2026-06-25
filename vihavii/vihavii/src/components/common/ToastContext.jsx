import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '320px',
        pointerEvents: 'none'
      }}>
        <AnimatePresence>
          {toasts.map(t => {
            let borderColor = '#D4AF37';
            let icon = <Info size={18} color="#D4AF37" />;
            
            if (t.type === 'success') {
              borderColor = '#52c41a';
              icon = <CheckCircle size={18} color="#52c41a" />;
            } else if (t.type === 'error') {
              borderColor = '#ff4d4f';
              icon = <AlertTriangle size={18} color="#ff4d4f" />;
            } else if (t.type === 'warning') {
              borderColor = '#faad14';
              icon = <AlertTriangle size={18} color="#faad14" />;
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                style={{
                  background: 'rgba(20, 20, 22, 0.95)',
                  backdropFilter: 'blur(12px)',
                  borderLeft: `4px solid ${borderColor}`,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  pointerEvents: 'auto',
                  userSelect: 'none'
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {icon}
                </div>
                <div style={{ flex: 1, fontSize: '13px', lineHeight: '1.4', fontWeight: '500' }}>
                  {t.message}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#888'}
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
