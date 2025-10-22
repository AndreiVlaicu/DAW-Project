import React, { useState } from 'react';
import { register } from '../auth';

export default function Register({ onDone }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // client | employee
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setErr(null); setLoading(true);
    try{
      await register(name, email, password, role);
      onDone();
    }catch(e){
      setErr(e?.response?.data?.error || 'Eroare la înregistrare');
    }finally{ setLoading(false); }
  }

  return (
    <div className="container" style={{maxWidth: 560, marginTop: 32}}>
      <div className="card">
        <h2 style={{marginTop:0, marginBottom:12}}>Înregistrare</h2>

        {/* Role picker */}
        <div style={{marginBottom:16}}>
          <div className="seg">
            <label className={`seg-item ${role==='client'?'active':''}`}>
              <input type="radio" name="role" value="client"
                     checked={role==='client'} onChange={()=>setRole('client')} />
              Client
            </label>
            <label className={`seg-item ${role==='employee'?'active':''}`}>
              <input type="radio" name="role" value="employee"
                     checked={role==='employee'} onChange={()=>setRole('employee')} />
              Angajat
            </label>
          </div>
        </div>

        {err && <div className="alert">{err}</div>}

        <form className="form" onSubmit={submit}>
          <div className="form-row">
            <label>Nume</label>
            <input required value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Parolă</label>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Se creează…' : 'Creează cont'}
          </button>
        </form>
      </div>
    </div>
  );
}
