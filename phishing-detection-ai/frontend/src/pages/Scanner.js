import React, { useState } from 'react';
import { analyzeURL, analyzeEmail, DEMO_URLS, DEMO_EMAIL } from '../utils/engine';
import { saveToHistory } from '../utils/storage';

// ✅ 100% browser-based — no backend calls at all!

const RC = { CRITICAL:'#ef4444', HIGH:'#f59e0b', MEDIUM:'#eab308', LOW:'#10b981' };

function Meter({ score, level }) {
  const c = RC[level] || '#94a3b8';
  return (
    <div style={{display:'flex',alignItems:'center',gap:16,margin:'16px 0'}}>
      <div style={{width:76,height:76,borderRadius:'50%',border:`3px solid ${c}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <span style={{fontSize:20,fontWeight:800,color:c}}>{score}</span>
        <span style={{fontSize:9,color:'var(--text-muted)'}}>/100</span>
      </div>
      <div style={{flex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:7}}>
          <span style={{color:'var(--text-secondary)'}}>Risk Score</span>
          <span style={{color:c,fontWeight:700}}>{level}</span>
        </div>
        <div style={{height:9,background:'var(--bg-secondary)',borderRadius:5,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${score}%`,background:`linear-gradient(90deg,${c}77,${c})`,borderRadius:5,transition:'width 0.9s ease'}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-muted)',marginTop:4}}>
          <span>Safe</span><span>Medium</span><span>High</span><span>Critical</span>
        </div>
      </div>
    </div>
  );
}

function Result({ res, onReset }) {
  const [open, setOpen] = useState(true);
  if (!res) return null;
  const c = RC[res.risk_level];
  return (
    <div style={{background:'var(--bg-card)',border:`1px solid ${c}35`,borderRadius:12,padding:22,marginTop:16}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
        <span style={{fontSize:40}}>{res.is_phishing ? '🚨' : '✅'}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:21,fontWeight:800,color:c}}>{res.is_phishing ? 'Phishing Detected!' : 'Looks Safe!'}</div>
          <div style={{fontSize:13,color:'var(--text-secondary)',marginTop:2}}>
            Confidence: <b style={{color:c}}>{Math.round(res.confidence*100)}%</b>
            {res.domain && <span style={{color:'var(--text-muted)',marginLeft:10}}>• {res.domain}</span>}
          </div>
        </div>
        <button onClick={() => setOpen(!open)}
          style={{background:'transparent',border:'1px solid var(--border)',borderRadius:7,padding:'5px 11px',cursor:'pointer',color:'var(--text-muted)',fontSize:12}}>
          {open ? '▲' : '▼'}
        </button>
      </div>

      <Meter score={res.risk_score} level={res.risk_level} />

      {open && <>
        {res.indicators?.length > 0 ? (
          <div style={{marginTop:4}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text-secondary)',marginBottom:8}}>
              Threat Indicators ({res.indicators.length})
            </div>
            {res.indicators.map((ind,i) => (
              <div key={i} style={{display:'flex',gap:9,padding:'8px 0',fontSize:13,color:'var(--text-secondary)',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:ind.startsWith('❌')?'#ef4444':'#f59e0b',marginTop:6,flexShrink:0}}/>
                {ind}
              </div>
            ))}
          </div>
        ) : (
          <div style={{padding:12,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:8,color:'#34d399',fontSize:13}}>
            ✅ No suspicious indicators found!
          </div>
        )}

        <div style={{marginTop:14,padding:12,background:res.is_phishing?'rgba(239,68,68,0.07)':'rgba(16,185,129,0.07)',borderRadius:8,fontSize:13,color:'var(--text-secondary)'}}>
          <b style={{color:res.is_phishing?'#f87171':'#34d399'}}>{res.is_phishing?'🛑 Action: ':'✅ Note: '}</b>
          {res.is_phishing ? 'Do NOT visit or enter personal info. Report to your security team.' : 'Appears safe. Always stay cautious online.'}
        </div>

        <button onClick={onReset}
          style={{marginTop:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:8,padding:'9px 18px',color:'white',fontWeight:700,cursor:'pointer',fontSize:13}}>
          🔍 Scan Another
        </button>
      </>}
    </div>
  );
}

export default function Scanner() {
  const [tab,   setTab]  = useState('url');
  const [url,   setURL]  = useState('');
  const [em,    setEM]   = useState({sender:'',subject:'',body:''});
  const [batch, setBatch]= useState('');
  const [res,   setRes]  = useState(null);
  const [bres,  setBRes] = useState([]);
  const [loading,setL]   = useState(false);
  const [err,   setErr]  = useState('');
  const [count, setCnt]  = useState(0);

  const reset = () => { setRes(null); setURL(''); setEM({sender:'',subject:'',body:''}); setErr(''); };

  const scan = () => {
    setErr(''); setRes(null); setL(true);
    setTimeout(() => {
      try {
        let r;
        if (tab === 'url') {
          if (!url.trim()) { setErr('URL enter చేయి'); setL(false); return; }
          r = analyzeURL(url.trim());
          if (r?.error) { setErr(r.error); setL(false); return; }
          saveToHistory({ type:'URL', input:url.trim(), risk:r.risk_level, score:r.risk_score, confidence:r.confidence, indicators:r.indicators });
        } else {
          if (!em.sender.trim() || !em.body.trim()) { setErr('Sender మరియు Body అవసరం'); setL(false); return; }
          r = analyzeEmail(em.sender, em.subject, em.body);
          saveToHistory({ type:'Email', input:em.sender.trim(), risk:r.risk_level, score:r.risk_score, confidence:r.confidence, indicators:r.indicators });
        }
        setRes(r);
        setCnt(c => c+1);
      } catch(e) { setErr('Error: '+e.message); }
      setL(false);
    }, 500);
  };

  const batchScan = () => {
    const urls = batch.split('\n').map(u=>u.trim()).filter(Boolean).slice(0,50);
    if (!urls.length) { setErr('URLs enter చేయి'); return; }
    setErr('');
    const results = urls.map(u => {
      const r = analyzeURL(u);
      if (r && !r.error) saveToHistory({ type:'URL', input:u, risk:r.risk_level, score:r.risk_score, confidence:r.confidence, indicators:r.indicators });
      return { url:u, ...r };
    });
    setBRes(results);
    setCnt(c => c + urls.length);
  };

  const tabBtn = (id, label) => (
    <button onClick={() => { setTab(id); setRes(null); setBRes([]); setErr(''); }}
      style={{padding:'8px 20px',borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,
        background: tab===id ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
        color: tab===id ? 'white' : 'var(--text-secondary)'}}>
      {label}
    </button>
  );

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>🔍 Phishing Scanner</h1>
          <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:4}}>
            ✅ 100% Browser-based • No backend needed • Instant results
          </p>
        </div>
        {count > 0 && (
          <div style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:8,padding:'8px 14px',fontSize:13,color:'#a5b4fc'}}>
            ✅ {count} scans done this session
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,background:'var(--bg-secondary)',borderRadius:10,padding:4,width:'fit-content',marginBottom:20,border:'1px solid var(--border)'}}>
        {tabBtn('url',  '🔗 URL Scan')}
        {tabBtn('email','📧 Email Scan')}
        {tabBtn('batch','📋 Batch Scan')}
      </div>

      {/* URL Tab */}
      {tab === 'url' && (
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22,marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>URL Scan</div>
          <div style={{display:'flex',gap:10,marginBottom:14}}>
            <input className="input" style={{flex:1}}
              placeholder="https://example.com లేదా http://suspicious.xyz/login"
              value={url} onChange={e=>setURL(e.target.value)}
              onKeyDown={e=>e.key==='Enter' && scan()} />
            <button onClick={scan} disabled={loading}
              style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:8,padding:'11px 22px',color:'white',fontWeight:700,cursor:'pointer',opacity:loading?.5:1,whiteSpace:'nowrap'}}>
              {loading ? '⏳...' : '🔍 Scan'}
            </button>
          </div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:8}}>💡 Quick test URLs:</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {DEMO_URLS.map(({url:u,label}) => (
              <button key={u} onClick={() => setURL(u)}
                style={{background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:6,padding:'4px 10px',fontSize:11,color:'var(--text-muted)',cursor:'pointer',fontFamily:'monospace'}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Email Tab */}
      {tab === 'email' && (
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22,marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:15}}>Email Analysis</div>
            <button onClick={() => setEM(DEMO_EMAIL)}
              style={{background:'transparent',border:'1px solid var(--border)',borderRadius:7,padding:'6px 12px',cursor:'pointer',color:'var(--text-secondary)',fontSize:12}}>
              📋 Load Demo Phishing Email
            </button>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <input className="input" placeholder="Sender: noreply@suspicious.xyz" value={em.sender} onChange={e=>setEM({...em,sender:e.target.value})} />
            <input className="input" placeholder="Subject: URGENT!! Verify Account!!" value={em.subject} onChange={e=>setEM({...em,subject:e.target.value})} />
            <textarea className="input" rows={6} placeholder="Email body paste చేయి..." value={em.body} onChange={e=>setEM({...em,body:e.target.value})} style={{resize:'vertical'}} />
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={() => setEM({sender:'',subject:'',body:''})}
                style={{background:'transparent',border:'1px solid var(--border)',borderRadius:8,padding:'10px 16px',cursor:'pointer',color:'var(--text-secondary)',fontWeight:600}}>
                🗑️ Clear
              </button>
              <button onClick={scan} disabled={loading}
                style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:8,padding:'10px 22px',color:'white',fontWeight:700,cursor:'pointer',opacity:loading?.5:1}}>
                {loading ? '⏳ Analyzing...' : '📧 Analyze Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Tab */}
      {tab === 'batch' && (
        <>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>Batch URL Scanner</div>
            <p style={{color:'var(--text-secondary)',fontSize:13,marginBottom:12}}>ఒక్కో line కి ఒక URL — max 50 URLs ఒకేసారి scan చేయవచ్చు</p>
            <textarea className="input" rows={8} value={batch} onChange={e=>setBatch(e.target.value)}
              placeholder={"https://google.com\nhttp://paypal-verify.xyz\nhttps://github.com\n..."}
              style={{resize:'vertical',fontFamily:'monospace',fontSize:13}} />
            <div style={{display:'flex',gap:10,marginTop:12}}>
              <button onClick={batchScan}
                style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:8,padding:'10px 22px',color:'white',fontWeight:700,cursor:'pointer'}}>
                🔍 Scan All
              </button>
              <button onClick={() => { setBatch(''); setBRes([]); }}
                style={{background:'transparent',border:'1px solid var(--border)',borderRadius:8,padding:'10px 16px',cursor:'pointer',color:'var(--text-secondary)',fontWeight:600}}>
                Clear
              </button>
            </div>
          </div>

          {bres.length > 0 && (
            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',fontWeight:700}}>
                Results: {bres.length} URLs • 🚨 {bres.filter(r=>r.is_phishing).length} threats • ✅ {bres.filter(r=>!r.is_phishing&&!r.error).length} safe
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'rgba(255,255,255,0.03)'}}>
                    {['#','URL','Risk','Score','Result'].map(h=>(
                      <th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:11,color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bres.map((r,i) => (
                    <tr key={i} style={{borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                      <td style={{padding:'10px 14px',fontSize:12,color:'var(--text-muted)'}}>{i+1}</td>
                      <td style={{padding:'10px 14px',fontSize:12,color:'var(--text-primary)',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'monospace'}}>{r.url}</td>
                      <td style={{padding:'10px 14px'}}>
                        {r.error ? <span style={{color:'var(--text-muted)',fontSize:11}}>Error</span> :
                          <span style={{background:`${RC[r.risk_level]}20`,color:RC[r.risk_level],padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700}}>{r.risk_level}</span>}
                      </td>
                      <td style={{padding:'10px 14px',fontWeight:800,color:RC[r.risk_level],fontSize:15}}>{r.risk_score ?? '—'}</td>
                      <td style={{padding:'10px 14px',fontSize:13}}>{r.error ? '⚠️ '+r.error : r.is_phishing ? '🚨 Phishing' : '✅ Safe'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {err && (
        <div style={{padding:13,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:8,color:'#f87171',fontSize:14,marginTop:10}}>
          ❌ {err}
        </div>
      )}

      {tab !== 'batch' && <Result res={res} onReset={reset} />}
    </div>
  );
}
