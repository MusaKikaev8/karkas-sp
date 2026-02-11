const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const get = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return m ? m[1].trim() : '';
};

const url = get('NEXT_PUBLIC_SUPABASE_URL');
const key = get('SUPABASE_SERVICE_ROLE_KEY');

if (!url || !key) {
  console.error('Missing Supabase URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: 'Bearer ' + key,
  'Content-Type': 'application/json',
};

const normalize = (s) => {
  if (!s) return s;
  const str = String(s);
  return str.toLowerCase().startsWith('sp') ? 'ÑÏ' + str.slice(2) : str;
};

const fetchJson = async (u) => {
  const res = await fetch(u, { headers });
  const text = await res.text();
  if (!res.ok) throw new Error(res.status + ' ' + text);
  return text ? JSON.parse(text) : [];
};

const patchJson = async (u, body) => {
  const res = await fetch(u, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(res.status + ' ' + text);
  return text ? JSON.parse(text) : [];
};

(async () => {
  let updated = 0;

  console.log('Updating sp_documents...');
  {
    const rows = await fetchJson(url + '/rest/v1/sp_documents?select=id,code');
    for (const r of rows) {
      const n = normalize(r.code);
      if (n !== r.code) {
        await patchJson(
          url + '/rest/v1/sp_documents?id=eq.' + encodeURIComponent(r.id),
          { code: n }
        );
        updated++;
      }
    }
  }

  console.log('Updating sp_clauses...');
  {
    const rows = await fetchJson(url + '/rest/v1/sp_clauses?select=id,sp_code');
    for (const r of rows) {
      const n = normalize(r.sp_code);
      if (n !== r.sp_code) {
        await patchJson(
          url + '/rest/v1/sp_clauses?id=eq.' + encodeURIComponent(r.id),
          { sp_code: n }
        );
        updated++;
      }
    }
  }

  console.log('Updating sp_clause_texts...');
  {
    const rows = await fetchJson(
      url + '/rest/v1/sp_clause_texts?select=sp_code,clause_id'
    );
    for (const r of rows) {
      const n = normalize(r.sp_code);
      if (n !== r.sp_code) {
        await patchJson(
          url +
            '/rest/v1/sp_clause_texts?sp_code=eq.' +
            encodeURIComponent(r.sp_code) +
            '&clause_id=eq.' +
            encodeURIComponent(r.clause_id),
          { sp_code: n }
        );
        updated++;
      }
    }
  }

  console.log('Updating comments...');
  {
    const rows = await fetchJson(url + '/rest/v1/comments?select=id,entity_key');
    for (const r of rows) {
      const keyStr = String(r.entity_key || '');
      if (!keyStr.toLowerCase().startsWith('sp')) continue;
      const n = normalize(keyStr);
      if (n !== keyStr) {
        await patchJson(
          url + '/rest/v1/comments?id=eq.' + encodeURIComponent(r.id),
          { entity_key: n }
        );
        updated++;
      }
    }
  }

  console.log('Done. Updated rows:', updated);
})();
