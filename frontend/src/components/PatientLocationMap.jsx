import { useEffect, useState, useRef } from 'react';
import api from '../services/api';

/**
 * PatientLocationMap — interactive map for caregivers showing
 * the live locations of all linked patients using Leaflet.js.
 */
export default function PatientLocationMap() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const leafletLoadedRef = useRef(false);

  // Load Leaflet CSS & JS from CDN
  useEffect(() => {
    if (leafletLoadedRef.current) return;

    // Add Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        leafletLoadedRef.current = true;
        initMap();
      };
      document.head.appendChild(script);
    } else {
      leafletLoadedRef.current = true;
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // Default: India center
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    fetchLocations();
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/location/patients');
      setPatients(res.data);
      setError(null);
      updateMarkers(res.data);
    } catch (err) {
      console.error('Failed to fetch patient locations:', err);
      setError('Could not load locations');
    } finally {
      setLoading(false);
    }
  };

  // Poll for location updates every 15 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchLocations, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const updateMarkers = (patientData) => {
    if (!mapInstanceRef.current || !window.L) return;

    const L = window.L;
    const map = mapInstanceRef.current;
    const bounds = [];

    patientData.forEach((patient) => {
      if (!patient.hasLocation) return;

      const { latitude, longitude, name, updatedAt } = patient;
      const key = patient._id;
      bounds.push([latitude, longitude]);

      const timeAgo = updatedAt ? getTimeAgo(new Date(updatedAt)) : 'Unknown';

      // Custom pulsing icon
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin">
            <div class="marker-pulse-ring"></div>
            <div class="marker-dot"></div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -18],
      });

      if (markersRef.current[key]) {
        // Update existing marker position
        markersRef.current[key].setLatLng([latitude, longitude]);
        markersRef.current[key].setPopupContent(
          `<div style="font-family:Inter,sans-serif;padding:4px;">
            <strong style="color:#1e293b;font-size:14px;">${name}</strong><br/>
            <span style="color:#64748b;font-size:12px;">📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}</span><br/>
            <span style="color:#94a3b8;font-size:11px;">🕐 ${timeAgo}</span>
          </div>`
        );
      } else {
        // Create new marker
        const marker = L.marker([latitude, longitude], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:Inter,sans-serif;padding:4px;">
              <strong style="color:#1e293b;font-size:14px;">${name}</strong><br/>
              <span style="color:#64748b;font-size:12px;">📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}</span><br/>
              <span style="color:#94a3b8;font-size:11px;">🕐 ${timeAgo}</span>
            </div>`
          );
        markersRef.current[key] = marker;
      }
    });

    // Fit map to bounds if we have locations
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const patientsWithLocation = patients.filter(p => p.hasLocation);
  const patientsWithoutLocation = patients.filter(p => !p.hasLocation);

  return (
    <div>
      <h2 className="section-heading">📍 Live Patient Locations</h2>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span className="badge badge-success">
          {patientsWithLocation.length} Sharing Location
        </span>
        {patientsWithoutLocation.length > 0 && (
          <span className="badge badge-warning">
            {patientsWithoutLocation.length} Not Sharing
          </span>
        )}
      </div>

      {/* Map Container */}
      <div className="location-map-container">
        {loading && !mapInstanceRef.current && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000,
            borderRadius: '16px',
          }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading map...</span>
          </div>
        )}
        {error && (
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'rgba(239,68,68,0.15)', color: '#f87171',
            padding: '0.375rem 0.75rem', borderRadius: '8px',
            fontSize: '0.75rem', fontWeight: 600, zIndex: 1000,
          }}>
            {error}
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
      </div>

      {/* Patients without location */}
      {patientsWithoutLocation.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.5rem' }}>
            ⚠️ These patients haven't shared their location yet:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {patientsWithoutLocation.map(p => (
              <span key={p._id} style={{
                background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)',
                padding: '0.375rem 0.75rem', borderRadius: '8px',
                fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24',
              }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
