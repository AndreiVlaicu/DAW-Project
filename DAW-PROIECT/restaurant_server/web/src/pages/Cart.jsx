import React from 'react';
import { api, getCsrf, money } from '../api';

export default function Cart({ cart, setCart }) {
  const total = cart.reduce((s, it) => s + it.qty * Number(it.p.price), 0);

  async function checkout(){
    try{
      await getCsrf();
      const items = cart.map(it => ({ product_id: it.p.id, qty: it.qty }));
      await api.post('/orders', { items });
      setCart([]);
      alert('Comanda a fost plasată!');
    }catch(e){
      if (e?.response?.status === 401) {
        alert('Trebuie să fii logat ca să plasezi comanda.');
      } else if (e?.response?.data?.error) {
        alert(e.response.data.error);
      } else {
        alert('Eroare la plasare.');
      }
    }
  }

  return (
    <div>
      <h2>Coș</h2>
      {cart.length === 0 ? <p>Coșul este gol.</p> : (
        <>
          <table className="table">
            <thead><tr><th>Produs</th><th>Cantitate</th><th>Preț</th><th>Total</th></tr></thead>
            <tbody>
              {cart.map((it, idx)=>(
                <tr key={idx}>
                  <td>{it.p.name}</td>
                  <td>{it.qty}</td>
                  <td>{money(it.p.price)}</td>
                  <td>{money(it.qty * it.p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p><strong>Total: {money(total)}</strong></p>
          <button onClick={checkout}>Plasează comanda</button>
        </>
      )}
    </div>
  );
}

