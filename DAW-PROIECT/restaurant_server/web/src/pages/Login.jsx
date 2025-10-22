import React, { useState } from 'react';
import { login } from '../auth';

export default function Login({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setErr(null); setLoading(true);
    try{
      await login(email, password);
      onDone();
    }catch(e){
      setErr(e?.response?.data?.error || 'Eroare la autentificare');
    }finally{ setLoading(false); }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2 style={{marginTop:0, marginBottom:4}}>Login</h2>
        {err && <div className="alert">{err}</div>}
        <form className="form" onSubmit={submit}>
          <div className="form-row">
            <label>Email</label>
            <input type="email" placeholder="ex: chef@demo.test" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Parolă</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Se autentifică…' : 'Autentificare'}
          </button>
        </form>
      </div>
    </div>
  );
}
