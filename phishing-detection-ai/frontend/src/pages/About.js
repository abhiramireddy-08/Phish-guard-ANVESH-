import React from 'react';

export default function About() {
  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>ℹ️ About PhishGuard </h1>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:4}}>Project గురించి complete information</p>
      </div>

      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderLeft:'3px solid #6366f1',borderRadius:12,padding:22,marginBottom:16}}>
        
<div style={{fontWeight:700,fontSize:15,marginBottom:12}}>
  🛡️ What Does This Project Do?
</div>

<p style={{color:'var(--text-secondary)',fontSize:14,lineHeight:1.8}}>
  PhishGuard is a <b style={{color:'var(--text-primary)'}}>rule-based phishing detection system</b>.
  It analyzes URLs and emails to detect potential phishing indicators.
  It works entirely in the browser without requiring a backend server or an internet connection.
</p>
</div>


      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {[
          {title:'URL Analysis Features',icon:'🔗',pts:['HTTPS verification','IP address detection','Suspicious TLD check (.xyz .tk etc)','Brand impersonation detection','Subdomain depth analysis','URL length & entropy','Encoded character detection','Phishing path detection']},
          {title:'Email Analysis Features',icon:'📧',pts:['Sender domain verification','Brand spoofing detection','Subject urgency analysis','CAPS LOCK detection','Credential request detection','Phishing CTA detection','Link analysis in body','Free email provider check']},
        ].map(s=>(
          <div key={s.title} style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>{s.icon} {s.title}</div>
            {s.pts.map((p,i)=>(
              <div key={i} style={{fontSize:13,color:'var(--text-secondary)',padding:'5px 0',display:'flex',gap:8,borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <span style={{color:'#6366f1',flexShrink:0}}>→</span>{p}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22,marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>⚙️ Tech Stack</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {layer:'Frontend',tech:'React.js + Recharts',icon:'⚛️',color:'#61dafb'},
            {layer:'AI Engine',tech:'Custom JS Algorithm',icon:'🧠',color:'#f59e0b'},
            {layer:'Storage',tech:'Browser localStorage',icon:'💾',color:'#10b981'},
            {layer:'Backend',tech:'Node.js + Express',icon:'🟢',color:'#6366f1'},
            {layer:'ML Service',tech:'Python + FastAPI',icon:'🐍',color:'#3b82f6'},
            {layer:'Database',tech:'PostgreSQL + Redis',icon:'🗄️',color:'#8b5cf6'},
          ].map(t=>(
            <div key={t.layer} style={{background:'var(--bg-secondary)',borderRadius:8,padding:14,borderLeft:`3px solid ${t.color}`}}>
              <div style={{fontSize:18,marginBottom:6}}>{t.icon}</div>
              <div style={{fontWeight:700,fontSize:13}}>{t.layer}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>{t.tech}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:22}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>📊 Risk Score Guide</div>
        {[
          {level:'CRITICAL',range:'70–100',color:'#ef4444',desc:'Definitely phishing. DO NOT visit or provide any information.'},
          {level:'HIGH',    range:'50–69', color:'#f59e0b',desc:'Very suspicious. Avoid and verify via official channels only.'},
          {level:'MEDIUM',  range:'30–49', color:'#eab308',desc:'Some suspicious signs. Proceed with extreme caution.'},
          {level:'LOW',     range:'0–29',  color:'#10b981',desc:'Likely safe. No major red flags detected.'},
        ].map(r=>(
          <div key={r.level} style={{display:'flex',alignItems:'center',gap:14,padding:14,background:'var(--bg-secondary)',borderRadius:8,marginBottom:8}}>
            <span style={{background:`${r.color}20`,color:r.color,padding:'4px 14px',borderRadius:20,fontSize:12,fontWeight:700,minWidth:88,textAlign:'center'}}>{r.level}</span>
            <span style={{fontSize:14,fontWeight:700,color:r.color,minWidth:55}}>{r.range}</span>
            <span style={{fontSize:13,color:'var(--text-secondary)'}}>{r.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
