import { useState } from 'react';
import { getReservations } from '../../services/reservationApi';
import { PICKUP_LABELS } from './PickupAdminPanel';

const STATUS_LABELS = { pending: 'Hinihintay ang aprubal', approved: 'Aprubado', rejected: 'Hindi naaprubahan' };

// Resident: look up own requests by contact number, see pickup schedule and its current status.
// (Kapag may login na, palitan ang lookup ng reservations ng naka-login na resident.)
export default function ResidentPickupStatus() {
  const [contact, setContact] = useState('');
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const search = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setItems(await getReservations({ contact_number: contact.trim() }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <h2>Status ng Reservation at Pickup</h2>
      <form onSubmit={search} style={styles.row}>
        <input placeholder="Contact number" value={contact} onChange={(e) => setContact(e.target.value)} required />
        <button type="submit">Hanapin</button>
      </form>

      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
      {items && items.length === 0 && <p>Walang nakitang request para sa numerong iyan.</p>}

      {items?.map((r) => (
        <div key={r.id} style={styles.card}>
          <strong>{r.facility_name}</strong>
          <div>{r.date}, {r.start_time} - {r.end_time}</div>
          <div>Status: {STATUS_LABELS[r.status]}</div>
          {r.status === 'approved' &&
            (r.pickup_status ? (
              <div>
                Pickup: <b>{r.pickup_date} {r.pickup_time}</b> - {PICKUP_LABELS[r.pickup_status]}
                {r.pickup_remarks && <div>Paalala: {r.pickup_remarks}</div>}
              </div>
            ) : (
              <div>Wala pang pickup schedule.</div>
            ))}
        </div>
      ))}
    </section>
  );
}

// Pangunahing styling lang; palitan ng style/CSS classes ng project ninyo
const styles = {
  row: { display: 'flex', gap: 8, marginBottom: 12 },
  card: { border: '1px solid #ccc', borderRadius: 8, padding: 12, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 4 },
};
