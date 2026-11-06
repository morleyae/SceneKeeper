param(
  [Parameter(Mandatory = $true)][string]$StateFile
)

$ErrorActionPreference = "Stop"
$logPath = "$StateFile.log"
$resultPath = "$StateFile.result"
function Write-UpdateLog([string]$Message) {
  try { [System.IO.File]::AppendAllText($logPath, "$Message`r`n", [System.Text.Encoding]::UTF8) } catch {}
}
function Write-UpdateProgress([string]$Message) {
  $script:currentStage = $Message
  try { [System.IO.File]::WriteAllText($resultPath, "PROGRESS`r`n$Message", [System.Text.Encoding]::UTF8) }
  catch { Write-UpdateLog "Could not write progress ($Message): $($_.Exception.Message)" }
  Write-UpdateLog "Stage: $Message"
}
function Write-UpdateResult([string]$Status, [string]$Message) {
  try {
    [System.IO.File]::WriteAllText(
      $resultPath,
      "$Status`r`n$Message",
      [System.Text.Encoding]::UTF8
    )
  } catch {
    Write-UpdateLog "Could not write installer result ($Status): $($_.Exception.Message)"
    return $false
  }
  return $true
}
$script:currentStage = "Starting the Windows installer."
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
  Write-UpdateLog $message
  exit 2
}
if (-not (Test-Path -LiteralPath $archive)) {
  $message = "The downloaded update ZIP was not found at its saved path. It may have been removed or blocked by security software; retry to download it again."
  Write-UpdateLog "Expected update archive path: $archive"
  Write-UpdateResult "ERROR" $message | Out-Null
  exit 2
}

# Install the extension while After Effects remains open. The loaded panel keeps
# running from memory; close and reopen the SceneKeeper panel after installation
# to load the new files. After Effects does not need to restart.
try {
  Write-UpdateProgress "Preparing a temporary extraction folder."
  $extensionParent = Split-Path -Parent $target
  $work = Join-Path $extensionParent (".SceneKeeper-update-" + [Guid]::NewGuid().ToString("N"))
  $payload = Join-Path $work "SceneKeeper"
  $backup = "$target.update-backup-" + [Guid]::NewGuid().ToString("N")
  New-Item -ItemType Directory -Path $work | Out-Null
  try {
    Write-UpdateProgress "Extracting the update ZIP."
    Expand-Archive -LiteralPath $archive -DestinationPath $work -Force
    Write-UpdateProgress "Checking the extracted SceneKeeper files."
    if (-not (Test-Path -LiteralPath (Join-Path $payload "CSXS\manifest.xml"))) {
      throw "The update archive does not contain a SceneKeeper CEP extension."
    }
    Write-UpdateProgress "Moving the installed SceneKeeper folder aside."
    if (Test-Path -LiteralPath $target) { Move-Item -LiteralPath $target -Destination $backup -ErrorAction Stop }
    Write-UpdateProgress "Placing the new SceneKeeper folder."
    try {
      Move-Item -LiteralPath $payload -Destination $target -ErrorAction Stop
    } catch {
      if (Test-Path -LiteralPath $backup) { Move-Item -LiteralPath $backup -Destination $target -ErrorAction Stop }
      throw
    }
    Write-UpdateProgress "Cleaning up the previous installation and download."
    if (Test-Path -LiteralPath $backup) {
      try { Remove-Item -LiteralPath $backup -Recurse -Force -ErrorAction Stop }
      catch { Write-UpdateLog "Could not remove old installation backup: $($_.Exception.Message)" }
    }
    try { Remove-Item -LiteralPath $archive -Force -ErrorAction Stop }
    catch { Write-UpdateLog "Could not remove downloaded ZIP: $($_.Exception.Message)" }
    try { Remove-Item -LiteralPath $StateFile -Force -ErrorAction Stop }
    catch { Write-UpdateLog "Could not remove installer state file: $($_.Exception.Message)" }
  } catch {
    $failureMessage = "Step '$script:currentStage' failed: $($_.Exception.Message)"
    Write-UpdateResult "ERROR" $failureMessage | Out-Null
    Write-UpdateLog "SceneKeeper update failed: $failureMessage"
    throw
  } finally {
    if ($work -and (Test-Path -LiteralPath $work)) {
      try { Remove-Item -LiteralPath $work -Recurse -Force -ErrorAction Stop }
      catch { Write-UpdateLog "Could not remove temporary extraction folder: $($_.Exception.Message)" }
    }
  }
} catch {
  $failureMessage = "Step '$script:currentStage' failed: $($_.Exception.Message)"
  Write-UpdateResult "ERROR" $failureMessage | Out-Null
  Write-UpdateLog "SceneKeeper update failed: $failureMessage"
  exit 10
}
if (-not (Write-UpdateResult "INSTALLED" $version)) { exit 11 }
