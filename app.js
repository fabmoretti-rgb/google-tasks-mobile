'use strict';

/* =========================================================================
   Tasks GTD – app mobile (PWA) per Google Tasks
   Compatibile con l'estensione Firefox "Google Tasks a schermo intero":
   stessi elenchi GTD, @contesti nel titolo, riga "⏳ In attesa dal …" nelle note.
   ========================================================================= */

const APP_VERSION = '1.0.10';
const API = 'https://tasks.googleapis.com/tasks/v1';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const SCOPES = 'https://www.googleapis.com/auth/tasks openid email profile';
const enc = encodeURIComponent;

/* ---------- Icone (Material Icons, Apache 2.0) ---------- */
const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const ICONS = {
  back: svg('M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z'),
  add: svg('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'),
  today: svg('M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z'),
  lists: svg('M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z'),
  inbox: svg('M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5a2 2 0 0 0-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z'),
  search: svg('M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'),
  more: svg('M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'),
  moreVert: svg('M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'),
  refresh: svg('M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'),
  settings: svg('M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'),
  close: svg('M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'),
  delete: svg('M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'),
  event: svg('M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z'),
  mail: svg('M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z'),
  link: svg('M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z'),
  notes: svg('M3 10h11v2H3v-2zm0-2h11V6H3v2zm0 8h7v-2H3v2zm15.01-3.13.71-.71a.996.996 0 0 1 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71-2.12-2.12zm-.71.71-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z'),
  expand: svg('M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z'),
  chevron: svg('M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'),
  hourglass: svg('M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5-4-4V4h8v3.5l-4 4z'),
  folder: svg('M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z'),
  arrow: svg('M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z'),
  cloud: svg('M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'),
  cloudOff: svg('M19.35 10.04A7.49 7.49 0 0 0 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46A5.497 5.497 0 0 1 17.5 10.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 17.16 24 15.68 24 14c0-2.64-2.05-4.78-4.65-4.96zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z'),
  skip: svg('M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z'),
  at: svg('M12 1.95c-5.52 0-10 4.48-10 10s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57v-1.43c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57v-1.43c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z'),
  review: svg('M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zM10 10H5V8h5v2zm0 4H5v-2h5v2zm0 4H5v-2h5v2zm4.29-2.12-2.83-2.83 1.41-1.41 1.42 1.42L17.46 9l1.41 1.42z'),
  move: svg('M6.99 11 3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z'),
  person: svg('M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'),
  logout: svg('M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z'),
  info: svg('M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'),
  rename: svg('M18.41 5.8 17.2 4.59c-.78-.78-2.05-.78-2.83 0l-2.68 2.68L3 15.96V20h4.04l8.74-8.74 2.63-2.63c.79-.78.79-2.05 0-2.83zM6.21 18H5v-1.21l8.66-8.66 1.21 1.21L6.21 18zM11 20l4-4h6v4H11z'),
  sortDate: svg('M3 6h9v2H3zm0 5h7v2H3zm0 5h5v2H3zM17 4h2v12h3l-4 4-4-4h3z'),
  share: svg('M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z'),
  subtask: svg('M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z'),
  showDone: svg('M14 10H3v2h11v-2zm0-4H3v2h11V6zM3 16h7v-2H3v2zm18.59-4.42L16 17.17l-2.59-2.58L12 16l4 4 7-7-1.41-1.42z'),
  done: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  circle: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
};

/* ---------- Utilità ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
function el(tag, attrs, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v; // solo icone statiche
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'value' && (tag === 'input' || tag === 'textarea' || tag === 'select')) n.value = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  if (tag === 'button' && !n.hasAttribute('aria-label') && !n.textContent.trim() && n.title) n.setAttribute('aria-label', n.title);
  return n;
}
const icon = (name) => el('span', { class: 'ico', html: ICONS[name] });
const norm = (s) => (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
/* Ordine delle attività: confronto carattere per carattere; le nuove in cima hanno una posizione provvisoria "!…" */
const cmpPos = (a, b) => { const x = a.position || ''; const y = b.position || ''; return x < y ? -1 : x > y ? 1 : 0; };
const topPosition = () => `!${String(9e15 - Date.now()).padStart(16, '0')}`;
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const safeHref = (u) => (/^(https?:|mailto:)/i.test(String(u || '').trim()) ? String(u).trim() : null);
const URL_RE = /\bhttps?:\/\/[^\s<>"]+/gi;
function autosize(ta) { ta.style.height = 'auto'; ta.style.height = `${ta.scrollHeight + 2}px`; }

const LS = {
  get(k, d = null) { try { const v = localStorage.getItem(`gt.${k}`); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(`gt.${k}`, JSON.stringify(v)); } catch { /* spazio pieno o bloccato */ } },
  del(k) { try { localStorage.removeItem(`gt.${k}`); } catch { /* */ } },
};

/* ---------- Preferenze ---------- */
const DEFAULT_CONTEXTS = ['@telefono', '@ufficio', '@casa', '@computer', '@commissioni'];
const prefs = Object.assign({
  theme: 'auto', scale: 1, font: 'system', hiRead: false, niceCase: false, home: 'today',
  sort: 'manual', showCompleted: true, searchShowDone: false,
  roles: {}, waitDays: 7, contexts: DEFAULT_CONTEXTS, lastReview: null, reviewChecks: {}, recent: [],
}, LS.get('prefs', {}));
const savePrefs = () => LS.set('prefs', prefs);

function applyLook() {
  const r = document.documentElement;
  if (prefs.theme === 'auto') delete r.dataset.theme; else r.dataset.theme = prefs.theme;
  const font = prefs.hiRead && prefs.font === 'system' ? 'atkinson' : prefs.font;
  if (font === 'system') delete r.dataset.font; else r.dataset.font = font;
  if (prefs.hiRead) r.dataset.hiread = ''; else delete r.dataset.hiread;
  r.style.fontSize = `${112.5 * prefs.scale}%`;
}

/* =========================================================================
   Accesso a Google (OAuth con reindirizzamento: funziona anche nell'app installata)
   ========================================================================= */
class AuthNeeded extends Error {}
class Offline extends Error {}

const auth = {
  tok: LS.get('token'),
  profile: LS.get('profile'),
  valid() { return !!this.tok && Date.now() < this.tok.exp; },
  clientId() { return (window.GT_CONFIG?.clientId || LS.get('clientId') || '').trim(); },
  redirectUri() { const u = new URL('./', location.href); return u.origin + u.pathname; },

  begin({ silent = false, selectAccount = false, consent = false, hint = null } = {}) {
    const cid = this.clientId();
    if (!cid) { go({ v: 'setup' }, { replace: true }); return; }
    flushEdits();
    const state = uid();
    // cambiando account si riparte dalla schermata iniziale (gli elenchi sono diversi)
    const back = hint || selectAccount ? { v: prefs.home, tab: prefs.home } : route;
    sessionStorage.setItem('gt.oauth', JSON.stringify({ state, route: back, silent }));
    const p = new URLSearchParams({
      client_id: cid, redirect_uri: this.redirectUri(), response_type: 'token',
      scope: SCOPES, include_granted_scopes: 'true', state,
    });
    if (silent) p.set('prompt', 'none');
    else if (consent) p.set('prompt', 'consent select_account');
    else if (selectAccount || !this.profile) p.set('prompt', 'select_account');
    if (hint) p.set('login_hint', hint);
    else if (this.profile?.email && !selectAccount) p.set('login_hint', this.profile.email);
    location.assign(`${AUTH_URL}?${p}`);
  },

  /** Al ritorno da Google: legge il token dall'indirizzo e lo cancella dalla barra. */
  async handleRedirect() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (!h.has('access_token') && !h.has('error')) return null;
    const saved = JSON.parse(sessionStorage.getItem('gt.oauth') || 'null');
    sessionStorage.removeItem('gt.oauth');
    history.replaceState(null, '', location.pathname);
    if (!saved || h.get('state') !== saved.state) return { error: 'state' };
    if (h.get('error')) return { error: h.get('error'), silent: saved.silent, route: saved.route };
    this.tok = { value: h.get('access_token'), exp: Date.now() + (Number(h.get('expires_in')) || 3600) * 1000 - 60_000 };
    LS.set('token', this.tok);
    sessionStorage.removeItem('gt.silentFail');
    try {
      const r = await fetch(USERINFO_URL, { headers: { Authorization: `Bearer ${this.tok.value}` } });
      if (r.ok) {
        const u = await r.json();
        const changed = this.profile?.email && this.profile.email !== u.email;
        this.profile = { email: u.email, name: u.name, picture: u.picture };
        LS.set('profile', this.profile);
        rememberAccount(this.profile);
        if (changed) resetData(); // altro account: via i dati del precedente
      }
    } catch { /* il profilo è solo cosmetico */ }
    return { ok: true, route: saved.route };
  },

  logout() {
    const t = this.tok?.value;
    this.tok = null; this.profile = null;
    LS.del('token'); LS.del('profile');
    resetData();
    if (t) fetch(REVOKE_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: t }) }).catch(() => {});
  },
};

/* ---------- Account usati su questo telefono (per il cambio rapido) ---------- */
function knownAccounts() { return LS.get('accounts', []); }
function rememberAccount(p) {
  if (!p?.email) return;
  LS.set('accounts', [p, ...knownAccounts().filter((a) => a.email !== p.email)].slice(0, 6));
}
function forgetAccount(email) { LS.set('accounts', knownAccounts().filter((a) => a.email !== email)); }

function avatar(p, cls = 'avatar') {
  const letter = (p?.name || p?.email || '?').trim().charAt(0).toUpperCase();
  const box = el('span', { class: cls, 'aria-hidden': 'true' }, letter);
  if (p?.picture) {
    const img = el('img', { src: p.picture, alt: '', referrerpolicy: 'no-referrer' });
    img.addEventListener('error', () => img.remove());
    box.append(img);
  }
  return box;
}

/** Pannello account: tocca un account per passarci subito. */
async function openAccounts() {
  const cur = auth.profile;
  const others = knownAccounts().filter((a) => a.email !== cur?.email);
  const switchTo = async (fn) => {
    flushEdits();
    if (outbox.length) await flushOutbox();
    if (outbox.length) {
      toast('Ci sono modifiche non ancora inviate: riprova quando c’è rete, così non vanno perse.', { error: true });
      return;
    }
    fn();
  };
  sheet((s, close) => {
    const row = (p, { current = false, onclick } = {}) => el('button', {
      class: `acct${current ? ' current' : ''}`, onclick, 'aria-current': current ? 'true' : null,
      'aria-label': `${current ? 'Account in uso: ' : 'Passa a '}${p.email}`,
    }, avatar(p), el('span', { class: 'acct-txt' }, el('b', {}, p.name || p.email), p.name ? el('small', {}, p.email) : null),
    current ? el('span', { class: 'acct-check', html: ICONS.done }) : el('span', { class: 'task-go', html: ICONS.chevron }));
    s.append(el('h2', {}, 'Account'),
      cur ? row(cur, { current: true }) : el('p', { class: 'sub' }, 'Nessun account collegato.'),
      others.length ? el('p', { class: 'sub', style: 'margin:1rem 0 .25rem' }, 'Passa a:') : null,
      ...others.map((a) => row(a, { onclick: () => { close(); switchTo(() => auth.begin({ hint: a.email })); } })),
      el('div', { class: 'sheet-actions', style: 'margin-top:.75rem' },
        el('button', { onclick: () => { close(); switchTo(() => auth.begin({ selectAccount: true })); } }, icon('add'), el('span', {}, 'Aggiungi un altro account')),
        cur ? el('button', {
          class: 'danger',
          onclick: async () => {
            close();
            if (await confirmBox('Uscire?', `Esci da ${cur.email}. Le attività restano su Google; su questo telefono verranno tolte.`, 'Esci')) {
              forgetAccount(cur.email);
              auth.logout();
              go({ v: 'login' }, { replace: true });
            }
          },
        }, icon('logout'), el('span', {}, 'Esci da questo account')) : null));
  });
}

/** Serve un nuovo accesso: prova in silenzio (una volta), altrimenti chiede. */
function needAuth() {
  const failed = Number(sessionStorage.getItem('gt.silentFail') || 0);
  if (auth.profile && auth.clientId() && Date.now() - failed > 5 * 60_000) {
    auth.begin({ silent: true });
  } else {
    state.authBanner = true;
    render({ soft: true });
  }
}

/* =========================================================================
   API Google Tasks + coda delle modifiche (funziona anche offline)
   ========================================================================= */
const taskPath = (listId, taskId) => `/lists/${enc(listId)}/tasks${taskId ? `/${enc(taskId)}` : ''}`;

async function apiRaw(method, path, { query, body } = {}) {
  if (!auth.valid()) throw new AuthNeeded();
  let url = API + path;
  if (query) {
    const q = new URLSearchParams(Object.entries(query).filter(([, v]) => v != null && v !== ''));
    if (q.toString()) url += `?${q}`;
  }
  const headers = { Authorization: `Bearer ${auth.tok.value}` };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new Offline();
  }
  if (res.status === 401) { auth.tok = null; LS.del('token'); throw new AuthNeeded(); }
  if (!res.ok) {
    let msg = `${res.status}`;
    try { msg = (await res.json()).error?.message || msg; } catch { /* */ }
    const e = new Error(msg); e.status = res.status; throw e;
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function apiAll(path, query) {
  const items = [];
  let pageToken;
  do {
    const r = await apiRaw('GET', path, { query: { ...query, pageToken } });
    items.push(...(r?.items || []));
    pageToken = r?.nextPageToken;
  } while (pageToken);
  return items;
}

let outbox = LS.get('outbox', []);
let idMap = LS.get('idmap', {});
let flushing = false;
const saveOutbox = () => { LS.set('outbox', outbox); LS.set('idmap', idMap); };
const realId = (id) => (id && idMap[id]) || id;

let localSeq = 0; // cresce a ogni modifica fatta sul telefono
function enqueue(op) {
  localSeq++;
  outbox.push({ ...op, opId: uid() });
  saveOutbox();
  flushOutbox();
}

async function sendOp(op) {
  const L = realId(op.listId);
  const T = realId(op.taskId);
  switch (op.kind) {
    case 'create': return apiRaw('POST', taskPath(L), { query: { parent: realId(op.parent), previous: realId(op.previous) }, body: op.body });
    case 'patch': return apiRaw('PATCH', taskPath(L, T), { body: op.body });
    case 'delete': return apiRaw('DELETE', taskPath(L, T)).catch((e) => { if (e.status === 404) return null; throw e; });
    case 'move': return apiRaw('POST', `${taskPath(L, T)}/move`, { query: { destinationTasklist: realId(op.dest) } });
    case 'list-create': return apiRaw('POST', '/users/@me/lists', { body: { title: op.title } });
    case 'list-patch': return apiRaw('PATCH', `/users/@me/lists/${enc(L)}`, { body: op.body });
    case 'list-delete': return apiRaw('DELETE', `/users/@me/lists/${enc(L)}`).catch((e) => { if (e.status === 404) return null; throw e; });
    default: return null;
  }
}

function applyResult(op, res) {
  if (op.kind === 'create' && res) {
    idMap[op.tempId] = res.id;
    for (const arr of store.tasks.values()) {
      const t = arr.find((x) => x.id === op.tempId);
      // la posizione provvisoria resta finché l'elenco non viene riallineato (Google rinumera le altre)
      if (t) { t.id = res.id; if (op.parent) t.position = res.position; t.updated = res.updated; t.links = res.links; }
      if (!op.parent) scheduleSync(2500);
      arr.forEach((x) => { if (x.parent === op.tempId) x.parent = res.id; });
    }
    if (route.id === op.tempId) { route.id = res.id; history.replaceState(route, ''); }
  } else if (op.kind === 'patch' && res) {
    const later = outbox.slice(1).some((o) => realId(o.taskId) === res.id);
    if (!later && !pendingEdits.has(`${realId(op.listId)}|${res.id}`)) replaceLocal(realId(op.listId), res);
  } else if (op.kind === 'move') {
    scheduleSync(1500);
  } else if (op.kind === 'list-create' && res) {
    idMap[op.tempId] = res.id;
    const l = store.lists.find((x) => x.id === op.tempId);
    if (l) { l.id = res.id; store.tasks.set(res.id, store.tasks.get(op.tempId) || []); store.tasks.delete(op.tempId); }
    if (route.id === op.tempId) { route.id = res.id; history.replaceState(route, ''); }
  }
}

async function flushOutbox() {
  if (flushing || !outbox.length) return;
  if (!auth.valid()) { needAuth(); return; }
  flushing = true;
  setBusy();
  try {
    while (outbox.length) {
      const op = outbox[0];
      try {
        const res = await sendOp(op);
        applyResult(op, res);
      } catch (e) {
        if (e instanceof Offline) { setOffline(true); break; }
        if (e instanceof AuthNeeded) { needAuth(); break; }
        toast(e.status === 400 && op.kind === 'move'
          ? 'Google non consente di spostare questa attività (per esempio se è ricorrente).'
          : `Modifica non riuscita: ${e.message}`, { error: true });
        scheduleSync(500);
      }
      outbox.shift();
      saveOutbox();
    }
    if (!outbox.length) setOffline(false);
  } finally {
    flushing = false;
    setBusy();
    saveCache();
    render({ soft: true });
  }
}

/* =========================================================================
   Dati locali (con copia salvata sul telefono per l'avvio istantaneo)
   ========================================================================= */
const store = { lists: [], tasks: new Map(), lastSync: 0 };
const state = { offline: false, syncing: false, authBanner: false, updateReady: null, completedOpen: false };

function loadCache() {
  const c = LS.get('cache');
  if (!c) return;
  store.lists = c.lists || [];
  store.tasks = new Map(Object.entries(c.tasks || {}));
  store.lastSync = c.ts || 0;
}
let cacheTimer;
function saveCache() {
  clearTimeout(cacheTimer);
  cacheTimer = setTimeout(() => LS.set('cache', { lists: store.lists, tasks: Object.fromEntries(store.tasks), ts: store.lastSync }), 300);
}
function resetData() {
  store.lists = []; store.tasks = new Map(); store.lastSync = 0;
  outbox = []; idMap = {}; saveOutbox();
  LS.del('cache');
}

const findList = (id) => store.lists.find((l) => l.id === realId(id));
const tasksOf = (listId) => store.tasks.get(realId(listId)) || [];
const findTask = (listId, id) => tasksOf(listId).find((t) => t.id === realId(id) || t.id === id);
const childrenOf = (listId, pid) => tasksOf(listId).filter((t) => t.parent === pid);
const isDone = (t) => t.status === 'completed';
const activeTasks = (listId) => tasksOf(listId).filter((t) => !isDone(t));

function replaceLocal(listId, task) {
  const arr = store.tasks.get(listId);
  if (!arr) return;
  const i = arr.findIndex((t) => t.id === task.id);
  if (i >= 0) arr[i] = task; else arr.push(task);
}

function listName(l) {
  const t = l?.title || '';
  if (!(prefs.niceCase || prefs.hiRead) || !/\p{L}/u.test(t) || t !== t.toUpperCase()) return t;
  return t.charAt(0) + t.slice(1).toLowerCase();
}

/* ---------- Sincronizzazione ---------- */
async function syncAll() {
  if (state.syncing) return;
  if (!auth.valid()) { needAuth(); return; }
  if (outbox.length) await flushOutbox();
  if (outbox.length) return; // ancora modifiche in coda (offline): non sovrascrivere
  state.syncing = true;
  setBusy();
  const seq0 = localSeq;
  try {
    const lists = await apiAll('/users/@me/lists', { maxResults: 100 });
    const all = await Promise.all(lists.map((l) => apiAll(taskPath(l.id), { maxResults: 100, showCompleted: true, showHidden: true })));
    // se nel frattempo hai modificato qualcosa, questi dati sono già vecchi: li scarto e riprovo tra poco
    if (localSeq !== seq0 || outbox.length) { scheduleSync(2000); return; }
    store.lists = lists;
    store.tasks = new Map(lists.map((l, i) => [l.id, all[i].filter((t) => !t.deleted)]));
    // le modifiche che stai ancora scrivendo restano visibili
    for (const p of pendingEdits.values()) { const t = findTask(p.listId, p.taskId); if (t) Object.assign(t, p.patch); }
    store.lastSync = Date.now();
    state.authBanner = false;
    setOffline(false);
    saveCache();
  } catch (e) {
    if (e instanceof Offline) setOffline(true);
    else if (e instanceof AuthNeeded) needAuth();
    else if (e.status === 403) toast(/insufficient|scope/i.test(e.message)
      ? 'Permesso sulle attività non concesso: esci e rientra, spuntando la casella “attività”.'
      : `Accesso negato da Google: ${e.message}`, { error: true });
    else toast(`Aggiornamento non riuscito: ${e.message}`, { error: true });
  } finally {
    state.syncing = false;
    setBusy();
    render({ soft: true });
  }
}
let syncTimer;
function scheduleSync(ms) { clearTimeout(syncTimer); syncTimer = setTimeout(syncAll, ms); }

/* =========================================================================
   Modifiche (immediate sul telefono, poi inviate a Google)
   ========================================================================= */
const todayISO = (offset = 0) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T00:00:00.000Z`;
};

function addTask(listId, data, { parent } = {}) {
  listId = realId(listId);
  if (!parent && listId === roleId('waiting')) data = { ...data, notes: withWaitMarker(data.notes) };
  const tempId = `tmp-${uid()}`;
  const t = { id: tempId, status: 'needsAction', position: parent ? '~' : topPosition(), updated: new Date().toISOString(), ...data, parent: parent || undefined };
  if (!store.tasks.has(listId)) store.tasks.set(listId, []);
  store.tasks.get(listId).push(t);
  // le sottoattività vanno in fondo (dopo l'ultima), come nell'estensione
  const previous = parent ? childrenOf(listId, parent).filter((c) => !isDone(c) && c.id !== tempId).sort(cmpPos).pop()?.id : undefined;
  enqueue({ kind: 'create', listId, tempId, body: data, parent, previous });
  saveCache();
  render({ soft: true });
  return t;
}

function patchTask(listId, taskId, patch) {
  const t = findTask(listId, taskId);
  if (t) { Object.assign(t, patch); for (const k of Object.keys(patch)) if (patch[k] == null) delete t[k]; }
  enqueue({ kind: 'patch', listId, taskId, body: patch });
  saveCache();
}

/* Testo scritto nei dettagli: inviato 0,7 s dopo che smetti di scrivere */
const pendingEdits = new Map();
function editTask(listId, taskId, patch) {
  const key = `${realId(listId)}|${realId(taskId)}`;
  const p = pendingEdits.get(key) || { listId, taskId, patch: {} };
  Object.assign(p.patch, patch);
  clearTimeout(p.timer);
  p.timer = setTimeout(() => flushEdit(key), 700);
  pendingEdits.set(key, p);
  const t = findTask(listId, taskId);
  if (t) Object.assign(t, patch);
  saveCache();
}
function flushEdit(key) {
  const p = pendingEdits.get(key);
  if (!p) return;
  clearTimeout(p.timer);
  pendingEdits.delete(key);
  patchTask(p.listId, p.taskId, p.patch);
}
function flushEdits() { for (const k of [...pendingEdits.keys()]) flushEdit(k); }

function toggleDone(listId, taskId) {
  const t = findTask(listId, taskId);
  if (!t) return;
  const completing = !isDone(t);
  const targets = [t, ...(completing ? childrenOf(realId(listId), t.id).filter((c) => !isDone(c)) : [])];
  for (const x of targets) {
    patchTask(listId, x.id, completing ? { status: 'completed', completed: new Date().toISOString() } : { status: 'needsAction', completed: null });
  }
  navigator.vibrate?.(12);
  render({ soft: true });
  if (completing) {
    toast('Completata', {
      actionLabel: 'Annulla',
      action: () => { for (const x of targets) patchTask(listId, x.id, { status: 'needsAction', completed: null }); render({ soft: true }); },
    });
  }
}

function removeTask(listId, taskId) {
  const L = realId(listId);
  const t = findTask(L, taskId);
  if (!t) return;
  const backup = { title: t.title, notes: t.notes, due: t.due };
  store.tasks.set(L, tasksOf(L).filter((x) => x.id !== t.id && x.parent !== t.id));
  enqueue({ kind: 'delete', listId: L, taskId: t.id });
  saveCache();
  if (route.v === 'task' && realId(route.id) === t.id) back();
  render({ soft: true });
  toast('Eliminata', { actionLabel: 'Annulla', action: () => addTask(L, backup) });
}

function moveToList(fromId, taskId, toId) {
  fromId = realId(fromId); toId = realId(toId);
  if (fromId === toId) return;
  const t = findTask(fromId, taskId);
  if (!t) return;
  const moving = [t, ...childrenOf(fromId, t.id)];
  store.tasks.set(fromId, tasksOf(fromId).filter((x) => !moving.includes(x)));
  if (!store.tasks.has(toId)) store.tasks.set(toId, []);
  store.tasks.get(toId).push(...moving);
  enqueue({ kind: 'move', listId: fromId, taskId: t.id, dest: toId });
  if (toId === roleId('waiting') && !WAIT_RE.test(t.notes || '')) patchTask(toId, t.id, { notes: withWaitMarker(t.notes) });
  saveCache();
  if (route.v === 'task' && realId(route.id) === t.id) { route.list = toId; history.replaceState(route, ''); }
  render({ soft: true });
  toast(`Spostata in “${listName(findList(toId))}”`);
}

/* =========================================================================
   GTD
   ========================================================================= */
const GTD_ROLE_RE = {
  inbox: /inbox|in arrivo|raccolta/,
  next: /prossim|next action|azioni/,
  projects: /progett|project/,
  waiting: /attesa|waiting|delegat/,
  someday: /giorno|forse|someday|maybe/,
  reading: /da leggere|leggere|verific|rivedere|lettur|to read|review/,
};
const ROLE_LABELS = { inbox: 'INBOX (raccolta)', next: 'Prossime azioni', reading: 'Da leggere / verificare', projects: 'Progetti', waiting: 'In attesa', someday: 'Un giorno / forse' };
const CTX_RE = /(^|\s)(@[\p{L}\p{N}_-]+)/gu;
const WAIT_RE = /⏳ In attesa dal (\d{2})\/(\d{2})\/(\d{4})(?: — da: ([^\n]+))?/;
const WAIT_LINE_RE = /\n?⏳ In attesa dal \d{2}\/\d{2}\/\d{4}(?: — da: [^\n]+)?/;

function roleList(role) {
  if (!GTD_ROLE_RE[role]) return null;
  const saved = prefs.roles[role];
  if (saved && findList(saved)) return findList(saved);
  return store.lists.find((l) => GTD_ROLE_RE[role].test(norm(l.title))) || null;
}
const roleId = (role) => roleList(role)?.id || null;
function roleOf(listId) { return Object.keys(ROLE_LABELS).find((r) => roleId(r) === listId) || null; }

const parseDue = (due) => { const [y, m, d] = due.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const daysBetween = (a, b) => Math.round((b - a) / 86_400_000);
function dueLabel(due) {
  const d = parseDue(due);
  const diff = daysBetween(today0(), d);
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Domani';
  if (diff === -1) return 'Ieri';
  if (diff < 0 && diff > -31) return `${-diff} giorni fa`;
  if (diff > 1 && diff < 7) return cap(d.toLocaleDateString('it-IT', { weekday: 'long' }));
  const o = { weekday: 'short', day: 'numeric', month: 'short' };
  if (d.getFullYear() !== today0().getFullYear()) o.year = 'numeric';
  return d.toLocaleDateString('it-IT', o);
}
const fullDate = (due) => parseDue(due).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function dueBuckets() {
  const t0 = today0();
  const b = { overdue: [], today: [], week: [] };
  for (const l of store.lists) {
    for (const t of activeTasks(l.id)) {
      if (!t.due) continue;
      const diff = daysBetween(t0, parseDue(t.due));
      const row = { t, listId: l.id };
      if (diff < 0) b.overdue.push(row); else if (diff === 0) b.today.push(row); else if (diff <= 7) b.week.push(row);
    }
  }
  Object.values(b).forEach((a) => a.sort((x, y) => x.t.due.localeCompare(y.t.due)));
  return b;
}

const taskContexts = (t) => [...(t.title || '').matchAll(CTX_RE)].map((m) => m[2].toLowerCase());
function contextCounts() {
  const c = new Map();
  for (const l of store.lists) for (const t of activeTasks(l.id)) for (const x of new Set(taskContexts(t))) c.set(x, (c.get(x) || 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
function decorateTitle(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(CTX_RE)) {
    const s = m.index + m[1].length;
    out.push(text.slice(last, s), el('span', { class: 'ctx' }, m[2]));
    last = s + m[2].length;
  }
  out.push(text.slice(last));
  return out;
}
function highlight(text, q) {
  const words = q.split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return text;
  return text.split(new RegExp(`(${words.join('|')})`, 'gi')).map((p, i) => (i % 2 ? el('mark', {}, p) : p));
}

const todayIt = () => new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
function withWaitMarker(notes, who) {
  if (WAIT_RE.test(notes || '')) return notes;
  const mark = `⏳ In attesa dal ${todayIt()}${who ? ` — da: ${who}` : ''}`;
  return notes ? `${notes.replace(/\s+$/, '')}\n${mark}` : mark;
}
function waitingInfo(t) {
  const m = (t.notes || '').match(WAIT_RE);
  const since = m ? new Date(+m[3], +m[2] - 1, +m[1]) : (t.updated ? new Date(t.updated) : null);
  if (!since) return null;
  const days = Math.max(0, daysBetween(since, new Date()));
  return { days, who: m?.[4]?.trim() || '', late: days >= prefs.waitDays };
}
const isDelegated = (t, listId) => !isDone(t) && (WAIT_RE.test(t.notes || '') || (listId === roleId('waiting') && !t.parent));
function delegatedRows() {
  const rows = [];
  for (const l of store.lists) for (const t of activeTasks(l.id)) if (isDelegated(t, l.id)) rows.push({ t, listId: l.id });
  return rows.sort((a, b) => (waitingInfo(b.t)?.days || 0) - (waitingInfo(a.t)?.days || 0));
}
function waitingChip(t, listId) {
  if (!isDelegated(t, listId)) return null;
  const w = waitingInfo(t);
  if (!w) return null;
  const when = w.days === 0 ? 'da oggi' : w.days === 1 ? 'da 1 giorno' : `da ${w.days} giorni`;
  return el('span', { class: `chip waiting${w.late ? ' late' : ''}` }, icon('hourglass'), `${when}${w.who ? ` · ${w.who}` : ''}`);
}

function projectsWithoutNext() {
  const pid = roleId('projects');
  if (!pid) return [];
  const pool = [roleId('next'), roleId('waiting')].filter(Boolean).flatMap((id) => activeTasks(id).map((t) => norm(`${t.title || ''} ${t.notes || ''}`)));
  return activeTasks(pid).filter((p) => {
    if (p.parent || childrenOf(pid, p.id).some((c) => !isDone(c))) return false;
    const name = norm(p.title).trim();
    return !(name && pool.some((x) => x.includes(name)));
  }).map((t) => ({ t, listId: pid }));
}

function orderActive(tasks) {
  const live = tasks.filter((t) => !isDone(t));
  const ids = new Set(live.map((t) => t.id));
  const byPos = cmpPos;
  const byDue = (a, b) => (a.due || '￿').localeCompare(b.due || '￿') || byPos(a, b);
  const cmp = prefs.sort === 'due' ? byDue : byPos;
  const kids = new Map();
  const roots = [];
  for (const t of live) {
    if (t.parent && ids.has(t.parent)) { if (!kids.has(t.parent)) kids.set(t.parent, []); kids.get(t.parent).push(t); } else roots.push(t);
  }
  const out = [];
  for (const r of roots.sort(cmp)) { out.push({ t: r, depth: 0 }); for (const k of (kids.get(r.id) || []).sort(cmp)) out.push({ t: k, depth: 1 }); }
  return out;
}

function weekKey(d = new Date()) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const y = x.getUTCFullYear();
  return `${y}-W${String(Math.ceil(((x - Date.UTC(y, 0, 1)) / 86_400_000 + 1) / 7)).padStart(2, '0')}`;
}

/* =========================================================================
   Navigazione (il tasto Indietro di Android funziona dentro l'app)
   ========================================================================= */
const TABS = {
  today: { label: 'Oggi', icon: 'today' },
  lists: { label: 'Elenchi', icon: 'lists' },
  inbox: { label: 'INBOX', icon: 'inbox' },
  search: { label: 'Cerca', icon: 'search' },
  more: { label: 'Altro', icon: 'more' },
};
let route = { v: 'today', tab: 'today' };
let pushes = 0;

function go(r, { replace = false } = {}) {
  flushEdits();
  if (route.v === 'search' && searchQ) rememberSearch(searchQ); // aprire un risultato = ricerca da ricordare
  r = { tab: TABS[r.v] ? r.v : route.tab, ...r };
  if (replace) history.replaceState(r, ''); else { history.pushState(r, ''); pushes++; }
  route = r;
  render({ top: true });
}
function tab(name) { go({ v: name, tab: name }, { replace: true }); }
function back() {
  flushEdits();
  if (pushes > 0) history.back();
  else tab(route.tab || prefs.home);
}
window.addEventListener('popstate', (e) => {
  flushEdits();
  pushes = Math.max(0, pushes - 1);
  route = e.state || { v: prefs.home, tab: prefs.home };
  render({ top: true });
});

/* =========================================================================
   Disegno dell'interfaccia
   ========================================================================= */
const collapsed = new Set(); // gruppi richiusi (per questa sessione)

function setBusy() {
  const b = $('#refreshBtn');
  if (b) b.classList.toggle('spin', state.syncing || flushing);
}
function setOffline(v) {
  if (state.offline === v) return;
  state.offline = v;
  renderBanners();
}

let toastTimer;
function toast(msg, { error = false, actionLabel, action } = {}) {
  const t = $('#toast');
  t.className = `toast${error ? ' error' : ''}`;
  t.replaceChildren(...[el('span', {}, msg), actionLabel ? el('button', { onclick: () => { t.hidden = true; action(); } }, actionLabel) : null].filter(Boolean));
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, actionLabel ? 6000 : 3500);
}

function renderBanners() {
  const box = $('#banners');
  const parts = [];
  if (state.offline) {
    parts.push(el('div', { class: 'banner', role: 'status' }, icon('cloudOff'),
      el('span', {}, outbox.length ? `Senza rete: ${outbox.length === 1 ? '1 modifica verrà inviata' : `${outbox.length} modifiche verranno inviate`} appena torna la connessione.` : 'Senza rete: vedi le ultime attività salvate.')));
  }
  if (state.authBanner && auth.clientId()) {
    parts.push(el('div', { class: 'banner info' }, icon('person'), el('span', {}, 'Accedi di nuovo per sincronizzare.'),
      el('button', { class: 'btn primary', onclick: () => auth.begin() }, 'Accedi')));
  }
  if (state.updateReady) {
    parts.push(el('div', { class: 'banner info' }, icon('refresh'), el('span', {}, 'È disponibile una nuova versione.'),
      el('button', { class: 'btn primary', onclick: () => state.updateReady.postMessage('skipWaiting') }, 'Aggiorna')));
  }
  box.replaceChildren(...parts);
}

function renderNav() {
  const inboxN = roleId('inbox') ? activeTasks(roleId('inbox')).filter((t) => !t.parent).length : 0;
  const b = dueBuckets();
  const todayN = b.overdue.length + b.today.length;
  for (const btn of document.querySelectorAll('#nav button')) {
    const name = btn.dataset.tab;
    const n = name === 'inbox' ? inboxN : name === 'today' ? todayN : 0;
    const badgeCls = name === 'today' && b.overdue.length ? 'badge' : 'badge blue';
    btn.replaceChildren(...[el('span', { class: 'pill-ico', html: ICONS[TABS[name].icon] }), TABS[name].label,
      n ? el('span', { class: badgeCls, 'aria-hidden': 'true' }, n > 99 ? '99+' : n) : null].filter(Boolean));
    btn.setAttribute('aria-label', `${TABS[name].label}${n ? `, ${n}` : ''}`);
    if (route.tab === name) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  }
  if ('setAppBadge' in navigator) { if (todayN) navigator.setAppBadge(todayN).catch(() => {}); else navigator.clearAppBadge?.().catch(() => {}); }
}

const VIEW = {
  today: { title: () => 'Oggi', render: viewToday, fab: true },
  lists: { title: () => 'Elenchi', render: viewLists, fab: true },
  list: { title: () => listName(findList(route.id)) || 'Elenco', render: viewList, fab: true, menu: openListMenu },
  task: { title: () => 'Attività', render: viewTask, menu: () => openTaskActions(route.list, route.id, { fromDetail: true }) },
  inbox: { title: () => 'Elabora INBOX', render: viewProcess },
  search: { title: () => 'Cerca', render: viewSearch },
  more: { title: () => 'Altro', render: viewMore },
  review: { title: () => 'Revisione settimanale', render: viewReview },
  contexts: { title: () => 'Contesti', render: viewContexts, fab: true },
  context: { title: () => route.ctx === '__none__' ? 'Senza contesto' : route.ctx, render: viewContext, fab: true },
  delegated: { title: () => 'Deleghe in corso', render: viewDelegated },
  settings: { title: () => 'Impostazioni', render: viewSettings },
  help: { title: () => 'Guida rapida', render: viewHelp },
  setup: { title: () => 'Configurazione', render: viewSetup, gate: true },
  login: { title: () => 'Accesso', render: viewLogin, gate: true },
};

function render({ soft = false, top = false } = {}) {
  const v = VIEW[route.v] ? route : { v: 'today', tab: 'today' };
  const def = VIEW[v.v];
  const main = $('#main');
  const isRoot = !!TABS[v.v];

  // Barra superiore
  $('#title').textContent = def.title();
  $('#backBtn').hidden = isRoot || def.gate;
  $('#logo').hidden = !isRoot && !def.gate;
  const actions = [];
  if (!def.gate && auth.clientId()) {
    actions.push(el('button', { id: 'refreshBtn', class: `bar-btn${state.syncing || flushing ? ' spin' : ''}`, title: 'Aggiorna', html: ICONS.refresh, onclick: () => syncAll() }));
  }
  if (def.menu) actions.push(el('button', { class: 'bar-btn', title: 'Altre azioni', html: ICONS.moreVert, onclick: def.menu }));
  if (!def.gate && auth.clientId()) {
    actions.push(el('button', {
      class: 'bar-btn acct-btn', onclick: openAccounts,
      'aria-label': auth.profile ? `Account: ${auth.profile.email}. Tocca per cambiare account` : 'Account: accedi',
    }, auth.profile ? avatar(auth.profile) : el('span', { class: 'ico', html: ICONS.person })));
  }
  $('#barActions').replaceChildren(...actions);

  // Navigazione e "+"
  $('#nav').hidden = !!def.gate;
  if (!def.gate) renderNav();
  const fab = $('#fab');
  fab.hidden = !def.fab || !!def.gate;
  renderBanners();

  // Contenuto: non ridisegnare mentre stai scrivendo
  const typing = main.contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if (soft && typing && (v.v === 'task' || v.v === 'inbox' || v.v === 'settings' || v.v === 'search' || v.v === 'setup')) return;
  if (soft && v.v === 'inbox' && procDirty) return;
  const scroll = main.scrollTop;
  const page = el('div', { class: 'page' });
  def.render(page);
  main.replaceChildren(page);
  main.scrollTop = top ? 0 : scroll;
}

/* ---------- Riga attività (con gesti) ---------- */
/* Sequenza delle attività visibili quando ne apri una: nel dettaglio si scorre alla precedente/successiva */
let navSeq = [];
function openFromRow(listId, id) {
  const rows = [...document.querySelectorAll('#main .task[data-id]')];
  navSeq = rows.map((n) => ({ list: n.dataset.list, id: n.dataset.id }));
  go({ v: 'task', list: listId, id });
}
function navNeighbors(listId, id) {
  const lid = realId(listId); const tid = realId(id);
  let seq = navSeq.filter((x) => findTask(x.list, x.id));
  let i = seq.findIndex((x) => realId(x.list) === lid && realId(x.id) === tid);
  if (i < 0) { // aperta da un link: uso l'ordine dell'elenco
    const t = findTask(lid, tid);
    seq = t && isDone(t)
      ? tasksOf(lid).filter(isDone).sort((a, b) => (b.completed || '').localeCompare(a.completed || '')).map((x) => ({ list: lid, id: x.id }))
      : orderActive(tasksOf(lid)).map(({ t: x }) => ({ list: lid, id: x.id }));
    i = seq.findIndex((x) => x.id === tid);
  }
  return { seq, i, prev: i > 0 ? seq[i - 1] : null, next: i >= 0 && i < seq.length - 1 ? seq[i + 1] : null };
}
function goNeighbor(dir) {
  const nb = navNeighbors(route.list, route.id);
  const to = dir > 0 ? nb.next : nb.prev;
  if (!to) { toast(dir > 0 ? 'È l’ultima attività' : 'È la prima attività'); return; }
  go({ v: 'task', list: to.list, id: to.id, slide: dir }, { replace: true });
}

function taskRow(t, listId, { depth = 0, showList = false, q = '', snippet = null, subTag = false } = {}) {
  if (t.__ctx) return parentContextRow(t.__ctx, listId);
  const done = isDone(t);
  const meta = [];
  if (subTag) meta.push(el('span', { class: 'chip sub-chip' }, icon('subtask'), 'Sottoattività'));
  if (t.due) {
    const overdue = !done && parseDue(t.due) < today0();
    meta.push(el('span', { class: `chip due${overdue ? ' overdue' : ''}` }, icon('event'), dueLabel(t.due)));
  }
  const w = waitingChip(t, listId);
  if (w) meta.push(w);
  for (const l of t.links || []) {
    meta.push(el('span', { class: 'chip link' }, icon(l.type === 'email' ? 'mail' : 'link'), l.description || 'Collegamento'));
  }
  if (showList) meta.push(el('span', { class: 'chip list' }, listName(findList(listId))));
  const title = t.title || '(senza titolo)';
  const spoken = [title, done ? 'completata' : null, t.due ? `scadenza ${dueLabel(t.due)}` : null, showList ? `elenco ${listName(findList(listId))}` : null].filter(Boolean).join(', ');

  const node = el('div', {
    class: `task${done ? ' done' : ''}${depth ? ' sub' : ''}`,
    dataset: { id: t.id, list: realId(listId) },
    role: 'button', tabindex: 0, 'aria-label': `${spoken}. Tocca per aprire.`,
    onclick: () => openFromRow(listId, t.id),
    onkeydown: (e) => { if (e.key === 'Enter') openFromRow(listId, t.id); },
  },
  el('button', {
    class: 'check', 'aria-label': `${done ? 'Riapri' : 'Completa'}: ${title}`, html: done ? ICONS.done : ICONS.circle,
    onclick: (e) => { e.stopPropagation(); toggleDone(listId, t.id); },
  }),
  el('div', { class: 'task-main' },
    el('div', { class: 'task-title' }, q ? highlight(title, q) : decorateTitle(title),
      t.notes && !WAIT_RE.test(t.notes) ? el('span', { class: 'notes-mark', html: ICONS.notes, title: 'Ha delle note' }) : null),
    meta.length ? el('div', { class: 'meta' }, meta) : null,
    snippet ? el('div', { class: 'meta' }, highlight(snippet, q)) : null),
  el('span', { class: 'task-go', html: ICONS.chevron, 'aria-hidden': 'true' }));

  const row = el('li', { class: 'trow' },
    el('div', { class: 'swipe-bg', 'aria-hidden': 'true' },
      el('span', { class: 'l' }, icon('done'), done ? 'Riapri' : 'Fatto'),
      el('span', { class: 'r' }, 'Azioni', icon('more'))),
    node);
  attachGestures(row, node, {
    right: () => toggleDone(listId, t.id),
    left: () => openTaskActions(listId, t.id),
    long: () => openTaskActions(listId, t.id),
  });
  return row;
}

/** Ricerca: attività principale che non contiene le parole cercate, mostrata sopra le sue sottoattività trovate */
function parentContextRow(t, listId) {
  return el('li', { class: 'trow' }, el('div', {
    class: `task search-parent${isDone(t) ? ' done' : ''}`, role: 'button', tabindex: 0,
    'aria-label': `${t.title || '(senza titolo)'}, attività di riferimento. Tocca per aprire.`,
    dataset: { id: t.id, list: realId(listId) },
    onclick: () => openFromRow(listId, t.id),
  },
  el('span', { class: 'check', html: isDone(t) ? ICONS.done : ICONS.circle, 'aria-hidden': 'true' }),
  el('div', { class: 'task-main' },
    el('div', { class: 'task-title' }, decorateTitle(t.title || '(senza titolo)')),
    el('div', { class: 'meta' }, el('span', { class: 'chip parent-chip' }, 'Attività di riferimento'))),
  el('span', { class: 'task-go', html: ICONS.chevron, 'aria-hidden': 'true' })));
}

/** Scorrimento orizzontale deciso (non un tocco, non uno scroll verticale) → attività vicina.
 *  Eventi "touch": il browser li consegna fino alla fine anche se nel frattempo scorre la pagina
 *  o il dito parte sopra un campo di testo (con i "pointer" il gesto veniva annullato). */
function attachPagerSwipe(area) {
  let sx = 0; let sy = 0; let st = 0; let on = false; let horiz = null;
  const reset = () => { area.style.transition = 'transform .15s'; area.style.transform = ''; };
  area.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || e.target.closest('select, input[type="date"]')) { on = false; return; }
    const p = e.touches[0];
    on = true; horiz = null; sx = p.clientX; sy = p.clientY; st = Date.now();
    area.style.transition = '';
  }, { passive: true });
  area.addEventListener('touchmove', (e) => {
    if (!on) return;
    if (e.touches.length !== 1) { on = false; reset(); return; }
    const p = e.touches[0];
    const dx = p.clientX - sx; const dy = p.clientY - sy;
    if (horiz === null && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) horiz = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (horiz) area.style.transform = `translateX(${dx * 0.35}px)`; // il contenuto segue il dito
  }, { passive: true });
  area.addEventListener('touchcancel', () => { on = false; reset(); }, { passive: true });
  area.addEventListener('touchend', (e) => {
    if (!on) return;
    on = false;
    reset();
    const p = e.changedTouches[0];
    const dx = p.clientX - sx; const dy = p.clientY - sy;
    if (!horiz || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.7 || Date.now() - st > 900) return;
    goNeighbor(dx < 0 ? 1 : -1);
  }, { passive: true });
}

function attachGestures(row, node, { right, left, long }) {
  let sx = 0; let sy = 0; let dx = 0; let pid = null;
  let active = false; let decided = false; let horiz = false; let longTimer;
  const suppressClick = () => { node.dataset.suppress = '1'; setTimeout(() => delete node.dataset.suppress, 400); };
  const reset = () => {
    node.classList.remove('dragging');
    node.style.transform = '';
    setTimeout(() => row.classList.remove('sw-right', 'sw-left'), 180);
  };
  const fingers = new Set();
  const cancel = () => { clearTimeout(longTimer); if (active && horiz) reset(); active = false; };
  node.addEventListener('pointerdown', (e) => {
    fingers.add(e.pointerId);
    if (fingers.size > 1) { cancel(); return; } // due dita = zoom, non scorrimento
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('.check')) return;
    sx = e.clientX; sy = e.clientY; dx = 0; pid = e.pointerId;
    active = true; decided = false; horiz = false;
    longTimer = setTimeout(() => {
      if (active && !decided) { active = false; navigator.vibrate?.(20); suppressClick(); long(); }
    }, 550);
  });
  node.addEventListener('pointermove', (e) => {
    if (!active || e.pointerId !== pid) return;
    const mx = e.clientX - sx; const my = e.clientY - sy;
    if (!decided && (Math.abs(mx) > 10 || Math.abs(my) > 10)) {
      decided = true;
      clearTimeout(longTimer);
      horiz = Math.abs(mx) > Math.abs(my) * 1.3;
      if (horiz) { node.setPointerCapture?.(pid); node.classList.add('dragging'); } else { active = false; return; }
    }
    if (horiz) {
      dx = mx;
      node.style.transform = `translateX(${dx}px)`;
      row.classList.toggle('sw-right', dx > 0);
      row.classList.toggle('sw-left', dx < 0);
    }
  });
  const end = () => {
    clearTimeout(longTimer);
    if (!active) return;
    active = false;
    if (!horiz) return;
    const fire = Math.abs(dx) > Math.min(130, row.offsetWidth * 0.3);
    suppressClick();
    reset();
    if (fire) (dx > 0 ? right : left)();
  };
  node.addEventListener('pointerup', (e) => { fingers.delete(e.pointerId); end(); });
  node.addEventListener('pointercancel', (e) => { fingers.delete(e.pointerId); cancel(); });
  node.addEventListener('contextmenu', (e) => e.preventDefault());
  node.addEventListener('click', (e) => { if (node.dataset.suppress) { e.stopPropagation(); e.preventDefault(); } }, true);
}

function group(key, label, rows, { cls = '', opts = {} } = {}) {
  const closed = collapsed.has(key);
  return [
    el('button', {
      class: `group-head ${cls}${closed ? ' closed' : ''}`, 'aria-expanded': String(!closed),
      onclick: () => { if (closed) collapsed.delete(key); else collapsed.add(key); render(); },
    }, icon('expand'), el('span', { class: 'gname' }, label), el('span', { class: 'gcount' }, rows.length)),
    closed ? null : el('ul', { class: `tasks${opts.q ? ' search-results' : ''}` }, rows.map((r) => taskRow(r.ctx ? { __ctx: r.t } : r.t, r.listId, { depth: r.depth, snippet: r.snippet, subTag: !!r.depth && !!opts.q, ...opts }))),
  ];
}

/* ---------- Oggi ---------- */
function viewToday(p) {
  if (!store.lists.length) { p.append(loadingOrEmpty()); return; }
  const b = dueBuckets();
  const inboxN = roleId('inbox') ? activeTasks(roleId('inbox')).filter((t) => !t.parent).length : 0;
  const late = delegatedRows().filter(({ t }) => waitingInfo(t)?.late).length;
  const ago = prefs.lastReview ? daysBetween(new Date(prefs.lastReview), new Date()) : null;
  const date = cap(new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }));

  p.append(el('p', { class: 'sub', style: 'margin-top:1rem' }, date));
  p.append(el('div', { class: 'cards' },
    el('button', { class: `card${b.overdue.length ? ' red' : ''}`, onclick: () => document.getElementById('g-overdue')?.scrollIntoView({ behavior: 'smooth' }) },
      el('span', { class: 'n' }, b.overdue.length), el('span', { class: 'l' }, b.overdue.length === 1 ? 'scaduta' : 'scadute')),
    el('button', { class: 'card blue', onclick: () => document.getElementById('g-today')?.scrollIntoView({ behavior: 'smooth' }) },
      el('span', { class: 'n' }, b.today.length), el('span', { class: 'l' }, 'in scadenza oggi')),
    el('button', { class: 'card blue', onclick: () => tab('inbox') }, el('span', { class: 'n' }, inboxN), el('span', { class: 'l' }, 'in INBOX da elaborare')),
    el('button', { class: `card${late ? ' amber' : ' green'}`, onclick: () => go({ v: 'delegated' }) }, el('span', { class: 'n' }, late), el('span', { class: 'l' }, 'deleghe da sollecitare'))));
  if (ago == null || ago > 7) {
    p.append(el('div', { class: 'banner info', style: 'margin:.5rem 0' }, icon('review'),
      el('span', {}, ago == null ? 'Revisione settimanale mai fatta.' : `Ultima revisione ${ago} giorni fa.`),
      el('button', { class: 'btn primary', onclick: () => go({ v: 'review' }) }, 'Inizia')));
  }
  if (b.overdue.length) p.append(el('span', { id: 'g-overdue' }), ...group('today-overdue', 'Scadute', b.overdue, { cls: 'danger', opts: { showList: true } }));
  p.append(el('span', { id: 'g-today' }), ...group('today-today', 'Oggi', b.today, { opts: { showList: true } }));
  if (b.week.length) p.append(...group('today-week', 'Prossimi 7 giorni', b.week, { opts: { showList: true } }));
  if (!b.overdue.length && !b.today.length && !b.week.length) p.append(el('div', { class: 'empty' }, icon('today'), el('p', {}, 'Nessuna scadenza: giornata libera.')));
}

function loadingOrEmpty() {
  if (!auth.valid() && !store.lists.length) return el('div', { class: 'empty' }, el('p', {}, 'Accedi per vedere le tue attività.'), el('button', { class: 'btn primary', onclick: () => auth.begin() }, 'Accedi con Google'));
  return el('div', { class: 'empty' }, el('p', {}, state.offline ? 'Nessun dato salvato: collegati a internet.' : 'Caricamento…'));
}

/* ---------- Elenchi ---------- */
function viewLists(p) {
  if (!store.lists.length) { p.append(loadingOrEmpty()); return; }
  const t0 = today0();
  p.append(el('div', { class: 'listcards' }, store.lists.map((l) => {
    const act = activeTasks(l.id);
    const overdue = act.some((t) => t.due && parseDue(t.due) < t0);
    const role = roleOf(l.id);
    return el('button', { class: 'listcard', onclick: () => go({ v: 'list', id: l.id }) },
      el('span', { class: 'lname' }, listName(l), role ? el('span', { class: 'lrole' }, `GTD · ${ROLE_LABELS[role]}`) : null),
      el('span', { class: `count${overdue ? ' red' : ''}` }, act.length),
      el('span', { class: 'task-go', html: ICONS.chevron, 'aria-hidden': 'true' }));
  })));
  p.append(el('button', { class: 'btn block', onclick: newList }, icon('add'), 'Nuovo elenco'));
}

/* ---------- Un elenco ---------- */
function viewList(p) {
  const list = findList(route.id);
  if (!list) { p.append(loadingOrEmpty()); return; }
  const tasks = tasksOf(list.id);
  const active = orderActive(tasks);
  const done = tasks.filter(isDone).sort((a, b) => (b.completed || '').localeCompare(a.completed || ''));
  const role = roleOf(list.id);
  if (role) p.append(el('p', { class: 'sub', style: 'margin-top:1rem' }, `Ruolo GTD: ${ROLE_LABELS[role]}${prefs.sort === 'due' ? ' · ordinate per scadenza' : ''}`));
  if (!active.length) p.append(el('div', { class: 'empty' }, icon('done'), el('p', {}, 'Nessuna attività da fare.')));
  p.append(el('ul', { class: 'tasks' }, active.map(({ t, depth }) => taskRow(t, list.id, { depth }))));
  if (prefs.showCompleted && done.length) {
    p.append(el('button', {
      class: `completed-toggle${state.completedOpen ? '' : ' closed'}`, 'aria-expanded': String(state.completedOpen),
      onclick: () => { state.completedOpen = !state.completedOpen; render(); },
    }, icon('expand'), `Completate (${done.length})`));
    if (state.completedOpen) p.append(el('ul', { class: 'tasks' }, done.map((t) => taskRow(t, list.id))));
  }
}

/* ---------- Dettaglio attività ---------- */
function viewTask(p) {
  const listId = realId(route.list);
  const t = findTask(listId, route.id);
  if (!t) { p.append(el('div', { class: 'empty' }, el('p', {}, 'Attività non trovata (forse eliminata).'))); return; }
  const done = isDone(t);
  const save = (patch) => editTask(listId, t.id, patch);

  const title = el('textarea', { class: 'textarea title-input', rows: 1, 'aria-label': 'Titolo', value: t.title || '', oninput: (e) => { autosize(e.target); save({ title: e.target.value }); } });
  const notes = el('textarea', { class: 'textarea', 'aria-label': 'Note', placeholder: 'Aggiungi dettagli', value: t.notes || '', oninput: (e) => { autosize(e.target); save({ notes: e.target.value }); renderNoteLinks(); } });
  const noteLinks = el('div', { class: 'links' });
  const renderNoteLinks = () => {
    const urls = [...new Set((notes.value.match(URL_RE) || []).map((u) => u.replace(/[.,;:!?)\]]+$/, '')))];
    noteLinks.replaceChildren(...urls.map((u) => el('a', { href: u, target: '_blank', rel: 'noopener' }, icon('link'), u)));
  };
  renderNoteLinks();

  const dueVal = t.due ? t.due.slice(0, 10) : '';
  const setDue = (iso) => { patchTask(listId, t.id, { due: iso }); render(); };
  const dueInput = el('input', { type: 'date', class: 'input', 'aria-label': 'Scadenza', value: dueVal, onchange: (e) => setDue(e.target.value ? `${e.target.value}T00:00:00.000Z` : null) });
  const dueChip = (label, iso) => el('button', { class: `pchip${(iso || '').slice(0, 10) === dueVal || (!iso && !dueVal) ? ' on' : ''}`, onclick: () => setDue(iso) }, label);

  const listSel = el('select', { class: 'select', 'aria-label': 'Elenco', onchange: (e) => moveToList(listId, t.id, e.target.value) },
    store.lists.map((l) => { const o = el('option', { value: l.id }, listName(l)); if (l.id === listId) o.selected = true; return o; }));

  const parent = t.parent && findTask(listId, t.parent);
  const subs = parent ? [] : childrenOf(listId, t.id).sort((a, b) => Number(isDone(a)) - Number(isDone(b)) || cmpPos(a, b));
  const subInput = el('input', { class: 'input', placeholder: 'Aggiungi una sottoattività', enterkeyhint: 'done' });
  const addSub = () => { const v = subInput.value.trim(); if (!v) return; addTask(listId, { title: v }, { parent: t.id }); render(); };
  subInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } });

  const marked = WAIT_RE.test(t.notes || '');
  const wchip = waitingChip(t, listId);

  p.classList.add('detail');
  // precedente / successiva: frecce in alto e scorrimento orizzontale del dito
  const nb = navNeighbors(listId, t.id);
  if (nb.seq.length > 1 && nb.i >= 0) {
    p.append(el('div', { class: 'pager' },
      el('button', { class: 'bar-btn pg-prev', disabled: !nb.prev, 'aria-label': 'Attività precedente', html: ICONS.chevron, onclick: () => goNeighbor(-1) }),
      el('span', { class: 'pg-pos' }, `${nb.i + 1} di ${nb.seq.length}`),
      el('button', { class: 'bar-btn', disabled: !nb.next, 'aria-label': 'Attività successiva', html: ICONS.chevron, onclick: () => goNeighbor(1) })));
    attachPagerSwipe(p);
  }
  if (route.slide) { p.classList.add(route.slide > 0 ? 'slide-in-next' : 'slide-in-prev'); delete route.slide; }
  p.append(
    el('label', { class: 'field' }, el('span', { class: 'lab' }, 'Titolo'), title),
    el('label', { class: 'field' }, el('span', { class: 'lab' }, 'Note'), notes, noteLinks),
    el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Scadenza'),
      el('div', { class: 'chips' }, dueChip('Oggi', todayISO(0)), dueChip('Domani', todayISO(1)), dueChip('Tra una settimana', todayISO(7)), dueChip('Nessuna', null)),
      dueInput, t.due ? el('p', { class: 'sub' }, fullDate(t.due)) : null),
    el('label', { class: 'field' }, el('span', { class: 'lab' }, 'Elenco'), listSel),
    done ? null : el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Delega'),
      el('div', { class: 'delegation' }, wchip || el('span', { class: 'sub' }, 'Non delegata'),
        el('button', { class: 'btn', onclick: () => delegateTask(listId, t.id) }, icon('hourglass'), wchip ? (marked ? 'Cambia persona' : 'Indica la persona') : 'Delega / in attesa di…'),
        marked ? el('button', { class: 'btn danger', onclick: () => undelegateTask(listId, t.id) }, 'Togli delega') : null)),
    parent
      ? el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Sottoattività di'),
        el('button', { class: 'listcard', onclick: () => go({ v: 'task', list: listId, id: parent.id }) }, el('span', { class: 'lname' }, parent.title || '(senza titolo)'), el('span', { class: 'task-go', html: ICONS.chevron })))
      : el('div', { class: 'field' }, el('span', { class: 'lab' }, `Sottoattività${subs.length ? ` (${subs.length})` : ''}`),
        subs.length ? el('ul', { class: 'subs' }, subs.map((s) => el('li', { class: isDone(s) ? 'done' : null },
          el('button', { class: 'check', 'aria-label': `${isDone(s) ? 'Riapri' : 'Completa'}: ${s.title}`, html: isDone(s) ? ICONS.done : ICONS.circle, onclick: () => { toggleDone(listId, s.id); render(); } }),
          el('button', { class: 't link-btn', style: 'text-align:left;color:inherit;font-weight:400', onclick: () => go({ v: 'task', list: listId, id: s.id }) }, s.title || '(senza titolo)', ' ', waitingChip(s, listId))))) : null,
        el('div', { class: 'btn-row' }, subInput, el('button', { class: 'btn', onclick: addSub }, icon('add'), 'Aggiungi'))),
    t.links?.length ? el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Collegamenti'),
      el('div', { class: 'links' }, t.links.map((l) => el(safeHref(l.link) ? 'a' : 'span', { href: safeHref(l.link), target: '_blank', rel: 'noopener' }, icon(l.type === 'email' ? 'mail' : 'link'), l.description || l.link)))) : null,
    el('div', { class: 'btn-row' },
      el('button', { class: `btn ${done ? '' : 'primary'} block`, onclick: () => { toggleDone(listId, t.id); render(); } }, icon('done'), done ? 'Segna come da fare' : 'Segna come completata'),
      el('button', { class: 'btn danger block', onclick: () => removeTask(listId, t.id) }, icon('delete'), 'Elimina')),
    el('p', { class: 'footnote' }, t.updated ? `Ultima modifica: ${new Date(t.updated).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })}` : ''));
  requestAnimationFrame(() => { autosize(title); autosize(notes); });
}

/* ---------- Deleghe ---------- */
async function delegateTask(listId, taskId) {
  const t = findTask(listId, taskId);
  if (!t) return;
  const old = (t.notes || '').match(WAIT_RE);
  const who = await askText(old ? 'Delegata a chi?' : 'In attesa di chi?', old?.[4]?.trim() || '', { placeholder: 'Nome (facoltativo)', ok: old ? 'Salva' : 'Segna come delegata', optional: true });
  if (who === null) return;
  flushEdits();
  const notes = old
    ? (t.notes || '').replace(WAIT_RE, `⏳ In attesa dal ${old[1]}/${old[2]}/${old[3]}${who ? ` — da: ${who}` : ''}`)
    : withWaitMarker(t.notes, who);
  patchTask(listId, t.id, { notes });
  render();
  toast(old ? 'Delega aggiornata' : 'Segnata come delegata');
}
function undelegateTask(listId, taskId) {
  const t = findTask(listId, taskId);
  if (!t) return;
  flushEdits();
  const before = t.notes;
  patchTask(listId, t.id, { notes: (t.notes || '').replace(WAIT_LINE_RE, '').replace(/^\n+/, '') });
  render();
  toast('Delega tolta', { actionLabel: 'Annulla', action: () => { patchTask(listId, t.id, { notes: before }); render(); } });
}

function viewDelegated(p) {
  const rows = delegatedRows();
  p.append(el('p', { class: 'sub', style: 'margin-top:1rem' }, `Attività in “In attesa” e attività delegate negli altri elenchi (anche sottoattività dei progetti). In rosso quelle oltre ${prefs.waitDays} giorni.`));
  if (!rows.length) { p.append(el('div', { class: 'empty' }, icon('hourglass'), el('p', {}, 'Nessuna delega in corso.'))); return; }
  p.append(el('ul', { class: 'tasks' }, rows.map(({ t, listId }) => taskRow(t, listId, { showList: true }))));
}

/* ---------- Elabora INBOX ---------- */
const procSkipped = new Set();
let procDirty = false;
function inboxQueue() {
  const id = roleId('inbox');
  return id ? activeTasks(id).filter((t) => !t.parent).sort((a, b) => cmpPos(a, b)) : [];
}
function viewProcess(p) {
  const inbox = roleList('inbox');
  if (!store.lists.length) { p.append(loadingOrEmpty()); return; }
  if (!inbox) { p.append(el('div', { class: 'empty' }, el('p', {}, 'Non trovo l’elenco INBOX. Sceglilo in Altro → Impostazioni → GTD.'))); return; }
  const all = inboxQueue();
  const queue = all.filter((t) => !procSkipped.has(t.id));
  if (!queue.length) {
    p.append(el('div', { class: 'empty' }, icon('inbox'),
      el('h2', {}, all.length ? 'Hai saltato le voci rimaste' : 'INBOX vuota'),
      el('p', {}, all.length ? 'Riprendile quando vuoi.' : 'Tutto chiarito e organizzato. Ottimo lavoro!'),
      all.length ? el('button', { class: 'btn primary', onclick: () => { procSkipped.clear(); render(); } }, `Riprendi le ${all.length} saltate`) : null,
      el('button', { class: 'btn', onclick: () => go({ v: 'list', id: inbox.id }) }, 'Apri la INBOX')));
    return;
  }
  const t = queue[0];
  procDirty = false;
  const dirty = () => { procDirty = true; };
  const title = el('textarea', { id: 'procTitle', class: 'textarea title-input', rows: 1, 'aria-label': 'Titolo', value: t.title || '', oninput: (e) => { autosize(e.target); dirty(); chipsUpd(); } });
  const notes = el('textarea', { id: 'procNotes', class: 'textarea', 'aria-label': 'Note', placeholder: 'Dettagli (facoltativi)', value: t.notes || '', oninput: (e) => { autosize(e.target); dirty(); } });
  let due = t.due ? t.due.slice(0, 10) : '';
  const dueRow = el('div', { class: 'chips' });
  const dueUpd = () => dueRow.replaceChildren(...[['Nessuna', ''], ['Oggi', todayISO(0).slice(0, 10)], ['Domani', todayISO(1).slice(0, 10)], ['Tra una settimana', todayISO(7).slice(0, 10)]]
    .map(([label, v]) => el('button', { class: `pchip${due === v ? ' on' : ''}`, onclick: () => { due = v; dirty(); dueUpd(); } }, label)));
  dueUpd();
  const ctxRow = el('div', { class: 'chips' });
  const chipsUpd = () => {
    const used = new Set(taskContexts({ title: title.value }));
    const opts = [...new Set([...prefs.contexts.map((x) => x.toLowerCase()), ...contextCounts().map(([k]) => k)])];
    ctxRow.replaceChildren(...opts.map((c) => el('button', {
      class: `pchip${used.has(c) ? ' on' : ''}`,
      onclick: () => {
        const re = new RegExp(`(^|\\s)${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`, 'giu');
        title.value = used.has(c) ? title.value.replace(re, '').replace(/\s{2,}/g, ' ').trim() : `${title.value.trim()} ${c}`;
        dirty(); chipsUpd(); autosize(title);
      },
    }, c)));
  };
  chipsUpd();
  const read = () => ({ title: title.value.trim(), notes: notes.value, due: due ? `${due}T00:00:00.000Z` : null });
  const missing = (role) => !roleId(role);
  const choice = (kind, ico, label, hint, fn) => el('button', {
    class: `choice k-${kind}`, disabled: ['next', 'projects', 'waiting', 'someday'].includes(kind) && missing(kind),
    onclick: fn,
  }, el('b', {}, label), el('span', { class: 'hint' }, el('span', { class: 'ico', html: ICONS[ico] }), el('span', {}, hint)));
  const reading = roleList('reading');

  p.append(el('div', { class: 'proc-card' },
    el('div', { class: 'proc-pos' }, `Voce ${all.indexOf(t) + 1} di ${all.length}`),
    el('label', { class: 'field' }, el('span', { class: 'lab' }, 'Titolo'), title),
    el('label', { class: 'field' }, el('span', { class: 'lab' }, 'Dettagli'), notes),
    el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Contesto'), ctxRow),
    el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Scadenza'), dueRow)),
  el('h2', { class: 'proc-q' }, 'Cosa ne faccio?'),
  el('div', { class: 'choices' },
    choice('done', 'done', 'Fatto', 'Meno di 2 minuti', () => processAction(t, 'done', read())),
    choice('next', 'arrow', 'Prossima azione', listName(roleList('next')) || '—', () => processAction(t, 'next', read())),
    reading ? choice('reading', 'notes', 'Da leggere', listName(reading), () => processAction(t, 'reading', read())) : null,
    choice('projects', 'folder', 'Progetto', 'Più di un’azione', () => processAction(t, 'projects', read())),
    choice('waiting', 'hourglass', 'In attesa di…', 'Delegato', () => processAction(t, 'waiting', read())),
    choice('someday', 'cloud', 'Un giorno / forse', 'Non ora', () => processAction(t, 'someday', read())),
    choice('other', 'lists', 'Altro elenco…', 'Scegli dall’elenco completo', () => processAction(t, 'other', read())),
    choice('delete', 'delete', 'Elimina', 'Non serve', () => processAction(t, 'delete')),
    choice('skip', 'skip', 'Salta', 'Decidi dopo', () => processAction(t, 'skip'))));
  requestAnimationFrame(() => { autosize(title); autosize(notes); });
}

async function processAction(t, kind, data) {
  const inboxId = roleId('inbox');
  procDirty = false;
  if (kind === 'skip') { procSkipped.add(t.id); render({ top: true }); return; }
  if (kind === 'delete') { removeTask(inboxId, t.id); render({ top: true }); return; }
  const patch = {};
  if (data.title && data.title !== t.title) patch.title = data.title;
  if (data.notes !== (t.notes || '')) patch.notes = data.notes;
  if ((t.due || '').slice(0, 10) !== (data.due || '').slice(0, 10)) patch.due = data.due;
  let dest = GTD_ROLE_RE[kind] ? roleId(kind) : null;
  if (kind === 'other') {
    dest = await pickList('Sposta in…', inboxId);
    if (!dest) return;
  }
  if (kind === 'waiting') {
    const who = await askText('In attesa di chi?', '', { placeholder: 'Nome (facoltativo)', ok: 'Sposta in “In attesa”', optional: true });
    if (who === null) return;
    patch.notes = withWaitMarker(patch.notes ?? t.notes, who);
  }
  if (Object.keys(patch).length) patchTask(inboxId, t.id, patch);
  if (kind === 'done') {
    patchTask(inboxId, t.id, { status: 'completed', completed: new Date().toISOString() });
    toast('Fatto ✓');
  } else {
    moveToList(inboxId, t.id, dest);
  }
  navigator.vibrate?.(12);
  render({ top: true });
}

/* ---------- Ricerca ---------- */
let searchQ = '';
/** Risultati per elenco, in ordine ad albero: ogni attività seguita dalle sue sottoattività trovate.
 *  Se l'attività principale non è tra i risultati compare come "attività di riferimento" (ctx). */
function searchGroups(q, showDone) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  const out = [];
  for (const l of store.lists) {
    const all = tasksOf(l.id);
    const shown = all.filter((t) => (showDone || !isDone(t)) && words.every((w) => norm(`${t.title || ''}\n${t.notes || ''}`).includes(w)));
    if (!shown.length) continue;
    const byId = new Map(all.map((t) => [t.id, t]));
    const ids = new Set(shown.map((t) => t.id));
    const subs = new Map();
    const anchors = [];
    for (const t of shown) {
      const parent = t.parent && byId.get(t.parent);
      if (!parent) { anchors.push({ t, ctx: false }); continue; }
      if (!subs.has(parent.id)) subs.set(parent.id, []);
      subs.get(parent.id).push(t);
    }
    for (const pid of subs.keys()) if (!ids.has(pid)) anchors.push({ t: byId.get(pid), ctx: true });
    const order = (a, b) => Number(isDone(a)) - Number(isDone(b)) || cmpPos(a, b);
    anchors.sort((a, b) => order(a.t, b.t));
    const rows = [];
    for (const { t, ctx } of anchors) {
      rows.push({ t, depth: 0, ctx });
      for (const c of (subs.get(t.id) || []).sort(order)) rows.push({ t: c, depth: 1 });
    }
    out.push({ l, shown, rows });
  }
  return out;
}

function rememberSearch(q) {
  q = q.trim();
  if (q.length < 2) return;
  prefs.recent = [q, ...prefs.recent.filter((x) => norm(x) !== norm(q))].slice(0, 5);
  savePrefs();
}
function viewSearch(p) {
  const input = el('input', { type: 'search', 'aria-label': 'Cerca in tutti gli elenchi', placeholder: 'Cerca in tutti gli elenchi…', value: searchQ, enterkeyhint: 'search', autocomplete: 'off' });
  const results = el('div');
  let timer;
  let memo;
  input.addEventListener('input', () => {
    clearTimeout(timer); clearTimeout(memo);
    timer = setTimeout(() => { searchQ = input.value.trim(); renderResults(); }, 150);
    memo = setTimeout(() => rememberSearch(input.value), 2000); // ricordata dopo 2 s senza scrivere
  });
  input.addEventListener('blur', () => { clearTimeout(memo); rememberSearch(input.value); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { rememberSearch(input.value); input.blur(); } });
  const clear = el('button', { class: 'bar-btn', title: 'Cancella', html: ICONS.close, onclick: () => { input.value = ''; searchQ = ''; renderResults(); input.focus(); } });
  p.append(el('div', { class: 'searchbox' }, el('div', { class: 'searchfield' }, icon('search'), input, clear),
    el('label', { class: 'switch-row' }, el('span', { class: 'txt' }, 'Mostra anche le completate'),
      el('input', { type: 'checkbox', class: 'switch', checked: prefs.searchShowDone, onchange: (e) => { prefs.searchShowDone = e.target.checked; savePrefs(); renderResults(); } }))),
  results);

  function renderResults() {
    const q = searchQ;
    if (!q) {
      results.replaceChildren(prefs.recent.length
        ? el('div', {}, el('h2', { class: 'h2' }, 'Ricerche recenti'),
          el('ul', { class: 'recent-list' }, prefs.recent.map((r) => el('li', {}, icon('search'),
            el('button', { class: 'q', onclick: () => { input.value = r; searchQ = r; rememberSearch(r); renderResults(); } }, r),
            el('button', { class: 'bar-btn', title: `Rimuovi “${r}”`, html: ICONS.close, onclick: () => { prefs.recent = prefs.recent.filter((x) => x !== r); savePrefs(); renderResults(); } })))))
        : el('p', { class: 'sub' }, 'Cerca in titoli e note di tutti gli elenchi. Più parole insieme; gli accenti non contano.'));
      return;
    }
    const words = norm(q).split(/\s+/).filter(Boolean);
    const parts = [];
    let total = 0;
    for (const { l, shown, rows } of searchGroups(q, prefs.searchShowDone)) {
      total += shown.length;
      parts.push(...group(`s-${l.id}`, listName(l), rows.map(({ t, depth, ctx }) => {
        let snippet = null;
        const nn = norm(t.notes);
        const w = !ctx && words.find((x) => nn.includes(x));
        if (w) { const i = nn.indexOf(w); snippet = (i > 30 ? '…' : '') + t.notes.slice(Math.max(0, i - 30), i + 90).replace(/\s+/g, ' '); }
        return { t, listId: l.id, snippet, depth, ctx };
      }), { opts: { q } }));
    }
    results.replaceChildren(
      el('div', { class: 'results-head' },
        el('p', { class: 'sub' }, total ? plural(total, 'risultato', 'risultati') : 'Nessuna attività trovata.'),
        total ? el('button', { class: 'btn', onclick: () => openExport({ q }) }, icon('share'), 'Esporta / copia') : null),
      ...parts);
  }
  renderResults();
  if (!searchQ) requestAnimationFrame(() => input.focus());
}

/* ---------- Altro ---------- */
function viewMore(p) {
  const ago = prefs.lastReview ? daysBetween(new Date(prefs.lastReview), new Date()) : null;
  const ctxN = contextCounts().length;
  const item = (ico, label, sub, fn) => el('li', {}, el('button', { onclick: fn }, icon(ico), el('span', { class: 'grow' }, label, sub ? el('small', {}, sub) : null), el('span', { class: 'task-go', html: ICONS.chevron })));
  p.append(
    el('ul', { class: 'menu-list' },
      item('review', 'Revisione settimanale', ago == null ? 'Mai fatta' : ago === 0 ? 'Fatta oggi' : `Ultima ${ago} giorni fa`, () => go({ v: 'review' })),
      item('at', 'Contesti', ctxN ? plural(ctxN, 'contesto in uso', 'contesti in uso') : 'Dove o con cosa fare un’azione', () => go({ v: 'contexts' })),
      item('hourglass', 'Deleghe in corso', plural(delegatedRows().length, 'attività', 'attività'), () => go({ v: 'delegated' })),
      item('share', 'Esporta / copia', 'Tutte le attività come testo o Markdown', () => openExport())),
    el('ul', { class: 'menu-list' },
      item('settings', 'Impostazioni', 'Testo, tema, leggibilità, GTD, account', () => go({ v: 'settings' })),
      item('info', 'Guida rapida', 'Gesti, pulsanti e consigli', () => go({ v: 'help' }))),
    auth.profile ? el('p', { class: 'sub' }, `Collegato come ${auth.profile.email}`) : null,
    el('p', { class: 'footnote' }, `Tasks GTD ${APP_VERSION} · i dati restano su Google Tasks`));
}

/* ---------- Revisione settimanale ---------- */
function viewReview(p) {
  const wk = weekKey();
  const checks = prefs.reviewChecks[wk] || {};
  const b = dueBuckets();
  const inboxId = roleId('inbox');
  const inboxN = inboxQueue().length;
  const late = delegatedRows().filter(({ t }) => waitingInfo(t)?.late);
  const noNext = projectsWithoutNext();
  const nextN = roleId('next') ? activeTasks(roleId('next')).length : 0;
  const somedayN = roleId('someday') ? activeTasks(roleId('someday')).length : 0;
  const ago = prefs.lastReview ? daysBetween(new Date(prefs.lastReview), new Date()) : null;
  const rows = (r) => el('ul', { class: 'tasks' }, r.map(({ t, listId }) => taskRow(t, listId, { showList: true })));
  const mind = el('input', { class: 'input', placeholder: 'Scrivi e premi Invio: va nella INBOX', enterkeyhint: 'send' });
  mind.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !mind.value.trim() || !inboxId) return;
    e.preventDefault();
    addTask(inboxId, { title: mind.value.trim() });
    mind.value = '';
    toast('Aggiunta alla INBOX');
  });
  const steps = [
    { id: 'mind', title: 'Svuota la testa', detail: 'Annota tutto quello che ti viene in mente.', body: mind },
    { id: 'inbox', title: 'Svuota la INBOX', ok: !inboxN, detail: inboxN ? `${plural(inboxN, 'voce', 'voci')} da elaborare` : 'INBOX vuota', body: inboxN ? el('button', { class: 'btn primary', onclick: () => tab('inbox') }, 'Elabora INBOX') : null },
    { id: 'overdue', title: 'Attività scadute', ok: !b.overdue.length, detail: b.overdue.length ? `${plural(b.overdue.length, 'scaduta', 'scadute')}: completale, rinviale o eliminale` : 'Nessuna scaduta', body: b.overdue.length ? rows(b.overdue) : null },
    { id: 'waiting', title: `Sollecita attese e deleghe (oltre ${prefs.waitDays} giorni)`, ok: !late.length, detail: late.length ? `${plural(late.length, 'da sollecitare', 'da sollecitare')}` : 'Nessuna da sollecitare', body: late.length ? rows(late) : null },
    { id: 'projects', title: 'Ogni progetto ha una prossima azione?', ok: !noNext.length, detail: noNext.length ? `${plural(noNext.length, 'progetto', 'progetti')} senza prossima azione: aggiungi una sottoattività o un’azione che contenga il nome del progetto.` : 'Tutti i progetti hanno un’azione', body: noNext.length ? rows(noNext) : null },
    { id: 'next', title: 'Rivedi le prossime azioni', detail: `${plural(nextN, 'attività', 'attività')}: togli quelle superate`, body: roleId('next') ? el('button', { class: 'btn', onclick: () => go({ v: 'list', id: roleId('next') }) }, 'Apri Prossime azioni') : null },
    { id: 'someday', title: 'Rivedi “Un giorno / forse”', detail: `${plural(somedayN, 'idea', 'idee')}: qualcuna è diventata attuale?`, body: roleId('someday') ? el('button', { class: 'btn', onclick: () => go({ v: 'list', id: roleId('someday') }) }, 'Apri Un giorno / forse') : null },
    { id: 'calendar', title: 'Guarda il calendario', detail: 'Settimana passata e prossime due settimane.' },
  ];
  const doneN = steps.filter((s) => checks[s.id]).length;
  p.append(el('p', { class: 'sub', style: 'margin-top:1rem' }, `${doneN} di ${steps.length} passi · ultima revisione: ${ago == null ? 'mai' : ago === 0 ? 'oggi' : `${ago} giorni fa`}`));
  steps.forEach((s, i) => p.append(el('section', { class: `rstep${checks[s.id] ? ' checked' : ''}` },
    el('label', {},
      el('input', { type: 'checkbox', checked: !!checks[s.id], onchange: (e) => { prefs.reviewChecks = { [wk]: { ...checks, [s.id]: e.target.checked } }; savePrefs(); render(); } }),
      el('span', { class: 'n' }, i + 1), el('span', {}, s.title), s.ok ? el('span', { class: 'ok' }, '✓') : null),
    el('p', {}, s.detail), s.body || null)));
  p.append(el('button', {
    class: 'btn primary block', style: 'margin:1rem 0',
    onclick: () => { prefs.lastReview = new Date().toISOString(); prefs.reviewChecks = {}; savePrefs(); toast('Revisione completata'); tab('today'); },
  }, icon('done'), 'Revisione completata'));
}

/* ---------- Contesti ---------- */
function noContextNext() {
  const id = roleId('next');
  return id ? activeTasks(id).filter((t) => !taskContexts(t).length).map((t) => ({ t, listId: id })) : [];
}
function viewContexts(p) {
  const used = new Map(contextCounts());
  const all = [...new Set([...used.keys(), ...prefs.contexts.map((x) => x.toLowerCase())])];
  const none = noContextNext();
  p.append(el('div', { class: 'info', style: 'margin-top:1rem' },
    el('p', {}, el('b', {}, 'Cos’è un contesto. '), 'Dove o con cosa puoi fare un’azione: al telefono, in ufficio, al computer…'),
    el('p', {}, el('b', {}, 'Come si assegna. '), 'Scrivi ', el('code', {}, '@parola'), ' nel titolo (es. ', el('code', {}, 'Chiamare Rossi @telefono'), ') oppure usa i pulsanti in Elabora INBOX.')),
  el('div', { class: 'ctxgrid' },
    all.map((c) => el('button', { class: `ctxcard${used.get(c) ? '' : ' dim'}`, onclick: () => go({ v: 'context', ctx: c }) },
      el('span', { class: 'nm' }, c), el('span', { class: 'ct' }, used.get(c) ? plural(used.get(c), 'attività', 'attività') : 'nessuna attività'))),
    none.length ? el('button', { class: 'ctxcard warn', onclick: () => go({ v: 'context', ctx: '__none__' }) },
      el('span', { class: 'nm' }, 'Senza contesto'), el('span', { class: 'ct' }, plural(none.length, 'prossima azione', 'prossime azioni'))) : null));
}
function viewContext(p) {
  if (route.ctx === '__none__') {
    const rows = noContextNext();
    p.append(el('p', { class: 'sub', style: 'margin-top:1rem' }, 'Prossime azioni senza @contesto.'));
    p.append(rows.length ? el('ul', { class: 'tasks' }, rows.map(({ t, listId }) => taskRow(t, listId))) : el('div', { class: 'empty' }, el('p', {}, 'Tutte hanno un contesto.')));
    return;
  }
  let total = 0;
  for (const l of store.lists) {
    const rows = activeTasks(l.id).filter((t) => taskContexts(t).includes(route.ctx)).map((t) => ({ t, listId: l.id }));
    if (!rows.length) continue;
    total += rows.length;
    p.append(...group(`c-${route.ctx}-${l.id}`, listName(l), rows));
  }
  if (!total) p.append(el('div', { class: 'empty' }, el('p', {}, `Nessuna attività aperta con ${route.ctx}.`)));
}

/* ---------- Impostazioni ---------- */
function viewSettings(p) {
  const chipset = (opts, cur, fn) => el('div', { class: 'chips' }, opts.map(([v, label]) => el('button', { class: `pchip${cur === v ? ' on' : ''}`, 'aria-pressed': String(cur === v), onclick: () => fn(v) }, label)));
  const setPref = (k, v) => { prefs[k] = v; savePrefs(); applyLook(); render(); };
  const sw = (label, sub, k) => el('label', { class: 'switch-row' }, el('span', { class: 'txt' }, label, sub ? el('small', {}, sub) : null),
    el('input', { type: 'checkbox', class: 'switch', checked: !!prefs[k], onchange: (e) => setPref(k, e.target.checked) }));
  const pct = Math.round(prefs.scale * 100);
  const range = el('input', { type: 'range', class: 'range', min: 85, max: 160, step: 5, value: pct, 'aria-label': 'Dimensione del testo' });
  const out = el('b', {}, `${pct}%`);
  range.addEventListener('input', () => { prefs.scale = range.value / 100; out.textContent = `${range.value}%`; applyLook(); });
  range.addEventListener('change', () => { savePrefs(); render(); });

  const roleSel = (role) => {
    const auto = store.lists.find((l) => GTD_ROLE_RE[role].test(norm(l.title)));
    return el('label', { class: 'field' }, el('span', { class: 'lab' }, ROLE_LABELS[role]),
      el('select', { class: 'select', onchange: (e) => { if (e.target.value) prefs.roles[role] = e.target.value; else delete prefs.roles[role]; savePrefs(); } },
        el('option', { value: '' }, `Automatico${auto ? ` (${listName(auto)})` : ' (non trovato)'}`),
        store.lists.map((l) => { const o = el('option', { value: l.id }, listName(l)); if (prefs.roles[role] === l.id) o.selected = true; return o; })));
  };

  p.append(
    el('section', { class: 'section' }, el('h3', {}, 'Dimensione del testo'),
      el('div', { class: 'switch-row' }, el('span', { class: 'txt' }, 'Grandezza'), out),
      range,
      el('div', { class: 'preview' }, el('div', { class: 'task-title' }, 'Telefonare al fornitore ', el('span', { class: 'ctx' }, '@telefono')), el('div', { class: 'meta' }, el('span', { class: 'chip due' }, icon('event'), 'Domani'))),
      el('p', { class: 'sub' }, 'Segue anche la dimensione del testo impostata in Chrome (Impostazioni → Accessibilità).')),
    el('section', { class: 'section' }, el('h3', {}, 'Aspetto'),
      el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Tema'), chipset([['auto', 'Come il telefono'], ['light', 'Chiaro'], ['dark', 'Scuro']], prefs.theme, (v) => setPref('theme', v))),
      el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Carattere'), chipset([['system', 'Di sistema (Roboto)'], ['atkinson', 'Atkinson Hyperlegible']], prefs.font, (v) => setPref('font', v))),
      sw('Alta leggibilità', 'Carattere Atkinson, interlinea ampia, testi secondari più scuri, nomi degli elenchi con l’iniziale maiuscola', 'hiRead'),
      sw('Nomi degli elenchi con l’iniziale maiuscola', '“Prossime azioni” invece di “PROSSIME AZIONI”', 'niceCase'),
      el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Schermata iniziale'), chipset([['today', 'Oggi'], ['lists', 'Elenchi'], ['inbox', 'INBOX']], prefs.home, (v) => setPref('home', v)))),
    el('section', { class: 'section' }, el('h3', {}, 'GTD'),
      el('p', { class: 'sub' }, 'Quale elenco svolge ogni ruolo. “Automatico” lo riconosce dal nome.'),
      ...Object.keys(ROLE_LABELS).map(roleSel),
      el('label', { class: 'field' }, el('span', { class: 'lab' }, 'Deleghe: da sollecitare dopo quanti giorni'),
        el('input', { class: 'input', type: 'number', inputmode: 'numeric', min: 1, max: 90, value: prefs.waitDays, onchange: (e) => { prefs.waitDays = Math.max(1, Math.min(90, Number(e.target.value) || 7)); savePrefs(); } })),
      el('label', { class: 'field' }, el('span', { class: 'lab' }, 'Contesti proposti (separati da virgola)'),
        el('input', { class: 'input', value: prefs.contexts.join(', '), onchange: (e) => { const c = e.target.value.split(/[,\s]+/).filter(Boolean).map((x) => (x.startsWith('@') ? x : `@${x}`).toLowerCase()); prefs.contexts = c.length ? c : DEFAULT_CONTEXTS; savePrefs(); } })),
      el('label', { class: 'switch-row' }, el('span', { class: 'txt' }, 'Mostra le attività completate negli elenchi'),
        el('input', { type: 'checkbox', class: 'switch', checked: prefs.showCompleted, onchange: (e) => { prefs.showCompleted = e.target.checked; savePrefs(); } }))),
    el('section', { class: 'section' }, el('h3', {}, 'Account Google'),
      el('p', {}, auth.profile ? `${auth.profile.name ? `${auth.profile.name} — ` : ''}${auth.profile.email}` : 'Nessun account collegato.'),
      el('div', { class: 'btn-row' },
        el('button', { class: 'btn', onclick: openAccounts }, icon('person'), auth.profile ? 'Cambia account' : 'Accedi'),
        auth.profile ? el('button', { class: 'btn danger', onclick: async () => { if (await confirmBox('Uscire?', 'Le attività restano su Google; su questo telefono verranno tolte.', 'Esci')) { auth.logout(); go({ v: 'login' }, { replace: true }); } } }, icon('logout'), 'Esci') : null)),
    el('section', { class: 'section' }, el('h3', {}, 'Configurazione'),
      setupFields(),
      el('p', { class: 'footnote' }, `Versione ${APP_VERSION}`)));
}

function copyBox(text) {
  return el('div', { class: 'copybox' }, el('span', { class: 'mono' }, text),
    el('button', { class: 'btn', onclick: async () => { try { await navigator.clipboard.writeText(text); toast('Copiato'); } catch { toast('Copia non riuscita: selezionalo a mano', { error: true }); } } }, 'Copia'));
}
function setupFields() {
  const cfgId = (window.GT_CONFIG?.clientId || '').trim();
  const input = el('input', { class: 'input mono', placeholder: '1234567890-xxxx.apps.googleusercontent.com', value: LS.get('clientId') || cfgId, disabled: !!cfgId, autocapitalize: 'off', spellcheck: 'false' });
  return el('div', {},
    el('label', { class: 'field' }, el('span', { class: 'lab' }, 'ID client OAuth'), input,
      cfgId ? el('p', { class: 'sub' }, 'Impostato nel file config.js.') : null),
    cfgId ? null : el('button', {
      class: 'btn primary', onclick: () => { const v = input.value.trim(); if (!v) return; LS.set('clientId', v); toast('ID client salvato'); if (!auth.valid()) go({ v: 'login' }, { replace: true }); },
    }, 'Salva'),
    el('p', { class: 'sub' }, 'In Google Cloud → Client, aggiungi:'),
    el('span', { class: 'lab' }, 'Origine JavaScript autorizzata'), copyBox(location.origin),
    el('span', { class: 'lab' }, 'URI di reindirizzamento autorizzato'), copyBox(auth.redirectUri()));
}

/* ---------- Guida rapida ---------- */
function viewHelp(p) {
  const row = (a, b) => el('li', {}, el('b', {}, a), ' — ', b);
  p.append(
    el('h2', { class: 'h2' }, 'Gesti sulle attività'),
    el('ul', {}, row('Tocca', 'apri i dettagli'), row('Tocca il cerchio', 'completa (con Annulla)'), row('Scorri verso destra', 'completa'),
      row('Scorri verso sinistra o tieni premuto', 'menu azioni: scadenza, sposta, delega, elimina'), row('Tasto Indietro', 'torna alla schermata precedente')),
    el('h2', { class: 'h2' }, 'Nel dettaglio di un’attività'),
    el('ul', {}, row('Scorri a sinistra / a destra', 'attività successiva / precedente, nell’ordine della schermata da cui l’hai aperta (anche frecce ‹ › in alto)'), row('Esporta / copia', 'dal menu ⋮ di un elenco, dai risultati della ricerca o da Altro')),
    el('h2', { class: 'h2' }, 'In basso'),
    el('ul', {}, row('Oggi', 'riepilogo, scadute, oggi, prossimi 7 giorni'), row('Elenchi', 'tutti i tuoi elenchi'), row('INBOX', 'elabora una voce alla volta'),
      row('Cerca', 'in titoli e note di tutti gli elenchi'), row('Altro', 'revisione, contesti, deleghe, impostazioni'), row('+ Nuova', 'aggiungi un’attività')),
    el('h2', { class: 'h2' }, 'Raccolta da altre app'),
    el('p', {}, 'Dopo aver installato l’app (menu ⋮ di Chrome → “Installa app”), da qualsiasi app usa ', el('b', {}, 'Condividi → Tasks GTD'), ': il testo o il link diventa una nuova attività nella INBOX.'),
    el('h2', { class: 'h2' }, 'Compatibilità'),
    el('p', {}, 'Contesti (@telefono), deleghe (⏳ nelle note) ed elenchi GTD sono gli stessi dell’estensione per Firefox e si vedono anche nell’app Google Tasks.'),
    el('h2', { class: 'h2' }, 'Senza rete'),
    el('p', {}, 'Vedi le ultime attività salvate e puoi modificarle: le modifiche partono appena torna la connessione.'));
}

/* ---------- Configurazione e accesso ---------- */
function viewSetup(p) {
  p.append(el('div', { class: 'gate' },
    el('img', { src: 'icons/icon.svg', alt: '' }),
    el('h2', {}, 'Configurazione iniziale'),
    el('p', {}, 'Serve l’ID client OAuth di Google: lo stesso usato dall’estensione per Firefox.')),
  setupFields());
}
function viewLogin(p) {
  p.append(el('div', { class: 'gate' },
    el('img', { src: 'icons/icon.svg', alt: '' }),
    el('h2', {}, 'Accedi a Google Tasks'),
    el('p', {}, 'Collega il tuo account Google per vedere e modificare le tue attività.'),
    state.loginError ? el('p', { class: 'err' }, state.loginError) : null,
    el('button', { class: 'btn primary block', onclick: () => auth.begin() }, 'Accedi con Google'),
    el('button', { class: 'btn block', onclick: () => auth.begin({ selectAccount: true }) }, 'Usa un altro account'),
    el('button', { class: 'link-btn', onclick: () => go({ v: 'setup' }) }, 'Configurazione')));
}

/* =========================================================================
   Fogli dal basso (bottom sheet)
   ========================================================================= */
function sheet(build) {
  const dlg = el('dialog', { class: 'sheet' });
  const inner = el('div', { class: 'sheet-in' }, el('div', { class: 'grip', 'aria-hidden': 'true' }));
  dlg.append(inner);
  let onClose = null;
  let closed = false;
  // chiusura indipendente dall'evento "close" (che alcuni browser ritardano)
  const close = () => {
    if (closed) return;
    closed = true;
    if (dlg.open) dlg.close();
    dlg.remove();
    onClose?.();
  };
  dlg.addEventListener('close', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  build(inner, close, (fn) => { onClose = fn; });
  document.body.append(dlg);
  dlg.showModal();
  return { dlg, close };
}

function askText(title, value = '', { placeholder = '', ok = 'Salva', optional = false } = {}) {
  return new Promise((resolve) => {
    let result = null;
    sheet((s, close, onClose) => {
      const input = el('input', { class: 'input', value, placeholder, enterkeyhint: 'done' });
      const confirm = () => { const v = input.value.trim(); if (!v && !optional) return; result = v; close(); };
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); confirm(); } });
      s.append(el('h2', {}, title), input,
        el('div', { class: 'sheet-footer' }, el('button', { class: 'btn', onclick: close }, 'Annulla'), el('button', { class: 'btn primary', onclick: confirm }, ok)));
      onClose(() => resolve(result));
      setTimeout(() => input.focus(), 50);
    });
  });
}

function confirmBox(title, text, ok = 'Elimina') {
  return new Promise((resolve) => {
    let yes = false;
    sheet((s, close, onClose) => {
      s.append(el('h2', {}, title), el('p', {}, text),
        el('div', { class: 'sheet-footer' }, el('button', { class: 'btn', onclick: close }, 'Annulla'),
          el('button', { class: 'btn primary', style: 'background:var(--danger);border-color:var(--danger);color:#fff', onclick: () => { yes = true; close(); } }, ok)));
      onClose(() => resolve(yes));
    });
  });
}

function actionsSheet(title, items) {
  sheet((s, close) => {
    s.append(el('h2', {}, title), el('div', { class: 'sheet-actions' }, items.filter(Boolean).map((it) => el('button', {
      class: it.danger ? 'danger' : null,
      onclick: () => { close(); setTimeout(it.fn, 60); },
    }, icon(it.icon), el('span', {}, it.label)))));
  });
}

function openTaskActions(listId, taskId, { fromDetail = false } = {}) {
  const t = findTask(listId, taskId);
  if (!t) return;
  const done = isDone(t);
  const marked = WAIT_RE.test(t.notes || '');
  actionsSheet(t.title || 'Attività', [
    { icon: 'done', label: done ? 'Segna come da fare' : 'Segna come completata', fn: () => toggleDone(listId, t.id) },
    fromDetail ? null : { icon: 'notes', label: 'Apri i dettagli', fn: () => go({ v: 'task', list: listId, id: t.id }) },
    done ? null : { icon: 'event', label: 'Scadenza: oggi', fn: () => { patchTask(listId, t.id, { due: todayISO(0) }); render(); toast('Scadenza: oggi'); } },
    done ? null : { icon: 'event', label: 'Scadenza: domani', fn: () => { patchTask(listId, t.id, { due: todayISO(1) }); render(); toast('Scadenza: domani'); } },
    t.due ? { icon: 'close', label: 'Togli la scadenza', fn: () => { patchTask(listId, t.id, { due: null }); render(); } } : null,
    { icon: 'move', label: 'Sposta in un altro elenco…', fn: () => chooseList(listId, t.id) },
    done ? null : { icon: 'hourglass', label: marked ? 'Cambia persona della delega' : 'Delega / in attesa di…', fn: () => delegateTask(listId, t.id) },
    marked ? { icon: 'close', label: 'Togli la delega', fn: () => undelegateTask(listId, t.id) } : null,
    { icon: 'delete', label: 'Elimina', danger: true, fn: () => removeTask(listId, t.id) },
  ]);
}

/** Elenco completo degli elenchi: restituisce l'id scelto (o null). */
function pickList(title, excludeId) {
  return new Promise((resolve) => {
    let chosen = null;
    sheet((s, close, onClose) => {
      s.append(el('h2', {}, title), el('div', { class: 'sheet-actions' },
        store.lists.filter((l) => l.id !== realId(excludeId)).map((l) => {
          const r = roleOf(l.id);
          return el('button', { onclick: () => { chosen = l.id; close(); } },
            icon(r === 'waiting' ? 'hourglass' : r === 'projects' ? 'folder' : r === 'someday' ? 'cloud' : r === 'reading' ? 'notes' : 'lists'),
            el('span', {}, listName(l), r ? el('small', { class: 'role-hint' }, ROLE_LABELS[r]) : null));
        })));
      onClose(() => resolve(chosen));
    });
  });
}

function chooseList(fromId, taskId) {
  actionsSheet('Sposta in…', store.lists.filter((l) => l.id !== realId(fromId)).map((l) => ({
    icon: roleOf(l.id) === 'waiting' ? 'hourglass' : roleOf(l.id) === 'projects' ? 'folder' : 'lists',
    label: listName(l), fn: () => moveToList(fromId, taskId, l.id),
  })));
}

function openListMenu() {
  const list = findList(route.id);
  if (!list) return;
  const doneN = tasksOf(list.id).filter(isDone).length;
  actionsSheet(listName(list), [
    { icon: 'showDone', label: prefs.showCompleted ? 'Nascondi le completate' : 'Mostra le completate', fn: () => { prefs.showCompleted = !prefs.showCompleted; savePrefs(); render(); } },
    { icon: 'sortDate', label: prefs.sort === 'due' ? 'Ordine personalizzato' : 'Ordina per scadenza', fn: () => { prefs.sort = prefs.sort === 'due' ? 'manual' : 'due'; savePrefs(); render(); } },
    { icon: 'share', label: 'Esporta / copia / condividi…', fn: () => openExport({ listId: list.id }) },
    { icon: 'rename', label: 'Rinomina elenco', fn: async () => { const v = await askText('Rinomina elenco', list.title); if (v && v !== list.title) { list.title = v; enqueue({ kind: 'list-patch', listId: list.id, body: { title: v } }); saveCache(); render(); } } },
    doneN ? { icon: 'delete', label: `Elimina le completate (${doneN})`, fn: async () => {
      if (!(await confirmBox('Eliminare le completate?', `Verranno eliminate ${plural(doneN, 'attività completata', 'attività completate')}.`))) return;
      for (const t of tasksOf(list.id).filter(isDone)) enqueue({ kind: 'delete', listId: list.id, taskId: t.id });
      store.tasks.set(list.id, tasksOf(list.id).filter((t) => !isDone(t))); saveCache(); render();
    } } : null,
    { icon: 'delete', label: 'Elimina elenco', danger: true, fn: async () => {
      if (!(await confirmBox('Eliminare l’elenco?', `“${listName(list)}” e tutte le sue attività verranno eliminati.`))) return;
      enqueue({ kind: 'list-delete', listId: list.id });
      store.lists = store.lists.filter((l) => l !== list); store.tasks.delete(list.id); saveCache(); back();
    } },
  ]);
}

/* ---------- Esporta / copia / condividi ---------- */
function exportRowsFor(scope, { q, listId, completed }) {
  const rows = [];
  if (scope === 'search') {
    for (const { l, rows: rs } of searchGroups(q, completed)) for (const { t, depth, ctx } of rs) rows.push({ list: l, t, depth, ctx });
    return rows;
  }
  for (const l of scope === 'all' ? store.lists : [findList(listId)].filter(Boolean)) {
    const tasks = tasksOf(l.id);
    for (const { t, depth } of orderActive(tasks)) rows.push({ list: l, t, depth });
    if (completed) tasks.filter(isDone).sort((a, b) => (b.completed || '').localeCompare(a.completed || '')).forEach((t) => rows.push({ list: l, t, depth: 0 }));
  }
  return rows;
}

const exportDate = (iso) => parseDue(iso).toLocaleDateString('it-IT');

function exportPlain(rows, notes) {
  const out = [];
  let cur;
  for (const { list, t, depth, ctx } of rows) {
    if (list !== cur) { if (cur) out.push(''); out.push(list.title.toUpperCase(), '='.repeat(Math.min(list.title.length, 40))); cur = list; }
    const pad = '    '.repeat(depth);
    out.push(`${pad}${isDone(t) ? '[x]' : '[ ]'} ${t.title || '(senza titolo)'}${t.due ? `  (scadenza ${exportDate(t.due)})` : ''}${ctx ? '  (attività di riferimento)' : ''}`);
    if (ctx || !notes) continue;
    for (const line of (t.notes || '').split('\n')) if (line.trim()) out.push(`${pad}      ${line.trim()}`);
    for (const l of t.links || []) out.push(`${pad}      ${l.description || ''} ${l.link}`.trimEnd());
  }
  return out.join('\n') || 'Nessuna attività.';
}

function exportMarkdown(rows, notes, title) {
  const md = (v) => String(v ?? '').replace(/([\\`*_[\]<>#|])/g, '\\$1');
  const out = [`# ${md(title)}`, '', `_Esportato il ${new Date().toLocaleString('it-IT')}_`];
  let cur;
  for (const { list, t, depth, ctx } of rows) {
    if (list !== cur) { out.push('', `## ${md(list.title)}`, ''); cur = list; }
    const pad = '  '.repeat(depth);
    out.push(`${pad}- [${isDone(t) ? 'x' : ' '}] ${md(t.title || '(senza titolo)')}${t.due ? ` — scadenza ${exportDate(t.due)}` : ''}${ctx ? ' _(attività di riferimento)_' : ''}`);
    if (ctx || !notes) continue;
    for (const line of (t.notes || '').split('\n')) if (line.trim()) out.push(`${pad}  ${md(line.trim())}  `);
    for (const l of t.links || []) out.push(`${pad}  [${md(l.description || l.link)}](${l.link})  `);
  }
  if (!rows.length) out.push('', '_Nessuna attività._');
  return out.join('\n') + '\n';
}

function openExport({ q = '', listId = null } = {}) {
  const st = { scope: q ? 'search' : listId ? 'list' : 'all', fmt: 'txt', completed: !!(q && prefs.searchShowDone), notes: true };
  const name = () => (st.scope === 'search' ? `Ricerca “${q}”` : st.scope === 'list' ? listName(findList(listId)) : 'Google Tasks');
  sheet((s) => {
    const box = el('textarea', { class: 'textarea export-view', readonly: true, spellcheck: 'false', 'aria-label': 'Testo da copiare' });
    const chips = el('div');
    const text = () => {
      const rows = exportRowsFor(st.scope, { q, listId, completed: st.completed });
      return st.fmt === 'md' ? exportMarkdown(rows, st.notes, name()) : exportPlain(rows, st.notes);
    };
    const chip = (label, on, fn) => el('button', { class: `pchip${on ? ' on' : ''}`, 'aria-pressed': String(on), onclick: () => { fn(); refresh(); } }, label);
    const refresh = () => {
      chips.replaceChildren(
        el('div', { class: 'chips' },
          q ? chip('Risultati ricerca', st.scope === 'search', () => { st.scope = 'search'; }) : null,
          listId ? chip('Questo elenco', st.scope === 'list', () => { st.scope = 'list'; }) : null,
          chip('Tutti gli elenchi', st.scope === 'all', () => { st.scope = 'all'; })),
        el('div', { class: 'chips' },
          chip('Testo semplice', st.fmt === 'txt', () => { st.fmt = 'txt'; }),
          chip('Markdown', st.fmt === 'md', () => { st.fmt = 'md'; })),
        el('div', { class: 'chips' },
          chip('Con le completate', st.completed, () => { st.completed = !st.completed; }),
          chip('Con note e link', st.notes, () => { st.notes = !st.notes; })));
      box.value = text();
      box.scrollTop = 0;
    };
    const copy = async () => {
      try { await navigator.clipboard.writeText(box.value); toast('Copiato: ora puoi incollarlo dove vuoi'); } catch { box.focus(); box.select(); toast('Seleziona il testo e copialo a mano', { error: true }); }
    };
    const share = async () => {
      try { await navigator.share({ title: name(), text: box.value }); } catch (e) { if (e?.name !== 'AbortError') copy(); }
    };
    const download = () => {
      const ext = st.fmt === 'md' ? 'md' : 'txt';
      const url = URL.createObjectURL(new Blob([box.value], { type: st.fmt === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' }));
      const a = el('a', { href: url, download: `${name().replace(/[\\/:*?"<>|“”]+/g, '_')} ${new Date().toISOString().slice(0, 10)}.${ext}` });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    };
    s.append(el('h2', {}, 'Esporta / copia'), chips, box,
      el('div', { class: 'sheet-footer export-footer' },
        el('button', { class: 'btn primary', onclick: copy }, 'Copia tutto'),
        navigator.share ? el('button', { class: 'btn', onclick: share }, icon('share'), 'Condividi') : null,
        el('button', { class: 'btn', onclick: download }, 'Scarica')));
    refresh();
  });
}

async function newList() {
  const v = await askText('Nuovo elenco', '', { ok: 'Crea' });
  if (!v) return;
  const tempId = `tmp-${uid()}`;
  store.lists.push({ id: tempId, title: v });
  store.tasks.set(tempId, []);
  enqueue({ kind: 'list-create', tempId, title: v });
  saveCache();
  go({ v: 'list', id: tempId });
}

/** Nuova attività (pulsante "+" e condivisione da altre app). */
function openNewTask(prefill = {}) {
  const defList = prefill.listId || (route.v === 'list' ? realId(route.id) : roleId('inbox')) || store.lists[0]?.id;
  if (!defList) { toast('Prima accedi e sincronizza le attività.', { error: true }); return; }
  sheet((s, close) => {
    let due = prefill.due || '';
    const title = el('textarea', { class: 'textarea title-input', rows: 1, placeholder: 'Cosa devi fare?', 'aria-label': 'Titolo', value: prefill.title || '', enterkeyhint: 'done' });
    const notes = el('textarea', { class: 'textarea', rows: 2, placeholder: 'Note (facoltative)', 'aria-label': 'Note', value: prefill.notes || '' });
    const listSel = el('select', { class: 'select', 'aria-label': 'Elenco' }, store.lists.map((l) => { const o = el('option', { value: l.id }, listName(l)); if (l.id === defList) o.selected = true; return o; }));
    const dueRow = el('div', { class: 'chips' });
    const dueUpd = () => dueRow.replaceChildren(...[['Nessuna', ''], ['Oggi', todayISO(0)], ['Domani', todayISO(1)], ['Tra una settimana', todayISO(7)]]
      .map(([l, v]) => el('button', { class: `pchip${due === v ? ' on' : ''}`, onclick: () => { due = v; dueUpd(); } }, l)));
    dueUpd();
    const ctxRow = el('div', { class: 'chips' });
    const ctxUpd = () => {
      const used = new Set(taskContexts({ title: title.value }));
      ctxRow.replaceChildren(...prefs.contexts.map((c) => el('button', {
        class: `pchip${used.has(c) ? ' on' : ''}`,
        onclick: () => { title.value = used.has(c) ? title.value.replace(c, '').replace(/\s{2,}/g, ' ').trim() : `${title.value.trim()} ${c}`; ctxUpd(); autosize(title); },
      }, c)));
    };
    ctxUpd();
    title.addEventListener('input', () => { autosize(title); ctxUpd(); });
    const add = () => {
      const v = title.value.trim();
      if (!v) { title.focus(); return; }
      const data = { title: v };
      if (notes.value.trim()) data.notes = notes.value.trim();
      if (due) data.due = due;
      addTask(listSel.value, data);
      close();
      toast(`Aggiunta a “${listName(findList(listSel.value))}”`);
    };
    title.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });
    s.append(el('h2', {}, 'Nuova attività'), title,
      el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Elenco'), listSel),
      el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Scadenza'), dueRow),
      el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Contesto'), ctxRow),
      el('div', { class: 'field' }, el('span', { class: 'lab' }, 'Note'), notes),
      el('div', { class: 'sheet-footer' }, el('button', { class: 'btn', onclick: close }, 'Annulla'), el('button', { class: 'btn primary', onclick: add }, icon('add'), 'Aggiungi')));
    setTimeout(() => { title.focus(); autosize(title); }, 60);
  });
}

/* =========================================================================
   Avvio
   ========================================================================= */
function bindChrome() {
  $('#backBtn').innerHTML = ICONS.back;
  $('#backBtn').addEventListener('click', back);
  const fab = $('#fab');
  fab.replaceChildren(el('span', { class: 'ico', html: ICONS.add }), 'Nuova');
  fab.setAttribute('aria-label', 'Nuova attività');
  fab.addEventListener('click', () => openNewTask());
  for (const b of document.querySelectorAll('#nav button')) b.addEventListener('click', () => tab(b.dataset.tab));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushEdits();
    else if (Date.now() - store.lastSync > 60_000) syncAll();
  });
  window.addEventListener('pagehide', flushEdits);
  window.addEventListener('online', () => { setOffline(false); flushOutbox().then(() => syncAll()); });
  window.addEventListener('offline', () => setOffline(true));
  setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - store.lastSync > 150_000) syncAll(); }, 30_000);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => render({ soft: true }));
}

function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:' || window.GT_CONFIG?.noServiceWorker) return;
  let started = Date.now(); // avvio o ultimo ritorno nell'app
  // Nuova versione pronta: si applica da sola all'avvio o quando torni nell'app (se non stai scrivendo),
  // altrimenti compare il pulsante "Aggiorna". Prima restava in attesa finché Android non chiudeva l'app.
  const offer = (w) => {
    if (!w || !navigator.serviceWorker.controller) return;
    state.updateReady = w;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (!typing && !pendingEdits.size && Date.now() - started < 20_000) {
      flushEdits();
      w.postMessage('skipWaiting');
    } else renderBanners();
  };
  navigator.serviceWorker.register('sw.js').then((reg) => {
    if (reg.waiting) offer(reg.waiting); // scaricata in una sessione precedente
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed') offer(w); });
    });
    // controllo di nuove versioni a ogni ritorno nell'app
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      started = Date.now();
      if (reg.waiting) offer(reg.waiting); else reg.update().catch(() => {});
    });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
}

async function boot() {
  applyLook();
  bindChrome();
  registerSW();

  // Parametri: condivisione da altre app, "nuova attività", scheda iniziale
  const qs = new URLSearchParams(location.search);
  if (qs.has('title') || qs.has('text') || qs.has('url')) {
    const text = (qs.get('text') || '').trim();
    const url = (qs.get('url') || (text.match(URL_RE) || [])[0] || '').trim();
    const title = (qs.get('title') || text.replace(url, '').split('\n')[0] || url).trim().slice(0, 250);
    sessionStorage.setItem('gt.share', JSON.stringify({ title, notes: [text !== title ? text : '', url && !text.includes(url) ? url : ''].filter(Boolean).join('\n') }));
  }
  if (qs.has('new')) sessionStorage.setItem('gt.share', JSON.stringify({}));
  const startTab = TABS[qs.get('tab')] ? qs.get('tab') : prefs.home;
  if (location.search) history.replaceState(null, '', location.pathname);

  loadCache();
  rememberAccount(auth.profile);
  const r = await auth.handleRedirect();
  route = r?.route ? { ...r.route } : { v: startTab, tab: startTab };
  history.replaceState(route, '');

  if (r?.error && r.error !== 'state') {
    if (r.silent) sessionStorage.setItem('gt.silentFail', String(Date.now()));
    if (!/interaction_required|login_required|consent_required/.test(r.error)) {
      state.loginError = r.error === 'access_denied'
        ? 'Accesso negato: aggiungi questo account agli “Utenti di test” in Google Cloud.'
        : `Errore di accesso: ${r.error}`;
    }
  }

  if (!auth.clientId()) route = { v: 'setup', tab: 'more' };
  else if (!auth.valid()) {
    if (auth.profile && !r?.error) { auth.begin({ silent: true }); return; } // rinnovo silenzioso
    if (!store.lists.length) route = { v: 'login', tab: 'more' };
    else state.authBanner = true;
  }
  history.replaceState(route, '');
  render({ top: true });

  if (auth.valid()) {
    await flushOutbox();
    await syncAll();
  }
  const share = sessionStorage.getItem('gt.share');
  if (share && store.lists.length) {
    sessionStorage.removeItem('gt.share');
    openNewTask({ ...JSON.parse(share), listId: roleId('inbox') });
  }
}

boot();
