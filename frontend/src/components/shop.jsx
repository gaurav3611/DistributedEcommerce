import { useState } from 'react';

const DEFAULT_S = { primary:'#f59e0b', dark:'#d97706', light:'#fef3c7', gradient:'linear-gradient(135deg,#f59e0b,#f97316)', shadow:'rgba(245,158,11,.35)' };

function MiniStars({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} style={{ width: '11px', height: '11px', color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', marginLeft: '3px' }}>{rating}</span>
      <span style={{ fontSize: '10px', color: '#9ca3af' }}>({rating >= 1000 ? (rating/1000).toFixed(1)+'k' : rating})</span>
    </div>
  );
}

export function ProductCard({ product: p, onAdd, onQuickView, wishlist, onToggleWish, added, S=DEFAULT_S }) {
  const [hovered, setHovered] = useState(false);
  const inWish = wishlist.includes(p.id);
  const isAdded = added[p.id];
  const disc = Math.round((1 - p.price / p.originalPrice) * 100);
  const outOfStock = p.stock !== undefined && p.stock <= 0;

  const badgeColors = {
    'Best Seller': { bg: '#fef3c7', color: '#92400e' },
    'New':         { bg: '#ede9fe', color: '#5b21b6' },
    'Hot Deal':    { bg: '#fee2e2', color: '#991b1b' },
    'Limited':     { bg: '#dcfce7', color: '#166534' },
    'Staff Pick':  { bg: '#e0f2fe', color: '#075985' },
    'Enterprise':  { bg: '#f3f4f6', color: 'var(--text-dark)' },
  };
  const bc = badgeColors[p.badge] || { bg: '#f3f4f6', color: 'var(--text-dark)' };

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onQuickView(p)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 24px 60px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08)`
          : '0 2px 16px rgba(0,0,0,0.07)',
        transition: 'all 0.35s cubic-bezier(.16,1,.3,1)',
      }}>

      {/* Badge */}
      {p.badge && (
        <span style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 3,
          fontSize: '9px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase',
          padding: '3px 9px', borderRadius: '100px',
          background: bc.bg, color: bc.color,
        }}>{p.badge}</span>
      )}

      {/* Wishlist */}
      <button
        aria-label="Wishlist"
        onClick={e => { e.stopPropagation(); onToggleWish(p.id); }}
        style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 3,
          width: '30px', height: '30px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: inWish ? 'var(--bg-card)1f2' : 'rgba(255,255,255,0.9)',
          color: inWish ? '#f43f5e' : '#9ca3af',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered || inWish ? 1 : 0,
          transition: 'all .25s',
          boxShadow: '0 2px 8px var(--shadow-md)',
        }}>
        <svg style={{ width: '14px', height: '14px' }} fill={inWish ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </button>

      {/* Image zone */}
      <div style={{
        height: '190px',
        background: `linear-gradient(145deg, ${p.color}12, ${p.color}06, var(--bg-subtle))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Soft color blob */}
        <div style={{
          position: 'absolute', width: '140px', height: '140px', borderRadius: '50%',
          background: p.color, filter: 'blur(60px)',
          opacity: hovered ? 0.25 : 0.12, transition: 'opacity .5s',
        }}/>
        <img
          src={p.image} alt={p.name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          style={{
            width: '120px', height: '120px', objectFit: 'contain',
            position: 'relative', zIndex: 1,
            transform: hovered ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
            transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
            filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))',
          }}
          onError={e => { e.target.src = 'https://placehold.co/120x120/1a1a1a/ff8e80?text=No+Image'; }}
        />
        {/* Quick view */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0, transition: 'opacity .3s', zIndex: 2,
        }}>
          <span style={{
            fontSize: '12px', fontWeight: 700, color: '#1e293b',
            background: 'var(--bg-card)', padding: '8px 18px', borderRadius: '100px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}>Quick View →</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: p.color, margin: 0 }}>
          {p.category}
        </p>
        <h3 style={{
          fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.35,
          margin: 0, minHeight: '38px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{p.name}</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MiniStars rating={p.rating} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
          <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)' }}>₹{p.price.toLocaleString('en-IN')}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: '#059669',
            background: '#d1fae5', padding: '1px 6px', borderRadius: '100px',
          }}>{disc}% off</span>
        </div>
        {/* Stock indicator */}
        {p.stock !== undefined && (
          <div style={{ marginTop:'4px' }}>
            <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'100px', background: outOfStock ? '#fee2e2' : p.stock <= 5 ? '#fef3c7' : '#d1fae5', color: outOfStock ? '#991b1b' : p.stock <= 5 ? '#92400e' : '#065f46' }}>
              {outOfStock ? 'Out of Stock' : p.stock <= 5 ? `Only ${p.stock} left!` : `${p.stock} in stock`}
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 16px 16px' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => !outOfStock && onAdd(p.id)}
          disabled={outOfStock}
          style={{
            width: '100%', height: '38px', borderRadius: '12px', border: 'none',
            cursor: outOfStock ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            transition: 'all .3s',
            opacity: outOfStock ? 0.5 : 1,
            background: outOfStock ? '#fee2e2' : isAdded ? '#d1fae5' : hovered ? p.color : 'var(--border-light)',
            color: outOfStock ? '#991b1b' : isAdded ? '#059669' : hovered ? '#fff' : '#475569',
            boxShadow: hovered && !isAdded && !outOfStock ? `0 4px 20px ${p.color}55` : 'none',
          }}>
          {outOfStock ? (
            'Out of Stock'
          ) : isAdded ? (
            <><svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>Added!</>
          ) : (
            <><svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>Add to Cart</>
          )}
        </button>
      </div>
    </article>
  );
}

/* ─── PRODUCT MODAL ─────────────────────────────────── */
export function ProductModal({ product: p, onClose, onAdd, wishlist, onToggleWish, S=DEFAULT_S }) {
  const [qty, setQty] = useState(1);
  const inWish = wishlist.includes(p.id);
  const disc = Math.round((1 - p.price / p.originalPrice) * 100);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(12px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: '660px',
        background: 'var(--bg-card)', borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
        animation: 'modalIn .3s cubic-bezier(.16,1,.3,1) forwards',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '14px', right: '14px', zIndex: 10,
          width: '32px', height: '32px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'var(--border-light)', color: 'var(--text-secondary)', fontSize: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        <div style={{ display: 'flex', flexDirection: 'row', minHeight: '360px' }}>
          {/* Image */}
          <div style={{
            width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
            background: `linear-gradient(145deg, ${p.color}15, ${p.color}05, var(--bg-subtle))`,
          }}>
            <img src={p.image} alt={p.name}
              referrerPolicy="no-referrer" crossOrigin="anonymous"
              style={{
              width: '170px', height: '170px', objectFit: 'contain',
              filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.18))',
            }} onError={e => { e.target.src = 'https://placehold.co/170x170/1a1a1a/ff8e80?text=No+Image'; }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '1px solid var(--border-light)' }}>
            <div>
              {p.badge && (
                <span style={{
                  display: 'inline-block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '.12em', padding: '3px 10px', borderRadius: '100px',
                  background: p.color + '20', color: p.color, marginBottom: '10px',
                }}>{p.badge}</span>
              )}
              <p style={{ fontSize: '10px', color: p.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.15em', margin: '0 0 6px' }}>{p.category}</p>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', margin: 0, lineHeight: 1.2 }}>{p.name}</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} style={{ width: '14px', height: '14px', color: i<=Math.round(p.rating)?'#f59e0b':'var(--border-main)' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }}>{p.rating}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({p.reviews.toLocaleString()} reviews)</span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)' }}>₹{p.price.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: '14px', color: '#cbd5e1', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: '100px' }}>{disc}% off</span>
            </div>

            <p style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: (p.stock !== undefined && p.stock <= 0) ? '#ef4444' : '#059669', display: 'inline-block' }}/>
              {p.stock !== undefined ? (p.stock <= 0 ? 'Out of Stock' : `${p.stock} in stock · Free Express Delivery`) : 'In Stock · Free Express Delivery'}
            </p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', height: '42px', background: 'var(--bg-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width: '38px', height: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer' }}>−</button>
                <span style={{ width: '36px', textAlign: 'center', fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>{qty}</span>
                <button onClick={() => setQty(q => q+1)} style={{ width: '38px', height: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer' }}>+</button>
              </div>
              <button onClick={() => { onAdd(p.id, qty); onClose(); }} style={{
                flex: 1, height: '42px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                fontWeight: 800, fontSize: '14px', color: 'var(--bg-card)',
                background: p.color,
                boxShadow: `0 8px 24px ${p.color}50`,
              }}>Add {qty > 1 ? `${qty} × ` : ''}to Cart</button>
              <button onClick={() => onToggleWish(p.id)} style={{
                width: '42px', height: '42px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: inWish ? 'var(--bg-card)1f2' : 'var(--bg-subtle)',
                color: inWish ? '#f43f5e' : 'var(--text-muted)', fontSize: '18px',
              }}>{inWish ? '💖' : '🤍'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CART SIDEBAR ───────────────────────────────────── */
export function CartSidebar({ open, onClose, cart, products, onCheckout, loading, S=DEFAULT_S }) {
  const items = cart?.items ? Object.entries(cart.items) : [];
  const count = items.reduce((a,[,q]) => a+q, 0);
  const total = items.reduce((a,[id,q]) => a+(products.find(p=>p.id===id)?.price||0)*q, 0);
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)' }} onClick={onClose}/>
      <aside style={{
        position: 'relative', width: '100%', maxWidth: '420px', height: '100%',
        background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.12)',
        animation: 'slideIn .38s cubic-bezier(.16,1,.3,1) forwards',
      }}>
        <div style={{ padding: '18px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--text-main)' }}>Your Cart</h2>
            {count > 0 && <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#6366f1', color: 'var(--bg-card)', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{count}</span>}
          </div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'var(--border-light)', color: 'var(--text-secondary)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ fontSize: '48px', opacity: .3 }}>🛒</div>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 600, margin: 0 }}>Your cart is empty</p>
              <button onClick={onClose} style={{ fontSize: '13px', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Browse Products</button>
            </div>
          ) : items.map(([pid, qty]) => {
            const p = products.find(x => x.id === pid);
            return (
              <div key={pid} style={{ display: 'flex', gap: '12px', padding: '14px', borderRadius: '16px', background: 'var(--bg-subtle)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: p ? `linear-gradient(135deg, ${p.color}15, var(--bg-subtle))` : 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {p && <img src={p.image} referrerPolicy="no-referrer" crossOrigin="anonymous" style={{ width: '46px', height: '46px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }} alt={p.name} onError={e => { e.target.src = 'https://placehold.co/46x46/1a1a1a/ff8e80?text=No+Image'; }}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p?.name || pid}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-main)' }}>₹{((p?.price||0)*qty).toLocaleString('en-IN')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--border-main)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button style={{ width: '26px', height: '26px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '15px' }}>−</button>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', padding: '0 6px' }}>{qty}</span>
                      <button style={{ width: '26px', height: '26px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '15px' }}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)', flexShrink: 0 }}>
          {items.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Subtotal ({count} items)</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Shipping</span>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>FREE · Hadoop Express</span>
              </div>
            </div>
          )}
          <button onClick={onCheckout} disabled={loading || items.length === 0} style={{
            width: '100%', height: '48px', borderRadius: '14px', border: 'none',
            cursor: items.length > 0 ? 'pointer' : 'not-allowed',
            fontWeight: 900, fontSize: '15px', color: 'var(--bg-card)',
            background: S.gradient,
            boxShadow: items.length > 0 ? `0 8px 24px ${S.shadow}` : 'none',
            opacity: items.length === 0 ? 0.4 : 1, transition: 'all .3s',
          }}>
            {loading ? '⏳ Processing…' : '🛍️  Place Order'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)', marginTop: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.15em' }}>🔒 Secured · Hadoop HDFS Pipeline</p>
        </div>
      </aside>
    </div>
  );
}
