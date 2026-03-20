import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import Layout from '../components/Layout';

/* Fix default Leaflet marker icon path issue in bundlers */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* Custom colored marker icon factory */
function createPatientIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${color};
        border: 3px solid rgba(255,255,255,0.9);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">👤</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

const MARKER_COLORS = ['#818cf8', '#22d3ee', '#f472b6', '#34d399', '#fbbf24', '#fb923c', '#a78bfa', '#38bdf8'];

const GEOFENCE_RADIUS_M = 5000; // 5km in meters

// Haversine formula for client-side distance check (km)
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Component that smoothly flies to a given position.
 */
function FlyToPosition({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom || 15, { duration: 1.2 });
    }
  }, [position, zoom, map]);
  return null;
}

/**
 * LiveLocationPage — caregiver view showing all patients on a Leaflet map
 * with a sidebar listing patients and their live statuses.
 */
export default function LiveLocationPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [flyZoom, setFlyZoom] = useState(15);
  const refreshTimerRef = useRef(null);
  const [settingGeofence, setSettingGeofence] = useState(null); // patientId being set

  const fetchLocations = async () => {
    try {
      const res = await api.get('/location/patients');
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    // Auto-refresh every 15 seconds
    refreshTimerRef.current = setInterval(fetchLocations, 15000);
    return () => clearInterval(refreshTimerRef.current);
  }, []);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient._id);
    if (patient.lastLocation?.lat && patient.lastLocation?.lng) {
      setFlyTo([patient.lastLocation.lat, patient.lastLocation.lng]);
      setFlyZoom(15);
    }
  };

  const handleSetSafeZone = async (patient) => {
    if (!patient.lastLocation?.lat || !patient.lastLocation?.lng) return;
    setSettingGeofence(patient._id);
    try {
      await api.post('/location/geofence', {
        patientId: patient._id,
        latitude: patient.lastLocation.lat,
        longitude: patient.lastLocation.lng,
      });
      // Refresh data to show the new circle
      await fetchLocations();
      // Fly the map to show the geofence circle (zoom 12 shows ~5km radius nicely)
      setFlyTo([patient.lastLocation.lat, patient.lastLocation.lng]);
      setFlyZoom(12);
    } catch (err) {
      console.error('Failed to set geofence:', err);
    } finally {
      setSettingGeofence(null);
    }
  };

  const isOutsideSafeZone = (patient) => {
    const loc = patient.lastLocation;
    const gc = patient.geofenceCenter;
    if (!loc?.lat || !gc?.lat) return false;
    return haversineKm(loc.lat, loc.lng, gc.lat, gc.lng) > 5;
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Never';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const isOnline = (dateStr) => {
    if (!dateStr) return false;
    return (Date.now() - new Date(dateStr).getTime()) < 120000; // within 2 minutes
  };

  const patientsWithLocation = patients.filter(
    (p) => p.lastLocation?.lat != null && p.lastLocation?.lng != null
  );

  // Default center: India or first patient
  const defaultCenter = patientsWithLocation.length > 0
    ? [patientsWithLocation[0].lastLocation.lat, patientsWithLocation[0].lastLocation.lng]
    : [20.5937, 78.9629];

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ color: '#94a3b8', fontSize: '1.125rem' }}>Loading locations...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div className="page-header" style={{ paddingBottom: '1rem', marginBottom: '0' }}>
          <h1>
            📍{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Live Location
            </span>
          </h1>
          <p>Track your patients' real-time locations</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#818cf8' }}>{patients.length}</p>
            <p className="stat-label">Total Patients</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#34d399' }}>
              {patients.filter((p) => isOnline(p.lastLocation?.updatedAt)).length}
            </p>
            <p className="stat-label">Online Now</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#fbbf24' }}>
              {patients.filter((p) => !p.lastLocation?.lat).length}
            </p>
            <p className="stat-label">No Location</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#f87171' }}>
              {patients.filter((p) => isOutsideSafeZone(p)).length}
            </p>
            <p className="stat-label">Outside Safe Zone</p>
          </div>
        </div>

        {/* Map + Sidebar Layout */}
        <div className="location-layout">
          {/* Sidebar */}
          <div className="location-sidebar">
            <div className="location-sidebar-header">
              <h3>👥 Patients</h3>
              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                Auto-refresh 15s
              </span>
            </div>

            {patients.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>👤</span>
                <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>No patients linked yet</p>
              </div>
            ) : (
              <div className="location-patient-list">
                {patients.map((patient, idx) => {
                  const online = isOnline(patient.lastLocation?.updatedAt);
                  const hasLocation = patient.lastLocation?.lat != null;
                  return (
                    <div
                      key={patient._id}
                      className={`location-patient-card ${selectedPatient === patient._id ? 'selected' : ''}`}
                      onClick={() => handlePatientClick(patient)}
                    >
                      <div className="location-patient-info">
                        <div className="location-patient-avatar" style={{ background: `linear-gradient(135deg, ${MARKER_COLORS[idx % MARKER_COLORS.length]}33, ${MARKER_COLORS[idx % MARKER_COLORS.length]}22)` }}>
                          <span>👤</span>
                        </div>
                        <div>
                          <p className="location-patient-name">{patient.name}</p>
                          <p className="location-patient-email">{patient.email}</p>
                        </div>
                      </div>
                      <div className="location-patient-status">
                        <div className="location-status-row">
                          <span className={`location-dot ${online ? 'online' : 'offline'}`} />
                          <span className={`location-status-text ${online ? 'online' : 'offline'}`}>
                            {online ? 'Online' : hasLocation ? 'Offline' : 'No data'}
                          </span>
                        </div>
                        {isOutsideSafeZone(patient) && (
                          <div style={{
                            background: 'rgba(248,113,113,0.15)',
                            color: '#f87171',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            marginTop: '0.25rem',
                            display: 'inline-block',
                          }}>
                            🚨 Outside Safe Zone
                          </div>
                        )}
                        {hasLocation && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSetSafeZone(patient); }}
                            disabled={settingGeofence === patient._id}
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem 1rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: patient.geofenceCenter?.lat
                                ? 'linear-gradient(135deg, #818cf8, #6366f1)'
                                : 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              width: '100%',
                              letterSpacing: '0.02em',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                          >
                            {settingGeofence === patient._id
                              ? '⏳ Setting Safe Zone...'
                              : patient.geofenceCenter?.lat
                                ? '🔄 Update Safe Zone'
                                : '📍 Set Safe Zone'}
                          </button>
                        )}
                        {patient.geofenceCenter?.lat && (
                          <div style={{
                            marginTop: '0.35rem',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(129,140,248,0.1)',
                            borderRadius: '6px',
                            fontSize: '0.65rem',
                            color: '#a5b4fc',
                            textAlign: 'center',
                          }}>
                            ✅ Safe zone active (5km radius)
                          </div>
                        )}
                        {hasLocation && (
                          <p className="location-last-seen">
                            Last seen: {getTimeAgo(patient.lastLocation.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="location-map-container">
            {patientsWithLocation.length === 0 ? (
              <div className="location-map-empty">
                <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>🗺️</span>
                <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>No locations available</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '320px' }}>
                  Patient locations will appear here once they enable location sharing on their device.
                </p>
              </div>
            ) : (
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {flyTo && <FlyToPosition position={flyTo} zoom={flyZoom} />}

                {patientsWithLocation.map((patient, idx) => (
                  <Marker
                    key={patient._id}
                    position={[patient.lastLocation.lat, patient.lastLocation.lng]}
                    icon={createPatientIcon(MARKER_COLORS[idx % MARKER_COLORS.length])}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'Inter, sans-serif', padding: '0.25rem', minWidth: '180px' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b', margin: '0 0 0.25rem' }}>
                          {patient.name}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.5rem' }}>
                          {patient.email}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: isOnline(patient.lastLocation.updatedAt) ? '#10b981' : '#64748b',
                            display: 'inline-block',
                          }} />
                          <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                            {isOnline(patient.lastLocation.updatedAt) ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.6875rem', color: '#94a3b8', margin: 0 }}>
                          Updated {getTimeAgo(patient.lastLocation.updatedAt)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Geofence circles */}
                {patientsWithLocation
                  .filter((p) => p.geofenceCenter?.lat != null)
                  .map((patient, idx) => (
                    <Circle
                      key={`geofence-${patient._id}`}
                      center={[patient.geofenceCenter.lat, patient.geofenceCenter.lng]}
                      radius={GEOFENCE_RADIUS_M}
                      pathOptions={{
                        color: isOutsideSafeZone(patient) ? '#ef4444' : '#818cf8',
                        fillColor: isOutsideSafeZone(patient) ? '#ef4444' : '#818cf8',
                        fillOpacity: 0.18,
                        weight: 3,
                      }}
                    />
                  ))
                }
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
