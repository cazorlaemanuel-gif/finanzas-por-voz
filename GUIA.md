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

## Paso 5. Saca tu enlace personal
En la hoja: **Finanzas por voz → Ver mi clave y mi enlace**. Copia el recuadro **"Tu enlace para el teléfono"**: ya lleva dentro tu hoja y tu clave. Mándatelo a ti mismo (WhatsApp contigo mismo o un correo). No lo compartas con nadie.

## Paso 6. Ponlo en tu teléfono
1. Abre tu enlace personal en **Chrome** (en iPhone, en **Safari**). Si se abre dentro de WhatsApp, toca **⋮ → Abrir en Chrome**.
2. Toca el botón verde y **permite el micrófono**. Di "1 café" para probar y luego "borra el último".
3. Instálala como app:
   - **Android:** en Chrome, menú **⋮ → Agregar a la pantalla principal → Instalar**. Queda un ícono llamado **Gastos**.
   - **iPhone:** en Safari, botón **Compartir → Agregar a inicio**.
4. Desde ahora: abres **Gastos**, empieza a escuchar sola, dices "15 mercado" y te responde en voz alta.

## Paso 7 (opcional). Un botón del teléfono que abre Gastos
- **Samsung:** **Ajustes → Funciones avanzadas → Botón lateral → Pulsar dos veces → Abrir aplicación → Gastos**.
- **Xiaomi, Motorola, Pixel y otros:** instala **Button Mapper** (gratis, Play Store), activa su permiso de accesibilidad y asigna, por ejemplo, **pulsación larga de bajar volumen → Aplicación → Gastos**.

> La página pública (cazorlaemanuel-gif.github.io/finanzas-por-voz) es la misma para todos y no guarda datos: solo envía lo que dices a la hoja de cada persona. Abrir el enlace `/exec` directamente también funciona, pero ahí Google bloquea el micrófono y solo sirve el teclado.

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
