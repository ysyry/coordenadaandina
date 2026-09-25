#!/usr/bin/env bash
# Copia los documentos institucionales a ./documentos para después subirlos a la base.
#
# Estos archivos NO se versionan: el GPS habla de protección de estudiantes y las
# circulares son internas. Viven en el Drive de la escuela; acá sólo hay una copia
# local para trabajar. Si clonás el repo en otra máquina, volvé a correr esto.
#
# Después de copiarlos, para que Areal los sirva:  npm run docs -- subir
#
#   ./scripts/traer-docs.sh /ruta/a/la/carpeta/del/drive
set -e
ORIGEN="${1:-$HOME/Downloads}"
DESTINO="$(dirname "$0")/../documentos"
mkdir -p "$DESTINO"

copiar() {
  local patron="$1" nombre="$2"
  local hallado
  hallado=$(find "$ORIGEN" -name "$patron" -type f 2>/dev/null | head -1)
  if [ -n "$hallado" ]; then
    cp "$hallado" "$DESTINO/$nombre"
    printf '  ok   %-34s %s\n' "$nombre" "$(du -h "$DESTINO/$nombre" | cut -f1)"
  else
    printf '  falta %-33s (no encontré %s)\n' "$nombre" "$patron"
  fi
}

echo "Buscando en $ORIGEN"
copiar "GPS_HojaDeRuta*.pdf"                       "gps-hoja-de-ruta.pdf"
copiar "Hoja_de_ruta_escolar_institucional.png"    "gps-hoja-de-ruta.png"
copiar "Protocolo_de_protección*.m4a"              "gps-protocolo.m4a"
copiar "Circular técnica 01.2026*.pdf"             "circular-01-2026.pdf"
copiar "Circular técnica 02.2026*DJN.pdf"          "circular-02-2026.pdf"
echo
echo "El video Guía_de_Protección_y_Sentido.mp4 (36 MB) no se copia: queda en el Drive."
echo "Ahora subilos a la base:  npm run docs -- subir"
