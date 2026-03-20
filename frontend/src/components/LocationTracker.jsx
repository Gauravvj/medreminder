import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

/**
 * LocationTracker — invisible component that shares the patient's
 * GPS location with the server every 30 seconds.
 * Shows a small status indicator.
 */
export default function LocationTracker() {
  const [status, setStatus] = useState('initializing'); // initializing | sharing | denied | error
  const [lastUpdate, setLastUpdate] = useState(null);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);
  const latestCoordsRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    // Request permission and start watching position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        latestCoordsRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setStatus('sharing');
        sendLocation(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error('Geolocation denied:', err.message);
        setStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        latestCoordsRef.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setStatus('sharing');
      },
      (err) => {
        console.error('Geolocation watch error:', err.message);
        setStatus('denied');
      },
      { enableHighAccuracy: true, maximumAge: 15000 }
    );

    // Send location to server every 30 seconds
    intervalRef.current = setInterval(() => {
      if (latestCoordsRef.current) {
        sendLocation(latestCoordsRef.current.latitude, latestCoordsRef.current.longitude);
      }
    }, 30000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const sendLocation = async (latitude, longitude) => {
    try {
      await api.put('/location/update', { latitude, longitude });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to send location:', err);
    }
  };

  const statusConfig = {
    initializing: { icon: '⏳', text: 'Getting location...', color: '#fbbf24' },
    sharing: { icon: '📍', text: 'Location sharing active', color: '#34d399' },
    denied: { icon: '❌', text: 'Location access denied', color: '#f87171' },
    error: { icon: '⚠️', text: 'Geolocation not supported', color: '#f87171' },
  };

  const cfg = statusConfig[status];

  return (
    <div className="location-status" style={{ borderColor: `${cfg.color}33`, background: `${cfg.color}0D` }}>
      <span className="location-status-dot" style={{ background: cfg.color, boxShadow: status === 'sharing' ? `0 0 8px ${cfg.color}80` : 'none' }} />
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: cfg.color }}>{cfg.icon} {cfg.text}</span>
      {lastUpdate && (
        <span style={{ fontSize: '0.625rem', color: '#64748b', marginLeft: 'auto' }}>
          Last: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
