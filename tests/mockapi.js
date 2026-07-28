/* A stand-in for the Worker, implementing the same contract so the client can
   be tested for real: same version check, same 409 payload, same routes.
   Node's single thread gives the same serialisation D1's UPDATE ... WHERE
   version = ? gives, which is exactly the property under test. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const DOCS = require('path').join(__dirname, '..', 'docs');
const trains = new Map();          // id -> { version, data }
let writes = 0, conflicts = 0;

const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const send = (code, obj) => {
    res.writeHead(code, {'content-type':'application/json','cache-control':'no-store'});
    res.end(JSON.stringify(obj));
  };

  if (url.pathname.startsWith('/api/trains/')) {
    const id = decodeURIComponent(url.pathname.split('/').pop());

    if (req.method === 'GET') {
      const t = trains.get(id);
      if (!t) return send(404, { ok:false, said:"I can't find that one." });
      return send(200, { ok:true, version:t.version, data:t.data });
    }

    if (req.method === 'PUT') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        const b = JSON.parse(body);
        const t = trains.get(id);
        if (!t) return send(404, { ok:false, said:"I can't find that one." });
        if (b.version !== t.version) {
          conflicts++;
          return send(409, { ok:false, conflict:true, version:t.version, data:t.data,
            said:"Somebody got there a moment before you. Nothing's lost — here's how it stands now." });
        }
        t.data = b.data; t.version++; writes++;
        return send(200, { ok:true, version:t.version });
      });
      return;
    }
  }

  if (url.pathname === '/__stats') return send(200, { writes, conflicts, trains: trains.size });
  if (url.pathname === '/__seed') {
    let body=''; req.on('data',c=>body+=c);
    req.on('end', () => { const b=JSON.parse(body); trains.set(b.id,{version:1,data:b.data});
      writes=0; conflicts=0; send(200,{ok:true}); });
    return;
  }

  // static
  let f = url.pathname === '/' ? '/index.html' : url.pathname;
  const full = path.join(DOCS, f);
  if (!full.startsWith(DOCS) || !fs.existsSync(full)) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, {'content-type': MIME[path.extname(full)] || 'text/plain', 'cache-control':'no-store'});
  res.end(fs.readFileSync(full));
}).listen(8123, () => console.log('mock api + static on :8123'));
