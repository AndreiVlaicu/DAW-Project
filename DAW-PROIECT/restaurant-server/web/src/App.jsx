import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, Navigate } from 'react-router-dom';

import Menu from './pages/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';

import { me, logout } from './auth';

export default function App() {
  const [user, setUser] = useState(null);        // utilizatorul logat (sau null)
  const [cart, setCart] = useState([]);          // [{ p, qty }]
  const nav = useNavigate();

  // ia utilizatorul curent la mount
  useEffect(() => {
    me().then(setUser).catch(() => setUser(null));
  }, []);

  async function doLogout() {
    try { await logout(); } finally { setUser(null); nav('/'); }
  }

  function addToCart(p) {
    const i = cart.findIndex(x => x.p.id === p.id);
    if (i >= 0) {
      const next = [...cart];
      next[i].qty++;
      setCart(next);
    } else {
      setCart([...cart, { p, qty: 1 }]);
    }
  }

  return (
    <div>
      {/* HEADER */}
      <header className="site-header">
        <div className="container flex between center">
          <Link className="brand" to="/">🍝 Restaurant</Link>
          <nav>
            <NavLink to="/menu">Meniu</NavLink>
            <NavLink to="/cart">Coș ({cart.reduce((s, x) => s + x.qty, 0)})</NavLink>
            {user ? (
              <>
                <span style={{ margin: '0 8px' }}>
                  Salut, <strong>{user.name}</strong> ({user.role})
                </span>
                {user.role === 'employee' && (
                  <>
                    <NavLink to="/admin/products">Admin Produse</NavLink>
                    <NavLink to="/admin/orders">Comenzi</NavLink>
                  </>
                )}
                <button className="btn-link" onClick={doLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* PAGINI */}
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/menu"
            element={<Menu onAdd={addToCart} />}
          />

          <Route
            path="/login"
            element={<Login onDone={async () => { setUser(await me()); nav('/'); }} />}
          />

          <Route
            path="/register"
            element={<Register onDone={async () => { setUser(await me()); nav('/'); }} />}
          />

          <Route
            path="/cart"
            element={<Cart cart={cart} setCart={setCart} />}
          />

          <Route path="/my-orders" element={<MyOrders />} />

          {/* Admin – backend-ul oricum verifică rolul */}
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />

          {/* fallback */}
          <Route path="*" element={<Navigate replace to="/menu" />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} Restaurant</p>
      </footer>
    </div>
  );
}

function Home() {
  return (
    <section style={{ paddingTop: 12 }}>
      <h2>Bun venit!</h2>
      <p>
        Intră la <Link to="/menu">Meniu</Link>, adaugă în coș și finalizează comanda.
      </p>
    </section>
  );
}
