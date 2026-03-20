import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  PieChart, LineChart, Line, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function MedicationHistoryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(user.role === 'patient' ? user._id : '');
  const [loading, setLoading] = useState(true);

  // Colors for the pie chart
  const COLORS = {
    taken: '#34d399', // Emerald
    missed: '#f87171', // Red
    fallback: '#94a3b8'
  };

  useEffect(() => {
    if (user.role === 'caregiver') {
      api.get('/auth/me').then(res => {
        setPatients(res.data.linkedPatients || []);
        if (res.data.linkedPatients?.length > 0) setSelectedPatient(res.data.linkedPatients[0]._id);
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => { 
    if (selectedPatient) fetchLogs(); 
  }, [selectedPatient]);

  const fetchLogs = async () => {
    setLoading(true);
    try { 
      const res = await api.get(`/logs/${selectedPatient}`); 
      setLogs(res.data); 
    }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const methodEmoji = (m) => m === 'voice' ? '🎤' : m === 'camera' ? '📷' : '👆';

  // Calculate metrics
  const totalLogs = logs.length;
  const takenLogs = logs.filter(l => l.status === 'taken');
  const missedLogs = logs.filter(l => l.status === 'missed');
  
  const relevantTotal = takenLogs.length + missedLogs.length;
  const adherenceRate = relevantTotal > 0 ? Math.round((takenLogs.length / relevantTotal) * 100) : 0;

  // Prepare data for the Pie Chart
  const pieData = [
    { name: 'Taken', value: takenLogs.length, color: COLORS.taken },
    { name: 'Missed', value: missedLogs.length, color: COLORS.missed }
  ].filter(d => d.value > 0); // Hide empty segments

  // Generate an encouraging message
  const getEncouragement = () => {
    if (totalLogs === 0) return "No data yet. Keep tracking!";
    if (adherenceRate >= 90) return "🌟 Incredible job! You're staying perfectly on track.";
    if (adherenceRate >= 75) return "👍 Doing great! Let's aim for a perfect week.";
    if (adherenceRate > 50) return "💪 You've got this. Try to set an alarm to help remember.";
    return "💡 Remember, every dose matters. You can do this!";
  };

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '2rem' }}>
        
        {/* Page Header */}
        <div className="flex-col-sm-row">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.025em' }}>
              Your Progress
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.375rem' }}>
              See how well you're keeping up with your medication
            </p>
          </div>
          {user.role === 'caregiver' && patients.length > 0 && (
            <select 
              value={selectedPatient} 
              onChange={(e) => setSelectedPatient(e.target.value)} 
              className="input-field" 
              style={{ width: 'auto', background: 'rgba(30,30,40,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 0' }}>Loading your stats...</div>
        ) : totalLogs === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <p>No medication history found yet.</p>
          </div>
        ) : (
          <>
            {/* Top Insight Banner */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(34, 211, 238, 0.05) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '2rem' }}>
                {adherenceRate >= 90 ? '🏆' : adherenceRate >= 70 ? '📈' : '🎯'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#e0e7ff' }}>Insight</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#a5b4fc', fontSize: '0.9375rem' }}>
                  {getEncouragement()}
                </p>
              </div>
            </div>

            {/* Dashboard Visuals */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              
              {/* Pie Chart Card */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#cbd5e1', fontSize: '1.125rem', fontWeight: 600 }}>Dose Breakdown</h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        animationBegin={200}
                        animationDuration={1200}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', color: '#f8fafc' }}
                        itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span style={{ color: '#cbd5e1', fontWeight: 500, marginRight: '1rem' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Center text manually using CSS absolute positioning over chart wrapper */}
                <div style={{ position: 'absolute', marginTop: '125px', textAlign: 'center', pointerEvents: 'none' }}>
                  <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>{adherenceRate}%</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adherence</p>
                </div>
              </div>

              {/* Status Metric Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Total Tracked</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#818cf8', margin: 0 }}>{relevantTotal}</p>
                  </div>
                  <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>💊</div>
                </div>
                
                <div className="glass-card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #34d399' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Doses Taken</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', margin: 0 }}>{takenLogs.length}</p>
                  </div>
                  <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>✅</div>
                </div>

                <div className="glass-card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #f87171' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Doses Missed</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f87171', margin: 0 }}>{missedLogs.length}</p>
                  </div>
                  <div style={{ fontSize: '2.5rem', opacity: 0.5 }}>❌</div>
                </div>
              </div>
            </div>

            {/* Recent Timeline */}
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#f1f5f9', fontWeight: 700, margin: '1rem 0 1.5rem 0' }}>Recent Activity</h3>
              <div className="glass-card" style={{ padding: '0' }}>
                {logs.slice(0, 5).map((log, i) => (
                  <div 
                    key={log._id} 
                    style={{ 
                      padding: '1.25rem 1.5rem',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      borderBottom: i < Math.min(logs.length, 5) - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: log.status === 'taken' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
                      }}>
                        {log.status === 'taken' ? '✅' : '❌'}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0', fontSize: '1rem' }}>
                          {log.medicineId?.medicineName || 'Deleted Medicine'}
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {methodEmoji(log.confirmationMethod)} Logged via {log.confirmationMethod}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                        {new Date(log.takenTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p style={{ margin: '0.125rem 0 0 0', color: '#64748b', fontSize: '0.75rem' }}>
                        {new Date(log.takenTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}
      </div>
    </Layout>
  );
}
