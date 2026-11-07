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

  function describeLicenseError(error) {
    const status = Number(error && error.status) || 0;
    const code = String(error && error.code || "");
    const detail = String(error && error.message || "").trim();
    let message;
    if (status === 400) message = "The license request was rejected (HTTP 400). Check that the key was copied completely and has no extra spaces.";
    else if (status === 401) message = "The license service denied the request (HTTP 401). The service may be misconfigured; send support code SK-LIC-401.";
    else if (status === 403 && /already activated on another device|device_mismatch/i.test(detail)) message = "This key is already activated on another device. Ask support to reset its activation before using it on this Mac.";
    else if (status === 403 && /revoked/i.test(detail)) message = "This license key has been revoked. Contact support to check the purchase or get a replacement key.";
    else if (status === 403) message = "The license was rejected (HTTP 403). This older license service cannot tell whether the key is invalid, revoked, or assigned to another device. Update SceneKeeper and retry; if it continues, send support code SK-LIC-403.";
    else if (status === 404 && /license_not_found|active license not found/i.test(detail)) message = "This key was not found in the license system. Check the key for typos or contact support to verify it.";
    else if (status === 404) message = "The license service endpoint was not found (HTTP 404). Update SceneKeeper and retry. If this continues, send support code SK-LIC-404.";
    else if (status === 408) message = "The license service timed out (HTTP 408). Check internet access and retry.";
    else if (status === 409) message = "This key is already activated on another device. Ask support to reset its activation before using it on this Mac.";
    else if (status === 429) message = "The license service is rate limiting requests (HTTP 429). Wait a few minutes, then retry.";
    else if (status >= 500) message = "The license service returned a server error (HTTP " + status + "). Wait a few minutes and retry.";
    else if (code === "CURL_DNS") message = "This Mac could not find the license server (DNS lookup failed). Check internet access, VPN, or DNS filtering.";
    else if (code === "CURL_CONNECT") message = "This Mac could not connect to the license server. Check internet access, VPN, firewall, or network filtering.";
    else if (code === "CURL_TLS") message = "This Mac could not establish a secure connection (TLS/certificate error). Check macOS date and time, then try another network.";
    else if (code === "TIMEOUT") message = "The license request timed out. Check internet access or network filtering, then retry.";
    else if (code === "CURL_START") message = "macOS could not start its built-in network client (/usr/bin/curl). Restart After Effects and retry.";
    else if (code === "STORAGE") message = "SceneKeeper could not save license data in your user data folder. Check write access to that folder, then restart After Effects.";
    else if (code === "INVALID_RESPONSE") message = "The license server returned an unreadable response. Update SceneKeeper and retry.";
    else if (status === 0) message = "Could not complete the license request (network or local connection error). Check internet access, VPN, firewall, and retry.";
    else message = detail || "License request failed (HTTP " + status + ").";

    const diagnostic = code || (status ? "HTTP_" + status : "NETWORK");
    return message + "\nDiagnostic: " + diagnostic + (detail && status === 0 ? " — " + detail.slice(0, 140) : "");
  }

  function setLicenseError(error) {
    setStatus(describeLicenseError(error), true);
  }

  function getDeviceId() {
    let deviceId = getStoredValue(DEVICE_ID_STORAGE);
    if (deviceId) return deviceId;

    const bytes = window.crypto.getRandomValues(new Uint8Array(24));
    deviceId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    setStoredValue(DEVICE_ID_STORAGE, deviceId);
    return deviceId;
  }

  function requestViaXhr(path, body) {
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
          parseError.code = "INVALID_RESPONSE";
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
        networkError.code = "NETWORK";
        reject(networkError);
      };
      xhr.ontimeout = () => {
        const timeoutError = new Error("The license server did not respond in time.");
        timeoutError.status = 0;
        timeoutError.code = "TIMEOUT";
        reject(timeoutError);
      };
      xhr.send(JSON.stringify(body));
    });
  }

  function requestViaCepNode(path, body) {
    return new Promise((resolve, reject) => {
      const cepNode = window.cep_node || (typeof cep_node !== "undefined" ? cep_node : null);
      if (!cepNode || typeof cepNode.require !== "function") {
        reject(new Error("CEP Node networking is unavailable."));
        return;
      }

      try {
        const https = cepNode.require("https");
        const Buffer = cepNode.require("buffer").Buffer;
        const endpoint = new URL(`${apiBaseUrl}${path}`);
        const payload = JSON.stringify(body);
        const requestOptions = {
          hostname: endpoint.hostname,
          port: endpoint.port || 443,
          path: `${endpoint.pathname}${endpoint.search}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload)
          }
        };
        const nativeRequest = https.request(requestOptions, (response) => {
          let responseText = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => { responseText += chunk; });
          response.on("end", () => {
            let result;
            try {
              result = JSON.parse(responseText);
            } catch (error) {
              const parseError = new Error("The license server returned an invalid response.");
              parseError.status = response.statusCode || 0;
              parseError.code = "INVALID_RESPONSE";
              reject(parseError);
              return;
            }
            if (response.statusCode >= 200 && response.statusCode < 300) {
              resolve(result);
              return;
            }
            const responseError = new Error(result.error || `License check failed (${response.statusCode}).`);
            responseError.status = response.statusCode || 0;
            reject(responseError);
          });
        });
        nativeRequest.setTimeout(25000, () => {
          const timeoutError = new Error("The license server did not respond in time.");
          timeoutError.status = 0;
          timeoutError.code = "TIMEOUT";
          nativeRequest.destroy(timeoutError);
        });
        nativeRequest.on("error", (error) => {
          if (typeof error.status !== "number") error.status = 0;
          reject(error);
        });
        nativeRequest.write(payload);
        nativeRequest.end();
      } catch (error) {
        if (typeof error.status !== "number") error.status = 0;
        reject(error);
      }
    });
  }

  function requestViaMacCurl(path, body) {
    return new Promise((resolve, reject) => {
      const cepNode = window.cep_node || (typeof cep_node !== "undefined" ? cep_node : null);
      if (!cepNode || typeof cepNode.require !== "function") {
        const unavailableError = new Error("CEP Node networking is unavailable.");
        unavailableError.code = "NETWORK_UNAVAILABLE";
        reject(unavailableError);
        return;
      }

      let child;
      try {
        const childProcess = cepNode.require("child_process");
        const marker = "\\nSCENEKeeperHTTPSTATUS:";
        const args = [
          "--silent", "--show-error", "--connect-timeout", "8", "--max-time", "15",
          "--request", "POST", "--header", "Content-Type: application/json",
          "--data-binary", "@-", "--write-out", `${marker}%{http_code}`,
          `${apiBaseUrl}${path}`
        ];
        child = childProcess.spawn("/usr/bin/curl", args, { stdio: ["pipe", "pipe", "pipe"] });
      } catch (error) {
        error.status = 0;
        reject(error);
        return;
      }

      let output = "";
      let errorOutput = "";
      let settled = false;
      let watchdog = null;
      const finish = (handler, value) => {
        if (settled) return;
        settled = true;
        if (watchdog) window.clearTimeout(watchdog);
        handler(value);
      };
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", (chunk) => { output += chunk; });
      child.stderr.on("data", (chunk) => { errorOutput += chunk; });
      child.on("error", (error) => {
        if (typeof error.status !== "number") error.status = 0;
        error.code = error.code === "ENOENT" ? "CURL_START" : (error.code || "CURL_NETWORK");
        finish(reject, error);
      });
      child.on("close", (exitCode) => {
        const markerIndex = output.lastIndexOf("\nSCENEKeeperHTTPSTATUS:");
        if (markerIndex < 0) {
          const detail = errorOutput.trim() || `macOS curl exited with code ${exitCode}.`;
          const curlError = new Error(detail);
          curlError.status = 0;
          curlError.code = /resolve host|could not resolve|could not resolve proxy/i.test(detail) ? "CURL_DNS"
            : /connect|connection refused|network is unreachable/i.test(detail) ? "CURL_CONNECT"
            : /ssl|tls|certificate/i.test(detail) ? "CURL_TLS"
            : exitCode === 28 ? "TIMEOUT" : "CURL_NETWORK";
          finish(reject, curlError);
          return;
        }

        const responseText = output.slice(0, markerIndex).trim();
        const statusText = output.slice(markerIndex + "\nSCENEKeeperHTTPSTATUS:".length).trim();
        const status = Number(statusText) || 0;
        if (!status) {
          const curlError = new Error(errorOutput.trim() || "macOS curl could not reach the license server.");
          curlError.status = 0;
          curlError.code = exitCode === 28 ? "TIMEOUT" : "CURL_NETWORK";
          finish(reject, curlError);
          return;
        }
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (error) {
          const parseError = new Error("The license server returned an invalid response.");
          parseError.status = status;
          parseError.code = "INVALID_RESPONSE";
          finish(reject, parseError);
          return;
        }
        if (status >= 200 && status < 300) {
          finish(resolve, result);
          return;
        }
        const responseError = new Error(result.error || `License check failed (${status}).`);
        responseError.status = status;
        finish(reject, responseError);
      });
      watchdog = window.setTimeout(() => {
        try { child.kill(); } catch (error) {}
        const timeoutError = new Error("macOS could not complete the license request within 18 seconds.");
        timeoutError.status = 0;
        timeoutError.code = "TIMEOUT";
        finish(reject, timeoutError);
      }, 18000);
      try {
        child.stdin.end(JSON.stringify(body));
      } catch (error) {
        error.status = 0;
        finish(reject, error);
      }
    });
  }

  async function request(path, body) {
    const isMac = /Macintosh|Mac OS X/i.test(navigator.userAgent || "");
    if (isMac) {
      try {
        return await requestViaMacCurl(path, body);
      } catch (curlError) {
        if (curlError.code !== "NETWORK_UNAVAILABLE") throw curlError;
        return requestViaXhr(path, body);
      }
    }

    let lastNativeError = null;
    try {
      return await requestViaCepNode(path, body);
    } catch (nativeError) {
      if (nativeError.status && nativeError.status !== 408 && nativeError.status !== 429 && nativeError.status < 500) {
        throw nativeError;
      }
      lastNativeError = nativeError;
    }

    try {
      return await requestViaXhr(path, body);
    } catch (xhrError) {
      if (lastNativeError && lastNativeError.message) {
        xhrError.message += ` (Native connection: ${lastNativeError.message})`;
      }
      throw xhrError;
    }
  }

  async function requestWithRetry(path, body, onRetry) {
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await request(path, body);
      } catch (error) {
        lastError = error;
        const canRetry = attempt === 0 &&
          (error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500);
        if (!canRetry) throw error;
        if (typeof onRetry === "function") onRetry();
        await new Promise((resolve) => window.setTimeout(resolve, 800));
      }
    }
    if (lastError) throw lastError;
    throw new Error("The license server did not respond after retrying. Check the connection and try again.");
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
      setLicenseError(error);
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
        const storageError = new Error("Could not save license state to the persistent user data folder.");
        storageError.code = "STORAGE";
        throw storageError;
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
      setLicenseError(error);
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
