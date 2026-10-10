import React, { useEffect, useState } from 'react';
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,LineChart,Line,CartesianGrid } from 'recharts';
import { getStats } from '../utils/storage';

const RC = { CRITICAL:'#ef4444', HIGH:'#f59e0b', MEDIUM:'#eab308', LOW:'#10b981' };
const TT = (p) => <Tooltip {...p} contentStyle={{background:'#1a1f2e',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8}} labelStyle={{color:'#f1f5f9'}}/>;

export default function Dashboard() {
  const [st, setSt] = useState({total:0,threats:0,safe:0,critical:0,high:0,medium:0,urls:0,emails:0,rate:0,avgScore:0,history:[]});

  useEffect(() => { setSt(getStats()); }, []);

  const h = st.history;

  // Last 7 days
  const days7 = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    const label = d.toLocaleDateString('en',{weekday:'short'});
    const items = h.filter(x=>{
      const xd = new Date(x.ts); return xd.toDateString()===d.toDateString();
    });
    return {label, scans:items.length, threats:items.filter(x=>x.risk!=='LOW').length};
  });

  // Score trend last 15
  const trend = [...h].slice(0,15).reverse().map((x,i)=>({i:i+1,score:x.score}));

  // Pie
  const pie = [
    {name:'Critical',value:st.critical,color:'#ef4444'},
    {name:'High',    value:st.high,    color:'#f59e0b'},
    {name:'Medium',  value:st.medium,  color:'#eab308'},
    {name:'Safe',    value:st.safe,    color:'#10b981'},
  ].filter(x=>x.value>0);

  const statCards = [
    {label:'Total Scans',     val:st.total,    icon:'🔍', color:'#6366f1'},
    {label:'Threats Found',   val:st.threats,  icon:'🚨', color:'#ef4444'},
    {label:'Safe Scans',      val:st.safe,     icon:'✅', color:'#10b981'},
    {label:'Detection Rate',  val:`${st.rate}%`,icon:'📊',color:'#f59e0b'},
  ];

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>📊 Dashboard</h1>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:4}}>Scan activity overview — updates after every scan</p>
      </div>

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
        {statCards.map(s=>(
          <div key={s.label} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:s.color}}/>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:10}}>{s.label}</div>
            <div style={{fontSize:30,fontWeight:800}}>{s.val}</div>
            <div style={{position:'absolute',right:16,top:20,fontSize:22,opacity:.3}}>{s.icon}</div>
          </div>
        ))}
      </div>

      {st.total===0 ? (
        <div style={{textAlign:'center',padding:'80px 24px',background:'var(--bg-card)',borderRadius:12,border:'1px solid var(--border)'}}>
          <div style={{fontSize:52,marginBottom:16}}>📊</div>
          <div style={{fontSize:20,fontWeight:700,marginBottom:10}}>No data yet</div>
          <div style={{color:'var(--text-secondary)',fontSize:14}}>Scanner లో URLs scan చేయి — charts ఇక్కడ show అవుతాయి!</div>
        </div>
      ) : <>
        {/* Charts row 1 */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22}}>
            <div style={{fontWeight:700,marginBottom:16}}>Last 7 Days Activity</div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={days7} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                <XAxis dataKey="label" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <TT/>
                <Bar dataKey="scans"   fill="#6366f1" radius={[4,4,0,0]} name="Total"/>
                <Bar dataKey="threats" fill="#ef4444" radius={[4,4,0,0]} name="Threats"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22}}>
            <div style={{fontWeight:700,marginBottom:12}}>Risk Breakdown</div>
            {pie.length>0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <TT/>
                </PieChart>
              </ResponsiveContainer>
            ):null}
            <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:8}}>
              {pie.map(x=>(
                <div key={x.name} style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{color:x.color}}>● {x.name}</span>
                  <span style={{color:'var(--text-muted)'}}>{x.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22}}>
            <div style={{fontWeight:700,marginBottom:14}}>Score Trend (Last 15 Scans)</div>
            {trend.length>1 ? (
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                  <XAxis dataKey="i" tick={{fill:'#94a3b8',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0,100]} tick={{fill:'#94a3b8',fontSize:11}} axisLine={false} tickLine={false}/>
                  <TT/>
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{fill:'#6366f1',r:3}} name="Score"/>
                </LineChart>
              </ResponsiveContainer>
            ):<div style={{textAlign:'center',padding:40,color:'var(--text-muted)',fontSize:13}}>2+ scans needed</div>}
          </div>

          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22}}>
            <div style={{fontWeight:700,marginBottom:14}}>Scan Breakdown</div>
            {[
              {label:'URL Scans',   val:st.urls,   tot:st.total, color:'#6366f1', icon:'🔗'},
              {label:'Email Scans', val:st.emails, tot:st.total, color:'#8b5cf6', icon:'📧'},
            ].map(x=>(
              <div key={x.label} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}>
                  <span>{x.icon} {x.label}</span>
                  <span style={{color:'var(--text-muted)'}}>{x.val}/{x.tot}</span>
                </div>
                <div style={{height:8,background:'var(--bg-secondary)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${x.tot?x.val/x.tot*100:0}%`,background:x.color,borderRadius:4}}/>
                </div>
              </div>
            ))}
            <div style={{marginTop:8,padding:12,background:'var(--bg-secondary)',borderRadius:8}}>
              <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>Avg Risk Score</div>
              <div style={{fontSize:26,fontWeight:800,color:st.avgScore>50?'#ef4444':'#10b981'}}>{st.avgScore}</div>
            </div>
          </div>
        </div>

        {/* Recent threats */}
        {h.filter(x=>x.risk!=='LOW').length>0 && (
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',fontWeight:700}}>🚨 Recent Threats</div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'rgba(255,255,255,0.03)'}}>
                  {['URL / Sender','Type','Risk','Score','Time'].map(h=>(
                    <th key={h} style={{textAlign:'left',padding:'10px 16px',fontSize:11,color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {h.filter(x=>x.risk!=='LOW').slice(0,6).map((r,i)=>(
                  <tr key={i} style={{borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                    <td style={{padding:'11px 16px',fontSize:13,maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.input}</td>
                    <td style={{padding:'11px 16px',fontSize:12,color:'var(--text-secondary)'}}>{r.type==='URL'?'🔗':'📧'} {r.type}</td>
                    <td style={{padding:'11px 16px'}}><span style={{background:`${RC[r.risk]}20`,color:RC[r.risk],padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{r.risk}</span></td>
                    <td style={{padding:'11px 16px',fontWeight:800,color:RC[r.risk]}}>{r.score}</td>
                    <td style={{padding:'11px 16px',fontSize:11,color:'var(--text-muted)'}}>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>}
    </div>
  );
}
