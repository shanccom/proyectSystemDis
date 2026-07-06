#!/bin/bash
set -e

GATEWAY="${1:-http://localhost:8080}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

json() { python3 -c "import sys,json; print(json.load(sys.stdin)$1)" 2>/dev/null; }

echo -e "${CYAN}============================================"
echo "  SISTEMA DE VOTACION - SIMULACION DE DATOS"
echo -e "============================================${NC}"
echo -e "Gateway: $GATEWAY\n"

# ─── 1. Login admin ───
echo -e "${YELLOW}[1/9] Iniciando sesion como administrador...${NC}"
ADMIN_RESP=$(curl -sf -X POST "$GATEWAY/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@gmail.com","password":"admin123"}') || {
  echo -e "${RED}[ERROR] No se pudo autenticar admin. Verifica que los servicios esten ejecutandose.${NC}"
  exit 1
}
ADMIN_TOKEN=$(echo "$ADMIN_RESP" | json "['token']")
ADMIN_USER_ID=$(echo "$ADMIN_RESP" | json "['userId']")
echo -e "${GREEN}  [OK] Admin autenticado (ID: $ADMIN_USER_ID)${NC}"

# ─── 2. Registrar votantes ───
echo -e "\n${YELLOW}[2/9] Registrando votantes de prueba...${NC}"

declare -a VOTER_ACCOUNTS=(
  "juanperez|juan@test.com|123456"
  "marialopez|maria@test.com|123456"
  "carlosgomez|carlos@test.com|123456"
  "anarojas|ana@test.com|123456"
  "pedromartin|pedro@test.com|123456"
)

declare -a VOTERS

for entry in "${VOTER_ACCOUNTS[@]}"; do
  IFS='|' read -r username email password <<< "$entry"
  RESP=$(curl -sf -X POST "$GATEWAY/api/auth/register" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$username\",\"email\":\"$email\",\"password\":\"$password\"}") || true

  if [ -n "$RESP" ]; then
    USER_ID=$(echo "$RESP" | json "['userId']")
    VOTERS+=("$USER_ID|$email|$username")
    echo -e "${GREEN}  [OK] Registrado: $username (ID: $USER_ID)${NC}"
  else
    LOGIN_RESP=$(curl -sf -X POST "$GATEWAY/api/auth/login" \
      -H 'Content-Type: application/json' \
      -d "{\"email\":\"$email\",\"password\":\"$password\"}") || {
      echo -e "${RED}  [ERROR] No se pudo obtener ID de $username${NC}"
      continue
    }
    USER_ID=$(echo "$LOGIN_RESP" | json "['userId']")
    VOTERS+=("$USER_ID|$email|$username")
    echo -e "${YELLOW}  [--] Ya existe: $username${NC}"
  fi
done

# ─── 3. Crear eleccion ───
echo -e "\n${YELLOW}[3/9] Creando eleccion de prueba...${NC}"
START_DATE=$(date -u -v-1d "+%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -u -d "yesterday" "+%Y-%m-%dT%H:%M:%S")
END_DATE=$(date -u -v+30d "+%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -u -d "+30 days" "+%Y-%m-%dT%H:%M:%S")

ELECTION_RESP=$(curl -sf -X POST "$GATEWAY/api/admin/elections" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"title\": \"Eleccion de Representantes 2026\",
    \"description\": \"Votacion para elegir representantes estudiantiles del semestre\",
    \"startDate\": \"$START_DATE\",
    \"endDate\": \"$END_DATE\"
  }") || {
  echo -e "${RED}[ERROR] No se pudo crear la eleccion${NC}"
  exit 1
}
ELECTION_ID=$(echo "$ELECTION_RESP" | json "['id']")
echo -e "${GREEN}  [OK] Eleccion creada (ID: $ELECTION_ID)${NC}"

# ─── 4. Agregar candidatos ───
echo -e "\n${YELLOW}[4/9] Agregando candidatos...${NC}"

declare -a CANDIDATES_DATA=(
  "Laura Martinez|Alianza Estudiantil"
  "Roberto Gomez|Movimiento Universitario"
  "Carla Sanchez|Frente de Estudiantes"
)

declare -a CANDIDATES

for entry in "${CANDIDATES_DATA[@]}"; do
  IFS='|' read -r name party <<< "$entry"
  CAND_RESP=$(curl -sf -X POST "$GATEWAY/api/admin/elections/$ELECTION_ID/candidates" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"name\":\"$name\",\"party\":\"$party\"}") || {
    echo -e "${RED}  [ERROR] No se pudo agregar candidato $name${NC}"
    continue
  }
  CAND_ID=$(echo "$CAND_RESP" | json "['id']")
  CANDIDATES+=("$CAND_ID")
  echo -e "${GREEN}  [OK] $name - $party (ID: $CAND_ID)${NC}"
done

# ─── 5. Abrir eleccion ───
echo -e "\n${YELLOW}[5/9] Abriendo eleccion para votacion...${NC}"
curl -sf -X PUT "$GATEWAY/api/admin/elections/$ELECTION_ID/status?status=OPEN" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null && \
  echo -e "${GREEN}  [OK] Eleccion abierta${NC}" || {
  echo -e "${RED}[ERROR] No se pudo abrir la eleccion${NC}"
  exit 1
}

# ─── 6. Obtener tokens de votantes ───
echo -e "\n${YELLOW}[6/9] Obteniendo tokens de votantes...${NC}"
declare -a VOTER_TOKENS
for entry in "${VOTERS[@]}"; do
  IFS='|' read -r userId email username <<< "$entry"
  LOGIN_RESP=$(curl -sf -X POST "$GATEWAY/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"$email\",\"password\":\"123456\"}") || {
    echo -e "${RED}  [ERROR] Login fallo para $username${NC}"
    continue
  }
  TOKEN=$(echo "$LOGIN_RESP" | json "['token']")
  VOTER_TOKENS+=("$userId|$TOKEN|$username")
  echo -e "${GREEN}  [OK] Token obtenido: $username${NC}"
done

# ─── 7. Emitir votos ───
echo -e "\n${YELLOW}[7/9] Emitiendo votos...${NC}"

declare -a VOTE_DISTRIBUTION=(0 1 0 2 1)
declare -a VOTE_LABELS=(
  "Laura Martinez" "Roberto Gomez"
  "Laura Martinez" "Carla Sanchez"
  "Roberto Gomez"
)

for i in "${!VOTER_TOKENS[@]}"; do
  IFS='|' read -r userId token username <<< "${VOTER_TOKENS[$i]}"
  cand_idx=${VOTE_DISTRIBUTION[$i]}
  candidate_id=${CANDIDATES[$cand_idx]}
  label=${VOTE_LABELS[$i]}

  curl -sf -X POST "$GATEWAY/api/votes" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $token" \
    -d "{\"userId\":$userId,\"electionId\":$ELECTION_ID,\"candidateId\":$candidate_id}" \
    > /dev/null && \
    echo -e "${GREEN}  [OK] $username voto por $label${NC}" || \
    echo -e "${RED}  [ERROR] Voto de $username fallo${NC}"
done

# ─── 8. Cerrar eleccion ───
echo -e "\n${YELLOW}[8/9] Cerrando eleccion...${NC}"
curl -sf -X PUT "$GATEWAY/api/admin/elections/$ELECTION_ID/status?status=CLOSED" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null && \
  echo -e "${GREEN}  [OK] Eleccion cerrada${NC}" || \
  echo -e "${YELLOW}  [--] No se pudo cerrar (puede que ya esté cerrada)${NC}"

# ─── 9. Mostrar resultados ───
echo -e "\n${YELLOW}[9/9] Resultados finales:${NC}"
sleep 1

RESULTS=$(curl -sf "$GATEWAY/api/elections/$ELECTION_ID/results" \
  -H "Authorization: Bearer $ADMIN_TOKEN") || {
  echo -e "${RED}  [ERROR] No se pudieron consultar los resultados${NC}"
  exit 1
}

echo -e "\n${CYAN}  Desglose por candidato:${NC}"
echo "$RESULTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for r in data:
    bar = '#' * r['votes']
    print(f'    {r[\"candidateName\"]}: {r[\"votes\"]} voto(s) {bar}')
"

echo -e "\n${GREEN}============================================"
echo "  SIMULACION COMPLETADA EXITOSAMENTE"
echo -e "============================================${NC}"
echo -e "\nResumen:"
echo "  - Eleccion ID: $ELECTION_ID"
echo "  - Candidatos: ${#CANDIDATES[@]}"
echo "  - Votantes registrados: ${#VOTERS[@]}"
echo "  - Votos emitidos: ${#VOTER_TOKENS[@]}"
echo -e "\nPuedes visualizar los resultados en http://localhost:5173"
