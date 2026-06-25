const CLIENT_ID     = "901759899160-nc57f9benv3bcpg46be2i34j60akisvu.apps.googleusercontent.com";
const API_KEY       = "AIzaSyBAs0nQ3lwQQ9P8kVBvngK02KHY56juDvU";
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES        = 'https://www.googleapis.com/auth/drive';

const ROOT_FOLDER    = 'Life-of-Tanja';
const FITNESS_FOLDER = 'Fitness';

const TOKEN_KEY = 'fitness_gtoken';
const folderCache = new Map();

// ── Token persistence ────────────────────────────────────────────────────────

function storeToken(tokenResponse) {
  const data = {
    access_token: tokenResponse.access_token,
    expires_at: Date.now() + tokenResponse.expires_in * 1000,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
  window.gapi.client.setToken({ access_token: data.access_token });
}

function restoreToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.expires_at > Date.now() + 60_000) {
      window.gapi.client.setToken({ access_token: data.access_token });
      return true;
    }
  } catch {}
  return false;
}

export function isTokenValid() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.expires_at > Date.now() + 60_000;
  } catch {}
  return false;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

function waitForGapi() {
  return new Promise((resolve) => {
    if (window.gapi) return resolve();
    const t = setInterval(() => { if (window.gapi) { clearInterval(t); resolve(); } }, 100);
  });
}

export async function initGapi() {
  await waitForGapi();
  return new Promise((resolve, reject) => {
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({ apiKey: API_KEY });
        restoreToken();
        resolve();
      } catch (err) { reject(err); }
    });
  });
}

let tokenClient = null;

export function initTokenClient(onSuccess, onError) {
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (r) => {
      if (r.error) { onError(r); } else { storeToken(r); onSuccess(r); }
    },
  });
}

export function requestAccessToken() {
  const hasStoredToken = !!localStorage.getItem(TOKEN_KEY);
  tokenClient.requestAccessToken({ prompt: hasStoredToken ? '' : 'consent' });
}

export function signOut() {
  const token = window.gapi.client.getToken();
  if (token) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken(null);
    folderCache.clear();
  }
  localStorage.removeItem(TOKEN_KEY);
}

function getToken() {
  return window.gapi.client.getToken()?.access_token;
}

// ── Drive fetch helper ────────────────────────────────────────────────────────

async function driveRequest(url, options = {}) {
  const token = getToken();
  if (!token) throw new Error('Nicht angemeldet – bitte neu einloggen.');
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    if (window.gapi?.client) window.gapi.client.setToken(null);
    throw new Error('SESSION_EXPIRED');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive ${res.status}: ${text}`);
  }
  return res;
}

async function driveListFiles(q) {
  const params = new URLSearchParams({
    q, fields: 'files(id)', spaces: 'drive',
    supportsAllDrives: 'true', includeItemsFromAllDrives: 'true',
  });
  const res = await driveRequest(`https://www.googleapis.com/drive/v3/files?${params}`);
  const data = await res.json();
  return data.files ?? [];
}

async function driveCreateFolder(name, parentId) {
  const body = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) body.parents = [parentId];
  const res = await driveRequest('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.id;
}

// ── Folder helpers ────────────────────────────────────────────────────────────

async function ensureFolder(name, parentId) {
  const key = `${parentId ?? 'root'}:${name}`;
  if (folderCache.has(key)) return folderCache.get(key);

  const q = parentId
    ? `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `name='${name}' and 'root' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const files = await driveListFiles(q);
  const id = files.length > 0 ? files[0].id : await driveCreateFolder(name, parentId);

  folderCache.set(key, id);
  return id;
}

async function getFitnessFolderId() {
  const rootId    = await ensureFolder(ROOT_FOLDER, null);
  const fitnessId = await ensureFolder(FITNESS_FOLDER, rootId);
  return fitnessId;
}

// ── Fitness entry I/O ─────────────────────────────────────────────────────────

function buildMarkdown(date, unit, exercises, runData, energy, note) {
  let fm = `---\ndate: ${date}\nunit: ${unit}\n`;

  if (unit === 'C' && runData) {
    fm += `duration_min: ${runData.duration}\ndistance_km: ${runData.distance}\n`;
  } else {
    fm += `exercises_done:\n${exercises.map(e => `  - ${e}`).join('\n')}\n`;
  }

  fm += `energy_after: ${energy}\n---`;

  return note.trim() ? `${fm}\n\n## Notiz\n\n${note.trim()}\n` : `${fm}\n`;
}

export async function saveFitnessEntry(date, unit, exercises, runData, energy, note) {
  console.log('[Drive] Getting fitness folder...');
  const fitnessId = await getFitnessFolderId();
  console.log('[Drive] Fitness folder ID:', fitnessId);
  const fileName  = `${date}-Fitness.md`;
  const content   = buildMarkdown(date, unit, exercises, runData, energy, note);

  const files = await driveListFiles(
    `name='${fileName}' and '${fitnessId}' in parents and trashed=false`
  );

  if (files.length > 0) {
    const fileId = files[0].id;
    console.log('[Drive] Updating existing file:', fileId);
    await driveRequest(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      { method: 'PATCH', headers: { 'Content-Type': 'text/markdown; charset=utf-8' }, body: content }
    );
    console.log('[Drive] File updated successfully');
    return fileId;
  }
  console.log('[Drive] Creating new file:', fileName);

  const metadata = { name: fileName, mimeType: 'text/markdown', parents: [fitnessId] };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'text/markdown' }), fileName);
  const created = await driveRequest(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    { method: 'POST', body: form }
  );
  return (await created.json()).id;
}
