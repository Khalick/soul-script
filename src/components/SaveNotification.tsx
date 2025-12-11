import React from 'react';
import { X, WifiOff, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

interface SaveNotificationProps {
  type: 'offline' | 'error';
  message: string;
  onClose: () => void;
}

export const SaveNotification: React.FC<SaveNotificationProps> = ({ type, message, onClose }) => {
  const { favoriteColor } = useSettingsStore();

  const getIcon = () => {
    if (type === 'offline') {
      return <WifiOff size={48} color="white" />;
    }
    return <AlertCircle size={48} color="white" />;
  };

  const getGradient = () => {
    if (type === 'offline') {
      return 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
    return 'linear-gradient(135deg, #ef4444, #dc2626)';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: getGradient(),
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.4)',
          animation: 'scaleIn 0.4s ease-out',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={20} color="white" />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              marginBottom: '20px',
              animation: type === 'offline' ? 'pulse 2s ease-in-out infinite' : 'shake 0.5s ease-in-out',
            }}
          >
            {getIcon()}
          </div>
          
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '15px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            {type === 'offline' ? 'Saved Offline' : 'Save Failed'}
          </h2>
          
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.95)',
              lineHeight: '1.6',
              marginBottom: '25px',
            }}
          >
            {message}
          </p>

          <button
            onClick={onClose}
            style={{
              padding: '15px 40px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '15px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
