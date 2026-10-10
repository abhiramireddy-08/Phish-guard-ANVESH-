import React, { useState } from 'react';


const TIPS = [
  {
    icon: '🔒',
    title: 'Always Check HTTPS',
    cat: 'URL',
    level: 'Basic',
    desc: 'Before opening a login page, look for the 🔒 lock icon in the address bar. If the URL only uses "http://", do not enter your credentials.',
    eg: '✅ https://paypal.com  ❌ http://paypal-secure.xyz'
  },
  {
    icon: '🔗',
    title: 'Identify Suspicious Domains',
    cat: 'URL',
    level: 'Basic',
    desc: 'Real companies generally do not use extensions like .xyz, .tk, .ml, .ga, and .cf for their main websites. Scammers often use cheap domains.',
    eg: '❌ paypal-verify.xyz  ✅ paypal.com'
  },
  {
    icon: '📧',
    title: 'Ignore Urgent Emails',
    cat: 'Email',
    level: 'Basic',
    desc: 'Urgent messages like "Account suspended in 24 hours!" may be phishing attempts. Scammers use threats to pressure you into acting quickly.',
    eg: '❌ "URGENT: Verify NOW or lose access!"'
  },
  {
    icon: '👤',
    title: 'Generic Greetings Are a Red Flag',
    cat: 'Email',
    level: 'Basic',
    desc: 'A greeting like "Dear Customer" can be suspicious, especially when combined with other warning signs. However, legitimate companies may also use generic greetings.',
    eg: '❌ "Dear Valued Customer"  ✅ "Dear Ravi Kumar"'
  },
  {
    icon: '🏦',
    title: 'Identify Brand Impersonation',
    cat: 'URL',
    level: 'Intermediate',
    desc: 'A domain like "paypal-secure.xyz" may use a brand name to mislead you. The actual domain is the part before the first slash after the protocol.',
    eg: '❌ paypal-secure.xyz/login  ✅ paypal.com/login'
  },
  {
    icon: '🔑',
    title: 'Never Share Your Password by Email',
    cat: 'Email',
    level: 'Basic',
    desc: 'Legitimate banks and payment services such as PayPal will not ask you to send your password or CVV by email. Treat such requests as highly suspicious.',
    eg: '❌ "Enter your password to verify"'
  },
  {
    icon: '📱',
    title: 'Use Two-Factor Authentication',
    cat: 'Protection',
    level: 'Intermediate',
    desc: 'Enabling 2FA adds another layer of security, even if someone learns your password. Consider using an authenticator app such as Google Authenticator.',
    eg: '✅ Enable 2FA for Google, PayPal, and your bank accounts'
  },
  {
    icon: '🕵️',
    title: 'Hover to See the Real URL',
    cat: 'URL',
    level: 'Intermediate',
    desc: 'Before clicking a link, hover over it to preview the destination URL. If the displayed destination looks suspicious or does not match the expected website, do not click it.',
    eg: 'Display: "Click here"  Real: http://phish.xyz'
  },
  {
    icon: '📎',
    title: 'Do Not Open Unknown Attachments',
    cat: 'Email',
    level: 'Intermediate',
    desc: 'Avoid opening unexpected .exe, .zip, and .docm files from unknown senders. They may contain malware or ransomware.',
    eg: '❌ Invoice.exe  ❌ Statement.zip from an unknown sender'
  },
  {
    icon: '🌐',
    title: 'Type the URL Directly',
    cat: 'URL',
    level: 'Basic',
    desc: 'Instead of clicking a link in an email, type the official website address directly into your browser.',
    eg: '✅ Type paypal.com in your browser  ❌ Click an unverified email link'
  },
  {
    icon: '📞',
    title: 'Verify Through a Phone Call',
    cat: 'Protection',
    level: 'Advanced',
    desc: 'If you receive a suspicious email, find the contact number on the company’s official website and call to verify the request.',
    eg: '✅ Call the number listed on the official PayPal website'
  },
  {
    icon: '🔄',
    title: 'Keep Software Updated',
    cat: 'Protection',
    level: 'Basic',
    desc: 'Keep your browser, operating system, and antivirus software updated. Security updates and browser protections can help detect or block phishing websites.',
    eg: '✅ Enable automatic updates for Chrome and Windows'
  },
];


const LC = {Basic:'#10b981',Intermediate:'#f59e0b',Advanced:'#ef4444'};

export default function Tips() {
  const [cat, setCat] = useState('All');
  const [lvl, setLvl] = useState('All');
  const [exp, setExp] = useState(null);

  const data = TIPS.filter(t=>(cat==='All'||t.cat===cat)&&(lvl==='All'||t.level===lvl));

  return (
    <div>
      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>💡 Safety Tips</h1>
        <p style={{color:'var(--text-secondary)',fontSize:14,marginTop:4}}>Phishing నుండి protect అవ్వడానికి complete guide</p>
      </div>

      {/* Summary */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {[{icon:'🔗',label:'URL Safety',cat:'URL',color:'#6366f1'},{icon:'📧',label:'Email Safety',cat:'Email',color:'#8b5cf6'},{icon:'🛡️',label:'Protection',cat:'Protection',color:'#10b981'}].map(x=>(
          <div key={x.label} onClick={()=>setCat(x.cat)}
            style={{background:'var(--bg-card)',border:`1px solid ${cat===x.cat?x.color:'var(--border)'}`,borderLeft:`3px solid ${x.color}`,borderRadius:12,padding:'16px 20px',cursor:'pointer',transition:'all .15s'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:22}}>{x.icon}</span>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{x.label}</div>
                <div style={{fontSize:12,color:'var(--text-muted)'}}>{TIPS.filter(t=>t.cat===x.cat).length} tips</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:16,marginBottom:20,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:6,fontWeight:600,textTransform:'uppercase'}}>Category</div>
          <div style={{display:'flex',gap:6}}>
            {['All','URL','Email','Protection'].map(c=>(
              <button key={c} onClick={()=>setCat(c)}
                style={{padding:'6px 14px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,
                  background:cat===c?'rgba(99,102,241,0.2)':'transparent',
                  borderColor:cat===c?'rgba(99,102,241,0.4)':'var(--border)',
                  color:cat===c?'#a5b4fc':'var(--text-muted)'}}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:6,fontWeight:600,textTransform:'uppercase'}}>Level</div>
          <div style={{display:'flex',gap:6}}>
            {['All','Basic','Intermediate','Advanced'].map(l=>(
              <button key={l} onClick={()=>setLvl(l)}
                style={{padding:'6px 14px',borderRadius:20,border:'1px solid',cursor:'pointer',fontSize:12,fontWeight:600,
                  background:lvl===l?'rgba(99,102,241,0.2)':'transparent',
                  borderColor:lvl===l?'rgba(99,102,241,0.4)':'var(--border)',
                  color:lvl===l?'#a5b4fc':'var(--text-muted)'}}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
        {data.map((t,i)=>(
          <div key={i} onClick={()=>setExp(exp===i?null:i)}
            style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderLeft:`3px solid #6366f1`,borderRadius:12,padding:18,cursor:'pointer',transition:'transform .15s',transform:exp===i?'none':'translateY(0)'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
              <span style={{fontSize:24,flexShrink:0}}>{t.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:5}}>{t.title}</div>
                <div style={{display:'flex',gap:6}}>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:4,background:'rgba(99,102,241,0.12)',color:'#a5b4fc'}}>{t.cat}</span>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:4,background:`${LC[t.level]}18`,color:LC[t.level]}}>{t.level}</span>
                </div>
              </div>
              <span style={{color:'var(--text-muted)',fontSize:11}}>{exp===i?'▲':'▼'}</span>
            </div>
            <p style={{color:'var(--text-secondary)',fontSize:13,lineHeight:1.6,margin:0}}>{t.desc}</p>
            {exp===i && (
              <div style={{marginTop:12,padding:10,background:'var(--bg-secondary)',borderRadius:6,fontSize:12,fontFamily:'monospace',color:'var(--text-muted)'}}>
                {t.eg}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
