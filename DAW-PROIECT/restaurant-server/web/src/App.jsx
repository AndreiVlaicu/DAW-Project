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

// Helpers pentru NavLink activ
const navCls = ({ isActive }) => (isActive ? 'active' : undefined);

// Gărzi simple (frontend). Backend-ul oricum validează, dar ascundem rutele vizual.
function RequireAuth({ user, children }) {
  if (!user) return <Navigate replace to="/login" />;
  return children;
}
function EmployeeOnly({ user, children }) {
  if (!user) return <Navigate replace to="/login" />;
  if (user.role !== 'employee') return <Navigate replace to="/menu" />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]); // [{ p, qty }]
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

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  return (
    <div>
      {/* HEADER */}
      <header className="site-header">
        <div className="container flex between center">
          <Link className="brand" to="/">🍝 Restaurant</Link>
          <nav>
            <NavLink className={navCls} to="/menu">Meniu</NavLink>
            <NavLink className={navCls} to="/cart">Coș ({cartCount})</NavLink>

            {user ? (
              <>
                <span style={{ margin: '0 8px' }}>
                  Salut, <strong>{user.name}</strong> ({user.role})
                </span>

                {user.role === 'employee' ? (
                  <>
                    <NavLink className={navCls} to="/admin/products">Admin Produse</NavLink>
                    <NavLink className={navCls} to="/admin/orders">Comenzi</NavLink>
                  </>
                ) : (
                  <NavLink className={navCls} to="/my-orders">Comenzile mele</NavLink>
                )}

                <button className="btn-link" onClick={doLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className={navCls} to="/login">Login</NavLink>
                <NavLink className={navCls} to="/register">Register</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* PAGINI */}
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/menu" element={<Menu onAdd={addToCart} />} />

          <Route
            path="/login"
            element={<Login onDone={async () => { setUser(await me()); nav('/'); }} />}
          />

          <Route
            path="/register"
            element={<Register onDone={async () => { setUser(await me()); nav('/'); }} />}
          />

          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />

          {/* Client: Comenzile mele */}
          <Route
            path="/my-orders"
            element={
              <RequireAuth user={user}>
                <MyOrders />
              </RequireAuth>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/products"
            element={
              <EmployeeOnly user={user}>
                <AdminProducts />
              </EmployeeOnly>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <EmployeeOnly user={user}>
                <AdminOrders />
              </EmployeeOnly>
            }
          />

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
