import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

/**
 * LocationTracker — background component that silently sends
 * the patient's GPS coordinates to the backend every 30 seconds.
 * Shows a small floating badge indicating sharing status.
 */
export default function LocationTracker() {
  const { user } = useAuth();
  // Initialize status based on geolocation availability (avoids setState in effect)
  const [status, setStatus] = useState(() => {
    if (typeof navigator !== 'undefined' && !navigator.geolocation) return 'error';
    return 'initializing';
  }); // initializing | active | denied | error
  const [lastUpdate, setLastUpdate] = useState(null);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const latestCoordsRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'patient') return;

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        latestCoordsRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setStatus('active');
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (err.code === 1) {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );

    // Send location to backend every 30 seconds
    const sendLocation = async () => {
      if (!latestCoordsRef.current) return;
      try {
        await api.post('/location/update', latestCoordsRef.current);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('Failed to send location:', err);
      }
    };

    // Send immediately once we get coords, then every 30s
    const startSending = setTimeout(() => {
      sendLocation();
      intervalRef.current = setInterval(sendLocation, 30000);
    }, 2000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(startSending);
    };
  }, [user]);

  // Don't render for non-patients
  if (!user || user.role !== 'patient') return null;

  const getStatusContent = () => {
    switch (status) {
      case 'active':
        return (
          <>
            <span className="location-dot-pulse" />
            <span>📍 Location sharing active</span>
            {lastUpdate && (
              <span className="location-time">
                Last: {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </>
        );
      case 'denied':
        return (
          <>
            <span style={{ color: '#f87171' }}>⚠️ Location access denied</span>
            <span className="location-time">Enable in browser settings</span>
          </>
        );
      case 'error':
        return <span style={{ color: '#fbbf24' }}>⚠️ Location unavailable</span>;
      default:
        return (
          <>
            <span className="location-spinner" />
            <span>Requesting location...</span>
          </>
        );
    }
  };

  return (
    <div className="location-tracker-badge">
      {getStatusContent()}
    </div>
  );
}
