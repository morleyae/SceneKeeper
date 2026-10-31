(function () {
  const config = window.SceneKeeperUpdateConfig || {};
  const notice = document.getElementById("scene-keeper-update-notice");
  const noticeMessage = document.getElementById("scene-keeper-update-message");
  const retryUpdateButton = document.getElementById("scene-keeper-retry-update");
  const versionLabel = document.getElementById("scene-keeper-version");
  const CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000;
  const RETRY_INTERVAL_MS = 5 * 60 * 1000;
  const LAST_CHECK_KEY = "scenekeeper.update.lastCheck";
  const PENDING_UPDATE_KEY = "scenekeeper.update.pendingVersion";
  let checkInFlight = false;
  let scheduledVersion = "";
  let nextCheckTimer = null;

  if (versionLabel) {
    const currentVersion = String(config.currentVersion || "").replace(/^v/i, "");
    versionLabel.textContent = currentVersion ? `SceneKeeper v${currentVersion}` : "SceneKeeper";
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
    const state = `${archivePath}\n${extensionPath}\n${version}\n`;
    if (!writeFile(helperPath, helperResult.data) || !writeFile(statePath, state)) {
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
    if (noticeMessage) noticeMessage.textContent = `SceneKeeper ${version} is ready. Close After Effects to let the update install, then reopen AE.`;
    else notice.textContent = `SceneKeeper ${version} is ready. Close After Effects to let the update install, then reopen AE.`;
    if (retryUpdateButton) {
      retryUpdateButton.hidden = false;
      retryUpdateButton.disabled = false;
      retryUpdateButton.textContent = "Retry Update Install";
    }
    notice.hidden = false;
  }

  function showInstallerStarted(version) {
    showNotice(version);
    const isWindows = /win/i.test(navigator.platform || navigator.userAgent);
    if (noticeMessage) {
      noticeMessage.textContent = isWindows
        ? `Installer started for ${version}. Close After Effects and wait for the installation confirmation before reopening AE.`
        : `Installer started for ${version}. Close AE, confirm the update dialog, and wait for the completion dialog before reopening.`;
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
    notice.hidden = false;
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
    notice.hidden = true;
  }

  function retryPendingInstallation() {
    const version = getPendingUpdateVersion() || scheduledVersion;
    if (!version || compareVersions(config.currentVersion, version) >= 0) return;
    const cep = window.__adobe_cep__;
    const userData = cep ? normalizePath(cep.getSystemPath("userData")) : "";
    const archivePath = `${userData}/SceneKeeper/updates/SceneKeeper-${version}.zip`;
    const fs = window.cep && window.cep.fs;
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
        setNoticeMessage(`Could not start the installer: ${installError.message}. Close After Effects and retry.`);
        if (retryUpdateButton) {
          retryUpdateButton.disabled = false;
          retryUpdateButton.textContent = "Retry Update Install";
        }
        return;
      }
      setPendingUpdateVersion(version);
      scheduledVersion = version;
      showInstallerStarted(version);
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

  function scheduleNextCheck(delay) {
    if (nextCheckTimer !== null) window.clearTimeout(nextCheckTimer);
    nextCheckTimer = window.setTimeout(() => {
      nextCheckTimer = null;
      checkForUpdates();
    }, Math.max(1000, Number(delay) || RETRY_INTERVAL_MS));
  }

  function checkForUpdates(forceCheck) {
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
      showUpdateProblem(`SceneKeeper ${release.tag_name} was found and is downloading. After the download, close and reopen After Effects to install the update.`);
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
        });
      });
    });
  }

  restorePendingUpdateNotice();
  if (retryUpdateButton) retryUpdateButton.addEventListener("click", retryPendingInstallation);
  if (window.SceneKeeperAppReady) checkForUpdates(true);
  else window.addEventListener("scenekeeper-app-ready", () => checkForUpdates(true), { once: true });
})();
