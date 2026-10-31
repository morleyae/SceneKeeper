(function () {
  const config = window.SceneKeeperUpdateConfig || {};
  const notice = document.getElementById("scene-keeper-update-notice");
  const CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000;
  const LAST_CHECK_KEY = "scenekeeper.update.lastCheck";
  let started = false;

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
      const command = `-NoProfile -ExecutionPolicy Bypass -File "${helperPath}" "${statePath}"`;
      launched = processApi.createProcess("powershell.exe", command);
    } else {
      launched = processApi.createProcess("/bin/bash", helperPath, statePath);
    }
    if (!launched || launched.err !== 0) return callback(new Error("Could not start the automatic installer"));
    callback(null);
  }

  function showNotice(version) {
    notice.textContent = `SceneKeeper ${version} wurde heruntergeladen. Schließe After Effects; das Update wird automatisch installiert. Danach AE neu starten, um die neue Version zu verwenden.`;
    notice.hidden = false;
  }

  function checkForUpdates() {
    if (started) return;
    started = true;
    if (!config.repository || !config.currentVersion || !notice) return;

    const lastCheck = Number(window.localStorage.getItem(LAST_CHECK_KEY)) || 0;
    if (Date.now() - lastCheck < CHECK_INTERVAL_MS) return;
    window.localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));

    requestJson(`https://api.github.com/repos/${config.repository}/releases/latest`, (releaseError, release) => {
      if (releaseError || !release || release.draft || release.prerelease || compareVersions(release.tag_name, config.currentVersion) <= 0) return;
      const asset = (release.assets || []).find((item) => item.name === `SceneKeeper-${release.tag_name}.zip`);
      if (!asset || !asset.browser_download_url) return;

      const cep = window.__adobe_cep__;
      const userData = cep ? normalizePath(cep.getSystemPath("userData")) : "";
      const updateDirectory = `${userData}/SceneKeeper/updates`;
      if (!userData || !makeDirectory(`${userData}/SceneKeeper`) || !makeDirectory(updateDirectory)) return;
      const archivePath = `${updateDirectory}/${asset.name}`;
      downloadFile(asset.browser_download_url, archivePath, (downloadError) => {
        if (downloadError) return;
        scheduleInstall(archivePath, release.tag_name, (installError) => {
          if (!installError) showNotice(release.tag_name);
        });
      });
    });
  }

  if (window.SceneKeeperAppReady) checkForUpdates();
  else window.addEventListener("scenekeeper-app-ready", checkForUpdates, { once: true });
})();
