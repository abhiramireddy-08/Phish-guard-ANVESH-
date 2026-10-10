const KEY = 'phishguard_history';

export function saveToHistory(item) {
  const list = getHistory();
  const entry = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2,7),
    type: item.type,
    input: item.input,
    risk: item.risk,
    score: item.score,
    confidence: item.confidence || 0,
    indicators: item.indicators || [],
    time: new Date().toLocaleString(),
    ts: Date.now(),
  };
  const updated = [entry, ...list].slice(0, 300);
  try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch(e) {}
  return entry;
}

export function getHistory() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function deleteItem(id) {
  const updated = getHistory().filter(h => h.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getStats() {
  const h = getHistory();
  const total    = h.length;
  const threats  = h.filter(x => x.risk !== 'LOW').length;
  const safe     = h.filter(x => x.risk === 'LOW').length;
  const critical = h.filter(x => x.risk === 'CRITICAL').length;
  const high     = h.filter(x => x.risk === 'HIGH').length;
  const medium   = h.filter(x => x.risk === 'MEDIUM').length;
  const urls     = h.filter(x => x.type === 'URL').length;
  const emails   = h.filter(x => x.type === 'Email').length;
  const rate     = total ? Math.round(threats / total * 100) : 0;
  const avgScore = total ? Math.round(h.reduce((s,x) => s + x.score, 0) / total) : 0;
  return { total, threats, safe, critical, high, medium, urls, emails, rate, avgScore, history: h };
}
