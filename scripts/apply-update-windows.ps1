param(
  [Parameter(Mandatory = $true)][string]$StateFile
)

$ErrorActionPreference = "Stop"
$logPath = "$StateFile.log"
try { Start-Transcript -LiteralPath $logPath -Append | Out-Null } catch {}
$resultPath = "$StateFile.result"
function Write-UpdateProgress([string]$Message) {
  try { Set-Content -LiteralPath $resultPath -Value @("PROGRESS", $Message) -Encoding UTF8 } catch {}
  try { Add-Content -LiteralPath $logPath -Value "SceneKeeper update: $Message" } catch {}
}
function Write-UpdateResult([string]$Status, [string]$Message) {
  try {
    [System.IO.File]::WriteAllText(
      $resultPath,
      "$Status`r`n$Message",
      [System.Text.Encoding]::UTF8
    )
  } catch {
    try { Add-Content -LiteralPath $logPath -Value "Could not write installer result ($Status): $($_.Exception.Message)" } catch {}
    return $false
  }
  return $true
}
Write-UpdateProgress "Installer started; reading update state."
try {
  # CEP writes the state file as UTF-8. Windows PowerShell 5 otherwise reads
  # it using the machine's legacy code page, which corrupts paths containing
  # accented characters in a Windows user name or parent folder.
  $stateText = [System.IO.File]::ReadAllText($StateFile, [System.Text.Encoding]::UTF8)
  $stateText = $stateText.TrimStart([char]0xFEFF)
  $stateLines = $stateText -split "`r?`n"
  $archive = $stateLines[0].TrimEnd("`r")
  $target = $stateLines[1].TrimEnd("`r")
  $version = $stateLines[2].TrimEnd("`r")
} catch {
  $message = "Could not read the update state file as UTF-8: $($_.Exception.Message)"
  Write-UpdateResult "ERROR" $message | Out-Null
  try { Add-Content -LiteralPath $logPath -Value $message } catch {}
  exit 2
}
if (-not (Test-Path -LiteralPath $archive)) {
  $message = "The downloaded update ZIP was not found at its saved path. It may have been removed or blocked by security software; retry to download it again."
  try { Add-Content -LiteralPath $logPath -Value "Expected update archive path: $archive" } catch {}
  Write-UpdateResult "ERROR" $message | Out-Null
  exit 2
}

# Install the extension while After Effects remains open. The loaded panel keeps
# running from memory; close and reopen the SceneKeeper panel after installation
# to load the new files. After Effects does not need to restart.
try {
  Write-UpdateProgress "Preparing a temporary extraction folder."
  $work = Join-Path $env:TEMP ([Guid]::NewGuid().ToString("N"))
  $payload = Join-Path $work "SceneKeeper"
  $backup = "$target.update-backup"
  New-Item -ItemType Directory -Path $work | Out-Null
  try {
    Write-UpdateProgress "Extracting the update ZIP."
    Expand-Archive -LiteralPath $archive -DestinationPath $work -Force
    Write-UpdateProgress "Checking the extracted SceneKeeper files."
    if (-not (Test-Path -LiteralPath (Join-Path $payload "CSXS\manifest.xml"))) {
      throw "The update archive does not contain a SceneKeeper CEP extension."
    }
    Write-UpdateProgress "Replacing the installed SceneKeeper files."
    if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Recurse -Force }
    if (Test-Path -LiteralPath $target) { Move-Item -LiteralPath $target -Destination $backup }
    try {
      Move-Item -LiteralPath $payload -Destination $target
    } catch {
      if (Test-Path -LiteralPath $backup) { Move-Item -LiteralPath $backup -Destination $target }
      throw
    }
    Write-UpdateProgress "Cleaning up temporary update files."
    if (Test-Path -LiteralPath $backup) { Remove-Item -LiteralPath $backup -Recurse -Force }
    Remove-Item -LiteralPath $archive -Force
    Remove-Item -LiteralPath $StateFile -Force
  } catch {
    $failureMessage = $_.Exception.Message
    Add-Content -LiteralPath $logPath -Value "SceneKeeper update failed: $failureMessage"
    Write-UpdateResult "ERROR" $failureMessage | Out-Null
    throw
  } finally {
    if ($work -and (Test-Path -LiteralPath $work)) { Remove-Item -LiteralPath $work -Recurse -Force }
  }
} catch {
  try { Stop-Transcript | Out-Null } catch {}
  exit 10
}
try { Stop-Transcript | Out-Null } catch {}
if (-not (Write-UpdateResult "INSTALLED" $version)) { exit 11 }
