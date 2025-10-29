// src/pages/MyOrders.jsx
import React, { useEffect, useState } from 'react';
import { api, money } from '../api';

export default function MyOrders(){
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(()=>{
    api.get('/my-orders')
      .then(r => setOrders(r.data || []))
      .catch(e => setErr(e?.response?.data?.error || e.message));
  },[]);

  return (
    <div className="container" style={{marginTop:24}}>
      <h2>Comenzile mele</h2>
      {err && <div className="alert">{err}</div>}
      <table className="table">
        <thead><tr><th>#</th><th>Data</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {orders.map(o=>(
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
              <td>{o.status}</td>
              <td>{money(o.total)}</td>
            </tr>
          ))}
          {orders.length === 0 && !err && (
            <tr><td colSpan={4} style={{color:'var(--muted)'}}>Nu ai comenzi încă.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
