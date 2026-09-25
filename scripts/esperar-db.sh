#!/usr/bin/env bash
# Espera a que Postgres acepte conexiones antes de migrar.
set -e
for i in $(seq 1 40); do
  if docker exec areal-db pg_isready -U areal -d areal >/dev/null 2>&1; then
    echo "Postgres listo."
    exit 0
  fi
  sleep 1
done
echo "Postgres no respondió en 40 segundos." >&2
exit 1
