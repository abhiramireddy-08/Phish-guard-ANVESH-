import React, { useState, useEffect } from 'react';
import { getHistory, clearHistory, deleteItem } from '../utils/storage';

const RC = { CRITICAL:'#ef4444', HIGH:'#f59e0b', MEDIUM:'#eab308', LOW:'#10b981' };
const RB = { CRITICAL:'rgba(239,68,68,0.15)', HIGH:'rgba(245,158,11,0.15)', MEDIUM:'rgba(234,179,8,0.15)', LOW:'rgba(16,185,129,0.15)' };

export default function History() {
  const [rows, setRows]       = useState([]);
  const [filter, setFilter]   = useState('ALL');
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState('newest');
  const [selected, setSelected] = useState(null);

  // Load fresh from localStorage every time this component mounts
  useEffect(() => { setRows(getHistory()); }, []);

  const handleClear = () => {
    if (!window.confirm('History అన్నీ delete చేయాలా?')) return;
    clearHistory(); setRows([]);
  };

  const handleDelete = (id) => {
    deleteItem(id);
    setRows(prev => prev.filter(r => r.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  // Apply filters
  let data = [...rows];
  if (filter === 'THREATS')  data = data.filter(r => r.risk !== 'LOW');
  if (filter === 'SAFE')     data = data.filter(r => r.risk === 'LOW');
  if (filter === 'URL')      data = data.filter(r => r.type === 'URL');
  if (filter === 'EMAIL')    data = data.filter(r => r.type === 'Email');
  if (filter === 'CRITICAL') data = data.filter(r => r.risk === 'CRITICAL');
  if (search.trim()) {
    const s = search.toLowerCase();
    data = data.filter(r => r.input?.toLowerCase().includes(s));
  }
  if (sort === 'high')   data = [...data].sort((a,b) => b.score - a.score);
  if (sort === 'low')    data = [...data].sort((a,b) => a.score - b.score);

  const threats = rows.filter(r => r.risk !== 'LOW').length;

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>📋 Scan History</h1>
          <p style={{color:'var(--text-muted)',fontSize:14,marginTop:4}}>
            {rows.length} scans · {threats} threats detected
          </p>
        </div>
        {rows.length > 0 && (
          <button onClick={handleClear} style={{background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:8,padding:'9px 16px',cursor:'pointer',color:'#f87171',fontWeight:600,fontSize:13}}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div style={{textAlign:'center',padding:'80px 24px',background:'var(--bg-card)',borderRadius:12,border:'1px solid var(--border)'}}>
          <div style={{fontSize:52,marginBottom:16}}>📋</div>
          <div style={{fontSize:20,fontWeight:700,marginBottom:10}}>No scan history yet</div>
          <div style={{color:'var(--text-secondary)',fontSize:14,lineHeight:1.8}}>
            Scanner page లో URL లేదా Email scan చేయి.<br/>
            ప్రతి scan automatically ఇక్కడ save అవుతుంది!
          </div>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:selected?'1fr 380px':'1fr',gap:16}}>
          {/* Left: Table */}
          <div>
            {/* Controls */}
            <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search URL / sender..."
                style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 14px',color:'var(--text-primary)',fontSize:13,outline:'none',width:220}}
              />
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',color:'var(--text-primary)',fontSize:13,cursor:'pointer'}}>
                <option value="newest">Newest First</option>
                <option value="high">Highest Risk</option>
                <option value="low">Lowest Risk</option>
              </select>
              <span style={{color:'var(--text-muted)',fontSize:12,marginLeft:'auto'}}>{data.length} results</span>
            </div>

            {/* Filter tabs */}
            <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
              {['ALL','THREATS','SAFE','URL','EMAIL','CRITICAL'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{padding:'6px 14px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,
                    background: filter===f?'rgba(99,102,241,0.2)':'transparent',
                    borderColor: filter===f?'rgba(99,102,241,0.4)':'var(--border)',
                    color: filter===f?'#a5b4fc':'var(--text-muted)'}}>
                  {f}
                </button>
              ))}
            </div>

            {data.length === 0 ? (
              <div style={{textAlign:'center',padding:40,color:'var(--text-muted)',background:'var(--bg-card)',borderRadius:12,border:'1px solid var(--border)'}}>
                No results for this filter
              </div>
            ) : (
              <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{background:'rgba(255,255,255,0.03)'}}>
                      {['#','Type','URL / Sender','Risk','Score','Time',''].map(h => (
                        <th key={h} style={{textAlign:'left',padding:'12px 14px',fontSize:11,color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, i) => (
                      <tr key={r.id}
                        onClick={() => setSelected(selected?.id===r.id ? null : r)}
                        style={{borderTop:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',
                          background: selected?.id===r.id?'rgba(99,102,241,0.08)':'transparent'}}>
                        <td style={{padding:'12px 14px',fontSize:12,color:'var(--text-muted)'}}>{i+1}</td>
                        <td style={{padding:'12px 14px'}}>
                          <span style={{fontSize:11,color:'var(--text-secondary)',background:'rgba(255,255,255,0.06)',padding:'3px 8px',borderRadius:5}}>
                            {r.type==='URL'?'🔗':'📧'} {r.type}
                          </span>
                        </td>
                        <td style={{padding:'12px 14px',fontSize:13,color:'var(--text-primary)',maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {r.input}
                        </td>
                        <td style={{padding:'12px 14px'}}>
                          <span style={{background:RB[r.risk],color:RC[r.risk],padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>
                            {r.risk}
                          </span>
                        </td>
                        <td style={{padding:'12px 14px'}}>
                          <span style={{fontSize:16,fontWeight:800,color:RC[r.risk]}}>{r.score}</span>
                          <span style={{fontSize:10,color:'var(--text-muted)'}}>/100</span>
                        </td>
                        <td style={{padding:'12px 14px',fontSize:11,color:'var(--text-muted)',whiteSpace:'nowrap'}}>{r.time}</td>
                        <td style={{padding:'12px 14px'}}>
                          <button onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                            style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:15,padding:'2px 6px',borderRadius:4}}
                            title="Delete">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Detail panel */}
          {selected && (
            <div style={{background:'var(--bg-card)',border:`1px solid ${RC[selected.risk]}30`,borderRadius:12,padding:20,height:'fit-content',position:'sticky',top:0}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:15}}>Scan Detail</div>
                <button onClick={() => setSelected(null)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:18}}>✕</button>
              </div>
              <div style={{fontSize:28,textAlign:'center',margin:'12px 0'}}>{selected.risk==='LOW'?'✅':'🚨'}</div>
              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{fontSize:36,fontWeight:800,color:RC[selected.risk]}}>{selected.score}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>Risk Score</div>
                <span style={{background:RB[selected.risk],color:RC[selected.risk],padding:'4px 14px',borderRadius:20,fontSize:12,fontWeight:700,marginTop:8,display:'inline-block'}}>
                  {selected.risk}
                </span>
              </div>

              <div style={{background:'var(--bg-secondary)',borderRadius:8,padding:12,marginBottom:12}}>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Input</div>
                <div style={{fontSize:12,color:'var(--text-primary)',wordBreak:'break-all'}}>{selected.input}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                {[
                  ['Type', selected.type],
                  ['Confidence', `${Math.round(selected.confidence*100)}%`],
                  ['Scanned', selected.time],
                ].map(([k,v]) => (
                  <div key={k} style={{background:'var(--bg-secondary)',borderRadius:8,padding:10}}>
                    <div style={{fontSize:10,color:'var(--text-muted)',marginBottom:2}}>{k}</div>
                    <div style={{fontSize:13,fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>

              {selected.indicators?.length > 0 && (
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--text-secondary)',marginBottom:8}}>Indicators ({selected.indicators.length})</div>
                  {selected.indicators.map((ind,i) => (
                    <div key={i} style={{fontSize:12,color:'var(--text-secondary)',padding:'6px 0',borderBottom:'1px solid var(--border)',display:'flex',gap:8}}>
                      <span style={{flexShrink:0}}>•</span>{ind}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
