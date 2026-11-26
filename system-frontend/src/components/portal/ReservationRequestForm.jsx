import { useEffect, useState } from 'react';
import { getFacilities, submitReservation } from '../../services/reservationApi';

const EMPTY = {
  resident_name: '',
  contact_number: '',
  facility_id: '',
  date: '',
  start_time: '',
  end_time: '',
  purpose: '',
};

export default function ReservationRequestForm() {
  const [form, setForm] = useState(EMPTY);
  const [facilities, setFacilities] = useState([]);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFacilities()
      .then(setFacilities)
      .catch(() => setMessage({ type: 'error', text: 'Hindi ma-load ang listahan ng facilities.' }));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.start_time >= form.end_time) {
      setMessage({ type: 'error', text: 'Dapat mas huli ang end time kaysa start time.' });
      return;
    }

    setLoading(true);
    try {
      const saved = await submitReservation(form);
      setMessage({
        type: 'success',
        text: `Naipadala na ang request #${saved.id} para sa ${saved.facility_name}. Status: ${saved.status}.`,
      });
      setForm(EMPTY);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Facility Reservation Request</h2>

      <label style={styles.label}>Pangalan
        <input name="resident_name" value={form.resident_name} onChange={handleChange} required />
      </label>

      <label style={styles.label}>Contact number
        <input name="contact_number" value={form.contact_number} onChange={handleChange} required />
      </label>

      <label style={styles.label}>Facility
        <select name="facility_id" value={form.facility_id} onChange={handleChange} required>
          <option value="">Pumili ng facility</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </label>

      <label style={styles.label}>Petsa
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
      </label>

      <div style={styles.row}>
        <label style={styles.label}>Start time
          <input type="time" name="start_time" value={form.start_time} onChange={handleChange} required />
        </label>
        <label style={styles.label}>End time
          <input type="time" name="end_time" value={form.end_time} onChange={handleChange} required />
        </label>
      </div>

      <label style={styles.label}>Layunin
        <textarea name="purpose" value={form.purpose} onChange={handleChange} rows={3} required />
      </label>

      {message && (
        <p role="alert" style={{ color: message.type === 'success' ? 'green' : 'crimson' }}>
          {message.text}
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Ipinapadala...' : 'Submit request'}
      </button>
    </form>
  );
}

// Pangunahing styling lang; palitan ng style/CSS classes ng project ninyo
const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  row: { display: 'flex', gap: 12 },
};
