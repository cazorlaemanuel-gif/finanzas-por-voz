// Pruebas del lector de frases. Uso: node pruebas/pruebas.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codigo = fs.readFileSync(path.join(__dirname, '..', 'Codigo.gs'), 'utf8');
const ctx = { module: { exports: {} } };
vm.createContext(ctx);
vm.runInContext(codigo, ctx);
const L = ctx.module.exports;

const cats = L.categoriasPorDefecto().map(L.filaACategoria);
const cfg = {};
L.configPorDefecto().forEach(f => { cfg[f[0]] = f[1]; });
const opciones = { metodos: L.lista_(cfg['Métodos de pago']), palabrasNegocio: L.lista_(cfg['Palabras de negocio']), ambitoDefecto: 'Personal' };
const ahora = new Date(2026, 10, 18, 12, 0, 0);

const casos = [
  // [frase, esperado]
  ['Claude, acabo de gastar $15 en ferretería', { monto: 15, categoria: 'Ferretería', tipo: 'Gasto', ambito: 'Personal' }],
  ['acabo de gastar 15 dólares en ferretería', { monto: 15, categoria: 'Ferretería' }],
  ['gasté 23,50 en el mercado', { monto: 23.5, categoria: 'Mercado' }],
  ['gasté 23.50 en el supermercado con tarjeta', { monto: 23.5, categoria: 'Mercado', metodo: 'tarjeta' }],
  ['compré tornillos por 8 dólares en efectivo', { monto: 8, categoria: 'Ferretería', metodo: 'efectivo' }],
  ['pagué 40 de luz', { monto: 40, categoria: 'Servicios', tipo: 'Gasto' }],
  ['pagué la tarjeta de crédito 100 dólares', { monto: 100, categoria: 'Tarjeta de crédito', tipo: 'Pago de deuda', grupo: 'Deudas' }],
  ['gasté 20 en mercado con tarjeta de crédito', { monto: 20, categoria: 'Mercado', metodo: 'tarjeta de crédito' }],
  ['me pagaron 200 de sueldo', { monto: 200, categoria: 'Sueldo', tipo: 'Ingreso' }],
  ['recibí 50 dólares', { monto: 50, categoria: 'Otros ingresos', tipo: 'Ingreso' }],
  ['ahorré 30', { monto: 30, categoria: 'Ahorro', tipo: 'Ahorro', grupo: 'Futuro' }],
  ['gasté quince dólares en gasolina', { monto: 15, categoria: 'Transporte' }],
  ['compré un café por dos dólares', { monto: 2, categoria: 'Comida afuera' }],
  ['gasté veinticinco en pizza', { monto: 25, categoria: 'Comida afuera' }],
  ['gasté ciento veinte dólares en ropa', { monto: 120, categoria: 'Ropa' }],
  ['gasté 1.500 en la renta', { monto: 1500, categoria: 'Vivienda' }],
  ['gasté 15 con 50 en farmacia', { monto: 15.5, categoria: 'Salud' }],
  ['gasté 35 en ferretería para el negocio', { monto: 35, categoria: 'Ferretería', ambito: 'Negocio' }],
  ['ayer gasté 10 en taxi', { monto: 10, categoria: 'Transporte', dia: 17 }],
  ['gasté 12 en algo raro', { monto: 12, categoria: 'Sin categoría' }],
  ['gasté 5 dólares en tornillos, con pago móvil', { monto: 5, categoria: 'Ferretería', metodo: 'pago móvil' }],
  ['borra el último', { comando: 'borrar' }],
  ['deshacer', { comando: 'borrar' }],
  ['cuánto llevo en mercado', { comando: 'consulta', categoria: 'Mercado' }],
  ['cuánto me queda', { comando: 'consulta', categoria: '' }],
  ['ayuda', { comando: 'ayuda' }],
  ['Claude', { comando: 'nada' }],
];

let ok = 0, falla = 0;
for (const [frase, esp] of casos) {
  const r = L.interpretar(frase, cats, opciones, ahora);
  const errores = [];
  for (const k of Object.keys(esp)) {
    const real = k === 'dia' ? r.fecha.getDate() : r[k];
    if (real !== esp[k]) errores.push(`${k}: esperaba ${JSON.stringify(esp[k])}, salió ${JSON.stringify(real)}`);
  }
  if (errores.length) { falla++; console.log('FALLA', JSON.stringify(frase), '→', errores.join('; ')); }
  else { ok++; console.log('OK   ', JSON.stringify(frase)); }
}
console.log(`\n${ok} OK, ${falla} FALLA`);
process.exit(falla ? 1 : 0);
