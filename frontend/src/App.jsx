import { useState, useEffect, useCallback } from 'react';
import { ToastContainer, useToasts, SkeletonCard } from './components/ui.jsx';
import { ProductCard, ProductModal, CartSidebar } from './components/shop.jsx';
import { CheckoutModal } from './components/checkout.jsx';
import { AdminPanel } from './components/admin.jsx';
import { ClusterDashboard } from './components/cluster.jsx';
import { CATEGORIES, API_BASE, CART_ID } from './data.js';

/* ─── ONYX PALETTE ────────────────────────────────── */
const S = {
  primary:   '#ff8e80',
  dark:      '#e2241f',
  deeper:    '#c1000a',
  light:     '#262626',
  subtle:    '#1a1a1a',
  gradient:  'linear-gradient(135deg, #ff8e80 0%, #e2241f 100%)',
  heroGrad:  'radial-gradient(ellipse at top left, rgba(255,142,128,0.15) 0%, rgba(14,14,14,1) 80%)',
  shadow:    'rgba(255,142,128,0.15)',
};

/* ─── PATH ROUTER (simple hash-based) ───────────────── */
function useRoute() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const isAdmin = hash === '#/admin' || hash === '#admin';
  return { isAdmin, hash };
}

/* ─── AUTH PAGE ──────────────────────────────────────── */
function AuthPage({ onLogin, isAdminPath }) {
  const role = isAdminPath ? 'admin' : 'customer';
  const [tab, setTab]       = useState('login');
  const [busy, setBusy]     = useState(false);
  const [form, setForm]     = useState({ username:'', email:'', password:'', confirm:'' });
  const [error, setError]   = useState('');

  const blankForm = { username:'', email:'', password:'', confirm:'' };

  const switchTab = (t) => { setTab(t); setError(''); setForm(blankForm); };

  const update = (k, v) => {
    if (error) setError('');           // clear error as soon as user types
    setForm(f => ({...f, [k]: v}));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (tab === 'register') {
      if (!form.username.trim()) return setError('Username is required.');
      if (!form.email.includes('@')) return setError('Enter a valid email.');
      if (form.password.length < 6) return setError('Password must be 6+ chars.');
      if (form.password !== form.confirm) return setError('Passwords do not match.');
    } else {
      if (!form.username.trim()) return setError('Enter your username.');
      if (!form.password) return setError('Enter your password.');
    }
    setBusy(true);
    try {
      const endpoint = tab === 'register' ? '/auth/register' : '/auth/login';
      const body = { username: form.username.trim(), password: form.password, role };
      if (tab === 'register') body.email = form.email.trim();

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        onLogin({ id: data.user.username, role: data.user.role, email: data.user.email });
      } else {
        setError(data.message || 'Authentication failed');
        // Clear sensitive fields so user can re-enter
        setForm(f => ({ ...f, password: '', confirm: '' }));
      }
    } catch (err) {
      setError('Server offline. Please try again.');
      setForm(f => ({ ...f, password: '', confirm: '' }));
    }
    setBusy(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
      background: 'var(--bg-main)',
    }}>
      <div style={{ position:'absolute', top:'-100px', left:'-100px', width:'400px', height:'400px', background: isAdminPath ? '#ef4444' : S.primary, borderRadius:'50%', filter:'blur(120px)', opacity:.12, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-80px', right:'-80px', width:'350px', height:'350px', background: isAdminPath ? '#dc2626' : '#f97316', borderRadius:'50%', filter:'blur(100px)', opacity:.1, pointerEvents:'none' }}/>

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:'420px' }}>
        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            width:'60px', height:'60px', borderRadius:'18px', marginBottom:'14px',
            background: isAdminPath ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : S.gradient,
            boxShadow: isAdminPath ? '0 8px 24px rgba(239,68,68,0.35)' : `0 8px 24px ${S.shadow}`,
          }}>
            {isAdminPath
              ? <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            }
          </div>
          <h1 style={{ fontSize:'28px', fontWeight:900, color:'var(--text-main)', margin:'0 0 4px', letterSpacing:'-0.5px' }}>IgniteCommerce</h1>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0, fontFamily:'monospace', letterSpacing:'.1em', textTransform:'uppercase' }}>
            {isAdminPath ? 'Admin Console · Private Access' : 'Distributed · Real-time · Fast'}
          </p>
          {isAdminPath && (
            <div style={{ marginTop:'12px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'8px 14px', fontSize:'11px', color:'#dc2626', fontWeight:600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" style={{display:'inline',verticalAlign:'middle',marginRight:'4px'}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              This is the admin portal. Only authorised administrators should log in here.
            </div>
          )}
        </div>

        {/* Card */}
        <div style={{ background:'var(--bg-card)', borderRadius:'24px', boxShadow:'0 20px 60px var(--shadow-lg)', overflow:'hidden' }}>
          {/* Tabs */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', background:'var(--bg-subtle)', borderBottom:'1px solid var(--border-light)' }}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => switchTab(t)}
                style={{
                  height:'48px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'14px',
                  textTransform:'capitalize', transition:'all .2s',
                  background: tab===t ? 'var(--bg-card)' : 'transparent',
                  color: tab===t ? (isAdminPath ? '#ef4444' : S.primary) : 'var(--text-muted)',
                  borderBottom: tab===t ? `2px solid ${isAdminPath ? '#ef4444' : S.primary}` : '2px solid transparent',
                }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ padding:'28px', display:'flex', flexDirection:'column', gap:'14px' }}>
            <InputField label="Username" type="text" value={form.username} onChange={v => update('username',v)} placeholder={tab==='login'?'your username':'choose a username'} accent={isAdminPath ? '#ef4444' : S.primary}/>
            {tab === 'register' && (
              <InputField label="Email" type="email" value={form.email} onChange={v => update('email',v)} placeholder="you@example.com" accent={isAdminPath ? '#ef4444' : S.primary}/>
            )}
            <InputField label="Password" type="password" value={form.password} onChange={v => update('password',v)} placeholder={tab==='login'?'your password':'min 6 characters'} accent={isAdminPath ? '#ef4444' : S.primary}/>
            {tab === 'register' && (
              <InputField label="Confirm Password" type="password" value={form.confirm} onChange={v => update('confirm',v)} placeholder="repeat password" accent={isAdminPath ? '#ef4444' : S.primary}/>
            )}

            {error && (
              <div style={{ background:'#fff1f2', border:'1px solid #fda4af', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', color:'#e11d48', fontWeight:600, display:'flex', alignItems:'center', gap:'6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={busy}
              style={{
                height:'48px', borderRadius:'14px', border:'none', cursor:'pointer',
                fontWeight:900, fontSize:'15px', color:'#fff',
                background: isAdminPath ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : S.gradient,
                boxShadow: isAdminPath ? '0 8px 24px rgba(239,68,68,0.35)' : `0 8px 24px ${S.shadow}`,
                opacity: busy ? .7 : 1, transition:'all .2s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginTop:'4px',
              }}>
              {busy
                ? <><svg style={{ width:'16px', height:'16px', animation:'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity:.3 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity:.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Please wait…</>
                : tab === 'login' ? (isAdminPath ? 'Admin Sign In →' : 'Sign In →') : 'Create Account →'
              }
            </button>

            <p style={{ textAlign:'center', fontSize:'12px', color:'var(--text-muted)', margin:0 }}>
              {tab === 'login'
                ? <span>Don't have an account? <button type="button" onClick={() => switchTab('register')} style={{ background:'none', border:'none', color: isAdminPath ? '#ef4444' : S.primary, fontWeight:700, cursor:'pointer' }}>Register</button></span>
                : <span>Already have an account? <button type="button" onClick={() => switchTab('login')} style={{ background:'none', border:'none', color: isAdminPath ? '#ef4444' : S.primary, fontWeight:700, cursor:'pointer' }}>Sign In</button></span>
              }
            </p>

            {!isAdminPath && (
              <p style={{ textAlign:'center', fontSize:'11px', color:'var(--text-muted)', margin:'4px 0 0', borderTop:'1px solid var(--border-light)', paddingTop:'12px' }}>
                Are you an admin? <a href="#/admin" style={{ color: S.primary, fontWeight:700, textDecoration:'none' }}>Go to Admin Portal →</a>
              </p>
            )}
            {isAdminPath && (
              <p style={{ textAlign:'center', fontSize:'11px', color:'var(--text-muted)', margin:'4px 0 0', borderTop:'1px solid var(--border-light)', paddingTop:'12px' }}>
                Customer? <a href="#/" style={{ color: S.primary, fontWeight:700, textDecoration:'none' }}>Go to Store →</a>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type, value, onChange, placeholder, accent }) {
  const [focused, setFocused] = useState(false);
  const c = accent || S.primary;
  return (
    <div>
      <label style={{ display:'block', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'7px' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width:'100%', height:'44px', borderRadius:'12px',
          border:`2px solid ${focused ? c : 'var(--border-main)'}`,
          padding:'0 14px', fontSize:'14px', color:'var(--text-main)', background:'var(--bg-card)',
          outline:'none', transition:'border .2s', boxSizing:'border-box',
        }}/>
    </div>
  );
}

/* ─── NAVBAR ─────────────────────────────────────────── */
function Navbar({ user, search, setSearch, onCart, cartCount, wishCount, onLogout, cat, setCat, theme, toggleTheme, showAdmin, onToggleAdmin, showCluster, onToggleCluster }) {
  return (
    <header style={{ position:'sticky', top:0, zIndex:50, background:'var(--bg-card)', boxShadow:'0 1px 0 var(--border-light)' }}>
      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 20px', height:'60px', display:'flex', alignItems:'center', gap:'16px' }}>
        <button onClick={onLogout} style={{ display:'flex', alignItems:'center', gap:'9px', background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>
          <div style={{ width:'34px', height:'34px', borderRadius:'10px', background: user.role === 'admin' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : S.gradient, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${S.shadow}` }}>
            {user.role === 'admin'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            }
          </div>
          <span style={{ fontSize:'18px', fontWeight:900, color:'var(--text-main)', letterSpacing:'-0.3px' }}>
            Ignite<span style={{ color:S.primary }}>Commerce</span>
          </span>
        </button>

        {!showAdmin && <SearchBar value={search} onChange={setSearch} S={S}/>}

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          {/* Admin toggle */}
          {user.role === 'admin' && (
            <>
              <button onClick={onToggleAdmin}
                style={{
                  height:'34px', padding:'0 14px', borderRadius:'10px', border:'none', cursor:'pointer',
                  fontWeight:700, fontSize:'12px', display:'flex', alignItems:'center', gap:'6px',
                  transition:'all .2s',
                  background: showAdmin ? S.gradient : 'var(--bg-subtle)',
                  color: showAdmin ? '#fff' : 'var(--text-secondary)',
                  boxShadow: showAdmin ? `0 4px 12px ${S.shadow}` : 'none',
                }}>
                {showAdmin ? 'Store' : 'Admin'}
              </button>
              <button onClick={onToggleCluster}
                style={{
                  height:'34px', padding:'0 14px', borderRadius:'10px', border:'none', cursor:'pointer',
                  fontWeight:700, fontSize:'12px', display:'flex', alignItems:'center', gap:'6px',
                  transition:'all .2s',
                  background: showCluster ? 'linear-gradient(135deg, #06b6d4, #22d3ee)' : 'var(--bg-subtle)',
                  color: showCluster ? '#fff' : 'var(--text-secondary)',
                  boxShadow: showCluster ? '0 4px 12px rgba(34,211,238,0.35)' : 'none',
                }}>
                🌐 Cluster
              </button>
            </>
          )}

          <button onClick={toggleTheme} style={{
            width:'38px', height:'38px', borderRadius:'12px', border:'2px solid var(--border-main)',
            background:'var(--bg-subtle)', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:'var(--text-main)', transition:'all .2s', fontSize:'16px',
          }} title="Toggle Theme">
            {theme === 'dark'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            }
          </button>

          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
            <span style={{ fontSize:'10px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', lineHeight:1 }}>{user.role === 'admin' ? 'ADMIN' : 'Hello'}</span>
            <span style={{ fontSize:'13px', fontWeight:700, color:'var(--text-main)', maxWidth:'110px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.4 }}>{user.id}</span>
          </div>

          {!showAdmin && (
            <>
              <button style={{
                position:'relative', width:'38px', height:'38px', borderRadius:'12px', border:'2px solid',
                borderColor: wishCount > 0 ? '#fda4af' : 'var(--border-main)',
                background: wishCount > 0 ? '#fff1f2' : 'var(--bg-subtle)',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
                color: wishCount > 0 ? '#e11d48' : 'var(--text-muted)',
              }}>
                <svg style={{ width:'16px', height:'16px' }} fill={wishCount>0?'currentColor':'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                {wishCount > 0 && <span style={{ position:'absolute', top:'-5px', right:'-5px', width:'14px', height:'14px', background:'#e11d48', color:'#fff', fontSize:'8px', fontWeight:900, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{wishCount}</span>}
              </button>
              <button onClick={onCart} style={{
                display:'flex', alignItems:'center', gap:'8px', height:'38px', padding:'0 16px',
                borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:800, fontSize:'14px',
                background: S.gradient, color:'#fff',
                boxShadow: cartCount > 0 ? `0 4px 16px ${S.shadow}` : `0 2px 8px ${S.shadow}`,
              }}>
                <svg style={{ width:'16px', height:'16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                {cartCount}
              </button>
            </>
          )}
        </div>
      </div>

      {!showAdmin && (
        <nav style={{ maxWidth:'1400px', margin:'0 auto', padding:'0 20px 10px', display:'flex', gap:'6px', overflowX:'auto', scrollbarWidth:'none' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{
                flexShrink:0, height:'30px', padding:'0 14px', borderRadius:'100px',
                border:'none', cursor:'pointer', fontWeight:600, fontSize:'12px', transition:'all .2s',
                background: cat===c ? S.primary : 'var(--border-light)',
                color: cat===c ? '#fff' : 'var(--text-secondary)',
                boxShadow: cat===c ? `0 4px 12px ${S.shadow}` : 'none',
              }}>{c}</button>
          ))}
          <span style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'var(--text-muted)', flexShrink:0, whiteSpace:'nowrap' }}>
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10b981', display:'inline-block' }}/>
            Hadoop HDFS Online
          </span>
        </nav>
      )}
    </header>
  );
}

function SearchBar({ value, onChange, S }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      flex:1, maxWidth:'520px', display:'flex', alignItems:'center', height:'38px',
      borderRadius:'12px', background:'var(--bg-subtle)',
      border:`2px solid ${focused ? S.primary : 'var(--border-main)'}`, transition:'border .2s',
    }}>
      <svg style={{ width:'16px', height:'16px', color:'var(--text-muted)', marginLeft:'12px', flexShrink:0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search products…"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex:1, background:'none', border:'none', outline:'none', padding:'0 10px', fontSize:'14px', color:'var(--text-main)' }}/>
      {value && <button onClick={() => onChange('')} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'18px', paddingRight:'10px' }}>×</button>}
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────── */
export default function App() {
  const { isAdmin: isAdminPath } = useRoute();
  const [user, setUser]       = useState(null);
  const [theme, setTheme]     = useState('light');
  const [products, setProducts] = useState([]);
  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [skeleton, setSkeleton] = useState(true);
  const [sidebar, setSidebar] = useState(false);
  const [recs, setRecs]       = useState([]);
  const { toasts, add: toast, remove: removeToast } = useToasts();
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('All');
  const [sort, setSort]       = useState('default');
  const [wishlist, setWishlist] = useState([]);
  const [modal, setModal]     = useState(null);
  const [added, setAdded]     = useState({});
  const [orderCount, setOrderCount] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCluster, setShowCluster] = useState(false);

  // ─── Fetch products from API ───
  const fetchProducts = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/products`);
      if (r.ok) {
        const data = await r.json();
        setProducts(data);
      }
    } catch(_) {}
  }, []);

  useEffect(() => {
    if (!user) return;
    setSkeleton(true);
    fetchProducts().then(() => setSkeleton(false));
    // Auto-refresh products every 10 seconds for real-time feel
    const interval = setInterval(fetchProducts, 10000);
    fetch(`${API_BASE}/recommendations/${user.id}`)
      .then(r => r.json()).then(d => setRecs(d.recommendedProductIds || [])).catch(()=>{});
    return () => clearInterval(interval);
  }, [user, fetchProducts]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  // Show admin panel by default for admin users
  useEffect(() => {
    if (user?.role === 'admin') setShowAdmin(true);
  }, [user]);

  const refreshCart = useCallback(async () => {
    try { const r = await fetch(`${API_BASE}/cart/${CART_ID}`); if (r.ok) setCart(await r.json()); } catch(_){}
  }, []);

  const addToCart = useCallback(async (productId, qty=1) => {
    setLoading(true);
    setAdded(a => ({...a, [productId]:true}));
    setTimeout(() => setAdded(a => ({...a, [productId]:false})), 1400);
    try {
      for (let i=0; i<qty; i++)
        await fetch(`${API_BASE}/cart/${CART_ID}/add?userId=${user.id}&productId=${productId}&quantity=1`, { method:'POST' });
      await refreshCart();
      toast('success', 'Added to cart!', products.find(p=>p.id===productId)?.name);
      setSidebar(true);
    } catch { toast('error', 'Connection error', 'Backend may be offline'); }
    setLoading(false);
  }, [user, refreshCart, toast, products]);

  const checkout = useCallback(async (checkoutData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checkout/${CART_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData || {})
      });
      if (res.ok) {
        setOrderCount(n => n+1);
        setCart(null);
        fetchProducts(); // refresh stock
        toast('success', '🎉 Order placed!', 'Stored to Hadoop HDFS successfully!');
      } else {
        const msg = await res.text();
        toast('error', 'Order failed', msg);
      }
    } catch { toast('error', 'Order failed', 'Please try again'); }
    setLoading(false);
  }, [toast, fetchProducts]);

  const toggleWish = useCallback((id) => {
    setWishlist(w => {
      if (w.includes(id)) { toast('info','Removed from Wishlist',''); return w.filter(x=>x!==id); }
      toast('success','Added to Wishlist ❤️', products.find(p=>p.id===id)?.name);
      return [...w, id];
    });
  }, [toast, products]);

  let filtered = products.filter(p => {
    const s = search.toLowerCase();
    return (cat==='All'||p.category===cat) &&
      (p.name?.toLowerCase().includes(s)||p.category?.toLowerCase().includes(s));
  });
  if (sort==='price-asc')  filtered=[...filtered].sort((a,b)=>a.price-b.price);
  if (sort==='price-desc') filtered=[...filtered].sort((a,b)=>b.price-a.price);
  if (sort==='rating')     filtered=[...filtered].sort((a,b)=>b.rating-a.rating);

  const cartItems = cart?.items ? Object.entries(cart.items) : [];
  const cartCount = cartItems.reduce((a,[,q])=>a+q, 0);

  if (!user) return <AuthPage onLogin={setUser} isAdminPath={isAdminPath}/>;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-main)', fontFamily:"'Manrope',system-ui,sans-serif", color:'var(--text-main)' }}>
      <ToastContainer toasts={toasts} remove={removeToast}/>
      {modal && <ProductModal product={modal} onClose={()=>setModal(null)} onAdd={addToCart} wishlist={wishlist} onToggleWish={toggleWish} S={S}/>}
      <CartSidebar open={sidebar} onClose={()=>setSidebar(false)} cart={cart} products={products} onCheckout={()=>{ setSidebar(false); setCheckoutOpen(true); }} loading={loading} S={S}/>
      {checkoutOpen && <CheckoutModal cart={cart} products={products} onClose={()=>setCheckoutOpen(false)} onConfirm={checkout} loading={loading}/>}

      <Navbar user={user} search={search} setSearch={setSearch} onCart={()=>setSidebar(true)} cartCount={cartCount} wishCount={wishlist.length} onLogout={()=>{ setUser(null); setShowAdmin(false); setShowCluster(false); }} cat={cat} setCat={setCat} theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} showAdmin={showAdmin} onToggleAdmin={() => { setShowAdmin(a => !a); setShowCluster(false); }} showCluster={showCluster} onToggleCluster={() => { setShowCluster(c => !c); setShowAdmin(false); }}/>

      <main style={{ maxWidth:'1400px', margin:'0 auto', padding:'32px 20px' }}>

        {/* ─── CLUSTER DASHBOARD ─── */}
        {showCluster && user.role === 'admin' ? (
          <ClusterDashboard toast={toast}/>
        ) : showAdmin && user.role === 'admin' ? (
          <AdminPanel products={products} onRefresh={fetchProducts} toast={toast}/>
        ) : (
          <>
            {/* Admin metrics (for admins viewing store) */}
            {user.role==='admin' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'28px' }}>
                {[
                  { label:'HDFS Nodes',    val:'1',        color:S.primary,  icon:'🖧', note:'Healthy' },
                  { label:'Total Products', val: products.length, color:'#10b981',  icon:'📦', note:'In Catalog' },
                  { label:'Hadoop Load',   val:'2.4%',     color:'#f97316',  icon:'⚡', note:'Low' },
                  { label:'Orders Today',  val:orderCount, color:S.dark,     icon:'📋', note:'HDFS Stored' },
                ].map(s => (
                  <div key={s.label} style={{ background:'var(--bg-card)', borderRadius:'16px', padding:'18px', boxShadow:'0 2px 12px var(--shadow-sm)', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:s.color }}/>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                      <span style={{ fontSize:'11px', fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.08em' }}>{s.label}</span>
                      <span>{s.icon}</span>
                    </div>
                    <p style={{ fontSize:'26px', fontWeight:900, color:s.color, margin:'0 0 4px' }}>{s.val}</p>
                    <p style={{ fontSize:'11px', color:'var(--text-muted)', margin:0 }}>{s.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Hero */}
            <div style={{
              borderRadius:'24px', overflow:'hidden', marginBottom:'40px', position:'relative',
              background: S.heroGrad, minHeight:'260px', display:'flex', alignItems:'center',
              boxShadow:`0 20px 60px ${S.shadow}`,
            }}>
              <div style={{ position:'absolute', top:'-60px', right:'-40px', width:'300px', height:'300px', background:'rgba(255,255,255,0.1)', borderRadius:'50%', filter:'blur(50px)' }}/>
              <div style={{ position:'absolute', bottom:'-60px', left:'40%', width:'250px', height:'250px', background:'rgba(255,255,255,0.07)', borderRadius:'50%', filter:'blur(60px)' }}/>
              <div style={{ position:'relative', zIndex:1, padding:'40px clamp(24px,5vw,60px)', maxWidth:'600px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
                  <div style={{ height:'2px', width:'24px', background:'rgba(255,255,255,0.7)' }}/>
                  <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.85)', textTransform:'uppercase', letterSpacing:'.2em' }}>Premium Tech Store · India 🇮🇳</span>
                </div>
                <h2 style={{ fontSize:'clamp(28px,5vw,52px)', fontWeight:900, color:'#fff', margin:'0 0 14px', lineHeight:1.1, letterSpacing:'-1px' }}>
                  Shop smart.<br/>Delivered fast.
                </h2>
                <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'15px', lineHeight:1.7, margin:'0 0 28px', maxWidth:'400px' }}>
                  Discover the latest tech essentials at incredible prices. Real-time stock · Secured via Apache Hadoop HDFS.
                </p>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  <button onClick={() => document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})}
                    style={{ height:'46px', padding:'0 28px', borderRadius:'14px', border:'none', cursor:'pointer', fontWeight:800, fontSize:'15px', background:'#fff', color:S.dark, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
                    Shop Now →
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recs.length>0 && (
              <div style={{ marginBottom:'32px' }}>
                <h3 style={{ fontSize:'14px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.1em', margin:'0 0 14px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span>🔥</span> Recommended For You
                </h3>
                <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'8px', scrollbarWidth:'none' }}>
                  {recs.map((r,i) => {
                    const rp = products.find(p => p.id === r);
                    return (
                      <div key={r} className="rec-card" onClick={() => rp && setModal(rp)} style={{ flexShrink:0, width:'180px', background:'var(--bg-card)', borderRadius:'14px', padding:'14px', boxShadow:'0 2px 10px var(--shadow-sm)', cursor:'pointer' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:S.light, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'8px' }}>
                          <span>{['⭐','🚀','💎','🔥','✨','🎯','⚡','🌟'][i%8]}</span>
                        </div>
                        <p style={{ fontSize:'12px', fontWeight:700, color:'var(--text-main)', margin:'0 0 4px', lineHeight:1.4 }}>{rp?.name || r}</p>
                        {rp && <p style={{ fontSize:'12px', fontWeight:900, color:S.primary, margin:0 }}>₹{rp.price?.toLocaleString('en-IN')}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Products header */}
            <div id="grid" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
              <div>
                <h3 style={{ fontSize:'22px', fontWeight:900, color:'var(--text-main)', margin:0 }}>
                  {cat==='All' ? 'All Products' : cat}
                </h3>
                {search && <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:'4px 0 0' }}>Results for "<span style={{ color:S.primary }}>{search}</span>"</p>}
              </div>
              <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>{filtered.length} products</span>
                <select value={sort} onChange={e=>setSort(e.target.value)}
                  style={{ height:'34px', padding:'0 12px', borderRadius:'10px', border:'2px solid var(--border-main)', background:'var(--bg-card)', fontSize:'13px', fontWeight:600, color:'var(--text-dark)', cursor:'pointer', outline:'none' }}>
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {skeleton ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'16px' }}>
                {Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}
              </div>
            ) : filtered.length===0 ? (
              <div style={{ textAlign:'center', padding:'80px 20px' }}>
                <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔍</div>
                <p style={{ fontSize:'18px', fontWeight:700, color:'var(--text-main)', marginBottom:'8px' }}>No products found</p>
                <p style={{ fontSize:'14px', color:'var(--text-secondary)', marginBottom:'20px' }}>Try a different search or category</p>
                <button onClick={()=>{setSearch('');setCat('All');}}
                  style={{ height:'40px', padding:'0 24px', borderRadius:'12px', border:'none', background:S.gradient, color:'#fff', fontWeight:700, cursor:'pointer', boxShadow:`0 4px 12px ${S.shadow}` }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:'16px' }}>
                {filtered.map(p=>(
                  <ProductCard key={p.id} product={p} onAdd={addToCart} onQuickView={setModal} wishlist={wishlist} onToggleWish={toggleWish} added={added} S={S}/>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer style={{ marginTop:'60px', borderTop:'1px solid var(--border-main)', padding:'24px 20px', textAlign:'center', background:'var(--bg-card)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'8px' }}>
          <div style={{ width:'24px', height:'24px', borderRadius:'8px', background:S.gradient, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:'12px' }}>⚡</span></div>
          <span style={{ fontSize:'14px', fontWeight:800, color:'var(--text-main)' }}>IgniteCommerce</span>
        </div>
        <p style={{ margin:0, fontSize:'12px', color:'var(--text-muted)' }}>Premium Tech Products · Powered by Apache Hadoop HDFS · 🇮🇳 India</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html:`
        * { box-sizing:border-box; outline:none!important; }
        body { font-family:'Manrope',system-ui,sans-serif; -webkit-font-smoothing:antialiased; margin:0; background-color: var(--bg-main); color: var(--text-main); }
        h1, h2, h3, h4, h5, h6 { font-family:'Plus Jakarta Sans',system-ui,sans-serif; letter-spacing:-0.02em; }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes popIn   { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
        .rec-card:hover { box-shadow:0 8px 24px var(--shadow-md)!important; transform:translateY(-3px); transition:all .25s; }
      `}}/>
    </div>
  );
}
