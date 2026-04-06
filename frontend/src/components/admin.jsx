import { useState, useEffect } from 'react';
import { CATEGORIES, BADGE_OPTIONS, COLOR_OPTIONS, API_BASE } from '../data.js';

const S = {
  primary: '#f59e0b', dark: '#d97706', light: '#fef3c7',
  gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  shadow: 'rgba(245,158,11,.35)',
};

/* ─── SVG ICONS (replacing emojis) ──────────── */
const Icon = {
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  save: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  image: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  x: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  pkg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  wallet: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
};

function Field({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
      <label style={{ fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.1em' }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type='text' }) {
  const [f, setF] = useState(false);
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    onFocus={() => setF(true)} onBlur={() => setF(false)}
    style={{ height:'42px', borderRadius:'10px', border:`2px solid ${f ? S.primary : 'var(--border-main)'}`, padding:'0 12px', fontSize:'14px', color:'var(--text-main)', background:'var(--bg-card)', outline:'none', transition:'border-color .2s', boxSizing:'border-box', width:'100%' }} />;
}

/* ─── MULTI-IMAGE INPUT (up to 5) ────────────── */
function MultiImageInput({ images, onChange }) {
  const [input, setInput] = useState('');
  const count = images.length;

  const addImage = () => {
    const url = input.trim();
    if (!url || count >= 5) return;
    onChange([...images, url]);
    setInput('');
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
      {/* Thumbnails */}
      {images.length > 0 && (
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {images.map((url, i) => (
            <div key={i} style={{ position:'relative', width:'64px', height:'64px', borderRadius:'10px', border:'2px solid var(--border-main)', overflow:'hidden', background:'var(--bg-subtle)' }}>
              <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }}/>
              <button onClick={() => removeImage(i)}
                style={{ position:'absolute', top:'2px', right:'2px', width:'18px', height:'18px', borderRadius:'50%', border:'none', background:'#ef4444', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}>
                {Icon.x}
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Add input */}
      {count < 5 && (
        <div style={{ display:'flex', gap:'6px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={count === 0 ? 'Paste image URL' : `Add image (${count}/5)`}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
            style={{ flex:1, height:'38px', borderRadius:'8px', border:'2px solid var(--border-main)', padding:'0 10px', fontSize:'13px', color:'var(--text-main)', background:'var(--bg-card)', outline:'none' }} />
          <button type="button" onClick={addImage}
            style={{ height:'38px', padding:'0 14px', borderRadius:'8px', border:'none', background:S.primary, color:'#fff', fontWeight:700, fontSize:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}>
            {Icon.plus} Add
          </button>
        </div>
      )}
      <p style={{ fontSize:'10px', color:'var(--text-muted)', margin:0 }}>{count}/5 images · Paste URLs or use /filename.png for local assets</p>
    </div>
  );
}

/* ─── ADD / EDIT PRODUCT FORM ────────────────── */
function ProductForm({ product, onSave, onCancel, loading }) {
  const isEdit = !!product;
  const [form, setForm] = useState(product ? {
    ...product,
    images: product.images || (product.image ? [product.image] : []),
    upiId: product.upiId || ''
  } : {
    name: '', price: '', originalPrice: '', category: 'Hardware',
    description: '', stock: '', badge: '', color: '#f59e0b', image: '', images: [], upiId: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.name && form.price && form.stock && form.category;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      ...form,
      price: parseFloat(form.price),
      originalPrice: parseFloat(form.originalPrice) || parseFloat(form.price) * 1.25,
      stock: parseInt(form.stock),
      reviews: form.reviews || 0,
      rating: form.rating || 4.5,
      image: form.images?.[0] || form.image || '',
    });
  };

  return (
    <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
      <h3 style={{ margin:'0 0 4px', fontSize:'18px', fontWeight:900, color:'var(--text-main)', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ color: S.primary }}>{isEdit ? Icon.edit : Icon.plus}</span>
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h3>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        <Field label="Product Name *">
          <Input value={form.name} onChange={v => set('name', v)} placeholder="e.g. Wireless Mouse Pro" />
        </Field>
        <Field label="Category *">
          <select value={form.category} onChange={e => set('category', e.target.value)}
            style={{ height:'42px', borderRadius:'10px', border:'2px solid var(--border-main)', padding:'0 12px', fontSize:'14px', color:'var(--text-main)', background:'var(--bg-card)', cursor:'pointer' }}>
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
        <Field label="Price (₹) *">
          <Input value={form.price} onChange={v => set('price', v)} placeholder="e.g. 4999" type="number" />
        </Field>
        <Field label="Original Price (₹)">
          <Input value={form.originalPrice} onChange={v => set('originalPrice', v)} placeholder="e.g. 7999" type="number" />
        </Field>
        <Field label="Stock Qty *">
          <Input value={form.stock} onChange={v => set('stock', v)} placeholder="e.g. 50" type="number" />
        </Field>
      </div>

      <Field label="Description">
        <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short product description..."
          rows={3} style={{ borderRadius:'10px', border:'2px solid var(--border-main)', padding:'10px 12px', fontSize:'14px', color:'var(--text-main)', background:'var(--bg-card)', outline:'none', resize:'vertical', fontFamily:'inherit' }} />
      </Field>

      {/* Multi-image upload */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        <Field label={<span style={{ display:'flex', alignItems:'center', gap:'5px' }}>{Icon.image} Product Images (max 5)</span>}>
          <MultiImageInput images={form.images || []} onChange={imgs => set('images', imgs)} />
        </Field>
        <Field label="UPI ID (Seller Payment receiving ID)">
          <Input value={form.upiId} onChange={v => set('upiId', v)} placeholder="e.g. 9876543210@paytm" />
        </Field>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
        <Field label="Badge">
          <select value={form.badge} onChange={e => set('badge', e.target.value)}
            style={{ height:'42px', borderRadius:'10px', border:'2px solid var(--border-main)', padding:'0 12px', fontSize:'14px', color:'var(--text-main)', background:'var(--bg-card)', cursor:'pointer' }}>
            <option value="">No Badge</option>
            {BADGE_OPTIONS.filter(b => b).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Accent Color">
          <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', alignItems:'center', height:'42px' }}>
            {COLOR_OPTIONS.map(c => (
              <button type="button" key={c} onClick={() => set('color', c)}
                style={{ width:'28px', height:'28px', borderRadius:'8px', border: form.color === c ? '3px solid var(--text-main)' : '2px solid var(--border-main)', background:c, cursor:'pointer', transition:'all .2s', flexShrink:0 }} />
            ))}
          </div>
        </Field>
      </div>

      <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
        <button type="button" onClick={onCancel}
          style={{ height:'44px', padding:'0 24px', borderRadius:'12px', border:'2px solid var(--border-main)', background:'var(--bg-card)', color:'var(--text-secondary)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
          Cancel
        </button>
        <button type="submit" disabled={!valid || loading}
          style={{ flex:1, height:'44px', borderRadius:'12px', border:'none', cursor: valid ? 'pointer' : 'not-allowed', fontWeight:800, fontSize:'14px', color:'#fff', background: valid ? S.gradient : 'var(--border-main)', boxShadow: valid ? `0 4px 16px ${S.shadow}` : 'none', opacity: loading ? .6 : 1, transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
          {loading ? 'Saving...' : isEdit ? <>{Icon.save} Update Product</> : <>{Icon.plus} Add Product</>}
        </button>
      </div>
    </form>
  );
}

/* ─── PRODUCT ROW (Admin table) ──────────────── */
function ProductRow({ product: p, onEdit, onDelete, onStockUpdate }) {
  const [editStock, setEditStock] = useState(false);
  const [stockVal, setStockVal] = useState(p.stock);

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px', borderRadius:'14px', background:'var(--bg-subtle)', transition:'all .2s' }}>
      {/* Image */}
      <div style={{ width:'48px', height:'48px', borderRadius:'10px', background:`linear-gradient(135deg, ${p.color}15, var(--bg-subtle))`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
        {p.image ? <img src={p.image} style={{ width:'36px', height:'36px', objectFit:'contain' }} alt="" onError={e => { e.target.style.display='none'; }}/> : <span style={{ color:'var(--text-muted)' }}>{Icon.pkg}</span>}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:'14px', fontWeight:700, color:'var(--text-main)', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:'12px', color:p.color, fontWeight:600 }}>{p.category}</span>
          {p.badge && <span style={{ fontSize:'9px', fontWeight:700, background:p.color+'20', color:p.color, padding:'1px 6px', borderRadius:'100px', textTransform:'uppercase' }}>{p.badge}</span>}
          {(p.images?.length > 1) && <span style={{ fontSize:'9px', fontWeight:600, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'2px' }}>{Icon.image} {p.images.length}</span>}
        </div>
      </div>

      {/* Price */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <p style={{ fontSize:'15px', fontWeight:900, color:'var(--text-main)', margin:0 }}>₹{p.price?.toLocaleString('en-IN')}</p>
        {p.originalPrice > p.price && <p style={{ fontSize:'11px', color:'var(--text-muted)', textDecoration:'line-through', margin:0 }}>₹{p.originalPrice?.toLocaleString('en-IN')}</p>}
      </div>

      {/* Stock */}
      <div style={{ width:'90px', flexShrink:0 }}>
        {editStock ? (
          <div style={{ display:'flex', gap:'4px' }}>
            <input type="number" value={stockVal} onChange={e => setStockVal(e.target.value)}
              style={{ width:'50px', height:'28px', borderRadius:'6px', border:'2px solid '+S.primary, padding:'0 6px', fontSize:'13px', color:'var(--text-main)', background:'var(--bg-card)', outline:'none', textAlign:'center' }} />
            <button onClick={() => { onStockUpdate(p.id, parseInt(stockVal)); setEditStock(false); }}
              style={{ height:'28px', padding:'0 8px', borderRadius:'6px', border:'none', background:'#10b981', color:'#fff', fontSize:'11px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Icon.check}</button>
          </div>
        ) : (
          <button onClick={() => setEditStock(true)}
            style={{ height:'28px', padding:'0 12px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700, background: p.stock > 10 ? '#d1fae5' : p.stock > 0 ? '#fef3c7' : '#fee2e2', color: p.stock > 10 ? '#065f46' : p.stock > 0 ? '#92400e' : '#991b1b' }}>
            {p.stock > 0 ? `${p.stock} left` : 'Out of stock'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
        <button onClick={() => onEdit(p)} title="Edit product"
          style={{ width:'32px', height:'32px', borderRadius:'8px', border:'2px solid var(--border-main)', background:'var(--bg-card)', color:S.primary, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Icon.edit}</button>
        <button onClick={() => onDelete(p.id)} title="Delete product"
          style={{ width:'32px', height:'32px', borderRadius:'8px', border:'2px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{Icon.trash}</button>
      </div>
    </div>
  );
}

/* ─── ADMIN PANEL (main export) ──────────────── */
export function AdminPanel({ products, onRefresh, toast }) {
  const [view, setView] = useState('list');
  const [tab, setTab] = useState('products');
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`);
      setOrders(await res.json());
    } catch {}
  };

  useEffect(() => {
    if (tab === 'orders') fetchOrders();
  }, [tab]);

  const verifyOrder = async (orderId) => {
    try {
      await fetch(`${API_BASE}/admin/orders/${orderId}/verify`, { method: 'PUT' });
      toast('success', `Payment verified for Order #${orderId}`);
      fetchOrders();
    } catch { toast('error', 'Failed to verify payment'); }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = products.reduce((a, p) => a + (p.stock || 0), 0);
  const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
  const totalValue = products.reduce((a, p) => a + (p.price || 0) * (p.stock || 0), 0);

  const handleSave = async (product) => {
    setLoading(true);
    try {
      const isEdit = !!editProduct;
      const url = isEdit ? `${API_BASE}/admin/products/${editProduct.id}` : `${API_BASE}/admin/products`;
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        toast('success', isEdit ? 'Product updated!' : 'Product added!', product.name);
        setView('list');
        setEditProduct(null);
        onRefresh();
      } else {
        toast('error', 'Failed to save', await res.text());
      }
    } catch { toast('error', 'Connection error', 'Backend may be offline'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`${API_BASE}/admin/products/${id}`, { method: 'DELETE' });
      toast('success', 'Product deleted');
      onRefresh();
    } catch { toast('error', 'Failed to delete'); }
  };

  const handleStockUpdate = async (id, stock) => {
    try {
      await fetch(`${API_BASE}/admin/products/${id}/stock?stock=${stock}`, { method: 'PUT' });
      toast('success', 'Stock updated', `Set to ${stock}`);
      onRefresh();
    } catch { toast('error', 'Failed to update stock'); }
  };

  if (view === 'add' || view === 'edit') {
    return (
      <div style={{ background:'var(--bg-card)', borderRadius:'20px', padding:'24px', boxShadow:'0 2px 16px var(--shadow-sm)' }}>
        <ProductForm
          product={editProduct}
          onSave={handleSave}
          onCancel={() => { setView('list'); setEditProduct(null); }}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        {[
          { label:'Total Products', val: products.length, icon: Icon.pkg, color:S.primary },
          { label:'Total Stock', val: totalStock.toLocaleString('en-IN'), icon: Icon.chart, color:'#10b981' },
          { label:'Out of Stock', val: outOfStock, icon: Icon.alert, color: outOfStock > 0 ? '#ef4444' : '#10b981' },
          { label:'Inventory Value', val: `₹${totalValue.toLocaleString('en-IN')}`, icon: Icon.wallet, color:'#6366f1' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--bg-card)', borderRadius:'16px', padding:'18px', boxShadow:'0 2px 12px var(--shadow-sm)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:s.color }}/>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
              <span style={{ fontSize:'11px', fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.08em' }}>{s.label}</span>
              <span style={{ color:s.color }}>{s.icon}</span>
            </div>
            <p style={{ fontSize:'22px', fontWeight:900, color:s.color, margin:0 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Header + Actions */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', borderBottom:'1px solid var(--border-light)', paddingBottom:'12px' }}>
        <div style={{ display:'flex', gap:'20px' }}>
          <h3 onClick={() => setTab('products')} style={{ cursor:'pointer', fontSize:'20px', fontWeight: tab==='products'?900:600, color: tab==='products'?'var(--text-main)':'var(--text-muted)', margin:'0 0 2px' }}>📦 Products</h3>
          <h3 onClick={() => setTab('orders')} style={{ cursor:'pointer', fontSize:'20px', fontWeight: tab==='orders'?900:600, color: tab==='orders'?'var(--text-main)':'var(--text-muted)', margin:'0 0 2px' }}>📑 Orders ({orders.filter(o => o.status === 'PENDING_VERIFICATION').length} pending)</h3>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => tab === 'orders' ? fetchOrders() : onRefresh()}
            style={{ height:'40px', padding:'0 16px', borderRadius:'12px', border:'2px solid var(--border-main)', background:'var(--bg-card)', color:'var(--text-secondary)', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
            {Icon.refresh} Refresh
          </button>
          <button onClick={() => { setView('add'); setEditProduct(null); }}
            style={{ height:'40px', padding:'0 20px', borderRadius:'12px', border:'none', background:S.gradient, color:'#fff', fontWeight:800, fontSize:'13px', cursor:'pointer', boxShadow:`0 4px 16px ${S.shadow}`, display:'flex', alignItems:'center', gap:'6px' }}>
            {Icon.plus} Add Product
          </button>
        </div>
      </div>

      {tab === 'products' ? (
        <>
          <div style={{ display:'flex', alignItems:'center', height:'40px', borderRadius:'12px', background:'var(--bg-subtle)', border:'2px solid var(--border-main)', padding:'0 14px', gap:'8px' }}>
            <span style={{ color:'var(--text-muted)' }}>{Icon.search}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:'14px', color:'var(--text-main)' }} />
            {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', display:'flex' }}>{Icon.x}</button>}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>
                <div style={{ marginBottom:'8px', color:'var(--text-muted)' }}>{Icon.pkg}</div>
                <p style={{ fontWeight:600, margin:0 }}>{search ? 'No products match your search' : 'No products yet. Add your first product!'}</p>
              </div>
            ) : filtered.map(p => (
              <ProductRow key={p.id} product={p}
                onEdit={(p) => { setEditProduct(p); setView('edit'); }}
                onDelete={handleDelete}
                onStockUpdate={handleStockUpdate}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {orders.map(o => (
            <div key={o.orderId} style={{ background:'var(--bg-card)', padding:'16px', borderRadius:'14px', border:'2px solid var(--border-main)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid var(--border-light)', paddingBottom:'10px', marginBottom:'10px' }}>
                <strong style={{ fontSize:'16px', color:'var(--text-main)' }}>#{o.orderId}</strong>
                <span style={{ padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:800, background: o.status === 'PENDING_VERIFICATION' ? '#fef3c7' : '#d1fae5', color: o.status === 'PENDING_VERIFICATION' ? '#d97706' : '#059669' }}>
                  {o.status.replace('_', ' ')}
                </span>
              </div>
              <p style={{ fontSize:'13px', margin:'0 0 4px', color:'var(--text-secondary)' }}>From: <strong style={{ color:'var(--text-main)' }}>{o.username}</strong> on {new Date(o.placedAt).toLocaleString()}</p>
              <p style={{ fontSize:'13px', margin:'0 0 10px', color:'var(--text-secondary)' }}>Payment: <strong>{o.paymentMethod}</strong> {o.paymentReference && `(Ref: ${o.paymentReference})`}</p>
              
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' }}>
                {o.items?.map(i => (
                  <div key={i.productId} style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg-subtle)', padding:'6px 10px', borderRadius:'8px' }}>
                    {i.productImage ? <img src={i.productImage} style={{ width:'24px', height:'24px', objectFit:'contain' }} alt=""/> : null}
                    <span style={{ fontSize:'12px', fontWeight:600, color:'var(--text-main)' }}>{i.quantity}x {i.productName}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ margin:0, color:'var(--text-main)' }}>Total: ₹{o.total?.toLocaleString('en-IN')}</h3>
                {o.status === 'PENDING_VERIFICATION' && (
                  <button onClick={() => verifyOrder(o.orderId)} style={{ padding:'8px 16px', borderRadius:'8px', border:'none', background:'#10b981', color:'#fff', fontWeight:700, cursor:'pointer' }}>
                    ✅ Accept Payment
                  </button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'20px' }}>No orders found.</p>}
        </div>
      )}
    </div>
  );
}
