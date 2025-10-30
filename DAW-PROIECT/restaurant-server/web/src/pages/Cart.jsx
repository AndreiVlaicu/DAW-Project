import React, { useState } from 'react';
import { api, getCsrf, money } from '../api';

export default function Cart({ cart, setCart }) {
  const [placing, setPlacing] = useState(false);
  const total = cart.reduce((s, it) => s + it.qty * Number(it.p.price), 0);

  // ——— Helpers pentru cantități ———
  const inc = (idx) => {
    setCart(cs => cs.map((it, i) => i === idx ? { ...it, qty: it.qty + 1 } : it));
  };
  const dec = (idx) => {
    setCart(cs => cs.flatMap((it, i) => {
      if (i !== idx) return it;
      if (it.qty <= 1) return [];          // dacă era 1, elimină din coș
      return { ...it, qty: it.qty - 1 };
    }));
  };
  const removeItem = (idx) => {
    setCart(cs => cs.filter((_, i) => i !== idx));
  };
  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Sigur vrei să golești coșul?')) setCart([]);
  };

  // ——— Plasare comandă ———
  async function checkout() {
    try {
      setPlacing(true);
      await getCsrf();
      const items = cart.map(it => ({ product_id: it.p.id, qty: it.qty }));
      await api.post('/orders', { items });
      setCart([]);
      alert('Comanda a fost plasată!');
    } catch (e) {
      if (e?.response?.status === 401) {
        alert('Trebuie să fii logat ca să plasezi comanda.');
      } else if (e?.response?.data?.error) {
        alert(e.response.data.error);
      } else {
        alert('Eroare la plasare.');
      }
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className="flex between center" style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Coș</h2>
        {cart.length > 0 && (
          <button
            className="btn btn-ghost"
            onClick={clearCart}
            title="Golește coșul"
            style={{ borderRadius: 10 }}
          >
            🧹 Golește coșul
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <p>Coșul este gol.</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Produs</th>
                <th style={{ width: 220 }}>Cantitate</th>
                <th>Preț</th>
                <th>Total</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((it, idx) => (
                <tr key={`${it.p.id}-${idx}`}>
                  <td>{it.p.name}</td>

                  <td>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        border: '1px solid var(--border, #e5e7eb)',
                        padding: '6px 10px',
                        borderRadius: 10,
                      }}
                    >
                      <button
                        className="btn-ghost"
                        onClick={() => dec(idx)}
                        aria-label="Scade cantitatea"
                        title="Scade"
                        style={{ padding: '4px 8px', borderRadius: 8 }}
                      >
                        −
                      </button>
                      <strong style={{ minWidth: 18, textAlign: 'center' }}>
                        {it.qty}
                      </strong>
                      <button
                        className="btn-ghost"
                        onClick={() => inc(idx)}
                        aria-label="Mărește cantitatea"
                        title="Mărește"
                        style={{ padding: '4px 8px', borderRadius: 8 }}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td>{money(it.p.price)}</td>
                  <td>{money(it.qty * it.p.price)}</td>

                  <td>
                    <button
                      className="btn-ghost"
                      onClick={() => removeItem(idx)}
                      aria-label="Elimină produsul"
                      title="Elimină"
                      style={{ borderRadius: 10 }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bara total + checkout */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 12,
              padding: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 14, color: 'var(--muted)' }}>
                Total de plată
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {money(total)}
              </div>
            </div>

            <button
              onClick={checkout}
              disabled={placing || cart.length === 0}
              aria-busy={placing ? 'true' : 'false'}
              className="btn btn-primary"
              style={{
                minWidth: 220,
                padding: '14px 20px',
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 16,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background:
                  'linear-gradient(90deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%)',
                boxShadow:
                  '0 8px 20px rgba(99, 102, 241, .35), 0 2px 6px rgba(99, 102, 241, .25)',
                transition: 'transform .08s ease, box-shadow .2s ease',
                opacity: placing || cart.length === 0 ? 0.7 : 1,
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'translateY(1px)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {placing ? (
                <>
                  <span className="spinner" />
                  Se plasează…
                </>
              ) : (
                <>
                  <span role="img" aria-hidden>🛒</span>
                  Plasează comanda
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
