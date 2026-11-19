# Finanzas por voz: guía de instalación

Anota tus gastos hablando: "gasté 15 dólares en ferretería".
**Es gratis:** usa tu propia cuenta de Google, sin pagar nada y sin inteligencia artificial.
Tus datos quedan en tu Google Drive: nadie más los ve, ni siquiera quien te regaló esta herramienta.

Tiempo: unos 15 minutos, una sola vez. Hazlo desde una computadora.

---

## Paso 1. Crea la hoja
1. Entra a tu cuenta de Google y abre **sheets.new** en el navegador. Se crea una hoja en blanco.
2. Arriba a la izquierda, cámbiale el nombre a **Finanzas por voz**.

## Paso 2. Pega el programa
1. En la hoja, ve a **Extensiones → Apps Script**. Se abre otra pestaña.
2. Borra todo lo que hay en `Código.gs` y pega el contenido completo del archivo **Codigo.gs**.
3. A la izquierda, junto a "Archivos", toca **+ → HTML**. Ponle de nombre **Pagina**, sin tilde y sin ".html".
4. Borra lo que trae y pega el contenido completo del archivo **Pagina.html**.
5. Toca el ícono del disquete (**Guardar**).

## Paso 3. Instala la hoja
1. Arriba, en la lista de funciones, elige **instalar** y toca **Ejecutar**.
2. Google pide permiso:
   - Toca **Revisar permisos** y elige tu cuenta.
   - Si sale "Google no ha verificado esta aplicación", es normal: el programa es tuyo, no de una empresa. Toca **Configuración avanzada → Ir a Finanzas por voz (no seguro)** y luego **Permitir**.
3. Vuelve a la pestaña de la hoja. Ya tiene las pestañas **Mes**, **Año**, **Movimientos**, **Categorias** y **Config**, y un menú nuevo, **Finanzas por voz**.

## Paso 4. Publica tu enlace privado
1. En Apps Script, arriba a la derecha: **Implementar → Nueva implementación**.
2. En el engranaje de "Seleccionar tipo", elige **Aplicación web**.
3. Llena así:
   - Descripción: `v1`
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
4. Toca **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).

> "Cualquier usuario" significa que el enlace abre sin iniciar sesión, porque tu teléfono lo necesita así. Para anotar hace falta además **tu clave**, que solo tienes tú.

## Paso 5. Mira tu clave
En la hoja: **Finanzas por voz → Ver mi clave y mi enlace**. Anota la clave.

## Paso 6. Ponlo en tu teléfono
1. Mándate el enlace `/exec` a ti mismo (por correo o WhatsApp) y ábrelo en **Chrome** (en iPhone, en **Safari**).
2. Escribe tu clave y toca **Guardar**. Solo se pide una vez.
3. Toca el botón verde y permite el **micrófono**.
4. Agrégalo a la pantalla de inicio:
   - **Android:** en Chrome, menú **⋮ → Agregar a la pantalla principal** (o **Instalar app**). Ponle un nombre corto, por ejemplo **Gastos**.
   - **iPhone:** en Safari, botón **Compartir → Agregar a inicio**.
5. Desde ahora: tocas el ícono **Gastos**, la página empieza a escuchar sola, dices tu gasto y te responde en voz alta.
6. **Con la voz, sin tocar nada (Android):** di "Hey Google, abre Gastos". Si tu asistente no lo abre, usa el ícono.

## Qué puedes decir
| Dices | Queda anotado |
|---|---|
| "gasté 15 dólares en ferretería" | Gasto de 15 en Ferretería |
| "gasté 23,50 en el mercado con tarjeta" | Gasto de 23,50 en Mercado, pagado con tarjeta |
| "gasté 35 en ferretería para el negocio" | Gasto de 35, marcado **Negocio** |
| "ayer gasté 10 en taxi" | Gasto con la fecha de ayer |
| "me pagaron 200 de sueldo" | Ingreso de 200 en Sueldo |
| "ahorré 30" | Ahorro de 30 |
| "pagué la tarjeta de crédito 100" | Pago de deuda de 100 |
| "cuánto llevo en mercado" | Te dice cuánto gastaste este mes en Mercado |
| "cuánto me queda" | Te dice lo que entró, lo que salió y lo que te queda |
| "borra el último" | Borra lo último que anotaste |

## Adáptalo a ti, sin tocar el programa
- **Categorias:** cambia nombres, presupuestos y sobre todo las **palabras que la activan**. Si en tu país dices "pulpería", "colmado" o "tienda de la esquina", agrégalo a Mercado. Si una frase quedó en "Sin categoría", agrega ahí la palabra que usaste.
- **Config:** tu moneda, tu ingreso, los porcentajes 50/30/20, tus métodos de pago (Nequi, Yape, Sinpe, Pago móvil…) y el idioma de la voz (`es-MX`, `es-CO`, `es-VE`…). Después de cambiar la moneda, usa **Finanzas por voz → Instalar o reparar la hoja** para aplicarla.
- **Mes:** cambia el mes en la celda B2 y elige Todos, Personal o Negocio en B3.

## Si algo falla
- **"Clave incorrecta":** en la página toca **Cambiar clave** y escríbela de nuevo.
- **No escucha:** revisa que Chrome tenga permiso de micrófono. También puedes escribir en el recuadro, y el micrófono del teclado sirve igual.
- **Perdiste el teléfono o compartiste la clave:** **Finanzas por voz → Cambiar la clave**. La anterior deja de servir.
- **Actualizar a una versión nueva:** pega el nuevo Codigo.gs y la nueva Pagina, guarda y en **Implementar → Gestionar implementaciones** edita la tuya y elige **Nueva versión**. Así el enlace no cambia.

---
Hecho para regalar. Licencia MIT: úsalo, tradúcelo, mejóralo y compártelo.
