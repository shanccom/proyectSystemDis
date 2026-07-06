param(
    [string]$GatewayUrl = "http://localhost:8080"
)

$Green   = "Green"
$Yellow  = "Yellow"
$Red     = "Red"
$Cyan    = "Cyan"

Write-Host "============================================" -ForegroundColor $Cyan
Write-Host "  SISTEMA DE VOTACION - SIMULACION DE DATOS" -ForegroundColor $Cyan
Write-Host "============================================" -ForegroundColor $Cyan
Write-Host "Gateway: $GatewayUrl`n"

# ---------------------------------------------------------------------------
# 1. Login como admin
# ---------------------------------------------------------------------------
Write-Host "[1/9] Iniciando sesion como administrador..." -ForegroundColor $Yellow
try {
    $adminLogin = @{ email = "admin@gmail.com"; password = "admin123" } | ConvertTo-Json
    $adminResp = Invoke-RestMethod -Uri "$GatewayUrl/api/auth/login" -Method Post `
        -Body $adminLogin -ContentType "application/json"
    $adminToken  = $adminResp.token
    $adminUserId = $adminResp.userId
    Write-Host "  [OK] Admin autenticado (ID: $adminUserId)" -ForegroundColor $Green
} catch {
    Write-Host "  [ERROR] No se pudo autenticar admin. Verifica que los servicios esten ejecutandose." -ForegroundColor $Red
    Write-Host "  Detalle: $_" -ForegroundColor $Red
    exit 1
}

$adminHeaders = @{ Authorization = "Bearer $adminToken" }

# ---------------------------------------------------------------------------
# 2. Registrar votantes de prueba
# ---------------------------------------------------------------------------
Write-Host "`n[2/9] Registrando votantes de prueba..." -ForegroundColor $Yellow
$voterAccounts = @(
    @{ username = "juanperez";   email = "juan@test.com";   password = "123456" }
    @{ username = "marialopez";  email = "maria@test.com";  password = "123456" }
    @{ username = "carlosgomez"; email = "carlos@test.com"; password = "123456" }
    @{ username = "anarojas";    email = "ana@test.com";    password = "123456" }
    @{ username = "pedromartin"; email = "pedro@test.com";  password = "123456" }
)

$voters = @()
foreach ($v in $voterAccounts) {
    try {
        $body = $v | ConvertTo-Json
        $resp = Invoke-RestMethod -Uri "$GatewayUrl/api/auth/register" -Method Post `
            -Body $body -ContentType "application/json"
        $voters += [PSCustomObject]@{ userId = $resp.userId; email = $v.email; username = $v.username }
        Write-Host "  [OK] Registrado: $($v.username) (ID: $($resp.userId))" -ForegroundColor $Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "  [--] Ya existe: $($v.username)" -ForegroundColor $Yellow
            try {
                $loginBody = @{ email = $v.email; password = $v.password } | ConvertTo-Json
                $loginResp = Invoke-RestMethod -Uri "$GatewayUrl/api/auth/login" -Method Post `
                    -Body $loginBody -ContentType "application/json"
                $voters += [PSCustomObject]@{ userId = $loginResp.userId; email = $v.email; username = $v.username }
            } catch {
                Write-Host "  [ERROR] No se pudo obtener ID de $($v.username)" -ForegroundColor $Red
            }
        } else {
            Write-Host "  [ERROR] $($v.username): $_" -ForegroundColor $Red
        }
    }
}

# ---------------------------------------------------------------------------
# 3. Crear eleccion
# ---------------------------------------------------------------------------
Write-Host "`n[3/9] Creando eleccion de prueba..." -ForegroundColor $Yellow
$startDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss")
$endDate   = (Get-Date).AddDays(30).ToString("yyyy-MM-ddTHH:mm:ss")

$electionBody = @{
    title       = "Eleccion de Representantes 2026"
    description = "Votacion para elegir representantes estudiantiles del semestre"
    startDate   = $startDate
    endDate     = $endDate
} | ConvertTo-Json

try {
    $election = Invoke-RestMethod -Uri "$GatewayUrl/api/admin/elections" -Method Post `
        -Body $electionBody -ContentType "application/json" -Headers $adminHeaders
    $electionId = $election.id
    Write-Host "  [OK] Eleccion creada (ID: $electionId): $($election.title)" -ForegroundColor $Green
} catch {
    Write-Host "  [ERROR] No se pudo crear la eleccion: $_" -ForegroundColor $Red
    exit 1
}

# ---------------------------------------------------------------------------
# 4. Agregar candidatos
# ---------------------------------------------------------------------------
Write-Host "`n[4/9] Agregando candidatos..." -ForegroundColor $Yellow
$candidatesData = @(
    @{ name = "Laura Martinez";  party = "Alianza Estudiantil" }
    @{ name = "Roberto Gomez";   party = "Movimiento Universitario" }
    @{ name = "Carla Sanchez";   party = "Frente de Estudiantes" }
)

$candidates = @()
foreach ($c in $candidatesData) {
    try {
        $body = $c | ConvertTo-Json
        $candidate = Invoke-RestMethod -Uri "$GatewayUrl/api/admin/elections/$electionId/candidates" `
            -Method Post -Body $body -ContentType "application/json" -Headers $adminHeaders
        $candidates += $candidate
        Write-Host "  [OK] $($c.name) - $($c.party) (ID: $($candidate.id))" -ForegroundColor $Green
    } catch {
        Write-Host "  [ERROR] No se pudo agregar candidato $($c.name): $_" -ForegroundColor $Red
    }
}

# ---------------------------------------------------------------------------
# 5. Abrir eleccion
# ---------------------------------------------------------------------------
Write-Host "`n[5/9] Abriendo eleccion para votacion..." -ForegroundColor $Yellow
try {
    Invoke-RestMethod -Uri "$GatewayUrl/api/admin/elections/$electionId/status?status=OPEN" `
        -Method Put -Headers $adminHeaders | Out-Null
    Write-Host "  [OK] Eleccion abierta" -ForegroundColor $Green
} catch {
    Write-Host "  [ERROR] No se pudo abrir la eleccion: $_" -ForegroundColor $Red
    exit 1
}

# ---------------------------------------------------------------------------
# 6. Obtener tokens de los votantes
# ---------------------------------------------------------------------------
Write-Host "`n[6/9] Obteniendo tokens de votantes..." -ForegroundColor $Yellow
$voterTokens = @()
foreach ($v in $voters) {
    try {
        $loginBody = @{ email = $v.email; password = "123456" } | ConvertTo-Json
        $resp = Invoke-RestMethod -Uri "$GatewayUrl/api/auth/login" -Method Post `
            -Body $loginBody -ContentType "application/json"
        $voterTokens += [PSCustomObject]@{
            userId   = $resp.userId
            token    = $resp.token
            username = $v.username
        }
        Write-Host "  [OK] Token obtenido: $($v.username)" -ForegroundColor $Green
    } catch {
        Write-Host "  [ERROR] Login fallo para $($v.username): $_" -ForegroundColor $Red
    }
}

# ---------------------------------------------------------------------------
# 7. Emitir votos (distribucion: Laura x2, Roberto x2, Carla x1)
# ---------------------------------------------------------------------------
Write-Host "`n[7/9] Emitiendo votos..." -ForegroundColor $Yellow
$voteDistribution = @(
    @{ candidateIndex = 0; label = "Laura Martinez" }
    @{ candidateIndex = 1; label = "Roberto Gomez" }
    @{ candidateIndex = 0; label = "Laura Martinez" }
    @{ candidateIndex = 2; label = "Carla Sanchez" }
    @{ candidateIndex = 1; label = "Roberto Gomez" }
)

for ($i = 0; $i -lt $voterTokens.Count; $i++) {
    $vt = $voterTokens[$i]
    $vd = $voteDistribution[$i]
    $candidateId = $candidates[$vd.candidateIndex].id

    try {
        $voteBody = @{
            userId      = $vt.userId
            electionId  = $electionId
            candidateId = $candidateId
        } | ConvertTo-Json

        $voteHeaders = @{ Authorization = "Bearer $($vt.token)" }
        $resp = Invoke-RestMethod -Uri "$GatewayUrl/api/votes" -Method Post `
            -Body $voteBody -ContentType "application/json" -Headers $voteHeaders
        Write-Host "  [OK] $($vt.username) voto por $($vd.label)" -ForegroundColor $Green
    } catch {
        Write-Host "  [ERROR] Voto de $($vt.username) fallo: $_" -ForegroundColor $Red
    }
}

# ---------------------------------------------------------------------------
# 8. Cerrar eleccion
# ---------------------------------------------------------------------------
Write-Host "`n[8/9] Cerrando eleccion..." -ForegroundColor $Yellow
try {
    Invoke-RestMethod -Uri "$GatewayUrl/api/admin/elections/$electionId/status?status=CLOSED" `
        -Method Put -Headers $adminHeaders | Out-Null
    Write-Host "  [OK] Eleccion cerrada" -ForegroundColor $Green
} catch {
    Write-Host "  [ERROR] No se pudo cerrar la eleccion: $_" -ForegroundColor $Red
}

# ---------------------------------------------------------------------------
# 9. Mostrar resultados
# ---------------------------------------------------------------------------
Write-Host "`n[9/9] Resultados finales:" -ForegroundColor $Yellow
Start-Sleep -Seconds 1

try {
    $adminResults = Invoke-RestMethod -Uri "$GatewayUrl/api/results/$electionId" `
        -Method Get -Headers $adminHeaders
    Write-Host "`n  Titulo: $($adminResults.electionTitle)" -ForegroundColor $Cyan
    Write-Host "  Estado: $($adminResults.status)" -ForegroundColor $Cyan
    Write-Host "  Total de votos: $($adminResults.totalVotes)" -ForegroundColor $Cyan
} catch {
    Write-Host "  [INFO] Resultados del admin no disponibles, consultando servicio de votacion..." -ForegroundColor $Yellow
}

try {
    $candidateResults = Invoke-RestMethod -Uri "$GatewayUrl/api/elections/$electionId/results" `
        -Method Get -Headers $adminHeaders
    Write-Host "`n  Desglose por candidato:" -ForegroundColor $Cyan
    foreach ($r in $candidateResults) {
        $bar = "#" * [Math]::Max($r.votes, 0)
        Write-Host "    $($r.candidateName): $($r.votes) voto(s) $bar" -ForegroundColor $Cyan
    }
} catch {
    Write-Host "  [ERROR] No se pudieron consultar los resultados: $_" -ForegroundColor $Red
}

Write-Host "`n============================================" -ForegroundColor $Green
Write-Host "  SIMULACION COMPLETADA EXITOSAMENTE" -ForegroundColor $Green
Write-Host "============================================" -ForegroundColor $Green
Write-Host "`nResumen:"
Write-Host "  - Eleccion ID: $electionId"
Write-Host "  - Candidatos: $($candidates.Count)"
Write-Host "  - Votantes registrados: $($voters.Count)"
Write-Host "  - Votos emitidos: $($voterTokens.Count)"
Write-Host "`nPuedes visualizar los resultados en http://localhost:5173"
