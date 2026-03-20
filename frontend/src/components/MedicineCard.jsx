import api from '../services/api';

/**
 * MedicineCard component.
 * Displays a single medicine with its schedule and provides
 * a confirm button for logging intake.
 */
export default function MedicineCard({ medicine, patientId, onLogged }) {
  const handleConfirm = async (method = 'manual') => {
    try {
      const res = await api.post('/logs', {
        patientId,
        medicineId: medicine._id,
        confirmationMethod: method,
      });

      if (res.data.isDuplicate) {
        alert(res.data.message);
      } else {
        onLogged?.(res.data);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        alert(err.response.data.message);
      } else {
        alert('Failed to log medicine');
      }
    }
  };

  // Check if any schedule time is near the current time (±30 min)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isUpcoming = medicine.scheduleTimes?.some(time => {
    const [h, m] = time.split(':').map(Number);
    const scheduleMinutes = h * 60 + m;
    const diff = scheduleMinutes - currentMinutes;
    return diff >= -30 && diff <= 30;
  });

  return (
    <div className={`medicine-card ${isUpcoming ? 'is-upcoming' : ''}`}>
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f1f5f9' }}>{medicine.medicineName}</h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.125rem' }}>{medicine.dosage}</p>
          </div>
          {isUpcoming && (
            <span className="badge badge-warning">⏰ Due Now</span>
          )}
        </div>

        {/* Schedule Times */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {medicine.scheduleTimes?.map((time, i) => (
            <span key={i} className="time-pill">
              🕐 {time}
            </span>
          ))}
        </div>

        {/* Instructions */}
        {medicine.instructions && (
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>📝 {medicine.instructions}</p>
        )}
      </div>

      {/* Action Button */}
      <div className="card-footer">
        <button
          onClick={() => handleConfirm('manual')}
          className="btn-success"
          style={{ width: '100%', fontSize: '0.8125rem' }}
        >
          ✅ I Took This Medicine
        </button>
      </div>
    </div>
  );
}
