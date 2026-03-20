import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import MedicineCard from '../components/MedicineCard';
import VoiceConfirmation from '../components/VoiceConfirmation';
import CameraVerification from '../components/CameraVerification';
import LocationTracker from '../components/LocationTracker';

/**
 * PatientDashboard — main screen for patients.
 * Shows: medicine schedule cards, voice/camera confirmation,
 * today's stats, and a reminder banner.
 */
export default function PatientDashboard() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [activeAlarms, setActiveAlarms] = useState([]);
  const [dismissedAlarms, setDismissedAlarms] = useState(new Set());
  const alarmAudioRef = useRef(null);

  useEffect(() => {
    // Initialize audio object for alarms
    if (typeof Audio !== 'undefined' && !alarmAudioRef.current) {
      alarmAudioRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      alarmAudioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    if (!medicines || medicines.length === 0) return;

    const checkAlarms = () => {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, '0');
      const currentMinute = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;

      let ringingMeds = [];
      medicines.forEach(med => {
        if (med.scheduleTimes?.includes(currentTime)) {
          const alarmKey = `${med._id}-${currentTime}`;
          if (!dismissedAlarms.has(alarmKey)) {
            ringingMeds.push(med);
          }
        }
      });

      if (ringingMeds.length > 0) {
        setActiveAlarms(ringingMeds);
        if (alarmAudioRef.current && alarmAudioRef.current.paused) {
          alarmAudioRef.current.play().catch(e => console.log('Autoplay blocked:', e));
        }
      } else {
        setActiveAlarms([]);
        if (alarmAudioRef.current && !alarmAudioRef.current.paused) {
          alarmAudioRef.current.pause();
          alarmAudioRef.current.currentTime = 0;
        }
      }
    };

    checkAlarms();
    const intervalId = setInterval(checkAlarms, 10000);
    return () => clearInterval(intervalId);
  }, [medicines, dismissedAlarms]);

  const dismissAllAlarms = () => {
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    const newDismissed = new Set(dismissedAlarms);
    activeAlarms.forEach(med => {
      newDismissed.add(`${med._id}-${currentTime}`);
    });
    setDismissedAlarms(newDismissed);
    setActiveAlarms([]);
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [medsRes, statsRes] = await Promise.all([
        api.get(`/medicines/${user._id}`),
        api.get(`/logs/stats/${user._id}`),
      ]);
      setMedicines(medsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogged = () => {
    fetchData(); // Refresh data after logging a dose
  };

  const handleVoiceConfirm = async (method) => {
    if (selectedMedicine) {
      try {
        await api.post('/logs', {
          patientId: user._id,
          medicineId: selectedMedicine._id,
          confirmationMethod: method,
        });
        fetchData();
        setSelectedMedicine(null);
      } catch (err) {
        if (err.response?.status === 409) {
          alert(err.response.data.message);
        }
      }
    }
  };

  // Current time for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ color: '#94a3b8', fontSize: '1.125rem' }}>Loading your dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Live Location Tracker */}
        <LocationTracker />

        {/* Active Alarms Banner */}
        {activeAlarms.length > 0 && (
          <div className="alarm-banner" style={{
            background: '#ef4444', color: '#fff', padding: '1.25rem', borderRadius: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
            border: '2px solid #fecaca',
            animation: 'pulse-glow 2s ease-in-out infinite'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>⏰</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>ALARM RINGING!</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem', fontWeight: 500 }}>
                  It's time for: {activeAlarms.map(a => a.medicineName).join(', ')}
                </p>
              </div>
            </div>
            <button
              onClick={dismissAllAlarms}
              style={{
                background: '#fff', color: '#ef4444', border: 'none', padding: '0.75rem 1.5rem',
                borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Stop Alarm
            </button>
          </div>
        )}

        {/* Greeting Header */}
        <div className="page-header">
          <h1>
            {greeting},{' '}
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user.name}
            </span>{' '}👋
          </h1>
          <p>Here's your medicine schedule for today</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid-3">
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#818cf8' }}>{stats?.totalLogs || 0}</p>
            <p className="stat-label">Total Doses Logged</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#34d399' }}>{stats?.adherenceRate || 0}%</p>
            <p className="stat-label">Adherence Rate</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#fbbf24' }}>{medicines.length}</p>
            <p className="stat-label">Active Medicines</p>
          </div>
        </div>

        {/* Medicine Schedule */}
        <div style={{ flex: 1 }}>
          <h2 className="section-heading">💊 Today's Medicines</h2>
          {medicines.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No medicines scheduled. Ask your caregiver to add medicines.</p>
            </div>
          ) : (
            <div className="cards-grid-2">
              {medicines.map((med) => (
                <div key={med._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <MedicineCard
                    medicine={med}
                    patientId={user._id}
                    onLogged={handleLogged}
                  />
                  {/* Select for voice/camera */}
                  <button
                    onClick={() => setSelectedMedicine(med)}
                    style={{
                      background: selectedMedicine?._id === med._id ? 'rgba(99,102,241,0.15)' : 'none',
                      border: selectedMedicine?._id === med._id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                      borderRadius: '10px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: selectedMedicine?._id === med._id ? '#a5b4fc' : '#818cf8',
                      transition: 'all 0.2s',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    🎤📷 Use Voice or Camera for "{med.medicineName}"
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voice & Camera Section */}
        {selectedMedicine && (
          <div className="confirm-panel animate-fade-in">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>
                Confirm:{' '}
                <span style={{ color: '#818cf8' }}>{selectedMedicine.medicineName}</span>
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
                Use voice or camera to verify you've taken the right medicine
              </p>
            </div>
            <div className="cards-grid-2">
              <VoiceConfirmation onConfirm={handleVoiceConfirm} />
              <CameraVerification expectedPill={selectedMedicine.medicineName} onVerified={handleVoiceConfirm} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
