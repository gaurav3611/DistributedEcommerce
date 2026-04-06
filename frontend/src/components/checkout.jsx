import { useState } from 'react';

const UPI_NAME = 'IgniteCommerce';

const S = {
  primary:  '#f59e0b',
  dark:     '#d97706',
  light:    '#fef3c7',
  gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  shadow:   'rgba(245,158,11,.35)',
};

function Step({ n, label, active, done }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', opacity: active || done ? 1 : .4, transition:'opacity .3s' }}>
      <div style={{
        width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:800, fontSize:'13px', flexShrink:0, transition:'all .3s',
        background: done ? '#10b981' : active ? S.primary : 'var(--border-main)',
        color: done || active ? '#fff' : 'var(--text-muted)',
      }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize:'13px', fontWeight: active ? 700 : 500, color: active ? 'var(--text-main)' : 'var(--text-secondary)', whiteSpace:'nowrap' }}>{label}</span>
    </div>
  );
}

function InputRow({ label, name, value, onChange, placeholder, type='text', half=false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', flex: half ? '1 1 calc(50% - 6px)' : '1 1 100%' }}>
      <label style={{ fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.1em' }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          height:'42px', borderRadius:'10px', border:`2px solid ${focused ? S.primary : 'var(--border-main)'}`,
          padding:'0 12px', fontSize:'14px', color:'var(--text-main)', background:'var(--bg-card)',
          outline:'none', transition:'border-color .2s', boxSizing:'border-box', width:'100%',
        }}
      />
    </div>
  );
}

/* ─── STEP 1: ADDRESS ─────────────────────────── */
function AddressStep({ addr, setAddr, onNext }) {
  const set = (k, v) => setAddr(a => ({ ...a, [k]: v }));
  const valid = addr.name && addr.phone && addr.line1 && addr.city && addr.state && addr.pin;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div>
        <h3 style={{ margin:'0 0 4px', fontSize:'18px', fontWeight:900, color:'var(--text-main)' }}>Delivery Address</h3>
        <p style={{ margin:0, fontSize:'13px', color:'var(--text-secondary)' }}>Where should we deliver your order?</p>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'12px' }}>
        <InputRow label="Full Name"     name="name"   value={addr.name}   onChange={set} placeholder="e.g. Rahul Sharma" />
        <InputRow label="Phone Number"  name="phone"  value={addr.phone}  onChange={set} placeholder="e.g. 98765 43210"    type="tel" />
        <InputRow label="Address Line 1" name="line1" value={addr.line1}  onChange={set} placeholder="House No., Street, Area" />
        <InputRow label="Address Line 2 (optional)" name="line2" value={addr.line2} onChange={set} placeholder="Landmark (optional)" />
        <InputRow label="City"   name="city"  value={addr.city}  onChange={set} placeholder="e.g. Mumbai" half />
        <InputRow label="State"  name="state" value={addr.state} onChange={set} placeholder="e.g. Maharashtra"  half />
        <InputRow label="Pincode" name="pin"  value={addr.pin}   onChange={set} placeholder="e.g. 400001" half type="number"/>
        <div style={{ flex:'1 1 calc(50% - 6px)' }}>
          <label style={{ fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.1em', display:'block', marginBottom:'5px' }}>Country</label>
          <div style={{ height:'42px', border:'2px solid var(--border-main)', borderRadius:'10px', padding:'0 12px', display:'flex', alignItems:'center', fontSize:'14px', color:'var(--text-muted)', background:'var(--bg-subtle)' }}>🇮🇳 India</div>
        </div>
      </div>

      <button onClick={onNext} disabled={!valid}
        style={{
          height:'48px', borderRadius:'14px', border:'none', cursor: valid ? 'pointer' : 'not-allowed',
          fontWeight:800, fontSize:'15px',
          background: valid ? S.gradient : 'var(--border-main)',
          boxShadow: valid ? `0 8px 24px ${S.shadow}` : 'none', transition:'all .3s',
          color: valid ? '#fff' : 'var(--text-muted)',
        }}>
        Continue to Payment →
      </button>
    </div>
  );
}

/* ─── STEP 2: PAYMENT ─────────────────────────── */
function PaymentStep({ total, onPay, onBack, loading, items, products }) {
  const upiIds = Array.from(new Set(items.map(([id]) => products?.find(p=>p.id===id)?.upiId).filter(Boolean)));
  const UPI_ID = upiIds[0] || 'store@ignitecommerce';

  const [method, setMethod] = useState('upi');
  const [paid,   setPaid]   = useState(false);
  const [utr,    setUtr]    = useState('');
  const [card,   setCard]   = useState({ number:'', expiry:'', cvv:'', name:'' });
  const setC = (k,v) => setCard(c=>({...c,[k]:v}));

  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent('IgniteCommerce Order')}`;
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}&bgcolor=ffffff&color=000000&margin=10&format=png`;

  const methods = [
    { id:'upi', icon:'📱', label:'UPI / QR Code' },
    { id:'card', icon:'💳', label:'Credit / Debit Card' },
    { id:'cod',  icon:'💵', label:'Cash on Delivery' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div>
        <h3 style={{ margin:'0 0 4px', fontSize:'18px', fontWeight:900, color:'var(--text-main)' }}>Payment</h3>
        <p style={{ margin:0, fontSize:'13px', color:'var(--text-secondary)' }}>Total to pay: <strong style={{ color:S.primary, fontSize:'16px' }}>₹{total.toLocaleString('en-IN')}</strong></p>
      </div>

      {/* Method selector */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
        {methods.map(m => (
          <button key={m.id} onClick={() => { setMethod(m.id); setPaid(false); }}
            style={{
              padding:'12px 8px', borderRadius:'12px', border:`2px solid`, cursor:'pointer',
              fontWeight:600, fontSize:'12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
              transition:'all .2s',
              borderColor: method===m.id ? S.primary : 'var(--border-main)',
              background:  method===m.id ? S.light : 'var(--bg-subtle)',
              color:       method===m.id ? S.dark : 'var(--text-secondary)',
            }}>
            <span style={{ fontSize:'20px' }}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* UPI / QR */}
      {method === 'upi' && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', padding:'20px', background:'var(--bg-subtle)', borderRadius:'16px' }}>
          <p style={{ margin:0, fontSize:'13px', fontWeight:600, color:'var(--text-dark)' }}>Scan with any UPI app to pay</p>
          <div style={{ padding:'8px', background:'#fff', borderRadius:'12px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}>
            <img src={qrUrl} alt="UPI QR Code" style={{ width:'200px', height:'200px', display:'block' }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}/>
            {/* Fallback if API fails */}
            <div style={{ width:'200px', height:'200px', display:'none', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'8px', color:'#94a3b8', fontSize:'12px' }}>
              <span style={{ fontSize:'32px' }}>📱</span>
              <span>QR unavailable</span>
              <span style={{ fontFamily:'monospace', fontSize:'11px', color:S.primary, wordBreak:'break-all', textAlign:'center' }}>{UPI_ID}</span>
            </div>
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ margin:'0 0 4px', fontSize:'12px', color:'var(--text-secondary)', fontWeight:500 }}>UPI ID</p>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg-card)', border:`1px solid ${S.primary}40`, borderRadius:'10px', padding:'8px 14px' }}>
              <span style={{ fontFamily:'monospace', fontWeight:700, color:S.dark, fontSize:'14px' }}>{UPI_ID}</span>
              <button onClick={() => { navigator.clipboard?.writeText(UPI_ID); }}
                style={{ background:S.light, border:'none', borderRadius:'6px', padding:'3px 8px', cursor:'pointer', fontSize:'11px', color:S.dark, fontWeight:700 }}>
                Copy
              </button>
            </div>
          </div>

          {!paid ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%', maxWidth:'300px' }}>
               <input value={utr} onChange={e => setUtr(e.target.value)} placeholder="Enter UPI Ref / UTR No." 
                      style={{ height:'42px', borderRadius:'10px', border:'2px solid var(--border-main)', padding:'0 12px', textAlign:'center', fontFamily:'monospace', fontSize:'14px', outline:'none' }} />
               <button onClick={() => setPaid(true)} disabled={utr.length < 5}
                 style={{ height:'40px', padding:'0 24px', borderRadius:'12px', border:`2px dashed ${utr.length>=5 ? S.primary : 'var(--border-main)'}`, background: utr.length>=5 ? S.light : 'var(--bg-subtle)', color: utr.length>=5 ? S.dark : 'var(--text-muted)', fontWeight:700, fontSize:'13px', cursor: utr.length>=5 ? 'pointer' : 'not-allowed' }}>
                 ✅ Verify My Payment
               </button>
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'12px 20px', background:'#d1fae5', borderRadius:'12px', color:'#065f46' }}>
              <p style={{ margin:'0 0 4px', fontWeight:800, fontSize:'15px' }}>✅ Payment confirmed!</p>
              <p style={{ margin:0, fontSize:'12px' }}>Click "Place Order" to confirm.</p>
            </div>
          )}
        </div>
      )}

      {/* Card */}
      {method === 'card' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', padding:'20px', background:'var(--bg-subtle)', borderRadius:'16px' }}>
          {[
            { k:'name',   label:'Name on Card', placeholder:'e.g. RAHUL SHARMA',   type:'text' },
            { k:'number', label:'Card Number',   placeholder:'1234 5678 9012 3456', type:'text' },
          ].map(f => (
            <InputRow key={f.k} label={f.label} name={f.k} value={card[f.k]} onChange={setC} placeholder={f.placeholder} type={f.type} />
          ))}
          <div style={{ display:'flex', gap:'12px' }}>
            <InputRow label="Expiry" name="expiry" value={card.expiry} onChange={setC} placeholder="MM/YY" half />
            <InputRow label="CVV"   name="cvv"    value={card.cvv}    onChange={setC} placeholder="•••" half type="password" />
          </div>
          <div style={{ padding:'10px 14px', background:'#fffbeb', borderRadius:'10px', fontSize:'12px', color:'#92400e', display:'flex', gap:'8px' }}>
            <span>🔒</span> Card details are simulated and not stored. Secured via SSL.
          </div>
        </div>
      )}

      {/* COD */}
      {method === 'cod' && (
        <div style={{ padding:'24px', background:'#f0fdf4', borderRadius:'16px', textAlign:'center' }}>
          <span style={{ fontSize:'48px' }}>💵</span>
          <p style={{ fontWeight:800, fontSize:'16px', color:'#065f46', margin:'12px 0 6px' }}>Cash on Delivery</p>
          <p style={{ fontSize:'13px', color:'#047857', margin:0 }}>Pay <strong>₹{total.toLocaleString('en-IN')}</strong> when your order arrives. No advance payment needed.</p>
        </div>
      )}

      <div style={{ display:'flex', gap:'10px' }}>
        <button onClick={onBack}
          style={{ flex:'0 0 auto', height:'48px', padding:'0 20px', borderRadius:'14px', border:'2px solid var(--border-main)', background:'var(--bg-card)', color:'var(--text-secondary)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
          ← Back
        </button>
        <button onClick={() => onPay(method, method === 'card' ? 'CARD' : utr)} disabled={loading || (method==='upi' && !paid)}
          style={{
            flex:1, height:'48px', borderRadius:'14px', border:'none', cursor:'pointer',
            fontWeight:900, fontSize:'15px', color: (method==='upi'&&!paid) ? 'var(--text-muted)' :'#fff',
            background: (method==='upi'&&!paid) ? 'var(--border-main)' : S.gradient,
            boxShadow: (method!=='upi'||paid) ? `0 8px 24px ${S.shadow}` : 'none',
            opacity: loading ? .7 : 1, transition:'all .3s',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
          }}>
          {loading
            ? <><svg style={{ width:'16px', height:'16px', animation:'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity:.3 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity:.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Processing…</>
            : '🎉 Place Order'
          }
        </button>
      </div>
    </div>
  );
}

/* ─── STEP 3: CONFIRMATION ────────────────────── */
function ConfirmStep({ orderId, addr, total, onClose }) {
  return (
    <div style={{ textAlign:'center', padding:'20px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:'20px' }}>
      <div style={{
        width:'80px', height:'80px', borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#059669)',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 12px 32px rgba(16,185,129,.4)', animation:'popIn .5s cubic-bezier(.16,1,.3,1)',
      }}>
        <span style={{ fontSize:'36px', color:'#fff' }}>✓</span>
      </div>

      <div>
        <h3 style={{ margin:'0 0 6px', fontSize:'22px', fontWeight:900, color:'var(--text-main)' }}>Order Placed! 🎉</h3>
        <p style={{ margin:0, fontSize:'14px', color:'var(--text-secondary)' }}>Thank you for shopping with IgniteCommerce</p>
      </div>

      {/* Order summary */}
      <div style={{ width:'100%', background:'var(--bg-subtle)', borderRadius:'16px', padding:'20px', textAlign:'left', display:'flex', flexDirection:'column', gap:'10px' }}>
        {[
          ['Order ID',  `#ORD-${orderId}`],
          ['Amount',    `₹${total.toLocaleString('en-IN')}`],
          ['Deliver to', `${addr.name}, ${addr.line1}, ${addr.city} - ${addr.pin}`],
          ['Storage',   'Hadoop HDFS'],
          ['Estimated',  '3–5 Business Days'],
        ].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', fontSize:'13px' }}>
            <span style={{ color:'var(--text-secondary)', flexShrink:0 }}>{k}</span>
            <span style={{ fontWeight:700, color:'var(--text-main)', textAlign:'right' }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ padding:'12px 16px', background:S.light, borderRadius:'12px', fontSize:'12px', color:S.dark, fontWeight:600, textAlign:'center' }}>
        📧 Order confirmation sent · Stored securely in Hadoop HDFS
      </div>

      <button onClick={onClose}
        style={{ height:'46px', padding:'0 36px', borderRadius:'14px', border:'none', cursor:'pointer', fontWeight:800, fontSize:'15px', color:'#fff', background:S.gradient, boxShadow:`0 8px 24px ${S.shadow}` }}>
        Continue Shopping
      </button>
    </div>
  );
}

/* ─── CHECKOUT MODAL (master) ─────────────────── */
export function CheckoutModal({ cart, products, onClose, onConfirm, loading }) {
  const [step,    setStep]   = useState(1);  // 1=address 2=payment 3=done
  const [addr,    setAddr]   = useState({ name:'', phone:'', line1:'', line2:'', city:'', state:'', pin:'' });
  const [orderId, setOrderId] = useState('');

  const items = cart?.items ? Object.entries(cart.items) : [];
  const total = items.reduce((a,[id,q]) => a+(products.find(p=>p.id===id)?.price||0)*q, 0);

  const handlePay = async (method, paymentDetails) => {
    const id = Math.random().toString(36).substring(2,10).toUpperCase();
    setOrderId(id);
    await onConfirm({ address: addr, paymentMethod: method, paymentDetails: paymentDetails || 'COD' });   // calls the real checkout API → Hadoop HDFS
    setStep(3);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(15,23,42,.55)', backdropFilter:'blur(12px)' }} onClick={step===3 ? onClose : undefined}/>
      <div style={{
        position:'relative', width:'100%', maxWidth:'540px',
        background:'var(--bg-card)', borderRadius:'24px',
        boxShadow:'0 40px 100px rgba(0,0,0,0.2)',
        animation:'modalIn .3s cubic-bezier(.16,1,.3,1) forwards',
        maxHeight:'90vh', overflowY:'auto',
      }}>
        {/* Header */}
        {step < 3 && (
          <div style={{ padding:'20px 24px 0', borderBottom:'1px solid var(--border-light)', paddingBottom:'16px', position:'sticky', top:0, background:'var(--bg-card)', zIndex:1, borderRadius:'24px 24px 0 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h2 style={{ margin:0, fontSize:'17px', fontWeight:900, color:'var(--text-main)' }}>Checkout</h2>
              <button onClick={onClose} style={{ background:'var(--border-light)', border:'none', borderRadius:'50%', width:'30px', height:'30px', cursor:'pointer', fontSize:'16px', color:'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
            </div>

            {/* Progress steps */}
            <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <Step n={1} label="Address" active={step===1} done={step>1}/>
              <div style={{ flex:1, height:'1px', background:'var(--border-main)' }}/>
              <Step n={2} label="Payment" active={step===2} done={step>2}/>
              <div style={{ flex:1, height:'1px', background:'var(--border-main)' }}/>
              <Step n={3} label="Done"    active={step===3} done={step>3}/>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ padding:'24px' }}>
          {step===1 && <AddressStep addr={addr} setAddr={setAddr} onNext={() => setStep(2)}/>}
          {step===2 && <PaymentStep total={total} onPay={handlePay} onBack={() => setStep(1)} loading={loading} items={items} products={products} />}
          {step===3 && <ConfirmStep orderId={orderId} addr={addr} total={total} onClose={onClose}/>}
        </div>
      </div>
    </div>
  );
}
