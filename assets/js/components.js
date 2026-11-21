(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureInfoModal() {
    var modal = document.getElementById("keeper-info-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "keeper-info-modal";
    modal.className = "settings-modal keeper-info-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "keeper-info-title");
    modal.setAttribute("hidden", "");
    modal.innerHTML =
      '<div class="help-modal-content keeper-info-card">' +
      '<button id="keeper-info-close" class="settings-close" type="button" aria-label="Close information">×</button>' +
      '<h2 id="keeper-info-title">Information</h2>' +
      '<div id="keeper-info-copy" class="keeper-info-copy"></div>' +
      '<div class="confirm-actions keeper-info-actions"><button id="keeper-info-done" type="button">Done</button></div>' +
      '</div>';
    document.body.appendChild(modal);

    function close() {
      modal.hidden = true;
      modal.classList.remove("is-visible");
    }

    modal.querySelector("#keeper-info-close").addEventListener("click", close);
    modal.querySelector("#keeper-info-done").addEventListener("click", close);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !modal.hidden) close();
    });
    return modal;
  }

  function openInfo(title, content) {
    var modal = ensureInfoModal();
    var titleElement = modal.querySelector("#keeper-info-title");
    var copyElement = modal.querySelector("#keeper-info-copy");

    titleElement.textContent = String(title || "Information");
    if (typeof content === "string") {
      copyElement.innerHTML = "<p>" + escapeHtml(content).replace(/\n/g, "<br>") + "</p>";
    } else if (content && content.nodeType) {
      copyElement.replaceChildren(content);
    } else {
      copyElement.replaceChildren();
    }

    modal.hidden = false;
    modal.classList.add("is-visible");
    modal.querySelector("#keeper-info-done").focus();
  }

  window.KeeperSuiteUI = window.KeeperSuiteUI || {};
  window.KeeperSuiteUI.openInfo = openInfo;
})();
