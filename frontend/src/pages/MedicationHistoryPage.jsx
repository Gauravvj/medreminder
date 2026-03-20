import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

export default function MedicationHistoryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(user.role === 'patient' ? user._id : '');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user.role === 'caregiver') {
      api.get('/auth/me').then(res => {
        setPatients(res.data.linkedPatients || []);
        if (res.data.linkedPatients?.length > 0) setSelectedPatient(res.data.linkedPatients[0]._id);
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => { if (selectedPatient) fetchLogs(); }, [selectedPatient]);

  const fetchLogs = async () => {
    setLoading(true);
    try { const res = await api.get(`/logs/${selectedPatient}`); setLogs(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.status === filter);
  const methodEmoji = (m) => m === 'voice' ? '🎤' : m === 'camera' ? '📷' : '👆';

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="flex-col-sm-row">
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f1f5f9' }}>📋 Medication History</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>View complete medication log records</p>
          </div>
          {user.role === 'caregiver' && patients.length > 0 && (
            <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="input-field" style={{ width: 'auto' }}>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
        </div>

        <div className="filter-group">
          {['all', 'taken', 'missed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f === 'all' ? '📋 All' : f === 'taken' ? '✅ Taken' : '❌ Missed'}
              <span style={{ marginLeft: '0.5rem', fontSize: '0.6875rem', opacity: 0.6 }}>
                ({f === 'all' ? logs.length : logs.filter(l => l.status === f).length})
              </span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 0' }}>Loading...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No logs found.</p>
            </div>
          ) : (
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Status</th>
                      <th>Method</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                            {log.medicineId?.medicineName || 'Unknown'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${log.status === 'taken' ? 'badge-success' : 'badge-danger'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ color: '#cbd5e1' }}>
                          {methodEmoji(log.confirmationMethod)} {log.confirmationMethod}
                        </td>
                        <td style={{ color: '#94a3b8' }}>
                          {new Date(log.takenTime).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
