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
  Write-UpdateLog "Resolved install target: $target"
} catch {
  $message = "Could not read the update state file as UTF-8: $($_.Exception.Message)"
  Write-UpdateResult "ERROR" $message | Out-Null
  Write-UpdateLog $message
  exit 2
}
if (-not [System.IO.File]::Exists($archive)) {
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
  $extensionParent = [System.IO.Path]::GetDirectoryName($target)
  if (-not [System.IO.Directory]::Exists($extensionParent)) {
    throw "The SceneKeeper install parent folder does not exist: $extensionParent"
  }
  $work = [System.IO.Path]::Combine($extensionParent, ".SceneKeeper-update-" + [Guid]::NewGuid().ToString("N"))
  $payload = [System.IO.Path]::Combine($work, "SceneKeeper")
  $backup = "$target.update-backup-" + [Guid]::NewGuid().ToString("N")
  [System.IO.Directory]::CreateDirectory($work) | Out-Null
  try {
    Write-UpdateProgress "Extracting the update ZIP."
    Expand-Archive -LiteralPath $archive -DestinationPath $work -Force
    Write-UpdateProgress "Checking the extracted SceneKeeper files."
    if (-not [System.IO.File]::Exists([System.IO.Path]::Combine($payload, "CSXS\manifest.xml"))) {
      throw "The update archive does not contain a SceneKeeper CEP extension."
    }
    Write-UpdateProgress "Moving the installed SceneKeeper folder aside."
    if ([System.IO.Directory]::Exists($target)) { [System.IO.Directory]::Move($target, $backup) }
    Write-UpdateProgress "Placing the new SceneKeeper folder."
    try {
      [System.IO.Directory]::Move($payload, $target)
    } catch {
      if ([System.IO.Directory]::Exists($backup)) { [System.IO.Directory]::Move($backup, $target) }
      throw
    }
    Write-UpdateProgress "Cleaning up the previous installation and download."
    if ([System.IO.Directory]::Exists($backup)) {
      try { [System.IO.Directory]::Delete($backup, $true) }
      catch { Write-UpdateLog "Could not remove old installation backup: $($_.Exception.Message)" }
    }
    try { [System.IO.File]::Delete($archive) }
    catch { Write-UpdateLog "Could not remove downloaded ZIP: $($_.Exception.Message)" }
    try { [System.IO.File]::Delete($StateFile) }
    catch { Write-UpdateLog "Could not remove installer state file: $($_.Exception.Message)" }
  } catch {
    $failureMessage = "Step '$script:currentStage' failed: $($_.Exception.Message)"
    Write-UpdateResult "ERROR" $failureMessage | Out-Null
    Write-UpdateLog "SceneKeeper update failed: $failureMessage"
    throw
  } finally {
    if ($work -and [System.IO.Directory]::Exists($work)) {
      try { [System.IO.Directory]::Delete($work, $true) }
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
