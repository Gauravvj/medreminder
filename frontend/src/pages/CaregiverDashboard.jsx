import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import PatientLocationMap from '../components/PatientLocationMap';

/**
 * CaregiverDashboard — main screen for caregivers.
 * Shows: linked patients, adherence stats, alerts, and trends.
 */
export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [patientStats, setPatientStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [profileRes, alertsRes, allPatientsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get(`/alerts/${user._id}`),
        api.get('/auth/patients'),
      ]);

      const linkedPatients = profileRes.data.linkedPatients || [];
      setPatients(linkedPatients);
      setAlerts(alertsRes.data);
      setAllPatients(allPatientsRes.data);

      // Fetch stats for each linked patient
      const statsMap = {};
      for (const p of linkedPatients) {
        try {
          const statsRes = await api.get(`/logs/stats/${p._id}`);
          statsMap[p._id] = statsRes.data;
        } catch {
          statsMap[p._id] = { totalLogs: 0, takenCount: 0, missedCount: 0, adherenceRate: 0 };
        }
      }
      setPatientStats(statsMap);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPatient = async (patientId) => {
    try {
      await api.put(`/auth/link-patient/${patientId}`);
      fetchData();
    } catch (err) {
      alert('Failed to link patient');
    }
  };

  const handleMarkRead = async (alertId) => {
    try {
      await api.put(`/alerts/${alertId}/read`);
      setAlerts(alerts.map(a => a._id === alertId ? { ...a, read: true } : a));
    } catch (err) {
      console.error('Failed to mark alert as read');
    }
  };

  const unlinkedPatients = allPatients.filter(
    p => !patients.some(lp => lp._id === p._id)
  );

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ color: '#94a3b8', fontSize: '1.125rem' }}>Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div className="page-header">
          <h1>Caregiver Dashboard</h1>
          <p>Monitor your patients' medication adherence</p>
        </div>

        {/* Overview Stats */}
        <div className="stats-grid-4">
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#818cf8' }}>{patients.length}</p>
            <p className="stat-label">Linked Patients</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#f87171' }}>{alerts.filter(a => !a.read).length}</p>
            <p className="stat-label">Unread Alerts</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#34d399' }}>
              {patients.length > 0
                ? Math.round(Object.values(patientStats).reduce((sum, s) => sum + (s.adherenceRate || 0), 0) / patients.length)
                : 0}%
            </p>
            <p className="stat-label">Avg Adherence</p>
          </div>
          <div className="stat-card">
            <p className="stat-value" style={{ color: '#fbbf24' }}>
              {Object.values(patientStats).reduce((sum, s) => sum + (s.missedCount || 0), 0)}
            </p>
            <p className="stat-label">Total Missed</p>
          </div>
        </div>

        {/* Patient Cards */}
        <div>
          <h2 className="section-heading">👥 Your Patients</h2>
          {patients.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👤</span>
              <p>No patients linked yet. Link a patient below.</p>
            </div>
          ) : (
            <div className="cards-grid-3">
              {patients.map((patient) => {
                const s = patientStats[patient._id] || {};
                return (
                  <div key={patient._id} className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div className="patient-avatar">👤</div>
                      <div>
                        <h3 style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9375rem' }}>{patient.name}</h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{patient.email}</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                      <div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{s.takenCount || 0}</p>
                        <p style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Taken</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>{s.missedCount || 0}</p>
                        <p style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Missed</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>{s.adherenceRate || 0}%</p>
                        <p style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Adherence</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Location Map */}
        <PatientLocationMap />

        {/* Link New Patient */}
        {unlinkedPatients.length > 0 && (
          <div>
            <h2 className="section-heading">➕ Link a Patient</h2>
            <div className="cards-grid-3">
              {unlinkedPatients.map((p) => (
                <div key={p._id} className="link-patient-card">
                  <div>
                    <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>{p.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</p>
                  </div>
                  <button
                    onClick={() => handleLinkPatient(p._id)}
                    className="btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.5rem 0.875rem' }}
                  >
                    Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Section */}
        <div>
          <h2 className="section-heading">🔔 Recent Alerts</h2>
          {alerts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✅</span>
              <p>No alerts. All patients are on track!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '30rem', overflowY: 'auto' }}>
              {alerts.slice(0, 20).map((alert) => (
                <div
                  key={alert._id}
                  className={`alert-card ${!alert.read ? 'unread' : 'read'}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <span className={`badge ${alert.type === 'missed_dose' ? 'badge-danger' :
                          alert.type === 'double_dose_attempt' ? 'badge-warning' : 'badge-info'
                        }`}>
                        {alert.type?.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>{alert.message}</p>
                    {alert.patientId && (
                      <p style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Patient: {alert.patientId.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                  {!alert.read && (
                    <button
                      onClick={() => handleMarkRead(alert._id)}
                      className="btn-outline"
                      style={{ fontSize: '0.6875rem', padding: '0.375rem 0.75rem', whiteSpace: 'nowrap' }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
