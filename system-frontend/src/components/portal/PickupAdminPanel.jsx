import { useCallback, useEffect, useState } from 'react';
import { getReservations, setPickupSchedule, updatePickupStatus } from '../../services/reservationApi';

export const PICKUP_LABELS = { scheduled: 'Naka-schedule', prepared: 'Handa na', released: 'Naibigay na' };

// Admin: set pickup schedules of approved reservations and update their pickup status
export default function PickupAdminPanel() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  const load = useCallback(
    () =>
      getReservations({ status: 'approved' })
        .then(setItems)
        .catch((e) => setMessage({ type: 'error', text: e.message })),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action, successText) => {
    setMessage(null);
    try {
      await action();
      setMessage({ type: 'success', text: successText });
      await load();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <section>
      <h2>Facility Pickup</h2>
      {message && (
        <p role="alert" style={{ color: message.type === 'success' ? 'green' : 'crimson' }}>{message.text}</p>
      )}
      {items.length === 0 && <p>Wala pang approved na reservation.</p>}
      {items.map((r) => (
        <PickupRow
          key={r.id}
          r={r}
          onSave={(sched) => run(() => setPickupSchedule(r.id, sched), 'Na-save ang pickup schedule.')}
          onStatus={(status) =>
            run(() => updatePickupStatus(r.id, status), `Na-update ang status: ${PICKUP_LABELS[status]}.`)
          }
        />
      ))}
    </section>
  );
}

function PickupRow({ r, onSave, onStatus }) {
  const [date, setDate] = useState(r.pickup_date || '');
  const [time, setTime] = useState(r.pickup_time || '');
  const released = r.pickup_status === 'released';

  return (
    <div style={styles.card}>
      <strong>{r.facility_name}</strong> - {r.resident_name} ({r.contact_number})
      <div>Reservation: {r.date}, {r.start_time} - {r.end_time}</div>
      <div>
        Pickup status: <b>{r.pickup_status ? PICKUP_LABELS[r.pickup_status] : 'Wala pang schedule'}</b>
      </div>

      <div style={styles.row}>
        <input type="date" value={date} max={r.date} disabled={released} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} disabled={released} onChange={(e) => setTime(e.target.value)} />
        <button disabled={released || !date || !time} onClick={() => onSave({ pickup_date: date, pickup_time: time })}>
          {r.pickup_status ? 'Update schedule' : 'Set schedule'}
        </button>
      </div>

      {r.pickup_status && !released && (
        <div style={styles.row}>
          {r.pickup_status === 'scheduled' && <button onClick={() => onStatus('prepared')}>Mark as prepared</button>}
          <button onClick={() => onStatus('released')}>Mark as released</button>
        </div>
      )}
    </div>
  );
}

// Pangunahing styling lang; palitan ng style/CSS classes ng project ninyo
const styles = {
  card: { border: '1px solid #ccc', borderRadius: 8, padding: 12, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' },
};
