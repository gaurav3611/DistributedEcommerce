import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../data.js';

/* ─── CLUSTER DASHBOARD ──────────────────────────────────
 * Visual proof of Distributed Shared Memory.
 * Shows:
 *  1. Active DataNodes (two systems working together)
 *  2. File distribution (which files are on which node)
 *  3. Replication proof (data duplicated across nodes)
 *  4. Live activity feed (real-time operations)
 * ────────────────────────────────────────────────────── */

const ACCENT = '#22d3ee';
const GREEN  = '#10b981';
const ORANGE = '#f97316';
const RED    = '#ef4444';
const PURPLE = '#818cf8';
const PINK   = '#ec4899';

function StatusDot({ healthy }) {
  return (
    <span style={{
      display:'inline-block', width:'8px', height:'8px', borderRadius:'50%',
      background: healthy ? GREEN : RED,
      boxShadow: healthy ? `0 0 8px ${GREEN}` : `0 0 8px ${RED}`,
      animation: 'pulse 2s ease-in-out infinite',
    }}/>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background:'var(--bg-card)', borderRadius:'16px', padding:'20px',
      boxShadow:'0 2px 12px var(--shadow-sm)', position:'relative', overflow:'hidden',
      border:'1px solid var(--border-light)',
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background: color || ACCENT }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
        <span style={{ fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.1em' }}>{label}</span>
        <span style={{ fontSize:'18px' }}>{icon}</span>
      </div>
      <p style={{ fontSize:'28px', fontWeight:900, color: color || 'var(--text-main)', margin:'0 0 4px', fontFamily:'monospace' }}>{value}</p>
      {sub && <p style={{ fontSize:'11px', color:'var(--text-muted)', margin:0 }}>{sub}</p>}
    </div>
  );
}

function NodeCard({ node, index }) {
  const usageNum = parseFloat(node.usagePercent) || 0;
  return (
    <div style={{
      background:'var(--bg-card)', borderRadius:'20px', padding:'24px',
      border:'1px solid var(--border-light)', boxShadow:'0 4px 20px var(--shadow-sm)',
      position:'relative', overflow:'hidden',
    }}>
      {/* Glow effect */}
      <div style={{
        position:'absolute', top:'-40px', right:'-40px', width:'120px', height:'120px',
        borderRadius:'50%', filter:'blur(40px)', opacity:0.12,
        background: index === 0 ? ACCENT : PURPLE,
      }}/>

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px' }}>
          <div style={{
            width:'48px', height:'48px', borderRadius:'14px', display:'flex',
            alignItems:'center', justifyContent:'center', fontSize:'22px',
            background: index === 0
              ? 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)'
              : 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
            boxShadow: index === 0 ? '0 6px 20px rgba(34,211,238,0.3)' : '0 6px 20px rgba(129,140,248,0.3)',
          }}>
            {index === 0 ? '🖥️' : '💾'}
          </div>
          <div>
            <h3 style={{ fontSize:'16px', fontWeight:800, margin:0, color:'var(--text-main)' }}>
              {index === 0 ? 'System A (Main)' : `System B (Replica ${index})`}
            </h3>
            <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:'2px 0 0', fontFamily:'monospace' }}>
              {node.hostname || node.ipAddress}:{node.port}
            </p>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:'6px' }}>
            <StatusDot healthy={node.state === 'NORMAL' || node.state === 'IN_SERVICE'}/>
            <span style={{
              fontSize:'11px', fontWeight:700, letterSpacing:'.05em',
              color: (node.state === 'NORMAL' || node.state === 'IN_SERVICE') ? GREEN : RED,
            }}>
              {node.state || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Storage bar */}
        <div style={{ marginBottom:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ fontSize:'11px', fontWeight:600, color:'var(--text-secondary)' }}>Storage Usage</span>
            <span style={{ fontSize:'11px', fontWeight:800, color: usageNum > 80 ? RED : usageNum > 50 ? ORANGE : GREEN }}>
              {node.usagePercent}
            </span>
          </div>
          <div style={{ height:'8px', borderRadius:'4px', background:'var(--border-light)', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:'4px', transition:'width 1s ease',
              width: `${Math.min(usageNum, 100)}%`,
              background: usageNum > 80 ? `linear-gradient(90deg, ${ORANGE}, ${RED})`
                : usageNum > 50 ? `linear-gradient(90deg, ${GREEN}, ${ORANGE})`
                : `linear-gradient(90deg, ${ACCENT}, ${GREEN})`,
            }}/>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
          <div style={{ background:'var(--bg-subtle)', borderRadius:'10px', padding:'10px' }}>
            <p style={{ fontSize:'10px', fontWeight:600, color:'var(--text-muted)', margin:'0 0 4px', textTransform:'uppercase' }}>Capacity</p>
            <p style={{ fontSize:'14px', fontWeight:800, color:'var(--text-main)', margin:0 }}>{node.capacityTotal}</p>
          </div>
          <div style={{ background:'var(--bg-subtle)', borderRadius:'10px', padding:'10px' }}>
            <p style={{ fontSize:'10px', fontWeight:600, color:'var(--text-muted)', margin:'0 0 4px', textTransform:'uppercase' }}>Used</p>
            <p style={{ fontSize:'14px', fontWeight:800, color:ORANGE, margin:0 }}>{node.capacityUsed}</p>
          </div>
          <div style={{ background:'var(--bg-subtle)', borderRadius:'10px', padding:'10px' }}>
            <p style={{ fontSize:'10px', fontWeight:600, color:'var(--text-muted)', margin:'0 0 4px', textTransform:'uppercase' }}>Blocks</p>
            <p style={{ fontSize:'14px', fontWeight:800, color:PURPLE, margin:0 }}>{node.blocksCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileDistributionTable({ files }) {
  if (!files || files.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>
        <p style={{ fontSize:'16px', marginBottom:'8px' }}>📂 No files distributed yet</p>
        <p style={{ fontSize:'12px' }}>Add products, users, or place orders to see data distribution</p>
      </div>
    );
  }

  const categoryColors = {
    products: ACCENT, users: GREEN, orders: ORANGE,
    carts: PURPLE, sessions: PINK,
  };

  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'separate', borderSpacing:'0 4px', fontSize:'13px' }}>
        <thead>
          <tr style={{ textAlign:'left' }}>
            <th style={{ padding:'8px 12px', fontSize:'10px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em' }}>File</th>
            <th style={{ padding:'8px 12px', fontSize:'10px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em' }}>Category</th>
            <th style={{ padding:'8px 12px', fontSize:'10px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em' }}>Size</th>
            <th style={{ padding:'8px 12px', fontSize:'10px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em' }}>Replication</th>
            <th style={{ padding:'8px 12px', fontSize:'10px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.1em' }}>Stored On Nodes</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, i) => (
            <tr key={i} style={{
              background:'var(--bg-card)', borderRadius:'10px',
              transition:'all .2s',
            }}>
              <td style={{ padding:'10px 12px', fontFamily:'monospace', fontWeight:600, color:'var(--text-main)', borderRadius:'10px 0 0 10px' }}>
                📄 {file.fileName}
              </td>
              <td style={{ padding:'10px 12px' }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:'4px',
                  padding:'3px 10px', borderRadius:'100px', fontSize:'11px', fontWeight:700,
                  background: `${categoryColors[file.category] || ACCENT}20`,
                  color: categoryColors[file.category] || ACCENT,
                }}>
                  {file.category}
                </span>
              </td>
              <td style={{ padding:'10px 12px', fontFamily:'monospace', fontWeight:600, color:'var(--text-secondary)' }}>
                {file.size}
              </td>
              <td style={{ padding:'10px 12px' }}>
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:'4px', fontWeight:800,
                  color: file.replication >= 2 ? GREEN : ORANGE,
                }}>
                  {file.replication >= 2 ? '✅' : '⚠️'} ×{file.replication}
                </span>
              </td>
              <td style={{ padding:'10px 12px', borderRadius:'0 10px 10px 0' }}>
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                  {(file.storedOnNodes || []).map((host, j) => (
                    <span key={j} style={{
                      padding:'3px 10px', borderRadius:'6px', fontSize:'11px', fontFamily:'monospace',
                      fontWeight:600, border:'1px solid var(--border-light)',
                      background: j === 0 ? `${ACCENT}15` : `${PURPLE}15`,
                      color: j === 0 ? ACCENT : PURPLE,
                    }}>
                      🖧 {host}
                    </span>
                  ))}
                  {(!file.storedOnNodes || file.storedOnNodes.length === 0) && (
                    <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>Fetching…</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'30px' }}>No recent activity</p>;
  }

  const categoryIcons = {
    products: '📦', users: '👤', orders: '🛒', carts: '🛍️', sessions: '🔑',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px', maxHeight:'400px', overflowY:'auto' }}>
      {activities.map((act, i) => (
        <div key={i} style={{
          display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px',
          background:'var(--bg-card)', borderRadius:'10px', border:'1px solid var(--border-light)',
        }}>
          <span style={{ fontSize:'16px' }}>{categoryIcons[act.category] || '📄'}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:'13px', fontWeight:700, color:'var(--text-main)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {act.file}
            </p>
            <p style={{ fontSize:'11px', color:'var(--text-muted)', margin:'2px 0 0' }}>
              {act.category} · {act.size} · Replication: ×{act.replication}
            </p>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <p style={{ fontSize:'11px', color:'var(--text-secondary)', margin:0, fontFamily:'monospace' }}>
              {new Date(act.modifiedAt).toLocaleTimeString()}
            </p>
            <p style={{ fontSize:'10px', color:'var(--text-muted)', margin:'2px 0 0' }}>
              {new Date(act.modifiedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StorageSummaryChart({ summary }) {
  if (!summary) return null;

  const categories = ['products', 'users', 'orders', 'carts', 'sessions', 'recommendations', 'transactions'];
  const colors = [ACCENT, GREEN, ORANGE, PURPLE, PINK, '#f59e0b', '#6366f1'];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px, 1fr))', gap:'10px' }}>
      {categories.map((cat, i) => {
        const data = summary[cat];
        if (!data || data.error) return null;
        return (
          <div key={cat} style={{
            background:'var(--bg-card)', borderRadius:'14px', padding:'16px',
            border:'1px solid var(--border-light)', textAlign:'center',
          }}>
            <div style={{
              width:'40px', height:'40px', borderRadius:'12px', margin:'0 auto 10px',
              background:`${colors[i]}20`, display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontSize:'18px' }}>
                {['📦','👤','🛒','🛍️','🔑','⭐','📊'][i]}
              </span>
            </div>
            <p style={{ fontSize:'24px', fontWeight:900, color: colors[i], margin:'0 0 4px', fontFamily:'monospace' }}>
              {data.fileCount}
            </p>
            <p style={{ fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', margin:'0 0 2px', textTransform:'capitalize' }}>
              {cat}
            </p>
            <p style={{ fontSize:'10px', color:'var(--text-muted)', margin:0 }}>
              {data.totalSize}
              {data.effectiveReplication > 0 && (
                <span style={{ color: GREEN }}> · ×{data.effectiveReplication} replicated</span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ─── MAIN CLUSTER DASHBOARD ─── */
export function ClusterDashboard({ toast }) {
  const [health, setHealth] = useState(null);
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [healthRes, filesRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/cluster/health`),
        fetch(`${API_BASE}/cluster/files`),
        fetch(`${API_BASE}/cluster/activity?limit=25`),
      ]);
      if (healthRes.ok) setHealth(await healthRes.json());
      if (filesRes.ok) setFiles(await filesRes.json());
      if (activityRes.ok) setActivity(await activityRes.json());
      setLastUpdate(new Date());
    } catch (e) {
      if (toast) toast('error', 'Cluster Unreachable', 'Could not fetch cluster data');
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAll();
    if (!autoRefresh) return;
    const iv = setInterval(fetchAll, 5000); // refresh every 5s
    return () => clearInterval(iv);
  }, [fetchAll, autoRefresh]);

  const nodes = health?.dataNodes || [];
  const repl = health?.replicationHealth || {};
  const summary = health?.storageSummary || {};

  if (loading) {
    return (
      <div style={{ textAlign:'center', padding:'80px 20px' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px', animation:'pulse 2s ease-in-out infinite' }}>🌐</div>
        <p style={{ fontSize:'18px', fontWeight:700, color:'var(--text-main)' }}>Connecting to Hadoop Cluster…</p>
        <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>Fetching DataNode info and file distribution</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontSize:'24px', fontWeight:900, color:'var(--text-main)', margin:'0 0 4px', display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              width:'36px', height:'36px', borderRadius:'12px',
              background:'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
              boxShadow:'0 4px 14px rgba(34,211,238,0.35)',
              fontSize:'16px',
            }}>🌐</span>
            Distributed Storage Monitor
          </h2>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0 }}>
            Real-time view of Hadoop HDFS cluster · Proving distributed shared memory
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {lastUpdate && (
            <span style={{ fontSize:'11px', color:'var(--text-muted)', fontFamily:'monospace' }}>
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button onClick={() => setAutoRefresh(a => !a)} style={{
            height:'32px', padding:'0 14px', borderRadius:'8px', border:'1px solid var(--border-main)',
            background: autoRefresh ? `${GREEN}20` : 'var(--bg-subtle)',
            color: autoRefresh ? GREEN : 'var(--text-muted)',
            fontWeight:700, fontSize:'11px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px',
          }}>
            <StatusDot healthy={autoRefresh}/>
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button onClick={fetchAll} style={{
            height:'32px', padding:'0 14px', borderRadius:'8px', border:'1px solid var(--border-main)',
            background:'var(--bg-subtle)', color:'var(--text-secondary)',
            fontWeight:700, fontSize:'11px', cursor:'pointer',
          }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Cluster Health Banner */}
      <div style={{
        borderRadius:'16px', padding:'18px 24px', marginBottom:'24px',
        display:'flex', alignItems:'center', gap:'14px',
        background: repl.isHealthy ? `${GREEN}12` : `${ORANGE}12`,
        border: `1px solid ${repl.isHealthy ? GREEN : ORANGE}30`,
      }}>
        <span style={{ fontSize:'24px' }}>{repl.isHealthy ? '✅' : '⚠️'}</span>
        <div>
          <p style={{ fontSize:'14px', fontWeight:800, color:'var(--text-main)', margin:'0 0 2px' }}>
            {repl.status || `Cluster Status: ${nodes.length} DataNode(s) active`}
          </p>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0 }}>
            HDFS URI: {health?.hdfsUri || 'N/A'} · Configured Replication: ×{repl.configuredReplication || '?'} · Cluster Capacity: {repl.clusterCapacity || 'N/A'} ({repl.clusterUsagePercent || '0%'} used)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'14px', marginBottom:'28px' }}>
        <StatCard label="Active DataNodes" value={nodes.length} sub="Physical systems connected" color={ACCENT} icon="🖧"/>
        <StatCard label="Total Files" value={summary._totalFiles || 0} sub={`${summary._totalSize || '0 B'} total data`} color={GREEN} icon="📁"/>
        <StatCard label="Replication Factor" value={`×${repl.configuredReplication || '?'}`} sub="Copies per file across nodes" color={PURPLE} icon="🔄"/>
        <StatCard label="Cluster Usage" value={repl.clusterUsagePercent || '0%'} sub={`${repl.clusterUsed || '0 B'} / ${repl.clusterCapacity || '0 B'}`} color={ORANGE} icon="💽"/>
      </div>

      {/* DataNode Cards */}
      <div style={{ marginBottom:'28px' }}>
        <h3 style={{ fontSize:'16px', fontWeight:800, color:'var(--text-main)', margin:'0 0 14px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>🖥️</span> Connected Systems (DataNodes)
        </h3>
        {nodes.length === 0 ? (
          <div style={{
            background:'var(--bg-card)', borderRadius:'16px', padding:'40px', textAlign:'center',
            border:'1px solid var(--border-light)',
          }}>
            <p style={{ fontSize:'32px', marginBottom:'12px' }}>🔌</p>
            <p style={{ fontSize:'16px', fontWeight:700, color:'var(--text-main)', marginBottom:'8px' }}>
              No DataNodes detected
            </p>
            <p style={{ fontSize:'13px', color:'var(--text-muted)', maxWidth:'400px', margin:'0 auto' }}>
              Make sure Hadoop HDFS is running with <code style={{ background:'var(--bg-subtle)', padding:'2px 6px', borderRadius:'4px' }}>start-dfs.sh</code> and both systems are configured correctly.
            </p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: nodes.length === 1 ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap:'16px' }}>
            {nodes.map((node, i) => <NodeCard key={i} node={node} index={i}/>)}
          </div>
        )}
      </div>

      {/* Storage Summary */}
      <div style={{ marginBottom:'28px' }}>
        <h3 style={{ fontSize:'16px', fontWeight:800, color:'var(--text-main)', margin:'0 0 14px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>📊</span> Storage Summary by Category
        </h3>
        <StorageSummaryChart summary={summary}/>
      </div>

      {/* File Distribution Table */}
      <div style={{
        background:'var(--bg-subtle)', borderRadius:'20px', padding:'24px',
        border:'1px solid var(--border-light)', marginBottom:'28px',
      }}>
        <h3 style={{ fontSize:'16px', fontWeight:800, color:'var(--text-main)', margin:'0 0 16px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>🗺️</span> File Distribution Map
          <span style={{ fontSize:'11px', fontWeight:600, color:'var(--text-muted)', marginLeft:'auto' }}>
            Shows which DataNode(s) hold each file's data blocks
          </span>
        </h3>
        <FileDistributionTable files={files}/>
      </div>

      {/* Activity Feed */}
      <div style={{
        background:'var(--bg-subtle)', borderRadius:'20px', padding:'24px',
        border:'1px solid var(--border-light)',
      }}>
        <h3 style={{ fontSize:'16px', fontWeight:800, color:'var(--text-main)', margin:'0 0 16px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>📡</span> Recent HDFS Activity
          <span style={{ fontSize:'11px', fontWeight:600, color:'var(--text-muted)', marginLeft:'auto' }}>
            Every operation is recorded in the distributed file system
          </span>
        </h3>
        <ActivityFeed activities={activity}/>
      </div>

      <style dangerouslySetInnerHTML={{ __html:`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}}/>
    </div>
  );
}
