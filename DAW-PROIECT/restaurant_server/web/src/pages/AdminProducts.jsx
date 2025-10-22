import React, { useEffect, useState } from 'react';
import { api, getCsrf, money } from '../api';

export default function AdminProducts(){
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name:'', description:'', price:'', image_url:'', category_id:'' });
  const [err, setErr] = useState(null);

  async function load(){
    setErr(null);
    try{
      const [rProd, rCats] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setProducts(rProd.data);
      setCategories(rCats.data);
    }catch(e){
      setErr(e?.response?.data?.error || e.message);
    }
  }
  useEffect(()=>{ load(); },[]);

  async function add(e){
    e.preventDefault(); setErr(null);
    try{
      await getCsrf();
      await api.post('/admin/products', {
        name: form.name,
        description: form.description,
        price: Number(form.price)||0,
        image_url: form.image_url || null,
        category_id: form.category_id ? Number(form.category_id) : null,
      });
      setForm({ name:'', description:'', price:'', image_url:'', category_id:'' });
      await load();
    }catch(e){ setErr(e?.response?.data?.error || e.message); }
  }

  async function del(id){
    try{ await getCsrf(); await api.delete(`/admin/products/${id}`); await load(); }
    catch(e){ setErr(e?.response?.data?.error || e.message); }
  }

  return (
    <div className="container" style={{marginTop:24}}>
      <h2>Admin – Produse</h2>
      {err && <div className="alert">{err}</div>}

      {/* layout cu 2 coloane: formular + listă categorii */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:18, alignItems:'start'}}>
        <div className="card">
          <form className="form" onSubmit={add}>
            <div className="form-row">
              <label>Nume</label>
              <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            </div>
            <div className="form-row">
              <label>Descriere</label>
              <textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            </div>
            <div className="form-row">
              <label>Preț</label>
              <input type="number" step="0.01" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
            </div>
            <div className="form-row">
              <label>Imagine URL</label>
              <input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/>
            </div>
            <div className="form-row">
              <label>Categorie</label>
              <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
                <option value="">(Fără categorie)</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (#{c.id})</option>
                ))}
              </select>
              <small style={{color:'var(--muted)'}}>Poți și să dai click pe o categorie din panoul din dreapta.</small>
            </div>
            <div>
              <button className="btn btn-primary">Salvează produs</button>
            </div>
          </form>
        </div>

        {/* Panou lateral cu categoriile (ID + denumire) */}
        <aside className="card" style={{position:'sticky', top:92}}>
          <h3 style={{marginTop:0, marginBottom:8}}>Categorii</h3>
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
            {categories.map(c => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={()=>setForm(f=>({...f, category_id: String(c.id) }))}
                  className="btn-ghost"
                  style={{width:'100%', justifyContent:'space-between', borderRadius:12, padding:'10px 12px'}}
                  title="Click pentru a seta categoria în formular"
                >
                  <span>{c.name}</span>
                  <code style={{opacity:.7}}>#{c.id}</code>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Tabelul cu produse */}
      <table className="table" style={{marginTop:18}}>
        <thead><tr><th>#</th><th>Produs</th><th>Preț</th><th>Acțiuni</th></tr></thead>
        <tbody>
          {products.map(p=>(
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{money(p.price)}</td>
              <td><button className="btn btn-ghost" onClick={()=>del(p.id)}>Șterge</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
