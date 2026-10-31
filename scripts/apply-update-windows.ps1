param(
  [Parameter(Mandatory = $true)][string]$StateFile
)

$ErrorActionPreference = "Stop"
$stateLines = Get-Content -LiteralPath $StateFile
$archive = $stateLines[0]
$target = $stateLines[1]
$version = $stateLines[2]
if (-not (Test-Path -LiteralPath $archive)) { exit 2 }

# Wait until After Effects releases the extension files.
while (Get-Process -Name AfterFX -ErrorAction SilentlyContinue) {
  Start-Sleep -Seconds 2
}

$work = Join-Path $env:TEMP ([Guid]::NewGuid().ToString("N"))
$payload = Join-Path $work "SceneKeeper"
$backup = "$target.update-backup"
New-Item -ItemType Directory -Path $work | Out-Null
try {
  Expand-Archive -LiteralPath $archive -DestinationPath $work -Force
  if (-not (Test-Path -LiteralPath (Join-Path $payload "CSXS\manifest.xml"))) {
    throw "The update archive does not contain a SceneKeeper CEP extension."
  }
  if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Recurse -Force }
  if (Test-Path -LiteralPath $target) { Move-Item -LiteralPath $target -Destination $backup }
  try {
    Move-Item -LiteralPath $payload -Destination $target
  } catch {
    if (Test-Path -LiteralPath $backup) { Move-Item -LiteralPath $backup -Destination $target }
    throw
  }
  if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Recurse -Force }
  Remove-Item -LiteralPath $archive -Force
  Remove-Item -LiteralPath $StateFile -Force
} finally {
  if (Test-Path -LiteralPath $work) { Remove-Item -LiteralPath $work -Recurse -Force }
}

try {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show("SceneKeeper $version is installed. Reopen After Effects to use it.", "SceneKeeper updated") | Out-Null
} catch {}
