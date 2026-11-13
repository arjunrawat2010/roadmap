<#
.SYNOPSIS
  Build the roadmap app and serve it with a local nginx on Windows.

.EXAMPLE
  deploy\deploy.cmd                 # build + start (or reload) on http://localhost:8080/
  deploy\deploy.cmd -Port 9000      # another port
  deploy\deploy.cmd stop            # stop the server

  The first run downloads nginx for Windows from nginx.org into .nginx\bin
  (no install, no admin rights). If nginx is already on PATH it is used instead,
  or pass -Nginx C:\path\to\nginx.exe.
#>
param(
  [ValidateSet('start', 'stop')]
  [string]$Action = 'start',
  [int]$Port = 8080,
  [string]$Nginx = '',
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$NginxVersion = '1.26.2'

$Repo   = Split-Path -Parent $PSScriptRoot
$Prefix = Join-Path $Repo '.nginx'
# nginx wants forward slashes, and -p needs a trailing slash.
$P      = ($Prefix -replace '\\', '/') + '/'
$OnWindows = $env:OS -eq 'Windows_NT'

function Get-NginxExe {
  if ($Nginx) { return (Resolve-Path $Nginx).Path }
  $local = Join-Path $Prefix "bin\nginx-$NginxVersion\nginx.exe"
  if (Test-Path $local) { return $local }
  $onPath = Get-Command nginx -ErrorAction SilentlyContinue
  if ($onPath) { return $onPath.Source }

  Write-Host "==> Downloading nginx $NginxVersion for Windows"
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  $zip = Join-Path $env:TEMP "nginx-$NginxVersion.zip"
  Invoke-WebRequest -UseBasicParsing -Uri "https://nginx.org/download/nginx-$NginxVersion.zip" -OutFile $zip
  Expand-Archive -Path $zip -DestinationPath (Join-Path $Prefix 'bin') -Force
  Remove-Item $zip
  return $local
}

function Test-Running {
  $pidFile = Join-Path $Prefix 'logs\nginx.pid'
  if (-not (Test-Path $pidFile)) { return $false }
  # "$(...)" turns an empty file (null) into "" so .Trim() is safe.
  $procId = "$(Get-Content $pidFile -Raw -ErrorAction SilentlyContinue)".Trim()
  if ($procId -notmatch '^\d+$') { return $false }
  return [bool](Get-Process -Id ([int]$procId) -ErrorAction SilentlyContinue)
}

function Invoke-Nginx([string[]]$Extra) {
  $nginxArgs = @('-p', $P, '-c', 'conf/nginx.conf') + $Extra
  Push-Location (Split-Path $exe)
  try { & $exe @nginxArgs } finally { Pop-Location }
  if ($LASTEXITCODE -ne 0) { throw "nginx $($Extra -join ' ') failed (exit $LASTEXITCODE). See $Prefix\logs\error.log" }
}

$exe = Get-NginxExe

if ($Action -eq 'stop') {
  if (Test-Running) { Invoke-Nginx @('-s', 'quit'); Write-Host 'Stopped.' } else { Write-Host 'Not running.' }
  exit 0
}

Write-Host '==> Building'
Push-Location $Repo
try {
  if (-not (Test-Path 'node_modules')) { npm ci; if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' } }
  npm run build; if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }
} finally { Pop-Location }

Write-Host '==> Writing nginx config'
foreach ($d in 'conf', 'logs', 'temp') { New-Item -ItemType Directory -Force -Path (Join-Path $Prefix $d) | Out-Null }
Copy-Item (Join-Path $Repo 'deploy\mime.types') (Join-Path $Prefix 'conf\mime.types') -Force
$root = (Join-Path $Repo 'dist') -replace '\\', '/'
$conf = (Get-Content (Join-Path $Repo 'deploy\nginx.conf.template') -Raw) -replace '__PORT__', $Port -replace '__ROOT__', $root
# Write UTF-8 without a BOM; nginx can't parse a BOM.
[IO.File]::WriteAllText((Join-Path $Prefix 'conf\nginx.conf'), $conf)
Invoke-Nginx @('-t', '-q')

if (Test-Running) {
  Write-Host '==> Reloading nginx'
  Invoke-Nginx @('-s', 'reload')
} else {
  Write-Host '==> Starting nginx'
  $argLine = "-p `"$P`" -c conf/nginx.conf"
  $sp = @{ FilePath = $exe; ArgumentList = $argLine; WorkingDirectory = (Split-Path $exe) }
  if ($OnWindows) { $sp.WindowStyle = 'Hidden' }
  Start-Process @sp
  Start-Sleep -Seconds 1
  if (-not (Test-Running)) {
    Write-Host "nginx didn't start. Last lines of $Prefix\logs\error.log:" -ForegroundColor Red
    Get-Content (Join-Path $Prefix 'logs\error.log') -Tail 10 -ErrorAction SilentlyContinue
    exit 1
  }
}

$url = "http://localhost:$Port/"
Write-Host "Roadmap is live at $url" -ForegroundColor Green
if ($OnWindows -and -not $NoBrowser) { Start-Process $url }
