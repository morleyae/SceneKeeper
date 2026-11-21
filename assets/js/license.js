(function () {
  "use strict";

  var SUITE_KEY = "toolkeepersuite.license.key";
  var SUITE_DEVICE = "toolkeepersuite.license.device";
  var SUITE_CHECKED = "toolkeepersuite.license.checkedAt";
  var OFFLINE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;

  var toolConfig = window.ToolKeeperLicenseConfig;
  var sceneConfig = window.SceneKeeperLicenseConfig;
  var suiteConfig = window.KeeperSuiteLicenseConfig;
  var config = suiteConfig || toolConfig || sceneConfig || {};
  var apiBaseUrl = String(config.apiBaseUrl || "").replace(/\/+$/, "");
  var extensionName = String(config.extensionName || (toolConfig ? "ToolKeeper" : (sceneConfig ? "SceneKeeper" : "KeeperSuite")));
  var legacyPrefix = extensionName.toLowerCase();

  function ensureLicenseUI() {
    var gate = document.getElementById("license-gate");
    if (!gate) {
      gate = document.createElement("div");
      gate.id = "license-gate";
      gate.className = "license-gate";
      gate.setAttribute("role", "dialog");
      gate.setAttribute("aria-modal", "true");
      gate.innerHTML =
        '<div class="license-gate-card">' +
        '<h2 id="license-gate-title">Activate ' + extensionName + '</h2>' +
        '<p id="license-gate-copy">Enter your license key to activate ' + extensionName + ' and all Keeper extensions.</p>' +
        '<label for="license-key-input">License key</label>' +
        '<input id="license-key-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="SK-...">' +
        '<p class="license-support-note">For support or to move a purchased key, message <strong>morley.ae</strong> on Discord.</p>' +
        '<p id="license-gate-status" class="license-gate-status" role="status" aria-live="polite"></p>' +
        '<div class="license-gate-actions"><button id="license-cancel-button" class="secondary" type="button" hidden>Close</button><button id="license-activate-button" type="button">Activate / Verify</button></div>' +
        '</div>';
      gate.hidden = true;
      document.body.insertBefore(gate, document.body.firstChild);
    }
  }

  ensureLicenseUI();
  var gate = document.getElementById("license-gate");
  var gateCopy = document.getElementById("license-gate-copy");
  var gateStatus = document.getElementById("license-gate-status");
  var settingsStatus = document.getElementById("license-settings-status");
  var input = document.getElementById("license-key-input");
  var activate = document.getElementById("license-activate-button");
  var cancel = document.getElementById("license-cancel-button");
  var manage = document.getElementById("license-manage-button");
  var busy = false;
  var licensed = false;

  function cepPaths() {
    var cep = window.__adobe_cep__ || window.cep;
    var fs = window.cep && window.cep.fs;
    if (!cep || !fs || typeof cep.getSystemPath !== "function") return null;
    var userData = String(cep.getSystemPath("userData") || "").replace(/^file:\/\//, "");
    try { userData = decodeURI(userData); } catch (error) {}
    userData = userData.replace(/\\/g, "/").replace(/\/$/, "");
    if (/^\/[A-Za-z]:\//.test(userData)) userData = userData.substring(1);
    return userData ? { cep: cep, fs: fs, userData: userData } : null;
  }

  function readPersistent(folder) {
    var paths = cepPaths();
    if (!paths) return {};
    try {
      var result = paths.fs.readFile(paths.userData + "/" + folder + "/license-state.json");
      if (!result || result.err !== 0 || !result.data) return {};
      var state = JSON.parse(result.data);
      return state && typeof state === "object" ? state : {};
    } catch (error) {
      return {};
    }
  }

  function legacyKeys(prefix) {
    return {
      key: prefix + ".license.key",
      device: prefix + ".license.device",
      checked: prefix + ".license.checkedAt"
    };
  }

  function readLocal(key) {
    try { return window.localStorage.getItem(key) || ""; } catch (error) { return ""; }
  }

  function firstString(values) {
    for (var i = 0; i < values.length; i += 1) {
      if (typeof values[i] === "string" && values[i]) return values[i];
    }
    return "";
  }

  var suite = readPersistent("ToolKeeperSuite");
  var tool = readPersistent("ToolKeeper");
  var scene = readPersistent("SceneKeeper");
  var toolKeys = legacyKeys("toolkeeper");
  var sceneKeys = legacyKeys("scenekeeper");

  var shared = {
    key: firstString([suite[SUITE_KEY], suite.key, scene[sceneKeys.key], scene[SUITE_KEY], tool[toolKeys.key], tool[SUITE_KEY], readLocal(toolKeys.key), readLocal(sceneKeys.key)]),
    device: firstString([suite[SUITE_DEVICE], suite.device, scene[sceneKeys.device], scene[SUITE_DEVICE], tool[toolKeys.device], tool[SUITE_DEVICE], readLocal(toolKeys.device), readLocal(sceneKeys.device)]),
    checked: firstString([suite[SUITE_CHECKED], suite.checked, scene[sceneKeys.checked], scene[SUITE_CHECKED], tool[toolKeys.checked], tool[SUITE_CHECKED], readLocal(toolKeys.checked), readLocal(sceneKeys.checked)])
  };

  var state = Object.assign({}, suite, shared);
  state[SUITE_KEY] = shared.key;
  state[SUITE_DEVICE] = shared.device;
  state[SUITE_CHECKED] = shared.checked;
  state.key = shared.key;
  state.device = shared.device;
  state.checked = shared.checked;
  state[toolKeys.key] = shared.key;
  state[toolKeys.device] = shared.device;
  state[toolKeys.checked] = shared.checked;
  state[sceneKeys.key] = shared.key;
  state[sceneKeys.device] = shared.device;
  state[sceneKeys.checked] = shared.checked;

  function writePersistent(folder) {
    var paths = cepPaths();
    if (!paths) return false;
    try {
      var directory = paths.userData + "/" + folder;
      var stat = paths.fs.stat(directory);
      var exists = stat && stat.err === 0 && stat.data && typeof stat.data.isDirectory === "function" && stat.data.isDirectory();
      if (!exists) {
        var made = paths.fs.makedir(directory);
        if (!made || made.err !== 0) return false;
      }
      var result = paths.fs.writeFile(directory + "/license-state.json", JSON.stringify(state));
      return Boolean(result && result.err === 0);
    } catch (error) {
      return false;
    }
  }

  function writeAll() {
    var paths = cepPaths();
    writePersistent("ToolKeeperSuite");
    writePersistent("ToolKeeper");
    writePersistent("SceneKeeper");
    try {
      window.localStorage.setItem(SUITE_KEY, shared.key);
      window.localStorage.setItem(SUITE_DEVICE, shared.device);
      window.localStorage.setItem(SUITE_CHECKED, shared.checked);
      window.localStorage.setItem(toolKeys.key, shared.key);
      window.localStorage.setItem(toolKeys.device, shared.device);
      window.localStorage.setItem(toolKeys.checked, shared.checked);
      window.localStorage.setItem(sceneKeys.key, shared.key);
      window.localStorage.setItem(sceneKeys.device, shared.device);
      window.localStorage.setItem(sceneKeys.checked, shared.checked);
    } catch (error) {}
  }

  function getStored(name) {
    return typeof state[name] === "string" ? state[name] : "";
  }

  function setStored(name, value) {
    state[name] = String(value);
    if (name === SUITE_KEY) {
      shared.key = String(value);
      state.key = shared.key;
      state[toolKeys.key] = shared.key;
      state[sceneKeys.key] = shared.key;
    } else if (name === SUITE_DEVICE) {
      shared.device = String(value);
      state.device = shared.device;
      state[toolKeys.device] = shared.device;
      state[sceneKeys.device] = shared.device;
    } else if (name === SUITE_CHECKED) {
      shared.checked = String(value);
      state.checked = shared.checked;
      state[toolKeys.checked] = shared.checked;
      state[sceneKeys.checked] = shared.checked;
    }
    writeAll();
  }

  writeAll();

  function setStatus(message, error) {
    if (gateStatus) {
      gateStatus.textContent = message;
      gateStatus.classList.toggle("is-error", Boolean(error));
    }
    if (settingsStatus) settingsStatus.textContent = message;
  }

  function showGate(message, locked) {
    if (!gate) return;
    if (gateCopy) gateCopy.textContent = message;
    if (cancel) cancel.hidden = locked;
    gate.hidden = false;
    if (input) input.focus();
  }

  function getDeviceId() {
    var deviceId = getStored(SUITE_DEVICE);
    if (deviceId) return deviceId;
    var bytes = new Uint8Array(24);
    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }
    deviceId = Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
    setStored(SUITE_DEVICE, deviceId);
    return deviceId;
  }

  function describeError(error) {
    var status = Number(error && error.status) || 0;
    var message = String(error && error.message || "License check failed.");
    if (status === 404) return "This license key was not found. Check the key or contact support.";
    if (status === 403) return "This license key is revoked or unavailable. Contact support.";
    if (status === 409) return "This license key is already activated on another device. Message morley.ae on Discord to reset it.";
    if (status === 429) return "The license service is rate limiting requests. Wait a few minutes and retry.";
    if (status >= 500) return "The license service is temporarily unavailable. Retry in a few minutes.";
    if (status === 408) return "The license server timed out. Check your internet connection and retry.";
    if (status === 0 && message && message !== "Could not reach the license server." && message !== "The license server did not respond in time.") return "Could not reach the license server: " + message;
    if (status === 0) return "Could not reach the license server. Check your internet connection and retry.";
    return message;
  }

  function macNativeCurlRequest(path, body) {
    return new Promise(function (resolve, reject) {
      if (!/Mac/i.test(navigator.platform || "")) {
        reject(Object.assign(new Error("Native macOS curl fallback is unavailable on this platform."), { status: 0 }));
        return;
      }
      var cepNode = window.cep_node || (typeof cep_node !== "undefined" ? cep_node : null);
      if (!cepNode || typeof cepNode.require !== "function") {
        reject(Object.assign(new Error("CEP Node runtime is unavailable for the native license request."), { status: 0 }));
        return;
      }
      var childProcess;
      try { childProcess = cepNode.require("child_process"); }
      catch (error) {
        reject(Object.assign(new Error("Could not load the native license process: " + error.message), { status: 0 }));
        return;
      }
      var settled = false;
      var stdout = "";
      var stderr = "";
      var args = [
        "-sS", "--max-time", "20",
        "-H", "Content-Type: application/json",
        "-H", "Accept: application/json",
        "-X", "POST",
        "--data-binary", JSON.stringify(body),
        "-w", "\n__TK_STATUS__:%{http_code}",
        apiBaseUrl + path
      ];
      var child;
      try { child = childProcess.spawn("/usr/bin/curl", args, { stdio: ["ignore", "pipe", "pipe"] }); }
      catch (error) {
        reject(Object.assign(new Error("Could not start native curl: " + error.message), { status: 0 }));
        return;
      }
      if (!child || !child.stdout || !child.stderr) {
        reject(Object.assign(new Error("Native curl could not capture a license response."), { status: 0 }));
        return;
      }
      child.stdout.setEncoding("utf8");
      child.stderr.setEncoding("utf8");
      child.stdout.on("data", function (chunk) { stdout += String(chunk || ""); });
      child.stderr.on("data", function (chunk) { stderr += String(chunk || ""); });
      child.on("error", function (error) {
        if (settled) return;
        settled = true;
        reject(Object.assign(new Error("Native curl failed: " + error.message), { status: 0 }));
      });
      child.on("close", function (exitCode) {
        if (settled) return;
        settled = true;
        var match = stdout.match(/\n__TK_STATUS__(?::)(\d{3})\s*$/);
        var status = match ? Number(match[1]) : 0;
        var responseText = match ? stdout.replace(/\n__TK_STATUS__:\d{3}\s*$/, "") : stdout;
        if (exitCode !== 0) {
          var detail = String(stderr || "").trim().replace(/\s+/g, " ").slice(0, 300);
          reject(Object.assign(new Error(detail ? "Native curl failed: " + detail : "Native curl exited with code " + exitCode), { status: status || 0 }));
          return;
        }
        var response;
        try { response = JSON.parse(responseText); }
        catch (error) {
          var parseError = new Error("The license server returned an invalid response.");
          parseError.status = status;
          reject(parseError);
          return;
        }
        if (status >= 200 && status < 300) resolve(response);
        else {
          var requestError = new Error(response.error || "License check failed (" + status + ").");
          requestError.status = status || 0;
          reject(requestError);
        }
      });
    });
  }

  function request(path, body) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", apiBaseUrl + path, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 25000;
      xhr.onload = function () {
        var response;
        try { response = JSON.parse(xhr.responseText); }
        catch (error) {
          var parseError = new Error("The license server returned an invalid response.");
          parseError.status = xhr.status;
          reject(parseError);
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300) resolve(response);
        else {
          var requestError = new Error(response.error || "License check failed (" + xhr.status + ").");
          requestError.status = xhr.status;
          reject(requestError);
        }
      };
      var retryNative = function (originalError) {
        macNativeCurlRequest(path, body).then(resolve).catch(function (nativeError) {
          reject(nativeError.status ? nativeError : originalError);
        });
      };
      xhr.onerror = function () {
        retryNative(Object.assign(new Error("Could not reach the license server."), { status: 0 }));
      };
      xhr.ontimeout = function () {
        retryNative(Object.assign(new Error("The license server did not respond in time."), { status: 408 }));
      };
      xhr.send(JSON.stringify(body));
    });
  }

  function allowOffline(error) {
    var temporary = error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500;
    var checked = Number(getStored(SUITE_CHECKED)) || 0;
    var elapsed = Date.now() - checked;
    return temporary && checked > 0 && elapsed >= 0 && elapsed <= OFFLINE_GRACE_MS;
  }

  function announceReady() {
    if (extensionName === "SceneKeeper") {
      window.SceneKeeperAppReady = true;
      window.dispatchEvent(new Event("scenekeeper-app-ready"));
    }
  }

  async function verify() {
    var licenseKey = getStored(SUITE_KEY);
    if (!licenseKey) {
      setStatus("No license activated on this installation.", false);
      showGate("Enter your license key to activate ToolKeeper and SceneKeeper on this installation.", true);
      announceReady();
      return;
    }
    setStatus("Checking your shared license...", false);
    try {
      await request("/api/verify", { licenseKey: licenseKey, deviceId: getDeviceId() });
      setStored(SUITE_CHECKED, String(Date.now()));
      licensed = true;
      if (gate) gate.hidden = true;
      setStatus("Shared license active on this installation.", false);
      announceReady();
    } catch (error) {
      if (allowOffline(error)) {
        licensed = true;
        if (gate) gate.hidden = true;
        setStatus("License server unavailable. Offline access is active temporarily.", false);
        announceReady();
        return;
      }
      setStatus(describeError(error), true);
      showGate("Enter a valid license key to activate ToolKeeper and SceneKeeper.", true);
    }
  }

  async function activateLicense() {
    if (busy || !activate) return;
    if (!apiBaseUrl) {
      setStatus("License service is not configured for this build.", true);
      return;
    }
    var licenseKey = input ? (input.value.trim() || getStored(SUITE_KEY)) : getStored(SUITE_KEY);
    if (!licenseKey) {
      setStatus("Enter your license key to continue.", true);
      if (input) input.focus();
      return;
    }
    busy = true;
    activate.disabled = true;
    activate.textContent = "Checking...";
    setStatus("Activating shared license...", false);
    try {
      await request("/api/activate", { licenseKey: licenseKey, deviceId: getDeviceId() });
      setStored(SUITE_KEY, licenseKey);
      setStored(SUITE_CHECKED, String(Date.now()));
      licensed = true;
      if (gate) gate.hidden = true;
      if (input) input.value = "";
      setStatus("Shared license active on this installation.", false);
      announceReady();
    } catch (error) {
      setStatus(describeError(error), true);
    } finally {
      busy = false;
      activate.disabled = false;
      activate.textContent = "Activate / Verify";
    }
  }

  if (activate) activate.addEventListener("click", activateLicense);
  if (input) input.addEventListener("keydown", function (event) { if (event.key === "Enter") activateLicense(); });
  if (cancel) cancel.addEventListener("click", function () { if (!busy) gate.hidden = true; });
  if (manage) manage.addEventListener("click", function () {
    var settingsDialog = document.getElementById("settings-dialog") || document.getElementById("settings-modal");
    if (settingsDialog && typeof settingsDialog.close === "function" && settingsDialog.open) settingsDialog.close();
    showGate("Enter a license key to activate or verify ToolKeeper and SceneKeeper.", !licensed);
  });

  if (!/^https:\/\/[^/\s]+(?:\/|$)/i.test(apiBaseUrl)) {
    setStatus("License service URL must use HTTPS.", true);
    showGate("The license service URL must use HTTPS.", false);
    if (activate) activate.disabled = true;
  } else {
    if (gate) gate.hidden = true;
    verify();
  }

  var publicApi = {
    open: function () { showGate("Enter a license key to activate or verify this installation.", !licensed); }
  };
  if (extensionName === "ToolKeeper") window.ToolKeeperLicense = publicApi;
  if (extensionName === "SceneKeeper") window.SceneKeeperLicense = publicApi;
})();
