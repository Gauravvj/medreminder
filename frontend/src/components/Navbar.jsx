import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Navbar component with navigation links, alert bell, and logout.
 * Shows different links based on user role (patient vs caregiver).
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch unread alert count for caregivers
  useEffect(() => {
    if (user?.role === 'caregiver') {
      api.get(`/alerts/unread/${user._id}`)
        .then(res => setUnreadCount(res.data.unreadCount))
        .catch(() => {});
    }
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user?.role === 'patient' ? [
    { path: '/dashboard', label: '🏠 Dashboard' },
    { path: '/schedule', label: '💊 Schedule' },
    { path: '/history', label: '📋 History' },
    { path: '/games', label: '🧠 Brain Games' },
  ] : [
    { path: '/caregiver', label: '📊 Dashboard' },
    { path: '/schedule', label: '💊 Medicines' },
    { path: '/history', label: '📋 Logs' },
  ];

  return (
    <nav className="navbar-glass">
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
          {/* Logo */}
          <Link to={user?.role === 'patient' ? '/dashboard' : '/caregiver'} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>💊</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MedReminder
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: isActive(link.path) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive(link.path) ? '#a5b4fc' : '#94a3b8',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Alert Bell for Caregivers */}
            {user?.role === 'caregiver' && (
              <Link to="/caregiver" style={{ position: 'relative', textDecoration: 'none' }}>
                <span style={{ fontSize: '1.25rem' }}>🔔</span>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-8px',
                    background: '#ef4444', color: 'white', fontSize: '0.65rem',
                    borderRadius: '9999px', width: '18px', height: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Info */}
            <span className="hidden sm:block" style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              {user?.name}
            </span>
            <span className="badge badge-info">{user?.role}</span>

            {/* Logout */}
            <button onClick={handleLogout} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem 0.875rem' }}>
              Logout
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden" style={{ paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.625rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: isActive(link.path) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive(link.path) ? '#a5b4fc' : '#94a3b8',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
