# Upload Artist Image to R2 via Worker (PowerShell)
#
# Usage:
#   .\upload-artist-image.ps1 peso-pluma.jpg
#   .\upload-artist-image.ps1 .\photos\junior-h.jpg junior-h

param(
    [Parameter(Mandatory=$true)]
    [string]$ImageFile,

    [Parameter(Mandatory=$false)]
    [string]$ArtistSlug
)

# API configuration
$API_URL = "https://blacksheep-api.bstabs.workers.dev"
$API_KEY = "your-admin-api-key-here"  # Reemplazar con tu API key real

# Verificar que el archivo existe
if (-not (Test-Path $ImageFile)) {
    Write-Host "❌ Error: Archivo no encontrado: $ImageFile" -ForegroundColor Red
    exit 1
}

# Obtener información del archivo
$fileInfo = Get-Item $ImageFile
$extension = $fileInfo.Extension.TrimStart('.')
$baseName = $fileInfo.BaseName

# Determinar el slug del artista
if (-not $ArtistSlug) {
    $ArtistSlug = $baseName
}

$filename = "$ArtistSlug.$extension"

# Determinar content type
$contentType = switch ($extension.ToLower()) {
    { $_ -in @('jpg', 'jpeg') } { 'image/jpeg' }
    'png' { 'image/png' }
    'webp' { 'image/webp' }
    default {
        Write-Host "❌ Error: Extensión no soportada: $extension" -ForegroundColor Red
        Write-Host "Soportados: jpg, jpeg, png, webp"
        exit 1
    }
}

Write-Host "📤 Subiendo imagen de artista..." -ForegroundColor Cyan
Write-Host "  Archivo:  $ImageFile"
Write-Host "  Slug:     $ArtistSlug"
Write-Host "  Filename: $filename"
Write-Host ""

# Leer el archivo
$fileBytes = [System.IO.File]::ReadAllBytes($fileInfo.FullName)

# Crear la URL completa
$uploadUrl = "$API_URL/admin/artists/images/$filename"

try {
    # Hacer la petición
    $response = Invoke-WebRequest `
        -Uri $uploadUrl `
        -Method POST `
        -Headers @{
            "x-api-key" = $API_KEY
            "Content-Type" = $contentType
        } `
        -Body $fileBytes `
        -ErrorAction Stop

    Write-Host "✅ Imagen subida exitosamente" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    Write-Host ""
    Write-Host "🌐 URL: $API_URL/artists/images/$filename" -ForegroundColor Green

} catch {
    Write-Host "❌ Error al subir imagen" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Mensaje: $($_.Exception.Message)"

    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Respuesta: $responseBody"
    }

    exit 1
}
