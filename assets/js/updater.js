(function () {
  const config = window.SceneKeeperUpdateConfig || {};
  const notice = document.getElementById("scene-keeper-update-notice");
  const noticeMessage = document.getElementById("scene-keeper-update-message");
  const retryUpdateButton = document.getElementById("scene-keeper-retry-update");
  const reopenPanelButton = document.getElementById("scene-keeper-reopen-panel");
  const versionLabel = document.getElementById("scene-keeper-version");
  const creatorLink = document.getElementById("scene-keeper-creator-link");
  const CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000;
  const RETRY_INTERVAL_MS = 5 * 60 * 1000;
  const LAST_CHECK_KEY = "scenekeeper.update.lastCheck";
  const PENDING_UPDATE_KEY = "scenekeeper.update.pendingVersion";
  const INSTALLED_VERSION_KEY = "scenekeeper.installedVersion";
  const ARCHIVE_RETRY_KEY = "scenekeeper.update.archiveRetryVersion";
  const CHANGELOG_FEATURE_VERSION = "1.0.26";
  const NO_HISTORY_VERSION_FLOOR = "1.0.16";
  const RELEASE_NOTES = {
    "1.0.17": ["Fixed backups and marker-based clip insertion on systems with older After Effects scripting support."],
    "1.0.18": ["Update messages now explain how to load a newly installed version."],
    "1.0.19": ["Update status now changes when the download and installer start."],
    "1.0.20": ["Made the four clip action buttons smaller and consistent."],
    "1.0.21": ["Added clearer macOS update confirmations and error details."],
    "1.0.22": ["Success and error messages now slide in briefly instead of staying in the panel."],
    "1.0.23": ["Improved the macOS updater so it can keep running while After Effects closes."],
    "1.0.24": ["On macOS, updates can install while After Effects is open."],
    "1.0.25": ["Linked the version number to GitHub releases and the creator name to TikTok."],
    "1.0.26": ["Added this plain-language update summary after installing a new version."],
    "1.0.27": ["The Settings heading now stays at the top, with the close button out of its way."],
    "1.0.28": [
      "Windows can now install updates while After Effects stays open, like macOS.",
      "Restarting the extension no longer creates another backup if one was saved in the last 10 minutes."
    ],
    "1.0.29": ["The full “by morley.ae” credit now links to TikTok."],
    "1.0.30": ["The Random Clips Between Markers button now matches the height of the other clip buttons."],
    "1.0.31": ["Fixed saved clip previews when the default cache folder is missing or cannot be written; SceneKeeper can now use a writable fallback folder."],
    "1.0.32": ["After Effects now prepares and checks the preview cache folder before creating saved clip previews, with fallback locations if needed."],
    "1.0.33": ["HEVC previews on Windows can fall back to a one-time download of a portable FFmpeg converter when Windows itself cannot decode the clip."],
    "1.0.34": [
      "License checks now allow more time and automatically retry once after a temporary connection or server error.",
      "The SceneKeeper title no longer runs into the header buttons in narrow panels."
    ],
    "1.0.35": ["License activation now uses CEP’s native HTTPS connection when the embedded panel request cannot reach the license server."],
    "1.0.36": ["On macOS, license checks can use the system HTTPS client as a fallback when After Effects’ embedded network connection times out."],
    "1.0.37": ["On macOS, the license request now uses one bounded system-curl attempt at a time, so a blocked connection cannot keep the panel retrying for minutes."],
    "1.0.38": ["HEVC/H.265 previews on Windows now recover from incomplete FFmpeg installs and include the supporting files needed for conversion."],
    "1.0.39": ["Windows HEVC previews now find PowerShell through the Windows system folders, even when After Effects does not inherit the normal Windows search path."],
    "1.0.41": ["After an update installs, close and reopen the SceneKeeper panel to load the new version. After Effects does not need to restart."],
    "1.0.42": ["The More actions button is easier to tap, the clip controls sit closer to the panel footer, and the Settings gear icon is clearer."],
    "1.0.43": ["The Settings gear is centered. The clip controls sit lower, and the More actions bar uses the full row instead of leaving empty space at both sides."],
    "1.0.44": [
      "Import and Export now start from a full panel page with clear choices.",
      "Update completion and errors appear in the SceneKeeper panel instead of system popups; after installation, reopen the panel to load the update."
    ],
    "1.0.45": ["After an update installs, use the Finish button to reload SceneKeeper and start using the new version without restarting After Effects."],
    "1.0.47": ["Windows updates now read saved paths as UTF-8, including account names with umlauts. If the downloaded ZIP disappears, SceneKeeper automatically downloads it once more."],
    "1.0.48": ["Small test release to verify that automatic updates are detected and installed."],
    "1.0.49": ["Windows update installation now reports each step, so a blocked or stalled installer is easier to diagnose."],
    "1.0.50": ["Windows update failures now include the installer's last log lines and report when PowerShell cannot write its result."]
  };
  const whatsNewDialog = document.getElementById("scene-keeper-whats-new");
  const whatsNewTitle = document.getElementById("scene-keeper-whats-new-title");
  const whatsNewCopy = document.getElementById("scene-keeper-whats-new-copy");
  const whatsNewList = document.getElementById("scene-keeper-whats-new-list");
  const whatsNewClose = document.getElementById("scene-keeper-whats-new-close");
  let checkInFlight = false;
  let scheduledVersion = "";
  let nextCheckTimer = null;
  let noticeHideTimer = null;

  function revealNotice() {
    if (!notice) return;
    if (noticeHideTimer) {
      clearTimeout(noticeHideTimer);
      noticeHideTimer = null;
    }
    notice.hidden = false;
    notice.classList.remove("is-visible");
    void notice.offsetWidth;
    requestAnimationFrame(() => notice.classList.add("is-visible"));
  }

  if (versionLabel) {
    const currentVersion = String(config.currentVersion || "").replace(/^v/i, "");
    versionLabel.textContent = config.development
      ? "SceneKeeper Dev"
      : (currentVersion ? `SceneKeeper v${currentVersion}` : "SceneKeeper");
    const repository = String(config.repository || "morleyae/SceneKeeper").replace(/^https?:\/\/github\.com\//i, "").replace(/\/+$/, "");
    if (config.development) versionLabel.removeAttribute("href");
    else versionLabel.href = `https://github.com/${repository}/releases/latest`;
  }

  [versionLabel, creatorLink].forEach((link) => {
    if (!link) return;
    if (config.development && link === versionLabel) return;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const cep = window.cep || window.__adobe_cep__;
      if (cep && cep.util && typeof cep.util.openURLInDefaultBrowser === "function") {
        cep.util.openURLInDefaultBrowser(link.href);
        return;
      }
      window.open(link.href, "_blank", "noopener");
    });
  });

  if (creatorLink) {
    creatorLink.href = "https://www.tiktok.com/@morley.ae";
  }

  function compareVersions(first, second) {
    const parse = (version) => String(version || "").replace(/^v/i, "").split(".").map((part) => Number(part) || 0);
    const a = parse(first);
    const b = parse(second);
    for (let index = 0; index < 3; index++) {
      if ((a[index] || 0) > (b[index] || 0)) return 1;
      if ((a[index] || 0) < (b[index] || 0)) return -1;
    }
    return 0;
  }

  function normalizePath(path) {
    let value = String(path || "").replace(/^file:\/\//, "");
    try { value = decodeURI(value); } catch (error) {}
    value = value.replace(/\\/g, "/").replace(/\/$/, "");
    if (/^\/[A-Za-z]:\//.test(value)) value = value.substring(1);
    return value;
  }

  function makeDirectory(path) {
    const fs = window.cep && window.cep.fs;
    if (!fs) return false;
    const stat = fs.stat(path);
    if (stat && stat.err === 0 && stat.data && typeof stat.data.isDirectory === "function" && stat.data.isDirectory()) return true;
    const result = fs.makedir(path);
    return Boolean(result && result.err === 0);
  }

  function writeFile(path, data, encoding) {
    const fs = window.cep && window.cep.fs;
    if (!fs || typeof fs.writeFile !== "function") return false;
    try {
      const result = encoding === undefined
        ? fs.writeFile(path, data)
        : fs.writeFile(path, data, encoding);
      return Boolean(result && result.err === 0);
    } catch (error) {
      return false;
    }
  }

  function encodeBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
    }
    return window.btoa(binary);
  }

  function requestJson(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Accept", "application/vnd.github+json");
    xhr.setRequestHeader("X-GitHub-Api-Version", "2022-11-28");
    xhr.timeout = 15000;
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) return callback(new Error(`HTTP ${xhr.status}`));
      try { callback(null, JSON.parse(xhr.responseText)); }
      catch (error) { callback(error); }
    };
    xhr.onerror = () => callback(new Error("Network error"));
    xhr.ontimeout = () => callback(new Error("Request timed out"));
    xhr.send();
  }

  function downloadFile(url, destination, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";
    xhr.timeout = 120000;
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300 || !xhr.response) return callback(new Error(`Download failed (${xhr.status})`));
      const encoding = window.cep && window.cep.encoding && window.cep.encoding.Base64;
      if (encoding === undefined) return callback(new Error("CEP Base64 file support is unavailable"));
      callback(writeFile(destination, encodeBase64(xhr.response), encoding) ? null : new Error("Could not save the update archive"));
    };
    xhr.onerror = () => callback(new Error("Download network error"));
    xhr.ontimeout = () => callback(new Error("Update download timed out"));
    xhr.send();
  }

  function scheduleInstall(archivePath, version, callback) {
    const cep = window.__adobe_cep__;
    const processApi = window.cep && window.cep.process;
    const fs = window.cep && window.cep.fs;
    if (!cep || !processApi || typeof processApi.createProcess !== "function" || !fs || typeof fs.readFile !== "function") {
      return callback(new Error("Automatic update installation is unavailable on this CEP runtime"));
    }

    const extensionPath = normalizePath(cep.getSystemPath("extension"));
    const userData = normalizePath(cep.getSystemPath("userData"));
    const updateDirectory = `${userData}/SceneKeeper/updates`;
    if (!extensionPath || !userData || !makeDirectory(`${userData}/SceneKeeper`) || !makeDirectory(updateDirectory)) {
      return callback(new Error("Could not prepare the update folder"));
    }

    const isWindows = /win/i.test(navigator.platform || navigator.userAgent);
    const helperSource = `${extensionPath}/scripts/apply-update-${isWindows ? "windows.ps1" : "macos.sh"}`;
    const helperResult = fs.readFile(helperSource);
    if (!helperResult || helperResult.err !== 0 || !helperResult.data) {
      return callback(new Error("The update installer script is missing"));
    }

    const helperPath = `${updateDirectory}/apply-update-${isWindows ? "windows.ps1" : "macos.sh"}`;
    const statePath = `${updateDirectory}/pending-update.json`;
    const resultPath = `${statePath}.result`;
    if (typeof fs.deleteFile === "function") {
      try { fs.deleteFile(resultPath); } catch (error) {}
    }
    const state = `${archivePath}\n${extensionPath}\n${version}\n`;
    const utf8Encoding = window.cep && window.cep.encoding && window.cep.encoding.UTF8;
    const stateWritten = utf8Encoding === undefined
      ? writeFile(statePath, state)
      : writeFile(statePath, state, utf8Encoding);
    if (!writeFile(helperPath, helperResult.data) || !stateWritten) {
      return callback(new Error("Could not prepare the automatic installer"));
    }

    let launched;
    if (isWindows) {
      const powershellPath = "C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";
      launched = processApi.createProcess(
        powershellPath,
        "-NoProfile",
        "-WindowStyle",
        "Hidden",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        helperPath,
        statePath
      );
      if (!launched || launched.err !== 0) {
        launched = processApi.createProcess(
          "powershell.exe",
          "-NoProfile",
          "-WindowStyle",
          "Hidden",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          helperPath,
          statePath
        );
      }
    } else {
      launched = processApi.createProcess("/usr/bin/nohup", "/bin/bash", helperPath, statePath);
    }
    if (!launched || launched.err !== 0) {
      const errorCode = launched && launched.err !== undefined ? ` (CEP error ${launched.err})` : "";
      return callback(new Error(`Could not start the automatic installer${errorCode}`));
    }
    callback(null);
  }

  function showNotice(version) {
    if (!notice) return;
    if (noticeMessage) noticeMessage.textContent = `SceneKeeper ${version} is ready to install. You can keep working while the installer runs. This message will update when installation is complete.`;
    else notice.textContent = `SceneKeeper ${version} is ready to install. You can keep working while the installer runs. This message will update when installation is complete.`;
    if (retryUpdateButton) {
      retryUpdateButton.hidden = false;
      retryUpdateButton.disabled = false;
      retryUpdateButton.textContent = "Retry Update Install";
    }
    revealNotice();
  }

  function showInstallerStarted(version) {
    showNotice(version);
    if (noticeMessage) {
      noticeMessage.textContent = `Installing ${version} while After Effects stays open. This message will update when it is installed.`;
    }
    if (retryUpdateButton) {
      retryUpdateButton.disabled = true;
      retryUpdateButton.textContent = "Installer Running";
    }
  }

  function setNoticeMessage(message) {
    if (!notice) return;
    if (noticeMessage) noticeMessage.textContent = String(message || "");
    else notice.textContent = String(message || "");
    revealNotice();
  }

  function monitorInstallResult(version, startedAt, lastProgress) {
    const cep = window.__adobe_cep__;
    const fs = window.cep && window.cep.fs;
    const userData = cep ? normalizePath(cep.getSystemPath("userData")) : "";
    const resultPath = `${userData}/SceneKeeper/updates/pending-update.json.result`;
    const result = fs && typeof fs.readFile === "function" ? fs.readFile(resultPath) : null;
    if (result && result.err === 0 && result.data) {
      const lines = String(result.data).replace(/^\uFEFF/, "").split(/\r?\n/);
      if (lines[0] === "PROGRESS") {
        const progress = lines.slice(1).join(" ").trim();
        if (progress) {
          lastProgress = progress;
          if (noticeMessage) noticeMessage.textContent = `Installing ${version}: ${progress}`;
          else if (notice) notice.textContent = `Installing ${version}: ${progress}`;
        }
      }
      if (lines[0] === "INSTALLED") {
        if (noticeMessage) noticeMessage.textContent = `SceneKeeper ${version} is installed. Finish the installation with the button below.`;
        else if (notice) notice.textContent = `SceneKeeper ${version} is installed. Finish the installation with the button below.`;
        if (retryUpdateButton) retryUpdateButton.hidden = true;
        if (reopenPanelButton) reopenPanelButton.hidden = false;
        try { window.localStorage.removeItem(ARCHIVE_RETRY_KEY); } catch (error) {}
        scheduledVersion = "";
        revealNotice();
        return;
      }
      if (lines[0] === "ERROR") {
        const details = lines.slice(1).join(" ").trim();
        const archiveMissing = /update ZIP was not found|archive is missing/i.test(details);
        let previousArchiveRetry = "";
        try { previousArchiveRetry = window.localStorage.getItem(ARCHIVE_RETRY_KEY) || ""; } catch (error) {}
        if (archiveMissing && previousArchiveRetry !== version) {
          try { window.localStorage.setItem(ARCHIVE_RETRY_KEY, version); } catch (error) {}
          clearPendingUpdateVersion();
          clearLastCheckTime();
          scheduledVersion = "";
          setNoticeMessage(`The ${version} update file could not be read. SceneKeeper is downloading it again…`);
          checkForUpdates(true);
          return;
        }
        setNoticeMessage(`SceneKeeper ${version} could not be installed${details ? `: ${details}` : ". Please try again."}`);
        if (retryUpdateButton) {
          retryUpdateButton.hidden = false;
          retryUpdateButton.disabled = false;
          retryUpdateButton.textContent = archiveMissing ? "Download Update Again" : "Retry Update Install";
        }
        scheduledVersion = "";
        return;
      }
    }

    if (Date.now() - startedAt >= 5 * 60 * 1000) {
      const logTail = readInstallerLogTail();
      const diagnostic = logTail
        ? ` Installer log: ${logTail}`
        : " No installer log was created; Windows may have blocked PowerShell before it started.";
      setNoticeMessage(`SceneKeeper ${version} installation did not finish within 5 minutes${lastProgress ? ` (last step: ${lastProgress})` : "; the Windows installer did not report that it started"}.${diagnostic}`);
      if (retryUpdateButton) {
        retryUpdateButton.hidden = false;
        retryUpdateButton.disabled = false;
        retryUpdateButton.textContent = "Retry Update Install";
      }
      scheduledVersion = "";
      return;
    }
    window.setTimeout(() => monitorInstallResult(version, startedAt, lastProgress), 1000);
  }

  function startInstallResultMonitor(version) {
    monitorInstallResult(version, Date.now());
  }

  function readInstallerLogTail() {
    const cep = window.__adobe_cep__;
    const fs = window.cep && window.cep.fs;
    const userData = cep ? normalizePath(cep.getSystemPath("userData")) : "";
    const logPath = `${userData}/SceneKeeper/updates/pending-update.json.log`;
    const result = fs && typeof fs.readFile === "function" ? fs.readFile(logPath) : null;
    if (!result || result.err !== 0 || !result.data) return "";
    return String(result.data)
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(-8)
      .join(" | ")
      .slice(-700);
  }

  function showUpdateProblem(message) {
    const pendingVersion = getPendingUpdateVersion();
    if (pendingVersion && compareVersions(config.currentVersion, pendingVersion) < 0) {
      showNotice(pendingVersion);
      return;
    }
    setNoticeMessage(message);
  }

  function clearNotice() {
    if (noticeMessage) noticeMessage.textContent = "";
    else notice.textContent = "";
    if (retryUpdateButton) retryUpdateButton.hidden = true;
    if (reopenPanelButton) reopenPanelButton.hidden = true;
    notice.classList.remove("is-visible");
    if (noticeHideTimer) clearTimeout(noticeHideTimer);
    noticeHideTimer = window.setTimeout(() => {
      notice.hidden = true;
      noticeHideTimer = null;
    }, 230);
  }

  function retryPendingInstallation() {
    const version = getPendingUpdateVersion() || scheduledVersion;
    if (!version || compareVersions(config.currentVersion, version) >= 0) return;
    const cep = window.__adobe_cep__;
    const userData = cep ? normalizePath(cep.getSystemPath("userData")) : "";
    const archivePath = `${userData}/SceneKeeper/updates/SceneKeeper-${version}.zip`;
    const fs = window.cep && window.cep.fs;
    let archiveRetryVersion = "";
    try { archiveRetryVersion = window.localStorage.getItem(ARCHIVE_RETRY_KEY) || ""; } catch (error) {}
    if (archiveRetryVersion === version) {
      if (fs && typeof fs.deleteFile === "function") {
        try { fs.deleteFile(archivePath); } catch (error) {}
      }
      clearPendingUpdateVersion();
      scheduledVersion = "";
      clearLastCheckTime();
      if (retryUpdateButton) retryUpdateButton.disabled = true;
      setNoticeMessage(`Downloading SceneKeeper ${version} again…`);
      checkForUpdates(true);
      return;
    }
    const archiveStat = fs && fs.stat ? fs.stat(archivePath) : null;
    if (!archiveStat || archiveStat.err !== 0) {
      clearPendingUpdateVersion();
      scheduledVersion = "";
      clearLastCheckTime();
      if (retryUpdateButton) retryUpdateButton.disabled = true;
      setNoticeMessage(`The ${version} update package is missing. Checking GitHub again...`);
      checkForUpdates(true);
      return;
    }

    if (retryUpdateButton) {
      retryUpdateButton.disabled = true;
      retryUpdateButton.textContent = "Starting installer...";
    }
    scheduleInstall(archivePath, version, (installError) => {
      if (installError) {
        setNoticeMessage(`Could not start the installer: ${installError.message}. Close and reopen the SceneKeeper panel, then retry.`);
        if (retryUpdateButton) {
          retryUpdateButton.disabled = false;
          retryUpdateButton.textContent = "Retry Update Install";
        }
        return;
      }
      setPendingUpdateVersion(version);
      scheduledVersion = version;
      showInstallerStarted(version);
      startInstallResultMonitor(version);
    });
  }

  function getLastCheckTime() {
    try { return Number(window.localStorage.getItem(LAST_CHECK_KEY)) || 0; }
    catch (error) { return 0; }
  }

  function setLastCheckTime() {
    try { window.localStorage.setItem(LAST_CHECK_KEY, String(Date.now())); }
    catch (error) {}
  }

  function clearLastCheckTime() {
    try { window.localStorage.removeItem(LAST_CHECK_KEY); }
    catch (error) {}
  }

  function getPendingUpdateVersion() {
    try { return String(window.localStorage.getItem(PENDING_UPDATE_KEY) || ""); }
    catch (error) { return ""; }
  }

  function setPendingUpdateVersion(version) {
    try { window.localStorage.setItem(PENDING_UPDATE_KEY, String(version || "")); }
    catch (error) {}
  }

  function clearPendingUpdateVersion() {
    try { window.localStorage.removeItem(PENDING_UPDATE_KEY); }
    catch (error) {}
  }

  function readStoredVersion() {
    try { return String(window.localStorage.getItem(INSTALLED_VERSION_KEY) || ""); }
    catch (error) { return ""; }
  }

  function storeCurrentVersion() {
    try { window.localStorage.setItem(INSTALLED_VERSION_KEY, String(config.currentVersion || "")); }
    catch (error) {}
  }

  function showWhatsNew(previousVersion, pendingVersion) {
    const currentVersion = String(config.currentVersion || "");
    const updateWasApplied = previousVersion
      ? compareVersions(currentVersion, previousVersion) > 0
      : (pendingVersion && compareVersions(currentVersion, pendingVersion) >= 0) ||
        compareVersions(currentVersion, CHANGELOG_FEATURE_VERSION) >= 0;
    if (!updateWasApplied || !whatsNewDialog || !whatsNewList) return false;

    const releaseVersions = Object.keys(RELEASE_NOTES).sort(compareVersions).filter((version) =>
      compareVersions(version, previousVersion || NO_HISTORY_VERSION_FLOOR) > 0 &&
      compareVersions(version, currentVersion) <= 0
    );
    let notes = [];
    for (let versionIndex = 0; versionIndex < releaseVersions.length; versionIndex++) {
      notes = notes.concat(RELEASE_NOTES[releaseVersions[versionIndex]]);
    }
    if (!previousVersion) {
      notes = [
        "Backups and Random Clips Between Markers now work on more After Effects setups.",
        "Update progress and installation errors are clearer.",
        "Updates install while After Effects stays open. Once installation finishes, close and reopen the SceneKeeper panel to load the new version.",
        "Success and error messages slide in briefly, and the clip action buttons take up less space.",
        "The footer links to GitHub releases and the creator’s TikTok profile.",
        "Restarting the extension avoids creating another backup within 10 minutes.",
        "Saved clip previews use writable fallback folders if the default cache location is unavailable.",
        "This short What’s New summary appears after an update."
      ];
    }
    if (!notes.length) notes = ["General improvements and fixes for a smoother SceneKeeper experience."];

    whatsNewTitle.textContent = `What’s New in SceneKeeper v${currentVersion}`;
    whatsNewCopy.textContent = previousVersion
      ? `Since v${previousVersion}, SceneKeeper has changed in these ways:`
      : "Here are the latest improvements in SceneKeeper:";
    while (whatsNewList.firstChild) whatsNewList.removeChild(whatsNewList.firstChild);
    for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
      const item = document.createElement("li");
      item.textContent = notes[noteIndex];
      whatsNewList.appendChild(item);
    }
    whatsNewDialog.hidden = false;
    window.setTimeout(() => whatsNewClose && whatsNewClose.focus(), 0);
    return true;
  }

  function restorePendingUpdateNotice() {
    const pendingVersion = getPendingUpdateVersion();
    if (!pendingVersion) return;
    if (compareVersions(config.currentVersion, pendingVersion) >= 0) {
      clearPendingUpdateVersion();
      clearNotice();
      return;
    }
    showNotice(pendingVersion);
  }

  if (whatsNewClose) {
    whatsNewClose.addEventListener("click", () => {
      whatsNewDialog.hidden = true;
      storeCurrentVersion();
    });
  }

  if (reopenPanelButton) {
    reopenPanelButton.addEventListener("click", () => {
      reopenPanelButton.disabled = true;
      reopenPanelButton.textContent = "Finishing…";
      const cep = window.__adobe_cep__;
      const fs = window.cep && window.cep.fs;
      const userData = cep ? normalizePath(cep.getSystemPath("userData")) : "";
      const resultPath = `${userData}/SceneKeeper/updates/pending-update.json.result`;
      if (fs && typeof fs.writeFile === "function") fs.writeFile(resultPath, "");
      window.setTimeout(() => window.location.reload(), 80);
    });
  }
  if (whatsNewDialog) {
    whatsNewDialog.addEventListener("click", (event) => {
      if (event.target === whatsNewDialog) {
        whatsNewDialog.hidden = true;
        storeCurrentVersion();
      }
    });
  }

  function scheduleNextCheck(delay) {
    if (nextCheckTimer !== null) window.clearTimeout(nextCheckTimer);
    nextCheckTimer = window.setTimeout(() => {
      nextCheckTimer = null;
      checkForUpdates();
    }, Math.max(1000, Number(delay) || RETRY_INTERVAL_MS));
  }

  function checkForUpdates(forceCheck) {
    if (config.development) return;
    if (checkInFlight) return;
    if (!config.repository || !config.currentVersion || !notice) return;

    if (scheduledVersion) {
      scheduleNextCheck(CHECK_INTERVAL_MS);
      return;
    }

    const pendingVersion = getPendingUpdateVersion();
    if (pendingVersion && compareVersions(config.currentVersion, pendingVersion) < 0) {
      showNotice(pendingVersion);
      scheduleNextCheck(CHECK_INTERVAL_MS);
      return;
    }

    const lastCheck = getLastCheckTime();
    const waitForNextAllowedCheck = CHECK_INTERVAL_MS - (Date.now() - lastCheck);
    if (!forceCheck && waitForNextAllowedCheck > 0) {
      scheduleNextCheck(waitForNextAllowedCheck);
      return;
    }

    checkInFlight = true;
    requestJson(`https://api.github.com/repos/${config.repository}/releases/latest`, (releaseError, release) => {
      checkInFlight = false;
      if (releaseError) {
        showUpdateProblem("Could not check for SceneKeeper updates. The panel will retry automatically.");
        scheduleNextCheck(RETRY_INTERVAL_MS);
        return;
      }
      setLastCheckTime();
      if (!release || release.draft || release.prerelease || compareVersions(release.tag_name, config.currentVersion) <= 0) {
        clearNotice();
        scheduleNextCheck(CHECK_INTERVAL_MS);
        return;
      }
      showUpdateProblem(`SceneKeeper ${release.tag_name} was found and is downloading. The panel will tell you when it is installed and ready to use.`);
      const asset = (release.assets || []).find((item) => item.name === `SceneKeeper-${release.tag_name}.zip`);
      if (!asset || !asset.browser_download_url) {
        showUpdateProblem(`SceneKeeper ${release.tag_name} is available, but its download package could not be found. Please contact support.`);
        clearLastCheckTime();
        scheduleNextCheck(RETRY_INTERVAL_MS);
        return;
      }

      const cep = window.__adobe_cep__;
      const userData = cep ? normalizePath(cep.getSystemPath("userData")) : "";
      const updateDirectory = `${userData}/SceneKeeper/updates`;
      if (!userData || !makeDirectory(`${userData}/SceneKeeper`) || !makeDirectory(updateDirectory)) {
        showUpdateProblem(`SceneKeeper ${release.tag_name} was found, but its temporary update folder could not be prepared.`);
        clearLastCheckTime();
        scheduleNextCheck(RETRY_INTERVAL_MS);
        return;
      }
      const archivePath = `${updateDirectory}/${asset.name}`;
      downloadFile(asset.browser_download_url, archivePath, (downloadError) => {
        if (downloadError) {
          showUpdateProblem(`SceneKeeper ${release.tag_name} was found, but the download failed. It will retry automatically.`);
          clearLastCheckTime();
          scheduleNextCheck(RETRY_INTERVAL_MS);
          return;
        }
        scheduleInstall(archivePath, release.tag_name, (installError) => {
          if (installError) {
            showUpdateProblem(`SceneKeeper ${release.tag_name} was downloaded, but automatic installation could not be started: ${installError.message}. It will retry automatically.`);
            clearLastCheckTime();
            scheduleNextCheck(RETRY_INTERVAL_MS);
            return;
          }
          setPendingUpdateVersion(release.tag_name);
          scheduledVersion = release.tag_name;
          showInstallerStarted(release.tag_name);
          startInstallResultMonitor(release.tag_name);
        });
      });
    });
  }

  if (!config.development) {
    const previouslyInstalledVersion = readStoredVersion();
    const pendingVersionBeforeRestore = getPendingUpdateVersion();
    restorePendingUpdateNotice();
    const whatsNewShown = showWhatsNew(previouslyInstalledVersion, pendingVersionBeforeRestore);
    if (!whatsNewShown) storeCurrentVersion();
    if (retryUpdateButton) retryUpdateButton.addEventListener("click", retryPendingInstallation);
    if (window.SceneKeeperAppReady) checkForUpdates(true);
    else window.addEventListener("scenekeeper-app-ready", () => checkForUpdates(true), { once: true });
  }
})();
