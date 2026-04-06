import { useEffect, useRef, useCallback, useState } from 'react';

/* ─── STARS ────────────────────────────────────────── */
export function Stars({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className={`w-3 h-3 ${i<=Math.round(rating)?'text-amber-400':'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
      <span className="text-xs text-slate-400">{rating}</span>
      {count && <span className="text-xs text-slate-600">({count.toLocaleString()})</span>}
    </div>
  );
}

/* ─── TOAST SYSTEM ─────────────────────────────────── */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);
  const add = useCallback((type, title, msg='') => {
    const tid = ++id.current;
    setToasts(t => [...t, { id: tid, type, title, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== tid)), 3800);
  }, []);
  const remove = useCallback((tid) => setToasts(t => t.filter(x => x.id !== tid)), []);
  return { toasts, add, remove };
}

export function ToastContainer({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-[300] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl
          ${t.type==='success'?'bg-emerald-950/95 border-emerald-800/60 text-emerald-300':
            t.type==='error'  ?'bg-red-950/95 border-red-800/60 text-red-300':
                               'bg-indigo-950/95 border-indigo-800/60 text-indigo-300'}`}
          style={{animation:'toastIn .35s cubic-bezier(.16,1,.3,1) forwards'}}>
          <span className="text-xl flex-shrink-0 mt-0.5">{t.type==='success'?'✅':t.type==='error'?'❌':'💬'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight">{t.title}</p>
            {t.msg && <p className="text-xs opacity-60 mt-0.5 truncate">{t.msg}</p>}
          </div>
          <button onClick={()=>remove(t.id)} className="text-lg opacity-30 hover:opacity-80 flex-shrink-0 transition-opacity leading-none">×</button>
        </div>
      ))}
    </div>
  );
}

/* ─── SKELETON CARD ─────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0d0d18] animate-pulse">
      <div className="h-48 bg-white/5"/>
      <div className="p-4 space-y-3">
        <div className="h-2 bg-white/5 rounded-full w-1/3"/>
        <div className="h-4 bg-white/5 rounded-full w-5/6"/>
        <div className="h-3 bg-white/5 rounded-full w-2/3"/>
        <div className="h-8 bg-white/5 rounded-xl mt-4"/>
      </div>
    </div>
  );
}

/* ─── BADGE ─────────────────────────────────────────── */
export function Badge({ label, color }) {
  if (!label) return null;
  const styles = {
    'Best Seller': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'New':         'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Hot Deal':    'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'Limited':     'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Staff Pick':  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Top Rated':   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Enterprise':  'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${styles[label]||'bg-white/10 text-white border-white/20'}`}>
      {label}
    </span>
  );
}
