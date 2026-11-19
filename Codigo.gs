/**
 * Finanzas por voz — v1.0
 * Anota gastos e ingresos hablando: "gasté 15 dólares en ferretería".
 * Gratis: Google Sheets + Apps Script. No usa IA ni servicios de pago.
 * Licencia MIT (ver LICENCIA.txt). Puedes copiarlo, traducirlo y regalarlo.
 */

var VERSION = '1.0';
var HOJAS = { CONFIG: 'Config', CAT: 'Categorias', MOV: 'Movimientos', MES: 'Mes', ANIO: 'Año' };
var COLS_MOV = ['Fecha', 'Tipo', 'Categoría', 'Grupo', 'Monto', 'Método', 'Ámbito', 'Concepto', 'Texto dictado', 'Origen', 'ID'];
var SIN_CATEGORIA = 'Sin categoría';

// ───────────────────────── Valores iniciales ─────────────────────────

function configPorDefecto() {
  return [
    ['Moneda', '$', 'Símbolo que se muestra en los montos ($, €, S/, Bs., Q, ₡…).'],
    ['Ingreso mensual', 0, 'Tu ingreso de un mes normal. Si este mes anotaste ingresos, se usan esos.'],
    ['% Necesidades', 50, 'Parte del ingreso para lo indispensable.'],
    ['% Deseos', 30, 'Parte del ingreso para gustos.'],
    ['% Futuro', 20, 'Parte del ingreso para ahorro e inversión.'],
    ['Ámbito por defecto', 'Personal', 'Personal o Negocio, cuando no lo dices.'],
    ['Palabras de negocio', 'negocio, empresa, del local, para el local, oficina', 'Si la frase tiene una de estas, se marca Negocio.'],
    ['Métodos de pago', 'efectivo, tarjeta de crédito, tarjeta de débito, tarjeta, pago móvil, zelle, transferencia, paypal, binance, nequi, yape, sinpe', 'Se detectan si dices "con…", "en…" o "por…": "con tarjeta", "en efectivo".'],
    ['Idioma de la voz', 'es-ES', 'Código del idioma para escuchar y hablar (es-ES, es-MX, es-VE, es-CO, es-AR…).'],
    ['Página de voz', 'https://cazorlaemanuel-gif.github.io/finanzas-por-voz/', 'Página pública que escucha tu voz. No guarda datos: se conecta a tu hoja con tu enlace y tu clave.']
  ];
}

// [Categoría, Grupo, Presupuesto mensual, Palabras]
function categoriasPorDefecto() {
  return [
    ['Mercado', 'Necesidades', 0, 'mercado, supermercado, abasto, bodega, víveres, comida de la casa, carnicería, panadería, verduras, frutas, charcutería'],
    ['Ferretería', 'Necesidades', 0, 'ferretería, ferre, tornillos, herramientas, pintura, materiales, clavos, cemento'],
    ['Transporte', 'Necesidades', 0, 'transporte, gasolina, combustible, taxi, pasaje, bus, autobús, metro, uber, estacionamiento, peaje, mecánico, repuesto'],
    ['Vivienda', 'Necesidades', 0, 'renta, alquiler, arriendo, condominio, hipoteca'],
    ['Servicios', 'Necesidades', 0, 'luz, electricidad, agua, gas, internet, teléfono, celular, recarga, saldo, cable'],
    ['Salud', 'Necesidades', 0, 'salud, farmacia, medicina, medicinas, médico, doctor, consulta, dentista, exámenes, laboratorio'],
    ['Educación', 'Necesidades', 0, 'colegio, escuela, universidad, curso, matrícula, útiles, libros'],
    ['Cuidado personal', 'Necesidades', 0, 'peluquería, barbería, corte de pelo, champú, jabón, aseo, higiene'],
    ['Mascota', 'Necesidades', 0, 'mascota, perro, gato, veterinario, perrarina, gatarina'],
    ['Seguro', 'Necesidades', 0, 'seguro, póliza'],
    ['Comida afuera', 'Deseos', 0, 'restaurante, comida afuera, almuerzo, cena, desayuno, pizza, hamburguesa, arepa, empanada, cafetería, café, helado, delivery'],
    ['Ropa', 'Deseos', 0, 'ropa, zapatos, camisa, pantalón, vestido'],
    ['Salidas', 'Deseos', 0, 'salida, cine, fiesta, bar, cerveza, discoteca, paseo, entretenimiento'],
    ['Suscripciones', 'Deseos', 0, 'suscripción, netflix, spotify, streaming, youtube, disney'],
    ['Regalos', 'Deseos', 0, 'regalo, cumpleaños'],
    ['Donaciones', 'Deseos', 0, 'donación, ofrenda, diezmo, caridad'],
    ['Gimnasio', 'Deseos', 0, 'gimnasio, gym'],
    ['Viajes', 'Deseos', 0, 'viaje, hotel, vuelo, boleto de avión'],
    ['Compras varias', 'Deseos', 0, 'compras, tienda, amazon, electrónica'],
    ['Ahorro', 'Futuro', 0, 'ahorro, ahorros, fondo de emergencia, emergencia'],
    ['Inversión', 'Futuro', 0, 'inversión, acciones, bolsa, cripto, bitcoin'],
    ['Tarjeta de crédito', 'Deudas', 0, 'tarjeta de crédito, pago de la tarjeta'],
    ['Préstamo', 'Deudas', 0, 'préstamo, cuota, deuda, crédito'],
    ['Sueldo', 'Ingreso', 0, 'sueldo, salario, quincena, nómina, pago del trabajo'],
    ['Ventas', 'Ingreso', 0, 'venta, ventas, cliente'],
    ['Otros ingresos', 'Ingreso', 0, 'ingreso, bono, propina, comisión'],
    [SIN_CATEGORIA, 'Sin clasificar', 0, '']
  ];
}

// ───────────────────────── Menú ─────────────────────────

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Finanzas por voz')
    .addItem('1. Instalar o reparar la hoja', 'instalar')
    .addItem('2. Ver mi clave y mi enlace', 'verClave')
    .addSeparator()
    .addItem('Probar una frase', 'probarFrase')
    .addItem('Cambiar la clave', 'nuevaClave')
    .addToUi();
}

function obtenerClave_() {
  var props = PropertiesService.getScriptProperties();
  var clave = props.getProperty('CLAVE');
  if (!clave) {
    clave = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    props.setProperty('CLAVE', clave);
  }
  return clave;
}

function nuevaClave() {
  PropertiesService.getScriptProperties().deleteProperty('CLAVE');
  var clave = obtenerClave_();
  SpreadsheetApp.getUi().alert('Clave nueva: ' + clave + '\n\nEscríbela de nuevo en tu teléfono. La anterior ya no sirve.');
}

function verClave() {
  var url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (e) {}
  var clave = obtenerClave_();
  if (!url) {
    SpreadsheetApp.getUi().alert('Tu clave: ' + clave + '\n\nTodavía no hay enlace: falta "Implementar > Nueva implementación > Aplicación web" (ver la guía).');
    return;
  }
  var porDefecto = configPorDefecto().filter(function (f) { return f[0] === 'Página de voz'; })[0][1];
  var pagina = String(leerConfig_(SpreadsheetApp.getActive())['Página de voz'] || porDefecto).trim();
  var personal = pagina ? pagina + '#url=' + encodeURIComponent(url) + '&clave=' + encodeURIComponent(clave) : '';
  var html = '<div style="font:14px/1.5 system-ui,sans-serif">'
    + (personal ? '<p><b>Tu enlace para el teléfono</b> (ya trae tu hoja y tu clave). Mándatelo y ábrelo una vez en Chrome:</p>'
      + '<textarea readonly style="width:100%;height:90px" onclick="this.select()">' + personal + '</textarea>' : '')
    + '<p>Clave: <b>' + clave + '</b><br>Enlace de la hoja: <span style="word-break:break-all">' + url + '</span></p>'
    + '<p style="color:#b03a2e">No compartas este enlace ni la clave: con ellos se puede anotar en tu hoja.</p></div>';
  SpreadsheetApp.getUi().showModalDialog(HtmlService.createHtmlOutput(html).setWidth(520).setHeight(320), 'Tu clave y tu enlace');
}

function probarFrase() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('Probar una frase', 'Escribe lo que dirías, por ejemplo: gasté 15 dólares en ferretería', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  ui.alert(procesar(r.getResponseText(), 'prueba'));
}

// ───────────────────────── Instalación ─────────────────────────

function instalar() {
  var ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(Session.getScriptTimeZone());

  // Config: agrega solo las filas que falten
  var cfg = hoja_(ss, HOJAS.CONFIG);
  if (cfg.getLastRow() === 0) cfg.appendRow(['Ajuste', 'Valor', 'Para qué sirve']);
  var existentes = cfg.getRange(1, 1, cfg.getLastRow(), 1).getValues().map(function (r) { return String(r[0]); });
  configPorDefecto().forEach(function (fila) { if (existentes.indexOf(fila[0]) < 0) cfg.appendRow(fila); });
  estiloEncabezado_(cfg, 3);
  cfg.setColumnWidth(1, 170); cfg.setColumnWidth(2, 260); cfg.setColumnWidth(3, 420);

  // Categorías: solo si está vacía
  var cat = hoja_(ss, HOJAS.CAT);
  if (cat.getLastRow() === 0) {
    cat.appendRow(['Categoría', 'Grupo', 'Presupuesto mensual', 'Palabras que la activan (separadas por coma)']);
    var cats = categoriasPorDefecto();
    cat.getRange(2, 1, cats.length, 4).setValues(cats);
  }
  estiloEncabezado_(cat, 4);
  cat.setColumnWidth(1, 160); cat.setColumnWidth(2, 120); cat.setColumnWidth(3, 150); cat.setColumnWidth(4, 520);
  var grupos = SpreadsheetApp.newDataValidation().requireValueInList(['Necesidades', 'Deseos', 'Futuro', 'Deudas', 'Ingreso', 'Sin clasificar'], true).build();
  cat.getRange('B2:B200').setDataValidation(grupos);

  // Movimientos: solo encabezados
  var mov = hoja_(ss, HOJAS.MOV);
  if (mov.getLastRow() === 0) mov.appendRow(COLS_MOV);
  estiloEncabezado_(mov, COLS_MOV.length);
  mov.getRange('A2:A').setNumberFormat('dd/mm/yyyy hh:mm');
  mov.setColumnWidth(1, 130); mov.setColumnWidth(8, 220); mov.setColumnWidth(9, 260);
  mov.getRange('B2:B').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Gasto', 'Ingreso', 'Ahorro', 'Inversión', 'Pago de deuda'], true).build());
  mov.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(cat.getRange('A2:A200'), true).build());
  mov.getRange('G2:G').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Personal', 'Negocio'], true).build());

  // Las fórmulas se escriben en inglés (con comas). En hojas en español
  // se cambia el idioma un momento y luego se devuelve el del usuario.
  var idiomaHoja = ss.getSpreadsheetLocale();
  if (idiomaHoja !== 'en_US') { ss.setSpreadsheetLocale('en_US'); SpreadsheetApp.flush(); }
  try {
    construirMes_(ss);
    construirAnio_(ss);
    SpreadsheetApp.flush();
  } finally {
    if (idiomaHoja !== 'en_US') { ss.setSpreadsheetLocale(idiomaHoja); SpreadsheetApp.flush(); }
  }
  aplicarMoneda_(ss);

  // Quita la hoja vacía que trae un archivo nuevo
  ss.getSheets().forEach(function (h) {
    var n = h.getName();
    if (['Hoja 1', 'Hoja1', 'Sheet1', 'Sheet 1'].indexOf(n) >= 0 && h.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(h);
  });
  ss.setActiveSheet(ss.getSheetByName(HOJAS.MES));
  obtenerClave_();
  try {
    SpreadsheetApp.getUi().alert('Listo (versión ' + VERSION + ').\n\nSigue con el paso de la guía: Implementar > Nueva implementación > Aplicación web. Luego usa el menú "Finanzas por voz > Ver mi clave y mi enlace".');
  } catch (e) { /* ejecutado desde el editor: no hay ventana */ }
}

function hoja_(ss, nombre) { return ss.getSheetByName(nombre) || ss.insertSheet(nombre); }

function estiloEncabezado_(h, n) {
  h.getRange(1, 1, 1, n).setFontWeight('bold').setBackground('#1f5f4a').setFontColor('#ffffff');
  h.setFrozenRows(1);
}

function construirMes_(ss) {
  var h = hoja_(ss, HOJAS.MES);
  var mes = h.getRange('B2').getValue();
  var ambito = h.getRange('B3').getValue();
  h.clear(); h.clearConditionalFormatRules();
  h.getRange('A2:A3').clearDataValidations();

  var hoy = new Date();
  h.getRange('A1').setValue('Resumen del mes').setFontSize(16).setFontWeight('bold');
  h.getRange('A2').setValue('Mes (primer día):');
  h.getRange('B2').setValue(mes instanceof Date ? mes : new Date(hoy.getFullYear(), hoy.getMonth(), 1)).setNumberFormat('mmmm yyyy');
  h.getRange('B2').setDataValidation(SpreadsheetApp.newDataValidation().requireDate().build());
  h.getRange('A3').setValue('Ver:');
  h.getRange('B3').setValue(ambito || 'Todos');
  h.getRange('B3').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Todos', 'Personal', 'Negocio'], true).build());
  h.getRange('C2').setValue('← cambia el mes aquí');
  h.getRange('C3').setValue('← Todos, Personal o Negocio');
  h.getRange('Z1').setFormula('=IF(B3="Todos","*",B3)');   // filtro de ámbito
  h.hideColumns(26);

  var rango = 'Movimientos!A:A,">="&$B$2,Movimientos!A:A,"<"&EDATE($B$2,1),Movimientos!G:G,$Z$1';

  // Totales del mes
  h.getRange('E1').setValue('Este mes').setFontWeight('bold');
  h.getRange('E2:E4').setValues([['Ingresos'], ['Salidas (gastos, ahorro y deudas)'], ['Te queda']]);
  h.getRange('F2').setFormula('=SUMIFS(Movimientos!E:E,Movimientos!B:B,"Ingreso",' + rango + ')');
  h.getRange('F3').setFormula('=SUMIFS(Movimientos!E:E,Movimientos!B:B,"<>Ingreso",' + rango + ')');
  h.getRange('F4').setFormula('=F2-F3').setFontWeight('bold');

  // 50 / 30 / 20
  h.getRange('H1:L1').setValues([['Grupo', 'Meta %', 'Meta', 'Real', 'Diferencia']]).setFontWeight('bold');
  var base = 'IF($F$2>0,$F$2,IFERROR(VLOOKUP("Ingreso mensual",Config!A:B,2,FALSE),0))';
  var filas = [['Necesidades', '% Necesidades'], ['Deseos', '% Deseos'], ['Futuro', '% Futuro'], ['Deudas', '']];
  filas.forEach(function (f, i) {
    var r = i + 2;
    h.getRange(r, 8).setValue(f[0]);
    h.getRange(r, 9).setFormula(f[1] ? '=IFERROR(VLOOKUP("' + f[1] + '",Config!A:B,2,FALSE)/100,"")' : '=""').setNumberFormat('0%');
    h.getRange(r, 10).setFormula(f[1] ? '=IF(I' + r + '="","",I' + r + '*' + base + ')' : '=""');
    h.getRange(r, 11).setFormula('=SUMIFS(Movimientos!E:E,Movimientos!D:D,H' + r + ',' + rango + ')');
    h.getRange(r, 12).setFormula('=IF(J' + r + '="","",J' + r + '-K' + r + ')');
  });

  // Por categoría
  h.getRange('A7:F7').setValues([['Categoría', 'Grupo', 'Presupuesto', 'Real', 'Queda', '% usado']]).setFontWeight('bold').setBackground('#1f5f4a').setFontColor('#ffffff');
  h.getRange('A8').setFormula('=FILTER({Categorias!A2:A,Categorias!B2:B,Categorias!C2:C},Categorias!A2:A<>"",Categorias!B2:B<>"Ingreso")');
  h.getRange('D8').setFormula('=MAP(A8:A,LAMBDA(c,IF(c="","",SUMIFS(Movimientos!E:E,Movimientos!C:C,c,' + rango + '))))');
  h.getRange('E8').setFormula('=MAP(A8:A,C8:C,D8:D,LAMBDA(c,p,r,IF(OR(c="",p=0,p=""),"",p-r)))');
  h.getRange('F8').setFormula('=MAP(A8:A,C8:C,D8:D,LAMBDA(c,p,r,IF(OR(c="",p=0,p=""),"",r/p)))');
  h.getRange('F8:F').setNumberFormat('0%');

  var rojo = SpreadsheetApp.newConditionalFormatRule().whenNumberLessThan(0).setFontColor('#c0392b').setRanges([h.getRange('E8:E'), h.getRange('L2:L5'), h.getRange('F4')]).build();
  h.setConditionalFormatRules([rojo]);
  h.setColumnWidth(1, 170); h.setColumnWidth(5, 220); h.setColumnWidth(8, 120);
  h.setFrozenRows(7);
}

function construirAnio_(ss) {
  var h = hoja_(ss, HOJAS.ANIO);
  var anio = h.getRange('B1').getValue();
  h.clear();
  h.getRange('A1').setValue('Año:').setFontWeight('bold');
  h.getRange('B1').setValue(anio || new Date().getFullYear()).setNumberFormat('0');
  var cab = ['Mes', 'Ingresos', 'Necesidades', 'Deseos', 'Futuro', 'Deudas', 'Te quedó'];
  h.getRange(3, 1, 1, cab.length).setValues([cab]).setFontWeight('bold').setBackground('#1f5f4a').setFontColor('#ffffff');
  var nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  for (var m = 1; m <= 12; m++) {
    var r = m + 3, ini = 'DATE($B$1,' + m + ',1)';
    var fechas = 'Movimientos!A:A,">="&' + ini + ',Movimientos!A:A,"<"&EDATE(' + ini + ',1)';
    h.getRange(r, 1).setValue(nombres[m - 1]);
    h.getRange(r, 2).setFormula('=SUMIFS(Movimientos!E:E,Movimientos!B:B,"Ingreso",' + fechas + ')');
    ['Necesidades', 'Deseos', 'Futuro', 'Deudas'].forEach(function (g, j) {
      h.getRange(r, 3 + j).setFormula('=SUMIFS(Movimientos!E:E,Movimientos!D:D,"' + g + '",' + fechas + ')');
    });
    h.getRange(r, 7).setFormula('=B' + r + '-SUMIFS(Movimientos!E:E,Movimientos!B:B,"<>Ingreso",' + fechas + ')');
  }
  h.getRange(16, 1).setValue('Total').setFontWeight('bold');
  for (var c = 2; c <= 7; c++) h.getRange(16, c).setFormulaR1C1('=SUM(R4C:R15C)').setFontWeight('bold');
  h.setColumnWidth(1, 120);
}

function aplicarMoneda_(ss) {
  var simbolo = String(leerConfig_(ss)['Moneda'] || '$').replace(/"/g, '');
  var fmt = '"' + simbolo + ' "#,##0.00;-"' + simbolo + ' "#,##0.00';
  ss.getSheetByName(HOJAS.MOV).getRange('E2:E').setNumberFormat(fmt);
  ss.getSheetByName(HOJAS.CAT).getRange('C2:C').setNumberFormat(fmt);
  var mes = ss.getSheetByName(HOJAS.MES);
  ['F2:F4', 'J2:L5', 'C8:E'].forEach(function (a) { mes.getRange(a).setNumberFormat(fmt); });
  ss.getSheetByName(HOJAS.ANIO).getRange('B4:G16').setNumberFormat(fmt);
}

// ───────────────────────── Web app ─────────────────────────

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Pagina')
    .setTitle('Finanzas por voz')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  var datos = {};
  try { datos = JSON.parse(e.postData.contents); } catch (err) { datos = e.parameter || {}; }
  var respuesta;
  if (String(datos.clave || '') !== obtenerClave_()) {
    respuesta = { ok: false, mensaje: 'Clave incorrecta.' };
  } else {
    respuesta = { ok: true, mensaje: procesar(String(datos.texto || ''), datos.origen || 'voz') };
  }
  return ContentService.createTextOutput(JSON.stringify(respuesta)).setMimeType(ContentService.MimeType.JSON);
}

// La llama la página cuando se abre desde el enlace de la web app
function procesarDesdePagina(clave, texto) {
  if (String(clave || '') !== obtenerClave_()) return { ok: false, mensaje: 'Clave incorrecta.' };
  return { ok: true, mensaje: procesar(String(texto || ''), 'voz'), idioma: String(leerConfig_(SpreadsheetApp.getActive())['Idioma de la voz'] || 'es-ES') };
}

// ───────────────────────── Lógica principal ─────────────────────────

function procesar(texto, origen) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = SpreadsheetApp.getActive();
    var cfg = leerConfig_(ss);
    var cats = leerCategorias_(ss);
    var simbolo = String(cfg['Moneda'] || '$');
    var r = interpretar(texto, cats, opcionesDesdeConfig_(cfg), new Date());
    var mov = ss.getSheetByName(HOJAS.MOV);

    if (r.comando === 'ayuda' || r.comando === 'nada') {
      return 'Dime por ejemplo: "gasté 15 dólares en ferretería", "me pagaron 200 de sueldo", "cuánto llevo en mercado" o "borra el último".';
    }
    if (r.comando === 'borrar') {
      var ultima = mov.getLastRow();
      if (ultima < 2) return 'No hay nada que borrar.';
      var v = mov.getRange(ultima, 1, 1, COLS_MOV.length).getValues()[0];
      mov.deleteRow(ultima);
      return 'Borré: ' + monto_(v[4], simbolo) + ' en ' + v[2] + '.';
    }
    if (r.comando === 'consulta') {
      return consultar_(mov, r, simbolo, cats);
    }
    if (!(r.monto > 0)) {
      return 'No entendí el monto. Di por ejemplo: "gasté 15 dólares en ferretería".';
    }
    mov.appendRow([r.fecha, r.tipo, r.categoria, r.grupo, r.monto, r.metodo, r.ambito, r.concepto, texto, origen, Utilities.getUuid().slice(0, 8)]);

    var msg = 'Anotado: ' + monto_(r.monto, simbolo) + ' en ' + r.categoria;
    if (r.ambito === 'Negocio') msg += ' (negocio)';
    msg += '.';
    if (r.categoria === SIN_CATEGORIA) {
      msg += ' No supe la categoría: cámbiala en la hoja o agrega la palabra en Categorías.';
    } else if (r.tipo === 'Gasto') {
      var total = sumarMes_(mov, r.fecha, function (f) { return f[2] === r.categoria; });
      msg += ' Llevas ' + monto_(total, simbolo) + ' este mes';
      var cat = buscarCat_(cats, r.categoria);
      if (cat && cat.presupuesto > 0) {
        var queda = cat.presupuesto - total;
        msg += queda >= 0 ? '; te quedan ' + monto_(queda, simbolo) : '; te pasaste por ' + monto_(-queda, simbolo);
      }
      msg += '.';
    }
    return msg;
  } finally {
    lock.releaseLock();
  }
}

function consultar_(mov, r, simbolo, cats) {
  var ahora = new Date();
  if (r.categoria && r.categoria !== SIN_CATEGORIA) {
    var t = sumarMes_(mov, ahora, function (f) { return f[2] === r.categoria; });
    var c = buscarCat_(cats, r.categoria);
    var m = 'En ' + r.categoria + ' llevas ' + monto_(t, simbolo) + ' este mes';
    if (c && c.presupuesto > 0) m += ' de ' + monto_(c.presupuesto, simbolo) + ' de presupuesto';
    return m + '.';
  }
  var ing = sumarMes_(mov, ahora, function (f) { return f[1] === 'Ingreso'; });
  var gas = sumarMes_(mov, ahora, function (f) { return f[1] !== 'Ingreso'; });
  return 'Este mes: entraron ' + monto_(ing, simbolo) + ' y salieron ' + monto_(gas, simbolo) + '. Te quedan ' + monto_(ing - gas, simbolo) + '.';
}

function sumarMes_(mov, fecha, filtro) {
  var n = mov.getLastRow();
  if (n < 2) return 0;
  var datos = mov.getRange(2, 1, n - 1, 7).getValues();
  var y = fecha.getFullYear(), mo = fecha.getMonth(), total = 0;
  datos.forEach(function (f) {
    var d = f[0];
    if (d instanceof Date && d.getFullYear() === y && d.getMonth() === mo && filtro(f)) total += Number(f[4]) || 0;
  });
  return Math.round(total * 100) / 100;
}

function monto_(n, simbolo) {
  var v = Math.round(Number(n) * 100) / 100;
  var txt = (v % 1 === 0) ? String(v) : v.toFixed(2).replace('.', ',');
  return simbolo + ' ' + txt;
}

function leerConfig_(ss) {
  var h = ss.getSheetByName(HOJAS.CONFIG), out = {};
  if (!h || h.getLastRow() < 2) return out;
  h.getRange(2, 1, h.getLastRow() - 1, 2).getValues().forEach(function (f) { out[String(f[0]).trim()] = f[1]; });
  return out;
}

function leerCategorias_(ss) {
  var h = ss.getSheetByName(HOJAS.CAT);
  if (!h || h.getLastRow() < 2) return [];
  return h.getRange(2, 1, h.getLastRow() - 1, 4).getValues()
    .filter(function (f) { return String(f[0]).trim(); })
    .map(function (f) { return filaACategoria(f); });
}

function opcionesDesdeConfig_(cfg) {
  return {
    metodos: lista_(cfg['Métodos de pago']),
    palabrasNegocio: lista_(cfg['Palabras de negocio']),
    ambitoDefecto: String(cfg['Ámbito por defecto'] || 'Personal').trim() === 'Negocio' ? 'Negocio' : 'Personal'
  };
}

// ═════════════ Lector de frases (funciones puras, sin Google; se prueban con node) ═════════════

function lista_(s) {
  return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x; });
}

function filaACategoria(f) {
  return { nombre: String(f[0]).trim(), grupo: String(f[1]).trim(), presupuesto: Number(f[2]) || 0, palabras: lista_(f[3]) };
}

function buscarCat_(cats, nombre) {
  for (var i = 0; i < cats.length; i++) if (cats[i].nombre === nombre) return cats[i];
  return null;
}

function normalizar(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!;:"“”«»()]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function escapar_(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Busca una palabra o frase completa (admite plural con s/es)
function buscarFrase_(texto, frase) {
  var f = normalizar(frase);
  if (!f) return -1;
  var re = new RegExp('(^|[^a-z0-9])' + escapar_(f) + '(e?s)?(?=[^a-z0-9]|$)');
  var m = re.exec(texto);
  return m ? m.index + m[1].length : -1;
}

var NUM_PALABRAS = {
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiun: 21, veintiuno: 21, veintiuna: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25,
  veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
  cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300, cuatrocientos: 400, cuatrocientas: 400,
  quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700,
  ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900
};
var MONEDA_RE = /^(\$|dolar|dolares|dolars|usd|verdes|pesos|euros|eur|€|bolivares|bs|soles|quetzales|colones|lempiras|reales|guaranies|cordobas|lucas|bolos)$/;

// Convierte "15", "15,50", "1.500", "2.500,75" en número
function leerNumero_(s) {
  s = s.replace(/^\$/, '');
  var tienePunto = s.indexOf('.') >= 0, tieneComa = s.indexOf(',') >= 0;
  if (tienePunto && tieneComa) {
    var dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
    var mil = dec === '.' ? ',' : '.';
    return parseFloat(s.split(mil).join('').replace(dec, '.'));
  }
  var sep = tienePunto ? '.' : (tieneComa ? ',' : '');
  if (!sep) return parseFloat(s);
  var partes = s.split(sep);
  if (partes.length > 2 || partes[partes.length - 1].length === 3) return parseFloat(partes.join(''));
  return parseFloat(partes.join('.'));
}

// Devuelve {monto, inicio, fin} (en tokens) o null
function extraerMonto(texto) {
  var t = texto.replace(/\$\s*(\d)/g, '$ $1').replace(/(\d)\s*\$/g, '$1 $');
  var tokens = t.split(' ').map(function (x) { return x.replace(/[.,]+$/, ''); });
  var candidatos = [];
  for (var i = 0; i < tokens.length; i++) {
    var tok = tokens[i], valor = null, fin = i;
    if (/^\d+([.,]\d+)*$/.test(tok)) {
      valor = leerNumero_(tok);
      if (tokens[i + 1] === 'mil') { valor *= 1000; fin = i + 1; }
      else if (/^millon(es)?$/.test(tokens[i + 1] || '')) { valor *= 1000000; fin = i + 1; }
    } else if (NUM_PALABRAS.hasOwnProperty(tok) || (tok === 'mil')) {
      var total = 0, actual = 0, j = i, ultimo = i;
      while (j < tokens.length) {
        var w = tokens[j];
        if (NUM_PALABRAS.hasOwnProperty(w)) { actual += NUM_PALABRAS[w]; ultimo = j; j++; }
        else if (w === 'mil') { total += (actual || 1) * 1000; actual = 0; ultimo = j; j++; }
        else if (w === 'y' && NUM_PALABRAS.hasOwnProperty(tokens[j + 1] || '')) { j++; }
        else break;
      }
      valor = total + actual; fin = ultimo;
    }
    if (valor === null || isNaN(valor)) continue;
    // centavos: "15 con 50"
    if (tokens[fin + 1] === 'con' && /^\d{1,2}$/.test(tokens[fin + 2] || '')) {
      var c = tokens[fin + 2]; valor += parseInt(c, 10) / (c.length === 1 ? 10 : 100); fin += 2;
    } else if (tokens[fin + 1] === 'y' && tokens[fin + 2] === 'medio') { valor += 0.5; fin += 2; }
    var junto = MONEDA_RE.test(tokens[i - 1] || '') || MONEDA_RE.test(tokens[fin + 1] || '');
    var esArticulo = (tok === 'un' || tok === 'una') && fin === i;
    candidatos.push({ monto: Math.round(valor * 100) / 100, inicio: i, fin: fin, junto: junto, digitos: /\d/.test(tok), articulo: esArticulo });
    i = fin;
  }
  if (!candidatos.length) return null;
  var orden = function (c) { return (c.junto ? 4 : 0) + (c.digitos ? 2 : 0) + (c.articulo ? 0 : 1); };
  candidatos.sort(function (a, b) { return orden(b) - orden(a) || a.inicio - b.inicio; });
  return candidatos[0];
}

function interpretar(textoOriginal, cats, opciones, ahora) {
  opciones = opciones || {};
  var t = normalizar(textoOriginal).replace(/^(oye |ok |hola )?claude[ ,.]*/, '').replace(/[.,]+$/, '').trim();
  var r = { comando: 'anotar', tipo: 'Gasto', monto: 0, categoria: SIN_CATEGORIA, grupo: 'Sin clasificar', metodo: '', ambito: opciones.ambitoDefecto || 'Personal', fecha: ahora, concepto: '' };
  if (!t) { r.comando = 'nada'; return r; }
  if (/^(ayuda|que puedo decir|como funciona)/.test(t)) { r.comando = 'ayuda'; return r; }
  if (/(borra|borrar|elimina|eliminar|deshaz|deshacer|anula|anular|quita|quitar)\b.*\b(ultimo|ultima|anterior)\b/.test(t) || /^(deshacer|deshaz)$/.test(t)) { r.comando = 'borrar'; return r; }
  var esConsulta = /\b(cuanto|cuantos)\b.*\b(llevo|he gastado|gaste|me queda|me quedan|tengo|van|va)\b/.test(t) || /^(resumen|como voy)/.test(t);

  // Método de pago: "con tarjeta", "en efectivo", "por pago movil"
  var metodos = (opciones.metodos || []).slice().sort(function (a, b) { return b.length - a.length; });
  for (var i = 0; i < metodos.length; i++) {
    var mre = new RegExp('(^|\\s)(con|en|por|via|mediante|usando)\\s+(el |la |un |una )?' + escapar_(normalizar(metodos[i])) + '(?=\\s|$)');
    var mm = mre.exec(t);
    if (mm) { r.metodo = metodos[i]; t = (t.slice(0, mm.index) + ' ' + t.slice(mm.index + mm[0].length)).replace(/\s+/g, ' ').trim(); break; }
  }

  // Ámbito
  var negocio = opciones.palabrasNegocio || [];
  for (var k = 0; k < negocio.length; k++) if (buscarFrase_(t, negocio[k]) >= 0) { r.ambito = 'Negocio'; break; }
  if (/\b(personal|para mi|para la casa)\b/.test(t)) r.ambito = 'Personal';

  // Fecha
  if (/\b(antier|anteayer|antes de ayer)\b/.test(t)) r.fecha = new Date(ahora.getTime() - 2 * 86400000);
  else if (/\bayer\b/.test(t)) r.fecha = new Date(ahora.getTime() - 86400000);

  // Tipo por el verbo
  var tipoVerbo = null;
  if (/\b(cobre|recibi|me pagaron|me depositaron|me transfirieron|me enviaron|me mandaron|gane|vendi|entraron|me entraron|ingrese|ingreso de)\b/.test(t)) tipoVerbo = 'Ingreso';
  else if (/\b(ahorre|guarde|aparte|separe)\b/.test(t)) tipoVerbo = 'Ahorro';
  else if (/\b(inverti)\b/.test(t)) tipoVerbo = 'Inversión';
  else if (/\b(abone|pague la tarjeta|pague el prestamo|pague la cuota|pague la deuda)\b/.test(t)) tipoVerbo = 'Pago de deuda';

  // Categoría: la palabra más larga que aparezca
  var mejor = null, mejorLargo = 0;
  var permitidos = { 'Ingreso': ['Ingreso'], 'Ahorro': ['Futuro'], 'Inversión': ['Futuro'], 'Pago de deuda': ['Deudas'] }[tipoVerbo] || null;
  for (var c = 0; c < cats.length; c++) {
    if (permitidos && permitidos.indexOf(cats[c].grupo) < 0) continue;
    var palabras = cats[c].palabras.concat([cats[c].nombre]);
    for (var p = 0; p < palabras.length; p++) {
      var pal = normalizar(palabras[p]);
      if (pal && pal.length > mejorLargo && buscarFrase_(t, pal) >= 0) { mejor = cats[c]; mejorLargo = pal.length; }
    }
  }
  if (!mejor && permitidos) {
    var porDefecto = { 'Ingreso': 'Otros ingresos', 'Ahorro': 'Ahorro', 'Inversión': 'Inversión', 'Pago de deuda': 'Préstamo' }[tipoVerbo];
    mejor = buscarCat_(cats, porDefecto);
  }
  if (mejor) { r.categoria = mejor.nombre; r.grupo = mejor.grupo; }

  var tipoGrupo = { 'Ingreso': 'Ingreso', 'Futuro': 'Ahorro', 'Deudas': 'Pago de deuda' }[r.grupo];
  r.tipo = tipoVerbo || tipoGrupo || 'Gasto';
  if (r.tipo === 'Ahorro' && r.categoria === 'Inversión') r.tipo = 'Inversión';

  if (esConsulta) { r.comando = 'consulta'; if (!mejor) r.categoria = ''; return r; }

  var m = extraerMonto(t);
  if (m) r.monto = m.monto;

  // Concepto: la frase sin "claude" ni "acabo de"
  r.concepto = String(textoOriginal || '').replace(/^\s*(oye |ok |hola )?claude[\s,.]*/i, '').replace(/^acabo de\s+/i, '').trim();
  r.concepto = r.concepto.charAt(0).toUpperCase() + r.concepto.slice(1);
  return r;
}

// Para node (pruebas). En Apps Script no hace nada.
if (typeof module !== 'undefined') {
  module.exports = { interpretar: interpretar, extraerMonto: extraerMonto, normalizar: normalizar, categoriasPorDefecto: categoriasPorDefecto, configPorDefecto: configPorDefecto, filaACategoria: filaACategoria, lista_: lista_ };
}
