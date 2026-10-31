(function () {
  const LICENSE_KEY_STORAGE = "scenekeeper.license.key";
  const DEVICE_ID_STORAGE = "scenekeeper.license.device";
  const CHECKED_AT_STORAGE = "scenekeeper.license.checkedAt";
  const OFFLINE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;
  const apiBaseUrl = (window.SceneKeeperLicenseConfig.apiBaseUrl || "").trim().replace(/\/+$/, "");
  const hasSecureApiUrl = /^https:\/\/[^/\s]+(?:\/|$)/i.test(apiBaseUrl);
  const gate = document.getElementById("license-gate");
  const keyInput = document.getElementById("license-key-input");
  const gateCopy = document.getElementById("license-gate-copy");
  const gateStatus = document.getElementById("license-gate-status");
  const activateButton = document.getElementById("license-activate-button");
  const cancelButton = document.getElementById("license-cancel-button");
  const manageButton = document.getElementById("license-manage-button");
  const settingsStatus = document.getElementById("license-settings-status");

  let isLicensed = false;
  let isBusy = false;

  function getLicenseStatePath() {
    const cep = window.__adobe_cep__;
    const fs = window.cep && window.cep.fs;
    if (!cep || !fs || typeof cep.getSystemPath !== "function" ||
        typeof fs.stat !== "function" || typeof fs.makedir !== "function" ||
        typeof fs.readFile !== "function" || typeof fs.writeFile !== "function") return null;
    let userDataPath = String(cep.getSystemPath("userData") || "").replace(/^file:\/\//, "");
    try { userDataPath = decodeURI(userDataPath); } catch (error) {}
    userDataPath = userDataPath.replace(/\\/g, "/").replace(/\/$/, "");
    if (/^\/[A-Za-z]:\//.test(userDataPath)) userDataPath = userDataPath.substring(1);
    if (!userDataPath) return null;
    const directoryPath = `${userDataPath}/SceneKeeper`;
    const directory = fs.stat(directoryPath);
    if (!(directory && directory.err === 0 && directory.data &&
          typeof directory.data.isDirectory === "function" && directory.data.isDirectory())) {
      const created = fs.makedir(directoryPath);
      if (!created || created.err !== 0) return null;
    }
    return `${directoryPath}/license-state.json`;
  }

  function getLegacyStateValue(key) {
    try { return window.localStorage.getItem(key) || ""; }
    catch (error) { return ""; }
  }

  function readPersistentLicenseState() {
    const filePath = getLicenseStatePath();
    if (!filePath) return null;
    try {
      const result = window.cep.fs.readFile(filePath);
      if (!result || result.err !== 0 || !result.data) return { path: filePath, state: {} };
      const state = JSON.parse(result.data);
      return { path: filePath, state: state && typeof state === "object" ? state : {} };
    } catch (error) {
      return { path: filePath, state: {} };
    }
  }

  const persistentState = readPersistentLicenseState();
  const licenseState = {
    [LICENSE_KEY_STORAGE]: getLegacyStateValue(LICENSE_KEY_STORAGE),
    [DEVICE_ID_STORAGE]: getLegacyStateValue(DEVICE_ID_STORAGE),
    [CHECKED_AT_STORAGE]: getLegacyStateValue(CHECKED_AT_STORAGE)
  };
  let licenseStateFilePath = persistentState ? persistentState.path : null;
  if (persistentState) Object.assign(licenseState, persistentState.state);

  function writePersistentLicenseState() {
    if (!licenseStateFilePath) return false;
    try {
      const result = window.cep.fs.writeFile(licenseStateFilePath, JSON.stringify(licenseState));
      return Boolean(result && result.err === 0);
    } catch (error) {
      return false;
    }
  }

  let persistentStorageReady = writePersistentLicenseState();

  function getStoredValue(key) {
    const value = licenseState[key];
    return typeof value === "string" && value ? value : getLegacyStateValue(key);
  }

  function setStoredValue(key, value) {
    const storedValue = String(value);
    licenseState[key] = storedValue;
    try { window.localStorage.setItem(key, storedValue); } catch (error) {}
    persistentStorageReady = writePersistentLicenseState();
    return persistentStorageReady;
  }

  function ensurePersistentStorage() {
    if (persistentStorageReady) return true;
    persistentStorageReady = writePersistentLicenseState();
    return persistentStorageReady;
  }

  function announceAppReady() {
    window.SceneKeeperAppReady = true;
    window.dispatchEvent(new Event("scenekeeper-app-ready"));
  }

  function setStatus(message, isError) {
    gateStatus.textContent = message;
    gateStatus.classList.toggle("is-error", Boolean(isError));
    settingsStatus.textContent = message;
  }

  function setBusy(busy) {
    isBusy = busy;
    activateButton.disabled = busy;
    activateButton.textContent = busy ? "Checking..." : "Activate / Verify";
  }

  function getDeviceId() {
    let deviceId = getStoredValue(DEVICE_ID_STORAGE);
    if (deviceId) return deviceId;

    const bytes = window.crypto.getRandomValues(new Uint8Array(24));
    deviceId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    setStoredValue(DEVICE_ID_STORAGE, deviceId);
    return deviceId;
  }

  function request(path, body) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${apiBaseUrl}${path}`, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 25000;
      xhr.onload = () => {
        let response;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (error) {
          const parseError = new Error("The license server returned an invalid response.");
          parseError.status = xhr.status;
          reject(parseError);
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response);
          return;
        }
        const responseError = new Error(response.error || `License check failed (${xhr.status}).`);
        responseError.status = xhr.status;
        reject(responseError);
      };
      xhr.onerror = () => {
        const networkError = new Error("Could not reach the license server.");
        networkError.status = 0;
        reject(networkError);
      };
      xhr.ontimeout = () => {
        const timeoutError = new Error("The license server did not respond in time.");
        timeoutError.status = 0;
        reject(timeoutError);
      };
      xhr.send(JSON.stringify(body));
    });
  }

  async function requestWithRetry(path, body, onRetry) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await request(path, body);
      } catch (error) {
        const canRetry = attempt === 0 &&
          (error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500);
        if (!canRetry) throw error;
        if (typeof onRetry === "function") onRetry();
        await new Promise((resolve) => window.setTimeout(resolve, 800));
      }
    }
    throw new Error("The license server did not respond. Please try again.");
  }

  function showGate(copy, locked) {
    gateCopy.textContent = copy;
    cancelButton.hidden = locked;
    gate.hidden = false;
    keyInput.focus();
  }

  function allowOffline(error) {
    const isTemporaryFailure = error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500;
    const lastCheck = Number(getStoredValue(CHECKED_AT_STORAGE)) || 0;
    const elapsed = Date.now() - lastCheck;
    return isTemporaryFailure && lastCheck > 0 && elapsed >= 0 && elapsed <= OFFLINE_GRACE_MS;
  }

  async function verifySavedLicense() {
    const licenseKey = getStoredValue(LICENSE_KEY_STORAGE);
    if (!licenseKey) {
      setStatus("No license activated on this installation.", false);
      showGate("Enter your license key to activate SceneKeeper on this installation.", true);
      return;
    }

    setStatus("Checking your SceneKeeper license...", false);
    try {
      await requestWithRetry("/api/verify", { licenseKey, deviceId: getDeviceId() }, () => {
        setStatus("The license server is taking longer than usual. Retrying...", false);
      });
      setStoredValue(CHECKED_AT_STORAGE, String(Date.now()));
      isLicensed = true;
      gate.hidden = true;
      setStatus("License active on this installation.", false);
      announceAppReady();
    } catch (error) {
      if (allowOffline(error)) {
        isLicensed = true;
        gate.hidden = true;
        setStatus("License server unavailable. Offline access is active temporarily.", false);
        announceAppReady();
        return;
      }
      setStatus(error.message, true);
      showGate("SceneKeeper needs a valid license activation. Check your connection or enter a license key.", true);
    }
  }

  async function activateLicense() {
    if (isBusy) return;
    if (!apiBaseUrl) {
      setStatus("License service is not configured for this build.", true);
      return;
    }

    const licenseKey = keyInput.value.trim() || getStoredValue(LICENSE_KEY_STORAGE);
    if (!licenseKey) {
      setStatus("Enter your license key to continue.", true);
      keyInput.focus();
      return;
    }

    setBusy(true);
    setStatus("Activating license...", false);
    try {
      const deviceId = getDeviceId();
      if (!ensurePersistentStorage()) {
        throw new Error("Could not save the license outside temporary CEP data. Check access to the user data folder and try again.");
      }
      await requestWithRetry("/api/activate", { licenseKey, deviceId }, () => {
        setStatus("The license server is taking longer than usual. Retrying...", false);
      });
      setStoredValue(LICENSE_KEY_STORAGE, licenseKey);
      setStoredValue(CHECKED_AT_STORAGE, String(Date.now()));
      isLicensed = true;
      gate.hidden = true;
      setStatus("License active on this installation.", false);
      keyInput.value = "";
      announceAppReady();
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      setBusy(false);
    }
  }

  manageButton.addEventListener("click", () => {
    showGate(
      hasSecureApiUrl
        ? "Enter a license key to activate or verify this installation."
        : "Set a valid HTTPS Cloudflare Worker URL in assets/js/license-config.js before enabling licensing.",
      !isLicensed && hasSecureApiUrl
    );
    if (!hasSecureApiUrl) cancelButton.hidden = false;
  });
  activateButton.addEventListener("click", activateLicense);
  keyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") activateLicense();
  });
  cancelButton.addEventListener("click", () => {
    if (!isBusy) gate.hidden = true;
  });

  if (!apiBaseUrl) {
    gate.hidden = true;
    setStatus("License service not configured (development build).", false);
    announceAppReady();
    return;
  }

  if (!hasSecureApiUrl) {
    showGate("The license service URL must use HTTPS. Update assets/js/license-config.js.", true);
    activateButton.disabled = true;
    setStatus("License service URL must use HTTPS.", true);
    return;
  }

  gate.hidden = true;
  verifySavedLicense();

  window.SceneKeeperLicense = {
    open() {
      showGate(
        "Enter a license key to activate or verify this installation.",
        !isLicensed
      );
    }
  };
})();
