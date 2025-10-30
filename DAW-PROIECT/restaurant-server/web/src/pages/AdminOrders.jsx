// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from 'react';
import { api, getCsrf, money } from '../api';

export default function AdminOrders(){
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [err, setErr] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const [r1, r2] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/order-statuses'),
      ]);
      setOrders(r1.data || []);
      setStatuses(r2.data || []);
      setErr(null);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  async function changeStatus(orderId, toStatus) {
    try {
      setSavingId(orderId);
      await getCsrf();
      await api.patch(`/admin/orders/${orderId}/status`, { to_status: toStatus });

      setOrders(os => os.map(o => o.id === orderId ? { ...o, status: toStatus } : o));
    } catch (e) {
      alert(e?.response?.data?.error || 'Nu s-a putut schimba statusul.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="container" style={{ marginTop: 24 }}>
      <h2>Comenzi</h2>
      {err && <div className="alert">{err}</div>}
      {loading ? <p>Se încarcă…</p> : (
        <table className="table">
          <thead>
            <tr><th>#</th><th>Client</th><th>Data</th><th>Status</th><th>Total</th></tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.user_name}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e)=>changeStatus(o.id, e.target.value)}
                    disabled={savingId === o.id}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>{money(o.total)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} style={{color:'var(--muted)'}}>Nu există comenzi.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
