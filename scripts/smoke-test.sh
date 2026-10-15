#!/usr/bin/env bash
# Teste de ponta a ponta da API contra um servidor rodando (padrão: http://localhost:3000).
# Uso: BASE_URL=http://localhost:3000 bash scripts/smoke-test.sh
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
JAR="$(mktemp)"
EMAIL="teste$(date +%s)@barber.com"
PASSWORD="senha123"
trap 'rm -f "$JAR"' EXIT

fail() { echo "FALHOU: $*" >&2; exit 1; }
check() { [ "$1" = "$2" ] || fail "$3 (esperado $2, recebido $1)"; echo "ok - $3"; }
status() { curl -s -o /tmp/smoke-body -w "%{http_code}" -b "$JAR" -c "$JAR" "$@"; }
body() { cat /tmp/smoke-body; }
jsonget() { node -e "const d=JSON.parse(require('fs').readFileSync('/tmp/smoke-body','utf8'));console.log(eval('d'+process.argv[1]))" "$1"; }

check "$(status "$BASE_URL/api/health")" 200 "health check com banco de dados"
check "$(status "$BASE_URL/")" 200 "página inicial"

check "$(status "$BASE_URL/api/barbershops")" 200 "lista de barbearias"
[ "$(jsonget '.length')" -ge 1 ] || fail "nenhuma barbearia retornada (rode o seed)"
SHOP_ID="$(jsonget '[0].id')"

check "$(status "$BASE_URL/api/barbershops?search=vintage")" 200 "busca de barbearias"
check "$(status "$BASE_URL/barbershops?search=vintage")" 200 "página de busca"
check "$(status "$BASE_URL/barbershops/$SHOP_ID")" 200 "página da barbearia"
check "$(status "$BASE_URL/barbershops/nao-existe")" 404 "barbearia inexistente retorna 404"

check "$(status "$BASE_URL/api/barbershops/$SHOP_ID")" 200 "detalhes da barbearia"
SERVICE_ID="$(jsonget '.services[0].id')"

DAY="$(node -e "const d=new Date(Date.now()+2*864e5);console.log(d.toISOString().slice(0,10))")"
check "$(status "$BASE_URL/api/barbershops/$SHOP_ID/available-times?date=$DAY")" 200 "horários disponíveis"
SLOT="$(jsonget '[0].date')"
TOTAL_SLOTS="$(jsonget '.length')"
check "$(status "$BASE_URL/api/barbershops/$SHOP_ID/available-times?date=xx")" 400 "data inválida é rejeitada"

check "$(status "$BASE_URL/api/bookings")" 401 "reservas exigem login"
check "$(status -X POST -H 'Content-Type: application/json' -d "{\"serviceId\":\"$SERVICE_ID\",\"date\":\"$SLOT\"}" "$BASE_URL/api/bookings")" 401 "criar reserva exige login"

check "$(status -X POST -H 'Content-Type: application/json' -d "{\"name\":\"Teste\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "$BASE_URL/api/register")" 201 "cadastro de usuário"
check "$(status -X POST -H 'Content-Type: application/json' -d "{\"name\":\"Teste\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" "$BASE_URL/api/register")" 409 "e-mail duplicado é rejeitado"
check "$(status -X POST -H 'Content-Type: application/json' -d '{"name":"T","email":"x","password":"1"}' "$BASE_URL/api/register")" 400 "cadastro inválido é rejeitado"

# Login por e-mail/senha via NextAuth (CSRF + credentials)
check "$(status "$BASE_URL/api/auth/csrf")" 200 "token CSRF"
CSRF="$(jsonget '.csrfToken')"
LOGIN_STATUS="$(status -X POST -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "email=$EMAIL" --data-urlencode "password=$PASSWORD" \
  --data-urlencode "json=true" "$BASE_URL/api/auth/callback/credentials")"
check "$LOGIN_STATUS" 200 "login com e-mail e senha"
check "$(status "$BASE_URL/api/auth/session")" 200 "sessão"
[ "$(jsonget '.user.email')" = "$EMAIL" ] || fail "sessão não contém o usuário logado"
echo "ok - sessão contém o usuário logado"

check "$(status -X POST -H 'Content-Type: application/json' -d "{\"serviceId\":\"$SERVICE_ID\",\"date\":\"$SLOT\"}" "$BASE_URL/api/bookings")" 201 "criar reserva"
BOOKING_ID="$(jsonget '.id')"
check "$(status -X POST -H 'Content-Type: application/json' -d "{\"serviceId\":\"$SERVICE_ID\",\"date\":\"$SLOT\"}" "$BASE_URL/api/bookings")" 409 "horário duplicado é rejeitado"
check "$(status -X POST -H 'Content-Type: application/json' -d "{\"serviceId\":\"$SERVICE_ID\",\"date\":\"2020-01-01T12:00:00.000Z\"}" "$BASE_URL/api/bookings")" 400 "horário no passado é rejeitado"

check "$(status "$BASE_URL/api/barbershops/$SHOP_ID/available-times?date=$DAY")" 200 "horários após a reserva"
[ "$(jsonget '.length')" -eq $((TOTAL_SLOTS - 1)) ] || fail "o horário reservado continua disponível"
echo "ok - horário reservado some da lista"

check "$(status "$BASE_URL/api/bookings")" 200 "listar minhas reservas"
[ "$(jsonget '.confirmed.length')" -eq 1 ] || fail "reserva não aparece em confirmadas"
check "$(status "$BASE_URL/bookings")" 200 "página de agendamentos logado"

check "$(status -X DELETE "$BASE_URL/api/bookings/$BOOKING_ID")" 200 "cancelar reserva"
check "$(status -X DELETE "$BASE_URL/api/bookings/$BOOKING_ID")" 404 "cancelar reserva já cancelada"

echo
echo "Todos os testes passaram."
