#!/bin/sh
# Arma index.html (GitHub Pages) a partir de Pagina.html, agregando el manifiesto y el ícono.
cd "$(dirname "$0")/.."
sed 's#<title>Finanzas por voz</title>#<title>Finanzas por voz</title>\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icono-192.png">\n<link rel="apple-touch-icon" href="icono-192.png">\n<meta name="theme-color" content="\#1f5f4a">#' Pagina.html > index.html
grep -c manifest index.html
