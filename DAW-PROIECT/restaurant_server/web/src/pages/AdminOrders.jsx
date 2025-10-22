import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function AdminOrders(){
  const [orders, setOrders] = useState([]);
  useEffect(()=>{ api.get('/admin/orders').then(r=> setOrders(r.data)).catch(()=>setOrders([])); },[]);
  return (
    <div>
      <h2>Comenzi</h2>
      <table className="table">
        <thead><tr><th>#</th><th>Client</th><th>Data</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {orders.map(o=>(
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.user_name}</td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
              <td>{o.status}</td>
              <td>{o.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
