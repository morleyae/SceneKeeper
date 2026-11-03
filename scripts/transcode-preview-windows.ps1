param(
  [Parameter(Mandatory = $true)][string]$SourcePath,
  [Parameter(Mandatory = $true)][double]$StartSeconds,
  [Parameter(Mandatory = $true)][double]$DurationSeconds,
  [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Wait-WinRtOperation($Operation) {
  while ($Operation.Status.ToString() -eq "Started") {
    Start-Sleep -Milliseconds 100
  }
  if ($Operation.Status.ToString() -ne "Completed") {
    try { $Operation.GetResults() | Out-Null } catch { throw $_.Exception }
    throw "The Windows media operation did not complete."
  }
  return $Operation.GetResults()
}

function Try-WindowsMediaTranscoder {
  try {
    $null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
    $null = [Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime]
    $null = [Windows.Storage.CreationCollisionOption, Windows.Storage, ContentType = WindowsRuntime]
    $null = [Windows.Media.Transcoding.MediaTranscoder, Windows.Media, ContentType = WindowsRuntime]
    $null = [Windows.Media.MediaProperties.MediaEncodingProfile, Windows.Media, ContentType = WindowsRuntime]
    $null = [Windows.Media.MediaProperties.VideoEncodingQuality, Windows.Media, ContentType = WindowsRuntime]

    $sourceFile = Wait-WinRtOperation ([Windows.Storage.StorageFile]::GetFileFromPathAsync($SourcePath))
    $outputFolderPath = [System.IO.Path]::GetDirectoryName($OutputPath)
    $outputName = [System.IO.Path]::GetFileName($OutputPath)
    $outputFolder = Wait-WinRtOperation ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync($outputFolderPath))
    $outputFile = Wait-WinRtOperation ($outputFolder.CreateFileAsync($outputName, [Windows.Storage.CreationCollisionOption]::ReplaceExisting))

    $profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp4([Windows.Media.MediaProperties.VideoEncodingQuality]::Vga)
    $transcoder = New-Object Windows.Media.Transcoding.MediaTranscoder
    $transcoder.AudioProcessingEnabled = $false
    $transcoder.AlwaysReencode = $true
    $transcoder.TrimStartTime = [TimeSpan]::FromSeconds($StartSeconds)
    $transcoder.TrimStopTime = [TimeSpan]::FromSeconds($StartSeconds + $DurationSeconds)

    $prepareResult = Wait-WinRtOperation ($transcoder.PrepareFileTranscodeAsync($sourceFile, $outputFile, $profile))
    if (-not $prepareResult.CanTranscode) {
      throw "Windows cannot decode this HEVC file (reason: $($prepareResult.FailureReason))."
    }
    Wait-WinRtOperation ($prepareResult.TranscodeAsync()) | Out-Null
    if (-not (Test-Path -LiteralPath $OutputPath -PathType Leaf)) {
      throw "Windows completed conversion without creating the preview file."
    }
    return $true
  } catch {
    return $false
  }
}

function Get-PreviewFfmpeg {
  $toolRoot = Join-Path $env:LOCALAPPDATA "SceneKeeper\Tools\FFmpeg"
  $ffmpegPath = Join-Path $toolRoot "bin\ffmpeg.exe"
  if (Test-Path -LiteralPath $ffmpegPath -PathType Leaf) {
    try {
      $null = & $ffmpegPath -hide_banner -version 2>&1
      if ($LASTEXITCODE -eq 0) { return $ffmpegPath }
    } catch {
      # A previous install may have copied ffmpeg.exe without its required DLLs.
    }
  }

  if (-not [Environment]::Is64BitOperatingSystem) {
    throw "Automatic HEVC preview support currently requires 64-bit Windows."
  }

  [Console]::Error.WriteLine("Downloading the one-time HEVC preview component (FFmpeg) from the FFmpeg builds project...")
  New-Item -ItemType Directory -Path $toolRoot -Force | Out-Null
  $extractRoot = Join-Path $env:TEMP ("SceneKeeper-FFmpeg-" + [Guid]::NewGuid().ToString("N"))
  $archivePath = Join-Path $extractRoot "ffmpeg-win64-lgpl.zip"
  $downloadUrl = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-lgpl.zip"
  try {
    New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath -UseBasicParsing
    Expand-Archive -LiteralPath $archivePath -DestinationPath $extractRoot -Force
    $found = Get-ChildItem -LiteralPath $extractRoot -Filter "ffmpeg.exe" -File -Recurse | Select-Object -First 1
    if (-not $found) { throw "The downloaded FFmpeg package did not contain ffmpeg.exe." }

    $toolBin = Join-Path $toolRoot "bin"
    if (Test-Path -LiteralPath $toolBin) {
      Remove-Item -LiteralPath $toolBin -Recurse -Force
    }
    New-Item -ItemType Directory -Path $toolBin -Force | Out-Null
    Copy-Item -Path (Join-Path $found.Directory.FullName "*") -Destination $toolBin -Recurse -Force
    if (-not (Test-Path -LiteralPath $ffmpegPath -PathType Leaf)) {
      throw "The FFmpeg package could not be installed in the local tools folder."
    }
    $null = & $ffmpegPath -hide_banner -version 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw "The installed FFmpeg converter could not start. Its required Windows components may be missing."
    }
    $packageRoot = $found.Directory.Parent.FullName
    $license = Join-Path $packageRoot "LICENSE.txt"
    if (Test-Path -LiteralPath $license) {
      Copy-Item -LiteralPath $license -Destination (Join-Path $toolRoot "FFmpeg-LICENSE.txt") -Force
    }
  } catch {
    throw "Could not download the HEVC preview component. Check your internet connection and try again. Details: $($_.Exception.Message)"
  } finally {
    if (Test-Path -LiteralPath $extractRoot) { Remove-Item -LiteralPath $extractRoot -Recurse -Force -ErrorAction SilentlyContinue }
  }

  return $ffmpegPath
}

try {
  if (Try-WindowsMediaTranscoder) { exit 0 }

  $ffmpeg = Get-PreviewFfmpeg
  $vf = "scale=480:480:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=15"
  $ffmpegArguments = @(
    "-hide_banner", "-loglevel", "error", "-y", "-ss", $StartSeconds.ToString([Globalization.CultureInfo]::InvariantCulture),
    "-i", $SourcePath, "-t", $DurationSeconds.ToString([Globalization.CultureInfo]::InvariantCulture),
    "-vf", $vf, "-an", "-c:v", "h264_mf", "-b:v", "200k", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", $OutputPath
  )
  $conversionLog = (& $ffmpeg @ffmpegArguments 2>&1 | Out-String)
  if ($LASTEXITCODE -ne 0) {
    throw "FFmpeg could not convert this HEVC file. $($conversionLog.Trim())"
  }
  if (-not (Test-Path -LiteralPath $OutputPath -PathType Leaf)) {
    throw "FFmpeg completed without creating the preview file."
  }
  exit 0
} catch {
  $failure = $_.Exception
  while ($failure.InnerException) { $failure = $failure.InnerException }
  [Console]::Error.WriteLine("HEVC preview conversion failed: " + $failure.Message)
  exit 1
}
