const SUSP_TLDS = ['.xyz','.tk','.ml','.ga','.cf','.gq','.top','.click','.link','.win','.loan','.download','.stream','.zip','.review','.country','.kim','.cricket','.party','.science','.trade','.work'];
const BRANDS = ['paypal','apple','google','microsoft','amazon','facebook','netflix','instagram','twitter','bank','secure','verify','account','login','ebay','chase','wells','citibank','hsbc','binance','coinbase','dropbox','whatsapp'];
const URGENCY = ['urgent','immediately','action required','account suspended','verify now','limited time','expires','warning','alert','failure to','act now','final notice','last chance','24 hours','48 hours','will be deleted','will be terminated'];
const CREDS = ['password','username','ssn','social security','credit card','bank account','routing number','pin number','cvv','confirm your','enter your','provide your','account number','date of birth','mother maiden'];

export function analyzeURL(raw) {
  if (!raw || !raw.trim()) return null;
  let url = raw.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'http://' + url;

  let parsed;
  try { parsed = new URL(url); } catch { return { error: 'Invalid URL format' }; }

  const domain = parsed.hostname.toLowerCase();
  const path   = parsed.pathname.toLowerCase();
  const full   = url.toLowerCase();

  let score = 0;
  const inds = [];
  const add = (pts, msg) => { score += pts; inds.push(msg); };

  if (!url.startsWith('https'))                      add(20, '❌ No HTTPS — unencrypted connection');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain))       add(30, '❌ IP address used as domain');
  const tld = '.' + domain.split('.').pop();
  if (SUSP_TLDS.includes(tld))                       add(22, `❌ Suspicious domain extension: ${tld}`);
  const bd = BRANDS.find(b => domain.includes(b));
  if (bd) {
    const real = domain === `${bd}.com` || domain === `www.${bd}.com` || domain.endsWith(`.${bd}.com`);
    if (!real)                                       add(22, `❌ Brand "${bd}" impersonated in domain`);
  }
  const bp = BRANDS.find(b => path.includes(b) && !domain.includes(b));
  if (bp)                                            add(12, `⚠️ Brand "${bp}" in URL path only`);
  if (url.includes('@'))                             add(25, '❌ @ symbol in URL — hides real host');
  const hyph = (domain.match(/-/g)||[]).length;
  if (hyph > 3)                                      add(8,  `⚠️ Excessive hyphens in domain (${hyph})`);
  const subs = domain.split('.').length - 2;
  if (subs > 2)                                      add(12, `⚠️ Deep subdomain nesting (${subs} levels)`);
  if (url.length > 120)                              add(8,  `⚠️ Very long URL (${url.length} chars)`);
  if (full.replace('://','').includes('//'))         add(8,  '⚠️ Double slash — possible redirect');
  const digs = (domain.replace(/\./g,'').match(/\d/g)||[]).length;
  if (digs > 5)                                      add(7,  `⚠️ Many digits in domain (${digs})`);
  if (/\/(login|signin|verify|update|secure|confirm|password|account)/.test(path) && !url.startsWith('https'))
                                                     add(15, '❌ Sensitive path without HTTPS');
  const enc = (url.match(/%[0-9a-f]{2}/gi)||[]).length;
  if (enc > 5)                                       add(6,  `⚠️ Many encoded chars (${enc}) — hiding content`);

  score = Math.min(score, 100);
  const risk = score>=70?'CRITICAL': score>=50?'HIGH': score>=30?'MEDIUM':'LOW';
  return { is_phishing:score>=40, confidence:parseFloat((score/100).toFixed(2)), risk_score:score, risk_level:risk, indicators:inds, domain, tld, has_https:url.startsWith('https') };
}

export function analyzeEmail(sender='', subject='', body='') {
  let score = 0;
  const inds = [];
  const bL = body.toLowerCase();
  const sL = subject.toLowerCase();
  const domain = sender.includes('@') ? sender.split('@')[1]?.toLowerCase() : '';
  const add = (pts, msg) => { score += pts; inds.push(msg); };

  if (domain) {
    const tld = '.' + domain.split('.').pop();
    if (SUSP_TLDS.includes(tld))                     add(22, `❌ Suspicious sender extension: ${tld}`);
    const bd = BRANDS.find(b => domain.includes(b));
    if (bd && !['paypal.com','apple.com','google.com','microsoft.com','amazon.com','facebook.com'].includes(domain))
                                                     add(25, `❌ Brand "${bd}" spoofed in sender`);
    if (/\d{4,}/.test(domain))                       add(8,  '⚠️ Suspicious numbers in sender domain');
    if (domain.split('.').length > 4)                add(10, '⚠️ Overly complex sender domain');
    const free = ['gmail.com','yahoo.com','hotmail.com','outlook.com'];
    if (free.includes(domain) && BRANDS.find(b => sL.includes(b)))
                                                     add(18, '❌ Brand in subject but free email provider');
  }

  const urgS = URGENCY.filter(k => sL.includes(k)).length;
  if (urgS > 0)                                      add(14, `⚠️ Urgent language in subject (${urgS} triggers)`);
  if (/[A-Z]{6,}/.test(subject))                    add(6,  '⚠️ Excessive CAPS in subject');
  if ((subject.match(/!/g)||[]).length > 2)          add(5,  '⚠️ Multiple !!! in subject');
  if (/(free|prize|winner|lottery|congratulations|selected|lucky|reward)/i.test(subject))
                                                     add(16, '❌ Prize/reward bait in subject');
  if (/(suspended|locked|terminated|hacked|compromised|expired)/i.test(subject))
                                                     add(12, '⚠️ Account threat keyword in subject');

  const urgB = URGENCY.filter(k => bL.includes(k)).length;
  if (urgB >= 3)                                     add(16, `❌ High urgency in body (${urgB} phrases)`);
  else if (urgB > 0)                                 add(8,  `⚠️ Urgency language in body (${urgB})`);
  const credC = CREDS.filter(k => bL.includes(k)).length;
  if (credC >= 2)                                    add(24, `❌ Requesting sensitive info (${credC} keywords)`);
  else if (credC === 1)                              add(10, '⚠️ Credential keyword in body');
  if (/dear (valued )?customer/i.test(body))         add(10, '⚠️ Generic greeting — not personalized');
  if (/click (?:here|below|this link) to (?:verify|confirm|update|login)/i.test(body))
                                                     add(18, '❌ Classic phishing call-to-action');
  if (/your account.*(suspended|locked|terminated)/i.test(body))
                                                     add(18, '❌ Account threat phrase');
  if (/we.*(detected|noticed).*(unusual|suspicious)/i.test(body))
                                                     add(12, '⚠️ Fake security alert pattern');
  const links = (body.match(/https?:\/\/[^\s]+/g)||[]);
  const badL = links.filter(l => !l.startsWith('https'));
  if (badL.length > 0)                              add(10, `❌ ${badL.length} non-HTTPS link(s) in body`);
  if (links.length > 7)                             add(8,  `⚠️ Too many links (${links.length})`);

  score = Math.min(score, 100);
  const risk = score>=70?'CRITICAL': score>=50?'HIGH': score>=25?'MEDIUM':'LOW';
  return { is_phishing:score>=36, confidence:parseFloat((score/100).toFixed(2)), risk_score:score, risk_level:risk, indicators:inds, links_count:links.length };
}

export const DEMO_URLS = [
  { url:'http://paypal-secure-verify.xyz/login',       label:'🚨 Phishing' },
  { url:'http://192.168.1.1/bank/login',               label:'🚨 IP URL' },
  { url:'http://apple-id-locked.tk/verify',            label:'🚨 Fake Apple' },
  { url:'https://amazon-gift-winner.ml/claim',         label:'🚨 Prize Scam' },
  { url:'https://www.google.com',                      label:'✅ Safe' },
  { url:'https://github.com/microsoft/vscode',         label:'✅ Safe' },
];

export const DEMO_EMAIL = {
  sender: 'security-noreply@paypal-support.xyz',
  subject: 'URGENT!! Your PayPal Account Has Been SUSPENDED!!!',
  body: `Dear valued customer,

We detected unusual and suspicious activity on your PayPal account. Your account will be permanently suspended within 24 hours.

Click here to verify your account now: http://paypal-verify.xyz/confirm

Please provide your username, password, credit card number and CVV to restore access. Failure to respond will result in permanent termination.

PayPal Security Team`,
};
