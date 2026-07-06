param(
    [string]$GatewayUrl = "http://localhost:8080"
)

# ---------------------------------------------------------------------------
# Colores
# ---------------------------------------------------------------------------
$Green  = "Green"
$Yellow = "Yellow"
$Red    = "Red"
$Cyan   = "Cyan"

Write-Host "============================================" -ForegroundColor $Cyan
Write-Host "  SISTEMA DE VOTACION - SIMULACION DE DATOS" -ForegroundColor $Cyan
Write-Host "============================================" -ForegroundColor $Cyan
Write-Host "Gateway: $GatewayUrl`n"

# ---------------------------------------------------------------------------
# 1. Login como administrador
# ---------------------------------------------------------------------------
Write-Host "[1/9] Iniciando sesion como administrador..." -ForegroundColor $Yellow

try {
    $adminLogin = @{
        email    = "admin@gmail.com"
        password = "admin123"
    } | ConvertTo-Json

    $adminResp = Invoke-RestMethod `
        -Uri "$GatewayUrl/api/auth/login" `
        -Method Post `
        -Body $adminLogin `
        -ContentType "application/json"

    $adminToken  = $adminResp.token
    $adminUserId = $adminResp.userId

    Write-Host "  [OK] Admin autenticado (ID: $adminUserId)" -ForegroundColor $Green
}
catch {
    Write-Host "  [ERROR] No se pudo autenticar el administrador." -ForegroundColor $Red
    Write-Host "  Detalle: $_" -ForegroundColor $Red
    exit 1
}

$adminHeaders = @{
    Authorization = "Bearer $adminToken"
}

# ---------------------------------------------------------------------------
# 2. Generar 200 cuentas de votantes
# ---------------------------------------------------------------------------
Write-Host "`n[2/9] Generando lista de 200 votantes..." -ForegroundColor $Yellow

$voterAccounts = @()

for ($i = 1; $i -le 200; $i++) {

    $numero = "{0:D3}" -f $i

    $voterAccounts += @{
        username = "votante$numero"
        email    = "votante$numero@test.com"
        password = "123456"
    }
}

Write-Host "  [OK] Se generaron $($voterAccounts.Count) cuentas." -ForegroundColor $Green

# ---------------------------------------------------------------------------
# 3. Registrar votantes
# ---------------------------------------------------------------------------
Write-Host "`n[3/9] Registrando votantes..." -ForegroundColor $Yellow

$voters = @()

foreach ($v in $voterAccounts) {

    try {

        $body = $v | ConvertTo-Json

        $resp = Invoke-RestMethod `
            -Uri "$GatewayUrl/api/auth/register" `
            -Method Post `
            -Body $body `
            -ContentType "application/json"

        $voters += [PSCustomObject]@{
            userId   = $resp.userId
            username = $v.username
            email    = $v.email
        }

        Write-Host "  [OK] $($v.username) registrado." -ForegroundColor $Green
    }
    catch {

        if ($_.Exception.Response.StatusCode -eq 409) {

            try {

                $loginBody = @{
                    email    = $v.email
                    password = $v.password
                } | ConvertTo-Json

                $loginResp = Invoke-RestMethod `
                    -Uri "$GatewayUrl/api/auth/login" `
                    -Method Post `
                    -Body $loginBody `
                    -ContentType "application/json"

                $voters += [PSCustomObject]@{
                    userId   = $loginResp.userId
                    username = $v.username
                    email    = $v.email
                }

                Write-Host "  [--] $($v.username) ya existía." -ForegroundColor $Yellow
            }
            catch {

                Write-Host "  [ERROR] No fue posible recuperar $($v.username)." -ForegroundColor $Red
            }

        }
        else {

            Write-Host "  [ERROR] $($v.username): $_" -ForegroundColor $Red
        }
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor $Green
Write-Host "Votantes disponibles: $($voters.Count)" -ForegroundColor $Green
Write-Host "============================================" -ForegroundColor $Green

# ---------------------------------------------------------------------------
# 4. Crear elecciones
# ---------------------------------------------------------------------------
Write-Host "`n[4/9] Creando elecciones..." -ForegroundColor $Yellow

$startDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ss")
$endDate   = (Get-Date).AddDays(30).ToString("yyyy-MM-ddTHH:mm:ss")

$electionsInfo = @(
    @{
        title = "Eleccion de Representantes 2026"
        description = "Eleccion de representantes estudiantiles."
    }
    @{
        title = "Eleccion del Consejo Universitario 2026"
        description = "Eleccion de los miembros del consejo universitario."
    }
    @{
        title = "Eleccion del Centro Federado 2026"
        description = "Eleccion de la directiva del centro federado."
    }
)

$elections = @()

foreach ($e in $electionsInfo) {

    try {

        $body = @{
            title       = $e.title
            description = $e.description
            startDate   = $startDate
            endDate     = $endDate
        } | ConvertTo-Json

        $resp = Invoke-RestMethod `
            -Uri "$GatewayUrl/api/admin/elections" `
            -Method Post `
            -Headers $adminHeaders `
            -Body $body `
            -ContentType "application/json"

        $elections += [PSCustomObject]@{
            id         = $resp.id
            title      = $resp.title
            candidates = @()
        }

        Write-Host "  [OK] $($resp.title) creada (ID: $($resp.id))" -ForegroundColor $Green
    }
    catch {

        Write-Host "  [ERROR] No se pudo crear $($e.title)" -ForegroundColor $Red
        Write-Host $_ -ForegroundColor $Red
    }
}

# ---------------------------------------------------------------------------
# 5. Agregar candidatos a cada elección
# ---------------------------------------------------------------------------
Write-Host "`n[5/9] Registrando candidatos..." -ForegroundColor $Yellow

$candidatesTemplate = @(
    @{ name = "Laura Martinez";  party = "Alianza Estudiantil" }
    @{ name = "Roberto Gomez";   party = "Movimiento Universitario" }
    @{ name = "Carla Sanchez";   party = "Frente Estudiantil" }
    @{ name = "Miguel Torres";   party = "Union Academica" }
    @{ name = "Diana Flores";    party = "Nueva Generacion" }
)

foreach ($election in $elections) {

    Write-Host ""
    Write-Host "Eleccion: $($election.title)" -ForegroundColor $Cyan

    foreach ($candidate in $candidatesTemplate) {

        try {

            $body = $candidate | ConvertTo-Json

            $resp = Invoke-RestMethod `
                -Uri "$GatewayUrl/api/admin/elections/$($election.id)/candidates" `
                -Method Post `
                -Headers $adminHeaders `
                -Body $body `
                -ContentType "application/json"

            $election.candidates += $resp

            Write-Host "   [OK] $($candidate.name)" -ForegroundColor $Green
        }
        catch {

            Write-Host "   [ERROR] $($candidate.name)" -ForegroundColor $Red
        }
    }
}

# ---------------------------------------------------------------------------
# 6. Abrir automáticamente todas las elecciones
# ---------------------------------------------------------------------------
Write-Host "`n[6/9] Abriendo elecciones..." -ForegroundColor $Yellow

foreach ($election in $elections) {

    try {

        Invoke-RestMethod `
            -Uri "$GatewayUrl/api/admin/elections/$($election.id)/status?status=OPEN" `
            -Method Put `
            -Headers $adminHeaders | Out-Null

        Write-Host "  [OK] $($election.title) abierta." -ForegroundColor $Green
    }
    catch {

        Write-Host "  [ERROR] No se pudo abrir $($election.title)." -ForegroundColor $Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor $Green
Write-Host "Elecciones creadas : $($elections.Count)" -ForegroundColor $Green

foreach ($election in $elections) {
    Write-Host " - $($election.title) : $($election.candidates.Count) candidatos" -ForegroundColor $Green
}

Write-Host "============================================" -ForegroundColor $Green
# ---------------------------------------------------------------------------
# 7. Obtener tokens de todos los votantes
# ---------------------------------------------------------------------------
Write-Host "`n[7/9] Obteniendo tokens de los votantes..." -ForegroundColor $Yellow

$voterTokens = @()

foreach ($v in $voters) {

    try {

        $loginBody = @{
            email    = $v.email
            password = "123456"
        } | ConvertTo-Json

        $resp = Invoke-RestMethod `
            -Uri "$GatewayUrl/api/auth/login" `
            -Method Post `
            -Body $loginBody `
            -ContentType "application/json"

        $voterTokens += [PSCustomObject]@{
            userId   = $resp.userId
            token    = $resp.token
            username = $v.username
        }

        Write-Host "  [OK] Token obtenido para $($v.username)" -ForegroundColor $Green
    }
    catch {

        Write-Host "  [ERROR] No se pudo iniciar sesion con $($v.username)" -ForegroundColor $Red
    }
}

Write-Host ""
Write-Host "Total de tokens obtenidos: $($voterTokens.Count)" -ForegroundColor $Green

# ---------------------------------------------------------------------------
# 8. Emitir 200 votos por cada elección (600 votos en total)
# ---------------------------------------------------------------------------
Write-Host "`n[8/9] Emitiendo votos..." -ForegroundColor $Yellow

foreach ($election in $elections) {

    Write-Host ""
    Write-Host "Procesando: $($election.title)" -ForegroundColor $Cyan

    foreach ($vt in $voterTokens) {

        # Elegir un candidato aleatorio
        $candidate = Get-Random -InputObject $election.candidates

        $voteBody = @{
            userId      = $vt.userId
            electionId  = $election.id
            candidateId = $candidate.id
        } | ConvertTo-Json

        $voteHeaders = @{
            Authorization = "Bearer $($vt.token)"
        }

        try {

            Invoke-RestMethod `
                -Uri "$GatewayUrl/api/votes" `
                -Method Post `
                -Headers $voteHeaders `
                -Body $voteBody `
                -ContentType "application/json" | Out-Null

            Write-Host "  [OK] $($vt.username) -> $($candidate.name)" -ForegroundColor $Green
        }
        catch {

            Write-Host "  [ERROR] $($vt.username): $_" -ForegroundColor $Red
        }
    }

    Write-Host "  Total de votos emitidos en '$($election.title)': $($voterTokens.Count)" -ForegroundColor $Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor $Green
Write-Host "Simulación de votación completada." -ForegroundColor $Green
Write-Host "Elecciones procesadas : $($elections.Count)" -ForegroundColor $Green
Write-Host "Votantes             : $($voterTokens.Count)" -ForegroundColor $Green
Write-Host "Votos emitidos       : $($voterTokens.Count * $elections.Count)" -ForegroundColor $Green
Write-Host "============================================" -ForegroundColor $Green

