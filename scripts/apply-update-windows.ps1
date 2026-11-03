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
$resultPath = "$StateFile.result"
if (-not (Test-Path -LiteralPath $archive)) {
  try { Set-Content -LiteralPath $resultPath -Value @("ERROR", "The update archive is missing.") -Encoding UTF8 } catch {}
  exit 2
}

# Install the extension while After Effects remains open. The loaded panel keeps
# running from memory; close and reopen the SceneKeeper panel after installation
# to load the new files. After Effects does not need to restart.
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
    try { Set-Content -LiteralPath $resultPath -Value @("ERROR", $failureMessage) -Encoding UTF8 } catch {}
    throw
  } finally {
    if ($work -and (Test-Path -LiteralPath $work)) { Remove-Item -LiteralPath $work -Recurse -Force }
  }
} catch {
  try { Stop-Transcript | Out-Null } catch {}
  exit 10
}
try { Stop-Transcript | Out-Null } catch {}
Set-Content -LiteralPath $resultPath -Value @("INSTALLED", $version) -Encoding UTF8
