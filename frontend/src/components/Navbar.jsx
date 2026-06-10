import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Search, Notebook } from 'lucide-react';

const Navbar = ({ searchVal, onSearchChange }) => {
  const { user, logout } = useContext(AuthContext);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header style={{
      background: 'rgba(15, 15, 27, 0.75)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '24px'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          padding: '8px',
          borderRadius: '10px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>
          <Notebook size={20} />
        </div>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          NeuraNote
        </span>
      </div>

      {/* Search Input Bar (Visible only when logged in) */}
      {user && (
        <div style={{
          position: 'relative',
          maxWidth: '420px',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '16px',
            color: '#64748b'
          }} />
          <input
            type="text"
            placeholder="Search notes, tags, or content..."
            value={searchVal || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              paddingLeft: '46px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '24px',
              fontSize: '0.92rem'
            }}
          />
        </div>
      )}

      {/* User Profile Info */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* User Details */}
          <div style={{
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }} className="user-details-desktop">
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#f8fafc'
            }}>{user.name}</span>
            <span style={{
              fontSize: '0.75rem',
              color: '#64748b'
            }}>{user.email}</span>
          </div>

          {/* User Avatar */}
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 700,
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            {getInitials(user.name)}
          </div>

          {/* Logout Control */}
          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          Secure Authentication
        </div>
      )}
    </header>
  );
};

export default Navbar;
