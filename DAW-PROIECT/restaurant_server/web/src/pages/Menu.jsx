import React, { useEffect, useState } from 'react';
import { api, money } from '../api';
import Carusel from '../components/Carusel';

// 🔽 pune aici pozele tale (din /public/hero sau URL extern)
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

export default function Menu({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/products').then(r=>setProducts(r.data)).catch(e=>setErr(e.message));
  }, []);

  return (
    <div className="container" style={{marginTop:24}}>
      {/* Carusel deasupra meniului */}
      <Carusel
  images={CaruselImages}
  height={400}          // înălțime fixă
  maxWidth={920}
  objectPosition="center"
/>


      <h2 style={{margin:'8px 0 16px'}}>Meniu</h2>
      {err && <div className="alert">{err}</div>}

      <div className="grid">
        {products.map(p=>(
          <div className="card product-card" key={p.id}>
            {p.image_url && (
              <img src={p.image_url} alt={p.name}
                   style={{width:'100%', height:160, objectFit:'cover', borderRadius:12, marginBottom:10}} />
            )}
            <div className="title">{p.name}</div>
            {p.description && <p style={{color:'var(--muted)', marginTop:4}}>{p.description}</p>}
            <div className="price" style={{margin:'10px 0'}}>{money(p.price)}</div>
            <button className="btn btn-ghost w-full" onClick={()=>onAdd(p)}>Adaugă în coș</button>
          </div>
        ))}
      </div>

      {products.length === 0 && !err && (
        <p style={{color:'var(--muted)', marginTop:12}}>Nu există produse active încă.</p>
      )}
    </div>
  );
}
