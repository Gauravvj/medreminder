import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

/**
 * MedicineSchedulePage — add/edit/delete medicines for a patient.
 * Caregivers can manage medicines for their linked patients.
 * Patients see their own medicines.
 */
export default function MedicineSchedulePage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(user.role === 'patient' ? user._id : '');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState({
    medicineName: '',
    dosage: '',
    scheduleTimes: '',
    instructions: '',
  });

  useEffect(() => {
    if (user.role === 'caregiver') {
      api.get('/auth/me').then(res => {
        setPatients(res.data.linkedPatients || []);
        if (res.data.linkedPatients?.length > 0) {
          setSelectedPatient(res.data.linkedPatients[0]._id);
        }
      }).catch(() => { });
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatient) fetchMedicines();
  }, [selectedPatient]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/medicines/${selectedPatient}`);
      setMedicines(res.data);
    } catch (err) {
      console.error('Failed to fetch medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      patientId: selectedPatient,
      medicineName: formData.medicineName,
      dosage: formData.dosage,
      scheduleTimes: formData.scheduleTimes.split(',').map(t => t.trim()),
      instructions: formData.instructions,
    };

    try {
      if (editingMed) {
        await api.put(`/medicines/${editingMed._id}`, payload);
      } else {
        await api.post('/medicines', payload);
      }
      setShowForm(false);
      setEditingMed(null);
      setFormData({ medicineName: '', dosage: '', scheduleTimes: '', instructions: '' });
      fetchMedicines();
    } catch {
      alert('Failed to save medicine');
    }
  };

  const handleEdit = (med) => {
    setEditingMed(med);
    setFormData({
      medicineName: med.medicineName,
      dosage: med.dosage,
      scheduleTimes: med.scheduleTimes.join(', '),
      instructions: med.instructions || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this medicine?')) return;
    try {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch {
      alert('Failed to delete medicine');
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="flex-col-sm-row">
          <div>
            <h1 className="page-header" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
              💊 Medicine Schedule
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>Manage daily medicines and schedule times</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Patient selector for caregivers */}
            {user.role === 'caregiver' && patients.length > 0 && (
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="input-field"
                style={{ width: 'auto' }}
              >
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => { setShowForm(!showForm); setEditingMed(null); setFormData({ medicineName: '', dosage: '', scheduleTimes: '', instructions: '' }); }}
              className={showForm ? 'btn-danger' : 'btn-primary'}
              style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
            >
              {showForm ? '✕ Cancel' : '➕ Add Medicine'}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="glass-card animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e2e8f0' }}>
              {editingMed ? '✏️ Edit Medicine' : '➕ New Medicine'}
            </h2>
            <div className="cards-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Medicine Name</label>
                <input
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Aspirin"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Dosage</label>
                <input
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Schedule Times</label>
                <input
                  value={formData.scheduleTimes}
                  onChange={(e) => setFormData({ ...formData, scheduleTimes: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 08:00, 14:00, 20:00"
                  required
                />
                <p style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.25rem' }}>Comma-separated, 24h format</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.375rem' }}>Instructions</label>
                <input
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Take after meals"
                />
              </div>
            </div>
            <div>
              <button type="submit" className="btn-success" style={{ fontSize: '0.8125rem' }}>
                {editingMed ? '💾 Update Medicine' : '✅ Add Medicine'}
              </button>
            </div>
          </form>
        )}

        {/* Medicines List */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '4rem 0' }}>Loading medicines...</div>
          ) : medicines.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No medicines added yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {medicines.map((med) => (
                <div key={med._id} className="schedule-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>{med.medicineName}</h3>
                      <span className="badge badge-info">{med.dosage}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.375rem' }}>
                      {med.scheduleTimes.map((t, i) => (
                        <span key={i} className="time-pill">🕐 {t}</span>
                      ))}
                    </div>
                    {med.instructions && (
                      <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>📝 {med.instructions}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(med)} className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem 0.875rem' }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(med._id)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.5rem 0.875rem' }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
