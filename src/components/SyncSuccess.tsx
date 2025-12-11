import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface SyncSuccessProps {
  count: number;
  onClose: () => void;
}

export const SyncSuccess: React.FC<SyncSuccessProps> = ({ count, onClose }) => {
  // favoriteColor removed as green color is hardcoded in this component

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
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 0 60px rgba(16, 185, 129, 0.4)',
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
              animation: 'scaleIn 0.5s ease-out',
            }}
          >
            <CheckCircle size={64} color="white" strokeWidth={2} />
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
            Sync Complete!
          </h2>
          
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.95)',
              lineHeight: '1.6',
              marginBottom: '10px',
            }}
          >
            Successfully synced <strong>{count}</strong> {count === 1 ? 'entry' : 'entries'} to the cloud.
          </p>
          
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '25px',
            }}
          >
            Your journal is now up to date across all devices! ✨
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
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};
