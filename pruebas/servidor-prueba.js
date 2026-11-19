// Servidor local que imita la web app, para probar Pagina.html sin Google.
// Uso: node pruebas/servidor-prueba.js  → http://localhost:8765/#url=http://localhost:8765/exec&clave=prueba
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.join(__dirname, '..');
const ctx = { module: { exports: {} } }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(raiz, 'Codigo.gs'), 'utf8'), ctx);
const L = ctx.module.exports;
const cats = L.categoriasPorDefecto().map(L.filaACategoria);
const cfg = {}; L.configPorDefecto().forEach(f => { cfg[f[0]] = f[1]; });
const op = { metodos: L.lista_(cfg['Métodos de pago']), palabrasNegocio: L.lista_(cfg['Palabras de negocio']), ambitoDefecto: 'Personal' };

http.createServer((req, res) => {
  if (req.method === 'POST') {
    let b = ''; req.on('data', d => b += d); req.on('end', () => {
      const d = JSON.parse(b);
      const r = L.interpretar(d.texto, cats, op, new Date());
      const msg = d.clave !== 'prueba' ? { ok: false, mensaje: 'Clave incorrecta.' }
        : { ok: true, mensaje: `Anotado: $ ${r.monto} en ${r.categoria}${r.ambito === 'Negocio' ? ' (negocio)' : ''}.`, detalle: r };
      console.log(JSON.stringify(d.texto), '→', msg.mensaje);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(msg));
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(path.join(raiz, 'Pagina.html')));
}).listen(8765, () => console.log('listo en http://localhost:8765'));
