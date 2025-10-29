import React, { useEffect, useMemo, useState } from 'react';
import { api, money } from '../api';
import Carusel from '../components/Carusel';

// 🔽 imaginile pentru carusel (din /public/carusel)
const CaruselImages = [
  { src: '/carusel/28.jpeg', title: 'Penne Pomodoro',      caption: 'Paste cu sos de roșii și busuioc' },
  { src: '/carusel/30.jpeg', title: 'Spaghete Bolognese',  caption: 'Sos bogat, gătit lent' },
  { src: '/carusel/38.jpeg', title: 'Risotto roșu',        caption: 'Cremos, direct din tigaie' },
  { src: '/carusel/27.jpeg', title: 'Wrap/Șaorma',         caption: 'Carne fragedă, sos de usturoi' },
  { src: '/carusel/25.jpeg', title: 'Steak la grătar',     caption: 'Carne suculentă, servită mediu' },
  { src: '/carusel/33.jpeg', title: 'Supă de legume',      caption: 'Ușoară și reconfortantă' },
  { src: '/carusel/16.jpeg', title: 'Tiramisu',            caption: 'Clasic italian, mascarpone fin' },
  { src: '/carusel/13.jpeg', title: 'Iced Coffee',         caption: 'Răcoritor, perfect la prânz' },
];

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // scoate diacriticele pt. căutare mai prietenoasă

export default function Menu({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/products')
      .then((r) => setProducts(r.data))
      .catch((e) => setErr(e.message));
  }, []);

  // filtrează în memorie după nume + descriere (case-insensitive, fără diacritice)
  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return products;
    return products.filter(
      (p) => norm(p.name).includes(q) || norm(p.description).includes(q)
    );
  }, [products, query]);

  return (
    <div className="container" style={{ marginTop: 24 }}>
      {/* Carusel */}
      <Carusel
        images={CaruselImages}
        height={400}
        maxWidth={920}
        objectPosition="center"
      />

      {/* 🔎 Căutare */}
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{
          margin: '16px 0 10px',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
        aria-label="Caută în meniu"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută preparate (ex. „pizza”, „tort”, „supă”)"
          aria-label="Câmp căutare meniu"
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px solid var(--border,#e5e7eb)',
            outline: 'none',
          }}
        />
        {query && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setQuery('')}
            aria-label="Șterge căutarea"
          >
            ✕
          </button>
        )}
      </form>

      {/* Titlu + mic rezumat rezultate */}
      <div className="flex between center" style={{ margin: '2px 0 12px' }}>
        <h2 style={{ margin: 0 }}>Meniu</h2>
        <small style={{ color: 'var(--muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'rezultat' : 'rezultate'}
          {query ? ` pentru „${query}”` : ''}
        </small>
      </div>

      {err && <div className="alert">{err}</div>}

      {/* Lista de produse (filtrată) */}
      <div className="grid">
        {filtered.map((p) => (
          <div className="card product-card" key={p.id}>
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                style={{
                  width: '100%',
                  height: 160,
                  objectFit: 'cover',
                  borderRadius: 12,
                  marginBottom: 10,
                }}
              />
            )}
            <div className="title">{p.name}</div>
            {p.description && (
              <p style={{ color: 'var(--muted)', marginTop: 4 }}>{p.description}</p>
            )}
            <div className="price" style={{ margin: '10px 0' }}>
              {money(p.price)}
            </div>
            <button className="btn btn-ghost w-full" onClick={() => onAdd(p)}>
              Adaugă în coș
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !err && (
        <p style={{ color: 'var(--muted)', marginTop: 12 }}>
          N-am găsit nimic pentru „{query}”. Încearcă alt termen.
        </p>
      )}
    </div>
  );
}
