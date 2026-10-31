param(
  [Parameter(Mandatory = $true)][string]$StateFile
)

$ErrorActionPreference = "Stop"
$logPath = "$StateFile.log"
try { Start-Transcript -LiteralPath $logPath -Append | Out-Null } catch {}
$stateLines = Get-Content -LiteralPath $StateFile
$archive = $stateLines[0]
$target = $stateLines[1]
$version = $stateLines[2]
if (-not (Test-Path -LiteralPath $archive)) { exit 2 }

# Like the macOS updater, install the extension while After Effects remains
# open. After Effects will keep the currently loaded panel in memory; a restart
# loads the newly installed files. If Windows has a file locked, the error
# dialog tells the user to close AE and retry.
try {
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
  } catch {
    $failureMessage = $_.Exception.Message
    Add-Content -LiteralPath $logPath -Value "SceneKeeper update failed: $failureMessage"
    try {
      Add-Type -AssemblyName PresentationFramework
      [System.Windows.MessageBox]::Show("SceneKeeper $version could not be installed. If After Effects is open, close it and retry. Also check that your Windows account can modify:`n$target`n`nDetails: $failureMessage`n`nLog: $logPath", "SceneKeeper update failed") | Out-Null
    } catch {}
    throw
  } finally {
    if ($work -and (Test-Path -LiteralPath $work)) { Remove-Item -LiteralPath $work -Recurse -Force }
  }
} catch {
  try { Stop-Transcript | Out-Null } catch {}
  exit 10
}
try { Stop-Transcript | Out-Null } catch {}

try {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show("SceneKeeper $version is installed. Reopen After Effects to use it.", "SceneKeeper updated") | Out-Null
} catch {}
