
    const result = document.getElementById("result");
    const panelTooltip = document.getElementById("panel-tooltip");
    const panelFullscreenCloseButton = document.getElementById("panel-fullscreen-close");
    const actionNotification = document.getElementById("action-notification");
    const errorDialog = document.getElementById("error-dialog");
    const errorDialogDetails = document.getElementById("error-dialog-details");
    const errorDialogOkButton = document.getElementById("error-dialog-ok-button");
    const librarySearch = document.getElementById("library-search");
    const clearLibrarySearch = document.getElementById("clear-library-search");
    const libraryTabs = document.getElementById("library-tabs");
    const newLibraryTabButton = document.getElementById("new-library-tab");
    const favoriteList = document.getElementById("favorite-list");
    const favoritesSection = document.querySelector(".favorites-section");
    function syncFullscreenPanelPage() {
      const activeFullscreenPage = document.querySelector(".panel-fullscreen-modal:not([hidden])");
      const isFullscreenPageOpen = Boolean(activeFullscreenPage);
      document.body.classList.toggle("panel-fullscreen-page-open", isFullscreenPageOpen);
      document.documentElement.classList.toggle("panel-fullscreen-page-open", isFullscreenPageOpen);
      panelFullscreenCloseButton.hidden = !activeFullscreenPage;
    }
    function focusFullscreenCloseButton() {
      syncFullscreenPanelPage();
      panelFullscreenCloseButton.focus();
    }
    const fullscreenPanelPageObserver = new MutationObserver(syncFullscreenPanelPage);
    document.querySelectorAll(".panel-fullscreen-modal").forEach((page) => {
      fullscreenPanelPageObserver.observe(page, { attributes: true, attributeFilter: ["hidden"] });
    });
    syncFullscreenPanelPage();
    panelFullscreenCloseButton.addEventListener("click", () => {
      const activePage = document.querySelector(".panel-fullscreen-modal:not([hidden])");
      if (!activePage) return;
      const closeTargets = {
        "clip-trash-modal": "#clip-trash-close",
        "clip-reorder-modal": "#clip-reorder-close",
        "missing-footage-modal": "#missing-footage-close",
        "help-modal": "#help-close",
        "settings-modal": "#settings-close",
        "export-data-confirmation": "#cancel-export-data-button",
        "random-marker-insert-dialog": "#random-marker-insert-cancel",
        "random-marker-replace-dialog": "#random-marker-replace-done",
        "save-clip-dialog": "#cancel-save-clip-button"
      };
      const closeTarget = closeTargets[activePage.id];
      const closeButton = closeTarget ? activePage.querySelector(closeTarget) : null;
      if (closeButton) closeButton.click();
    });
    const clipSortMenuControl = document.getElementById("library-sort-control");
    const clipSortMenuToggle = document.getElementById("clip-sort-menu-toggle");
    const clipSortMenu = document.getElementById("clip-sort-menu");
    const missingFootageButton = document.getElementById("missing-footage-button");
    const missingFootageModal = document.getElementById("missing-footage-modal");
    const missingFootageList = document.getElementById("missing-footage-list");
    const libraryBreadcrumb = document.getElementById("library-breadcrumb");
    const undoActionButton = document.getElementById("undo-action-button");
    const copySelectionButton = document.getElementById("copy-selection-button");
    const pasteSelectionButton = document.getElementById("paste-selection-button");
    const createFolderToggle = document.getElementById("create-folder-toggle");
    const folderCreateRow = document.getElementById("folder-create-row");
    const newFolderName = document.getElementById("new-folder-name");
    const createFolderButton = document.getElementById("create-folder-button");
    const libraryContextMenu = document.getElementById("library-context-menu");
    let libraryContextMenuAnchor = null;
    const folderCreateDialog = document.getElementById("folder-create-dialog");
    const folderCreateName = document.getElementById("folder-create-name");
    const confirmFolderCreateButton = document.getElementById("confirm-folder-create-button");
    const cancelFolderCreateButton = document.getElementById("cancel-folder-create-button");
    const renameDialog = document.getElementById("rename-dialog");
    const renameDialogTitle = document.getElementById("rename-dialog-title");
    const renameDialogInput = document.getElementById("rename-dialog-input");
    const confirmRenameButton = document.getElementById("confirm-rename-button");
    const cancelRenameButton = document.getElementById("cancel-rename-button");
    const clipEditDialog = document.getElementById("clip-edit-dialog");
    const clipEditTitle = document.getElementById("clip-edit-dialog-title");
    const clipEditName = document.getElementById("clip-edit-name");
    const clipEditIn = document.getElementById("clip-edit-in");
    const clipEditOut = document.getElementById("clip-edit-out");
    const clipEditPositionX = document.getElementById("clip-edit-position-x");
    const clipEditPositionY = document.getElementById("clip-edit-position-y");
    const clipEditScaleX = document.getElementById("clip-edit-scale-x");
    const clipEditScaleY = document.getElementById("clip-edit-scale-y");
    const clipEditScaleLink = document.getElementById("clip-edit-scale-link");
    const clipEditAudioToggle = document.getElementById("clip-edit-audio-toggle");
    const clipEditAudioState = document.getElementById("clip-edit-audio-state");
    const clipEditError = document.getElementById("clip-edit-error");
    const confirmClipEditButton = document.getElementById("confirm-clip-edit-button");
    const cancelClipEditButton = document.getElementById("cancel-clip-edit-button");
    const favoritePreview = document.getElementById("favorite-preview");
    const favoritePreviewVideo = document.getElementById("favorite-preview-video");
    const favoritePreviewName = document.getElementById("favorite-preview-name");
    const favoritePreviewStatus = document.getElementById("favorite-preview-status");
    const favoritePreviewMessage = document.getElementById("favorite-preview-message");
    const favoritePlayerControls = document.getElementById("favorite-player-controls");
    const favoritePlayButton = document.getElementById("favorite-play-button");
    const favoritePlayGlyph = document.getElementById("favorite-play-glyph");
    const favoritePreviewSeek = document.getElementById("favorite-preview-seek");
    const favoritePreviewCurrent = document.getElementById("favorite-preview-current");
    const favoritePreviewDuration = document.getElementById("favorite-preview-duration");
    const favoriteMuteButton = document.getElementById("favorite-mute-button");
    const quickSaveSelectedClipsButton = document.getElementById("quick-save-selected-clips");
    const saveClipDialog = document.getElementById("save-clip-dialog");
    const saveClipNameInput = document.getElementById("save-clip-name");
    const saveClipCurrentLocationButton = document.getElementById("save-clip-current-location-button");
    const saveClipSceneLocationButton = document.getElementById("save-clip-scene-location-button");
    const saveClipNewFolderButton = document.getElementById("save-clip-new-folder-button");
    const saveClipBreadcrumb = document.getElementById("save-clip-breadcrumb");
    const saveClipFolderList = document.getElementById("save-clip-folder-list");
    const saveClipFolderSearch = document.getElementById("save-clip-folder-search");
    const saveClipOptionsDetails = document.querySelector(".save-clip-options-details");
    const saveClipPosition = document.getElementById("save-clip-position");
    const saveClipScale = document.getElementById("save-clip-scale");
    const saveClipAudio = document.getElementById("save-clip-audio");
    const cancelSaveClipButton = document.getElementById("cancel-save-clip-button");
    const longClipConfirmation = document.getElementById("long-clip-confirmation");
    const longClipConfirmationText = document.getElementById("long-clip-confirmation-text");
    const saveLongClipButton = document.getElementById("save-long-clip-button");
    const shortenLongClipButton = document.getElementById("shorten-long-clip-button");
    const saveFirst10SecondsButton = document.getElementById("save-first-10-seconds-button");
    const replaceClipConfirmation = document.getElementById("replace-clip-confirmation");
    const replaceClipConfirmationText = document.getElementById("replace-clip-confirmation-text");
    const confirmClipReplacementButton = document.getElementById("confirm-clip-replacement-button");
    const cancelClipReplacementButton = document.getElementById("cancel-clip-replacement-button");
    const insertFavoriteButton = document.getElementById("insert-favorite-button");
    const extraClipActionsToggle = document.getElementById("extra-clip-actions-toggle");
    const extraClipActions = document.getElementById("extra-clip-actions");
    const randomMarkerInsertOpenButton = document.getElementById("random-marker-insert-open");
    const replaceSelectedClipOpenButton = document.getElementById("replace-selected-clip-open");
    const quickReplaceSelectedClipButton = document.getElementById("quick-replace-selected-clip");
    const randomMarkerInsertDialog = document.getElementById("random-marker-insert-dialog");
    const randomMarkerInsertTitle = document.getElementById("random-marker-insert-title");
    const randomMarkerInsertHelp = document.getElementById("random-marker-insert-help");
    const randomMarkerCustomFolders = document.getElementById("random-marker-custom-folders");
    const randomMarkerFolderTree = document.getElementById("random-marker-folder-tree");
    const randomMarkerFolderSearch = document.getElementById("random-marker-folder-search");
    const randomMarkerSkipNames = document.getElementById("random-marker-skip-names");
    const randomMarkerSkipEntry = document.getElementById("random-marker-skip-entry");
    const randomMarkerSkipChips = document.getElementById("random-marker-skip-chips");
    const randomMarkerNameOptions = document.getElementById("random-marker-name-options");
    const randomMarkerSkipSuggestions = document.getElementById("random-marker-skip-suggestions");
    const randomMarkerSkipSuggestionCopy = document.getElementById("random-marker-skip-suggestion-copy");
    const randomMarkerSkipSuggestionAdd = document.getElementById("random-marker-skip-suggestion-add");
    const randomMarkerCreatePrecomps = document.getElementById("random-marker-create-precomps");
    const randomMarkerPresetPicker = document.getElementById("random-marker-preset-picker");
    const randomMarkerPresetRecentSelect = document.getElementById("random-marker-preset-recent");
    const randomMarkerPresetName = document.getElementById("random-marker-preset-name");
    const randomMarkerPresetChooseButton = document.getElementById("random-marker-preset-choose");
    const randomMarkerPresetClearButton = document.getElementById("random-marker-preset-clear");
    const randomMarkerInsertRunButton = document.getElementById("random-marker-insert-run");
    const randomMarkerReplaceCurrentFolderButton = document.getElementById("random-marker-replace-current-folder");
    const replaceSelectedNextDialog = document.getElementById("replace-selected-next-dialog");
    const replaceSelectedAgainButton = document.getElementById("replace-selected-again");
    const replaceSelectedChangeFoldersButton = document.getElementById("replace-selected-change-folders");
    const replaceSelectedNextDoneButton = document.getElementById("replace-selected-next-done");
    const randomMarkerInsertCancelButton = document.getElementById("random-marker-insert-cancel");
    const randomMarkerReplaceDialog = document.getElementById("random-marker-replace-dialog");
    const randomMarkerReplaceList = document.getElementById("random-marker-replace-list");
    const randomMarkerReplaceSelectedButton = document.getElementById("random-marker-replace-selected");
    const randomMarkerReplaceChooseClipButton = document.getElementById("random-marker-replace-choose-clip");
    const randomMarkerDeleteSelectedPrecompsButton = document.getElementById("random-marker-delete-selected-precomps");
    const randomMarkerDeleteConfirmation = document.getElementById("random-marker-delete-confirmation");
    const randomMarkerDeleteConfirmationCancelButton = document.getElementById("random-marker-delete-confirmation-cancel");
    const randomMarkerDeleteConfirmationConfirmButton = document.getElementById("random-marker-delete-confirmation-confirm");
    const randomMarkerReplaceDoneButton = document.getElementById("random-marker-replace-done");
    const exportDataConfirmation = document.getElementById("export-data-confirmation");
    const exportFootageChoiceList = document.getElementById("export-footage-choice-list");
    const exportChoiceSearch = document.getElementById("export-choice-search");
    const exportSelectedFootageButton = document.getElementById("export-selected-footage-button");
    const exportAllDataButton = document.getElementById("export-all-data-button");
    const exportFootageModeButton = document.getElementById("export-footage-mode-button");
    const exportFolderModeButton = document.getElementById("export-folder-mode-button");
    const cancelExportDataButton = document.getElementById("cancel-export-data-button");
    const settingsToggle = document.getElementById("settings-toggle");
    const workspaceName = document.getElementById("workspace-name");
    const workspaceSaveButton = document.getElementById("workspace-save");
    const workspaceSelect = document.getElementById("workspace-select");
    const workspaceOpenButton = document.getElementById("workspace-open");
    const workspaceUpdateButton = document.getElementById("workspace-update");
    const workspaceDeleteButton = document.getElementById("workspace-delete");
    const workspaceDeleteConfirmation = document.getElementById("workspace-delete-confirmation");
    const workspaceDeleteConfirmationText = document.getElementById("workspace-delete-confirmation-text");
    const cancelWorkspaceDeleteButton = document.getElementById("cancel-workspace-delete");
    const confirmWorkspaceDeleteButton = document.getElementById("confirm-workspace-delete");
    const deleteLibraryOpenButton = document.getElementById("delete-library-open");
    const deleteLibraryOffer = document.getElementById("delete-library-offer");
    const deleteLibraryExportButton = document.getElementById("delete-library-export");
    const deleteLibraryContinueButton = document.getElementById("delete-library-continue");
    const deleteLibraryCancelButton = document.getElementById("delete-library-cancel");
    const deleteLibraryFinal = document.getElementById("delete-library-final");
    const deleteLibraryConfirmInput = document.getElementById("delete-library-confirm-input");
    const deleteLibraryFinalCancelButton = document.getElementById("delete-library-final-cancel");
    const deleteLibraryConfirmButton = document.getElementById("delete-library-confirm");
    const helpToggle = document.getElementById("help-toggle");
    const libraryDataToggle = document.getElementById("library-data-toggle");
    const helpModal = document.getElementById("help-modal");
    const startGuidedTutorialButton = document.getElementById("start-guided-tutorial");
    const guidedTour = document.getElementById("guided-tour");
    const guidedTourCard = document.getElementById("guided-tour-card");
    const guidedTourStepLabel = document.getElementById("guided-tour-step-label");
    const guidedTourTitle = document.getElementById("guided-tour-title");
    const guidedTourCopy = document.getElementById("guided-tour-copy");
    const guidedTourSkipButton = document.getElementById("guided-tour-skip");
    const guidedTourBackButton = document.getElementById("guided-tour-back");
    const guidedTourNextButton = document.getElementById("guided-tour-next");
    const guidedTourPointer = document.getElementById("guided-tour-pointer");
    const clipTrashToggle = document.getElementById("clip-trash-toggle");
    const clipTrashModal = document.getElementById("clip-trash-modal");
    const clipTrashList = document.getElementById("clip-trash-list");
    const clipReorderModal = document.getElementById("clip-reorder-modal");
    const clipReorderTitle = document.getElementById("clip-reorder-title");
    const clipReorderList = document.getElementById("clip-reorder-list");
    const clipReorderLocation = document.getElementById("clip-reorder-location");
    const clipReorderCancelButton = document.getElementById("clip-reorder-cancel");
    const clipReorderDoneButton = document.getElementById("clip-reorder-done");
    const manualReorderConfirmation = document.getElementById("manual-reorder-confirmation");
    const cancelManualReorderButton = document.getElementById("cancel-manual-reorder");
    const confirmManualReorderButton = document.getElementById("confirm-manual-reorder");
    const emptyClipTrashButton = document.getElementById("empty-clip-trash-button");
    const clipTrashConfirmation = document.getElementById("clip-trash-confirmation");
    const clipTrashConfirmationText = document.getElementById("clip-trash-confirmation-text");
    const confirmClipTrashAction = document.getElementById("confirm-clip-trash-action");
    const clipPreviewSizeSquare = document.getElementById("clip-preview-size-square");
    const clipPreviewSizeLandscape = document.getElementById("clip-preview-size-landscape");
    const saveDefaultPosition = document.getElementById("save-default-position");
    const saveDefaultScale = document.getElementById("save-default-scale");
    const saveDefaultAudio = document.getElementById("save-default-audio");
    const frameBlendingEnabled = document.getElementById("frame-blending-enabled");
    const frameBlendingState = document.getElementById("frame-blending-state");
    const mutedInsertEnabled = document.getElementById("muted-insert-enabled");
    const mutedInsertState = document.getElementById("muted-insert-state");
    const previewAutoplayToggle = document.getElementById("preview-autoplay");
    const previewAutoplayState = document.getElementById("preview-autoplay-state");
    const deleteConfirmation = document.getElementById("delete-confirmation");
    const deleteConfirmationText = document.getElementById("delete-confirmation-text");
    const importFolderConflict = document.getElementById("import-folder-conflict");
    const importFolderConflictCopy = document.getElementById("import-folder-conflict-copy");
    const importFolderConflictReplaceButton = document.getElementById("import-folder-conflict-replace");
    const importFolderConflictKeepButton = document.getElementById("import-folder-conflict-keep");
    const importFolderConflictCancelButton = document.getElementById("import-folder-conflict-cancel");
    const importSuccessConfirmation = document.getElementById("import-success-confirmation");
    const importSuccessConfirmationText = document.getElementById("import-success-confirmation-text");
    const cancelDeleteButton = document.getElementById("cancel-delete-button");
    const confirmDeleteButton = document.getElementById("confirm-delete-button");
    const importSuccessOkButton = document.getElementById("import-success-ok-button");
    let favoriteRecords = [];
    let guidedTourActive = false;
    let guidedTourStep = "welcome";
    let guidedTourTarget = null;
    let guidedTourBusy = false;
    let guidedTourSamplePath = "";
    let guidedTourSampleStorageIndex = null;
    let guidedTourPreviewCleanup = null;
    let guidedTourPreviousHoverPreviewEnabled = null;
    let footageStatusRequestActive = false;
    let pendingFootageStatusCallback = null;
    let draggedClipOrderId = "";
    let activeClipDragGhost = null;
    function moveActiveClipDragGhost(event) {
      if (!activeClipDragGhost) return;
      const x = Number(event.clientX);
      const y = Number(event.clientY);
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 ||
          x > document.documentElement.clientWidth || y > document.documentElement.clientHeight) {
        activeClipDragGhost.style.display = "none";
        return;
      }
      activeClipDragGhost.style.display = "block";
      activeClipDragGhost.style.left = `${x}px`;
      activeClipDragGhost.style.top = `${y}px`;
    }
    document.addEventListener("dragover", moveActiveClipDragGhost, true);
    document.addEventListener("dragleave", (event) => {
      if (!activeClipDragGhost) return;
      if (event.clientX <= 0 || event.clientY <= 0 ||
          event.clientX >= document.documentElement.clientWidth ||
          event.clientY >= document.documentElement.clientHeight) {
        activeClipDragGhost.style.display = "none";
      }
    }, true);
    let clipReorderRequestActive = false;
    let pendingClipReorderIds = null;
    let pendingManualReorderOpen = null;
    let originalClipReorderIds = null;
    let clipReorderFolderId = "";
    let pendingFolderReorderIds = null;
    let originalFolderReorderIds = null;
    let folderReorderParentId = "";
    let folderReorderRequestActive = false;
    let draggedFolderOrderId = "";
    let pendingCollectionOrderIds = null;
    let originalCollectionOrderIds = null;
    let collectionReorderParentId = "";
    let draggedCollectionOrderId = "";
    let favoriteFolders = [];
    let favoriteFoldersLoaded = false;
    const clipThumbnailCache = new Map();
    const randomMarkerSelectedFolderIds = new Set();
    const randomMarkerExcludedFolderIds = new Set();
    const expandedRandomMarkerFolderIds = new Set();
    let randomMarkerAvailableNames = [];
    let randomMarkerSkippedNames = [];
    let randomMarkerCloseMarkerSuggestions = [];
    let randomMarkerTwixtorPresetPath = "";
    let randomMarkerRecentTwixtorPresets = [];
    let randomMarkerReplaceSlots = [];
    let randomMarkerReplaceMode = "marker";
    let pendingManualReplaceSlots = null;
    let randomMarkerReplaceFolderSelection = "*";
    let randomMarkerDialogMode = "insert";
    let lastSelectedClipReplacementFolders = null;
    let randomMarkerPendingPrecompDeleteSlots = null;
    let randomMarkerSelectionPollTimer = null;
    let randomMarkerSelectionSyncInFlight = false;
    let lastRandomMarkerAESelectionSignature = null;
    let randomMarkerSelectionSyncGeneration = 0;
    let pendingRandomMarkerAESelectionSignature = null;
    let pendingRandomMarkerAESelectionCount = 0;
    let saveClipPickerFolderId = "";
    let saveClipSelectedFolderId = "";
    let saveClipCurrentFolderId = "";
    const expandedSaveClipFolderIds = new Set();
    const collapsedSaveClipSearchFolderIds = new Set();
    let pendingClipReplacementIndex = null;
    let pendingQuickSaveBatch = null;
    let exportSelectedFootagePaths = [];
    let exportSelectedFolderIds = [];
    let exportSelectionMode = "folders";
    let exportChoiceSearchQuery = "";
    const expandedExportFolderIds = new Set();
    let pendingDeleteIndex = null;
    let pendingDeleteFootagePath = null;
    let pendingClipTrashAction = null;
    let clipTrashPreviewEntries = [];
    let favoriteResultsMode = "footage";
    let selectedFootagePath = "";
    let selectedFolderId = "";
    let selectedFavoriteStorageIndex = null;
    let selectedLibraryItemKey = "";
    let selectedLibraryKeys = new Set();
    let copiedLibraryEntries = [];
    let libraryFavoriteKeys = new Set();
    let pendingFolderCreateParentId = "";
    let explorerTabs = [{
      id: "explorer-tab-1",
      sourcePath: "",
      folderId: "",
      search: "",
      selectedFavoriteStorageIndex: null,
      selectedLibraryItemKey: ""
    }];
    let activeExplorerTabId = "explorer-tab-1";
    let nextExplorerTabNumber = 2;
    let draggedExplorerTabId = "";
    const EXPLORER_TAB_DRAG_TYPE = "application/x-scenekeeper-explorer-tab";
    const GUIDED_TUTORIAL_FOLDER_ID = "scenekeeper_getting_started";
    const GUIDED_TUTORIAL_SEEN_KEY = "sceneKeeper.guidedTutorial.seen";
    let pendingDeleteFolderId = null;
    let pendingRenameTarget = null;
    let pendingClipEditRecord = null;
    let clipEditScalesLinked = true;
    let favoritePreviewRange = null;
    let favoritePreviewRequest = 0;
    let previewAutoplay = true;
    let hoverPreviewEnabled = true;
    let clipPreviewFormat = "square";
    let previewPanelFocused = true;
    let errorDialogReturnFocus = null;
    let favoriteLoadNoticeTimer = null;
    let suppressInitialFavoriteLoadStatus = true;
    let shiftDeleteMode = false;

    function setKeyboardFocusMode() {
      document.body.classList.remove("pointer-mode");
    }

    function setPointerFocusMode() {
      document.body.classList.add("pointer-mode");
    }

    let panelTooltipTarget = null;
    let panelTooltipPinned = false;
    let actionNotificationTimer = null;
    let actionNotificationHideTimer = null;

    function getPanelTooltipTarget(element) {
      return element instanceof Element ? element.closest("[data-tooltip]") : null;
    }

    function hidePanelTooltip(target) {
      if (target && target !== panelTooltipTarget) return;
      panelTooltipTarget = null;
      panelTooltipPinned = false;
      panelTooltip.classList.remove("is-visible");
      panelTooltip.classList.remove("is-help-tooltip");
      panelTooltip.hidden = true;
    }

    function showPanelTooltip(target, pinned) {
      const label = target?.dataset.tooltip?.trim();
      if (!label) {
        hidePanelTooltip(target);
        return;
      }

      panelTooltipTarget = target;
      panelTooltipPinned = Boolean(pinned);
      panelTooltip.textContent = label;
      panelTooltip.hidden = false;
      panelTooltip.classList.toggle("is-help-tooltip", target.classList.contains("random-marker-help"));
      panelTooltip.classList.remove("is-visible");

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = panelTooltip.getBoundingClientRect();
      const margin = 8;
      const gap = 6;
      let top = targetRect.top - tooltipRect.height - gap;
      if (top < margin) top = targetRect.bottom + gap;
      top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin));
      const left = Math.max(
        margin,
        Math.min(
          targetRect.left + (targetRect.width - tooltipRect.width) / 2,
          window.innerWidth - tooltipRect.width - margin
        )
      );
      panelTooltip.style.left = `${left}px`;
      panelTooltip.style.top = `${top}px`;
      requestAnimationFrame(() => {
        if (panelTooltipTarget === target) panelTooltip.classList.add("is-visible");
      });
    }

    function showActionNotification(message, tone) {
      if (!actionNotification) return;
      if (actionNotificationTimer) clearTimeout(actionNotificationTimer);
      if (actionNotificationHideTimer) clearTimeout(actionNotificationHideTimer);
      actionNotification.textContent = message;
      actionNotification.classList.toggle("is-error", tone === "error");
      actionNotification.classList.toggle("is-success", tone === "success");
      actionNotification.classList.toggle("is-warning", tone === "warning");
      actionNotification.hidden = false;
      actionNotification.classList.remove("is-visible");
      void actionNotification.offsetWidth;
      requestAnimationFrame(() => actionNotification.classList.add("is-visible"));
      actionNotificationTimer = window.setTimeout(() => {
        actionNotification.classList.remove("is-visible");
        actionNotificationHideTimer = window.setTimeout(() => {
          actionNotification.hidden = true;
          actionNotification.classList.remove("is-error", "is-success", "is-warning");
          actionNotificationHideTimer = null;
        }, 160);
        actionNotificationTimer = null;
      }, tone === "error" ? 5000 : 3000);
    }

    document.addEventListener("pointerover", (event) => {
      const target = getPanelTooltipTarget(event.target);
      if (panelTooltipPinned) return;
      if (target?.classList.contains("random-marker-help")) return;
      if (target && target !== panelTooltipTarget) showPanelTooltip(target);
    });
    document.addEventListener("pointerout", (event) => {
      const target = getPanelTooltipTarget(event.target);
      if (target?.classList.contains("random-marker-help")) return;
      if (!target || (event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) return;
      if (panelTooltipPinned) return;
      if (document.activeElement !== target || document.body.classList.contains("pointer-mode")) {
        hidePanelTooltip(target);
      }
    });
    document.addEventListener("focusin", (event) => {
      const target = getPanelTooltipTarget(event.target);
      if (panelTooltipPinned) return;
      if (target?.classList.contains("random-marker-help")) return;
      if (target && !document.body.classList.contains("pointer-mode")) showPanelTooltip(target);
    });
    document.addEventListener("focusout", (event) => {
      const target = getPanelTooltipTarget(event.target);
      if (target?.classList.contains("random-marker-help")) return;
      if (target && (!target.matches(":hover") || document.body.classList.contains("pointer-mode"))) {
        hidePanelTooltip(target);
      }
    });
    document.addEventListener("click", (event) => {
      const target = getPanelTooltipTarget(event.target);
      if (target?.classList.contains("random-marker-help")) {
        event.preventDefault();
        if (panelTooltipPinned && panelTooltipTarget === target) hidePanelTooltip();
        else showPanelTooltip(target, true);
        return;
      }
      if (panelTooltipPinned || target) hidePanelTooltip();
    }, true);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panelTooltipPinned) hidePanelTooltip();
    });

    function repositionPanelTooltip() {
      if (panelTooltipTarget?.isConnected) showPanelTooltip(panelTooltipTarget, panelTooltipPinned);
      else hidePanelTooltip();
    }

    document.addEventListener("scroll", repositionPanelTooltip, true);
    window.addEventListener("resize", repositionPanelTooltip);

    function syncDeleteMode(isActive) {
      shiftDeleteMode = isActive;
      favoriteList.querySelectorAll(".clip-more-button").forEach((button) => {
        const entryType = button.dataset.entryType;
        const name = button.dataset.entryName;
        button.classList.toggle("delete-mode", isActive);
        button.setAttribute("aria-label", isActive ? `Delete ${entryType} "${name}"` : `Actions for ${name}`);
        button.title = isActive ? `Delete ${entryType} "${name}"` : "More actions";
      });
    }

    document.addEventListener("keydown", setKeyboardFocusMode, true);
    document.addEventListener("mousedown", setPointerFocusMode, true);
    document.addEventListener("touchstart", setPointerFocusMode, true);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Shift" || event.code === "ShiftLeft" || event.code === "ShiftRight") {
        syncDeleteMode(true);
      } else if (event.shiftKey) {
        syncDeleteMode(true);
      }
    }, true);
    window.addEventListener("keyup", (event) => {
      if (event.key === "Shift" || event.code === "ShiftLeft" || event.code === "ShiftRight" || !event.shiftKey) {
        syncDeleteMode(false);
      }
    }, true);
    favoriteList.addEventListener("pointermove", (event) => {
      syncDeleteMode(event.shiftKey);
    });
    window.addEventListener("blur", () => syncDeleteMode(false));

    function setResult(message, tone) {
      if (favoriteLoadNoticeTimer) {
        clearTimeout(favoriteLoadNoticeTimer);
        favoriteLoadNoticeTimer = null;
      }
      if (message === "BACKUP_RECENT") return;
      const displayMessage = message === "BACKUP_SAVED" ? "Backup saved." : (message || "");
      result.textContent = "";
      result.className = "";
      if (displayMessage) showActionNotification(displayMessage, tone || "info");
    }

    function getGuidedTourStep(stepId, errorMessage) {
      const steps = {
        welcome: {
          label: "GETTING STARTED · INTRO",
          title: "Welcome to SceneKeeper",
          copy: "We'll open a five-second sample in its own After Effects composition. Then you'll save it to your library and insert it again.",
          next: "Start tutorial",
          target: "",
          nextAction: true
        },
        preparing: {
          label: "GETTING STARTED · SETUP",
          title: "Preparing your example",
          copy: "Importing the sample and opening a separate tutorial composition...",
          next: "Preparing...",
          target: "",
          busy: true
        },
        error: {
          label: "GETTING STARTED · SETUP",
          title: "Tutorial setup failed",
          copy: errorMessage || "SceneKeeper could not prepare the example. Check that After Effects has an open project, then try again.",
          next: "Try again",
          target: "",
          nextAction: true
        },
        saveAction: {
          label: "GETTING STARTED · 1 OF 4",
          title: "Save your first clip",
          copy: "The sample footage layer is selected in the tutorial composition. Click Save a Selected Clip to add it to the Getting Started collection.",
          next: "Save example",
          target: "#quick-save-selected-clips",
          targetAction: true
        },
        saving: {
          label: "GETTING STARTED · 2 OF 4",
          title: "Saving your first clip",
          copy: "SceneKeeper is saving the selected footage and its visible range...",
          next: "Saving...",
          target: "",
          busy: true
        },
        preview: {
          label: "GETTING STARTED · 3 OF 4",
          title: "Preview on hover",
          copy: "Hover over the highlighted example clip. Its moving preview plays right in the library card. Once the preview is ready, continue to insert it.",
          next: "Insert example",
          target: "tutorial-sample",
          hoverAction: true,
          requiresHover: true
        },
        insert: {
          label: "GETTING STARTED · 4 OF 4",
          title: "Insert it again",
          copy: "Click Insert Selected Clip or double-click the saved clip. Either way, it is inserted at the current playhead.",
          next: "Insert example",
          target: "#insert-favorite-button",
          targetAction: true,
          back: true
        },
        search: {
          label: "LIBRARY BASICS · 1 OF 4",
          title: "Find clips quickly",
          copy: "Try a search term such as “Clip”. Matching saved clips and folders appear as you type. Press Next when you are ready.",
          next: "Next",
          target: "#library-search",
          inputAction: true,
          back: true
        },
        organize: {
          label: "LIBRARY BASICS · 2 OF 4",
          title: "Organize your library",
          copy: "Right-click an empty area in the library and choose New Folder. You can create a folder here, then press Next to continue.",
          next: "Next",
          target: "#favorite-list",
          contextAction: true,
          emptyAreaAction: true,
          back: true
        },
        actions: {
          label: "LIBRARY BASICS · 3 OF 4",
          title: "Undo, copy and paste",
          copy: "Undo and Redo track SceneKeeper changes. Select a clip or folder before Copy; Paste places copied items in the current collection.",
          next: "Next",
          target: ".library-actions",
          focusTarget: true,
          back: true
        },
        settings: {
          label: "LIBRARY BASICS · 4 OF 4",
          title: "Settings, trash and transfer",
          copy: "Settings control preview and clip defaults. Recently Deleted can restore or permanently remove clips; Import/Export transfers your library. Help can restart this tour.",
          next: "Finish",
          target: ".section-heading-actions",
          focusTarget: true,
          back: true
        }
      };
      return steps[stepId] || steps.welcome;
    }

    function setGuidedTourStep(stepId, errorMessage) {
      if (guidedTourStep === "preview" && stepId !== "preview") {
        restoreGuidedTourPreviewSetting();
      }
      if (guidedTourTarget) guidedTourTarget.classList.remove("guided-tour-target");
      if (guidedTourPreviewCleanup) {
        guidedTourPreviewCleanup();
        guidedTourPreviewCleanup = null;
      }
      guidedTourStep = stepId;
      const step = getGuidedTourStep(stepId, errorMessage);
      guidedTourTarget = step.target === "tutorial-sample"
        ? favoriteList.querySelector(`.favorite-result[data-storage-index="${guidedTourSampleStorageIndex}"]`)
        : (step.target ? document.querySelector(step.target) : null);
      if (step.emptyAreaAction) favoriteList.scrollTop = 0;
      if (guidedTourTarget) guidedTourTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
      if (guidedTourTarget) guidedTourTarget.classList.add("guided-tour-target");

      guidedTourStepLabel.textContent = step.label;
      guidedTourTitle.textContent = step.title;
      guidedTourCopy.textContent = step.copy;
      guidedTourBackButton.hidden = !step.back;
      guidedTourBackButton.disabled = guidedTourBusy;
      guidedTourNextButton.textContent = step.next;
      guidedTourNextButton.disabled = Boolean(step.busy || step.requiresHover) || guidedTourBusy;
      guidedTourSkipButton.disabled = false;
      guidedTour.hidden = false;
      guidedTourCard.hidden = false;
      guidedTourPointer.classList.toggle("is-hovering", Boolean(step.hoverAction));

      if (step.requiresHover && guidedTourTarget) {
        setupGuidedTourPreviewStep(step);
      } else {
        guidedTourNextButton.textContent = step.next;
      }

      positionGuidedTourPointer(step.busy
        ? null
        : ((step.targetAction || step.hoverAction || step.contextAction || step.inputAction) && guidedTourTarget
          ? guidedTourTarget
          : (step.nextAction ? guidedTourNextButton : null)), step.emptyAreaAction && guidedTourTarget === favoriteList);

      if (guidedTourTarget) {
        const targetBounds = guidedTourTarget.getBoundingClientRect();
        if (targetBounds.top > window.innerHeight * 0.55) {
          guidedTourCard.style.top = "12px";
          guidedTourCard.style.bottom = "auto";
        } else {
          guidedTourCard.style.top = "auto";
          guidedTourCard.style.bottom = "12px";
        }
      } else {
        guidedTourCard.style.top = "auto";
        guidedTourCard.style.bottom = "12px";
      }
      requestAnimationFrame(() => {
        if (!guidedTourActive) return;
        if (!guidedTourNextButton.disabled) guidedTourNextButton.focus();
        else guidedTourSkipButton.focus();
      });
    }

    function setupGuidedTourPreviewStep(step) {
      if (guidedTourPreviousHoverPreviewEnabled === null) {
        guidedTourPreviousHoverPreviewEnabled = hoverPreviewEnabled;
      }
      hoverPreviewEnabled = true;
      const video = guidedTourTarget.querySelector(".favorite-clip-thumbnail video");
      if (!video) {
        guidedTourNextButton.textContent = "Preview unavailable · Continue";
        guidedTourNextButton.disabled = false;
        return;
      }

      guidedTourNextButton.textContent = "Hover to preview";
      guidedTourNextButton.disabled = true;
      let pointerEntered = guidedTourTarget.matches(":hover");
      const updatePreviewStep = () => {
        if (!guidedTourActive || guidedTourStep !== "preview" || !pointerEntered ||
            !video.classList.contains("is-ready")) return;
        guidedTourNextButton.textContent = step.next;
        guidedTourNextButton.disabled = false;
      };
      const onPointerEnter = () => {
        pointerEntered = true;
        updatePreviewStep();
      };
      guidedTourTarget.addEventListener("pointerenter", onPointerEnter);
      video.addEventListener("loadeddata", updatePreviewStep);
      video.addEventListener("seeked", updatePreviewStep);
      guidedTourPreviewCleanup = () => {
        guidedTourTarget?.removeEventListener("pointerenter", onPointerEnter);
        video.removeEventListener("loadeddata", updatePreviewStep);
        video.removeEventListener("seeked", updatePreviewStep);
      };
      updatePreviewStep();
    }

    function restoreGuidedTourPreviewSetting() {
      if (guidedTourPreviousHoverPreviewEnabled === null) return;
      hoverPreviewEnabled = guidedTourPreviousHoverPreviewEnabled;
      guidedTourPreviousHoverPreviewEnabled = null;
    }

    function positionGuidedTourPointer(target, emptyAreaAction = false) {
      if (!guidedTourActive || !target || target.hidden || target.disabled) {
        guidedTourPointer.hidden = true;
        return;
      }

      const bounds = target.getBoundingClientRect();
      const pointerWidth = 28;
      const pointerHeight = 34;
      let left = bounds.left + Math.min(bounds.width * (emptyAreaAction ? 0.86 : 0.7), bounds.width - pointerWidth * 0.5) - 2;
      let top = bounds.top + Math.min(bounds.height * (emptyAreaAction ? 0.82 : 0.45), bounds.height - pointerHeight * 0.65) - 2;
      if (emptyAreaAction) {
        let emptyPoint = null;
        for (let y = bounds.bottom - 8; y > bounds.top + 8 && !emptyPoint; y -= 4) {
          for (let x = bounds.right - 8; x > bounds.left + 8; x -= 4) {
            const element = document.elementFromPoint(x, y);
            if (element && target.contains(element) && !element.closest(".favorite-result-item, button, input, select, textarea, a")) {
              emptyPoint = { x, y };
              break;
            }
          }
        }
        if (!emptyPoint) {
          guidedTourPointer.hidden = true;
          return;
        }
        left = emptyPoint.x - 2;
        top = emptyPoint.y - 2;
      }
      left = Math.max(4, Math.min(left, window.innerWidth - pointerWidth - 4));
      top = Math.max(4, Math.min(top, window.innerHeight - pointerHeight - 4));
      guidedTourPointer.style.left = `${left}px`;
      guidedTourPointer.style.top = `${top}px`;
      guidedTourPointer.hidden = false;
    }

    function setGuidedTourDynamicTarget(target, emptyAreaAction = false) {
      guidedTourTarget?.classList.remove("guided-tour-target");
      guidedTourTarget = target;
      guidedTourTarget?.classList.add("guided-tour-target");
      positionGuidedTourPointer(target, emptyAreaAction);
    }

    function repositionGuidedTourPointer() {
      if (!guidedTourActive) return;
      const step = getGuidedTourStep(guidedTourStep);
      positionGuidedTourPointer(step.busy
        ? null
        : ((step.targetAction || step.hoverAction || step.contextAction || step.inputAction) && guidedTourTarget
          ? guidedTourTarget
          : (step.nextAction ? guidedTourNextButton : null)), step.emptyAreaAction && guidedTourTarget === favoriteList);
    }

    window.addEventListener("resize", repositionGuidedTourPointer);
    document.addEventListener("scroll", repositionGuidedTourPointer, true);

    function startGuidedTutorial() {
      guidedTourActive = true;
      guidedTourBusy = false;
      helpModal.hidden = true;
      setGuidedTourStep("welcome");
    }

    function finishGuidedTutorial() {
      try {
        window.localStorage.setItem(GUIDED_TUTORIAL_SEEN_KEY, "true");
      } catch (error) {
        // The tutorial remains available from Help if storage is unavailable.
      }
      if (guidedTourTarget) guidedTourTarget.classList.remove("guided-tour-target");
      guidedTourTarget = null;
      guidedTourActive = false;
      guidedTourBusy = false;
      restoreGuidedTourPreviewSetting();
      guidedTourPointer.classList.remove("is-hovering");
      guidedTour.hidden = true;
      guidedTourCard.hidden = true;
      guidedTourPointer.hidden = true;
      guidedTourCard.style.top = "";
      guidedTourCard.style.bottom = "";
      if (!saveClipDialog.hidden) saveClipDialog.hidden = true;
      helpToggle.focus();
    }

    function getGuidedTutorialSamplePath() {
      const cep = window.__adobe_cep__;
      if (!cep || typeof cep.getSystemPath !== "function") {
        throw new Error("The After Effects extension path is unavailable.");
      }
      const extensionPath = decodeURI(cep.getSystemPath("extension") || "")
        .replace(/^file:\/\//i, "")
        .replace(/^\/([A-Za-z]:)/, "$1")
        .replace(/\/$/, "");
      if (!extensionPath) throw new Error("The SceneKeeper extension path is unavailable.");
      return `${extensionPath}/assets/tutorial/SceneKeeper Tour Example.mp4`;
    }

    function prepareGuidedTutorialExample() {
      guidedTourBusy = true;
      librarySearch.value = "";
      syncSearchClearButtons();
      setGuidedTourStep("preparing");
      try {
        guidedTourSamplePath = getGuidedTutorialSamplePath();
      } catch (error) {
        guidedTourBusy = false;
        setGuidedTourStep("error", error.message);
        return;
      }

      const encodedSamplePath = JSON.stringify(encodeURIComponent(guidedTourSamplePath));
      callAE(`prepareSceneKeeperTutorialExample(${encodedSamplePath})`, "", (response) => {
        if (response.indexOf("TUTORIAL_PREPARED|") !== 0) {
          guidedTourBusy = false;
          setGuidedTourStep("error", response || "After Effects could not prepare the example.");
          return;
        }
        const tutorialFolderId = response.substring("TUTORIAL_PREPARED|".length) || GUIDED_TUTORIAL_FOLDER_ID;
        selectedFolderId = tutorialFolderId;
        refreshFavoriteFolders(() => {
          selectedFolderId = tutorialFolderId;
          refreshFavorites(false, "", undefined, () => {
            if (!guidedTourActive) return;
            guidedTourBusy = false;
            const normalizedSamplePath = guidedTourSamplePath.replace(/\\/g, "/").toLowerCase();
            const existingSample = favoriteRecords.find((record) =>
              String(record.sourcePath || "").replace(/\\/g, "/").toLowerCase() === normalizedSamplePath);
            if (existingSample) {
              guidedTourSampleStorageIndex = existingSample.storageIndex;
              selectedFolderId = existingSample.folderId || "";
              selectedFavoriteStorageIndex = existingSample.storageIndex;
              selectedLibraryItemKey = `clip:${existingSample.storageIndex}`;
              renderFavoriteClips();
              updateFavoriteSelection();
              setGuidedTourStep("preview");
              return;
            }
            guidedTourSampleStorageIndex = null;
            selectedFolderId = tutorialFolderId;
            selectedFavoriteStorageIndex = null;
            selectedLibraryItemKey = "";
            renderFavoriteClips();
            updateFavoriteSelection();
            setGuidedTourStep("saveAction");
          });
        });
      }, (message) => {
        guidedTourBusy = false;
        setGuidedTourStep("error", message);
      });
    }

    function handleGuidedTourNext() {
      if (guidedTourBusy) return;
      if (guidedTourStep === "welcome" || guidedTourStep === "error") {
        prepareGuidedTutorialExample();
      } else if (guidedTourStep === "saveAction") {
        quickSaveSelectedClipsButton.click();
      } else if (guidedTourStep === "insert") {
        if (insertFavoriteButton.disabled) {
          showActionNotification("Select the saved example clip first.");
          return;
        }
        insertFavoriteButton.click();
      } else if (guidedTourStep === "preview") {
        if (guidedTourNextButton.disabled) return;
        setGuidedTourStep("insert");
      } else if (guidedTourStep === "search") {
        librarySearch.value = "";
        syncSearchClearButtons();
        selectedFolderId = "";
        selectedFootagePath = "";
        selectedFavoriteStorageIndex = null;
        selectedLibraryItemKey = "";
        selectedLibraryKeys.clear();
        renderFavoriteClips();
        setGuidedTourStep("organize");
      } else if (guidedTourStep === "organize") {
        closeLibraryContextMenu();
        if (!folderCreateDialog.hidden) closeFolderCreateDialog();
        setGuidedTourStep("actions");
      } else if (guidedTourStep === "actions") {
        setGuidedTourStep("settings");
      } else if (guidedTourStep === "settings") {
        finishGuidedTutorial();
      }
    }

    function handleGuidedTourBack() {
      if (guidedTourBusy) return;
      if (guidedTourStep === "insert") setGuidedTourStep("preview");
      else if (guidedTourStep === "organize") setGuidedTourStep("search");
      else if (guidedTourStep === "actions") setGuidedTourStep("organize");
      else if (guidedTourStep === "settings") setGuidedTourStep("actions");
    }

    function skipGuidedTutorial() {
      if (guidedTourBusy) {
        showActionNotification("Please wait for the current After Effects action to finish.");
        return;
      }
      finishGuidedTutorial();
    }

    function enforceGuidedTutorialLock(event) {
      if (!guidedTourActive) return;
      if (!errorDialog.hidden && errorDialog.contains(document.activeElement)) return;
      if (event.type === "keydown" && event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        skipGuidedTutorial();
        return;
      }
      if (event.type === "keydown" && event.key === "Tab") {
        const focusableElements = Array.from(guidedTourCard.querySelectorAll("button:not([disabled]):not([hidden])"));
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        if (!guidedTourCard.contains(document.activeElement) ||
            (event.shiftKey && document.activeElement === firstFocusable) ||
            (!event.shiftKey && document.activeElement === lastFocusable)) {
          event.preventDefault();
          (event.shiftKey ? lastFocusable : firstFocusable)?.focus();
        }
        return;
      }
      if (guidedTourCard.contains(event.target) || (!errorDialog.hidden && errorDialog.contains(event.target))) return;
      if (guidedTourStep === "organize" &&
          (libraryContextMenu.contains(event.target) || folderCreateDialog.contains(event.target))) return;
      if (guidedTourStep === "search" && guidedTourTarget === librarySearch && guidedTourTarget.contains(event.target)) return;
      const isLibraryWhitespace = guidedTourStep === "organize" && event.target.closest(".favorites-section") &&
        !event.target.closest("button, input, select, textarea, a, .favorite-result-item, .library-tab-item, .library-context-menu");
      if (isLibraryWhitespace && ((event.type === "pointerdown" && event.button === 2) || event.type === "contextmenu")) return;
      const targetActionStep = ["saveAction", "insert"].includes(guidedTourStep);
      if (targetActionStep && guidedTourTarget && guidedTourTarget.contains(event.target)) return;
      const isTutorialSample = guidedTourStep === "insert" &&
        event.target.closest(`.favorite-result[data-storage-index="${guidedTourSampleStorageIndex}"]`);
      if (isTutorialSample) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.type === "click" && !guidedTourBusy) {
        showActionNotification("Follow the highlighted tutorial step to continue.");
      }
    }

    ["pointerdown", "click", "contextmenu", "keydown", "keyup", "wheel", "touchmove"].forEach((eventName) => {
      document.addEventListener(eventName, enforceGuidedTutorialLock, { capture: true, passive: false });
    });

    function closeErrorDialog() {
      errorDialog.hidden = true;
      if (errorDialogReturnFocus && errorDialogReturnFocus.isConnected) {
        errorDialogReturnFocus.focus();
      }
      errorDialogReturnFocus = null;
    }

    errorDialogOkButton.addEventListener("click", closeErrorDialog);

    const LIBRARY_FAVORITES_STORAGE_KEY = "sceneKeeperLibraryFavorites";
    const CLIP_TRACKING_STORAGE_KEY = "sceneKeeperClipTracking";
    const CLIP_SORT_MODE_STORAGE_KEY = "sceneKeeperClipSortMode";
    const RANDOM_MARKER_INSERT_SETTINGS_KEY = "sceneKeeperRandomMarkerInsertSettings";
    const CLIP_PREVIEW_FORMAT_STORAGE_KEY = "sceneKeeperClipPreviewFormat";
    const SAVE_CLIP_DEFAULTS_STORAGE_KEY = "sceneKeeperSaveClipDefaults";
    const WORKSPACES_STORAGE_KEY = "sceneKeeperWorkspaces";
    let clipTrackingData = {};
    let clipSortMode = "footage";
    try {
      clipTrackingData = JSON.parse(window.localStorage.getItem(CLIP_TRACKING_STORAGE_KEY) || "{}") || {};
      const storedSortMode = window.localStorage.getItem(CLIP_SORT_MODE_STORAGE_KEY);
      if (["manual", "inserted", "leastInserted", "recent", "footage"].includes(storedSortMode)) clipSortMode = storedSortMode;
    } catch (error) {
      clipTrackingData = {};
    }
    syncClipSortMenu();
    let savedWorkspaces = [];
    let pendingWorkspaceDeleteId = "";

    function getClipTrackingKey(record) {
      return record.clipId || `legacy:${record.sourcePath}:${record.sourceIn}:${record.sourceOut}`;
    }

    function getClipTrackingData(record) {
      const data = clipTrackingData[getClipTrackingKey(record)] || {};
      return {
        insertCount: Number.isFinite(Number(data.insertCount)) ? Math.max(0, Number(data.insertCount)) : 0,
        addedAt: Number.isFinite(Number(data.addedAt)) ? Number(data.addedAt) : 0,
        randomRank: Number.isFinite(Number(data.randomRank)) ? Number(data.randomRank) : 0
      };
    }

    function saveClipTrackingData() {
      try {
        window.localStorage.setItem(CLIP_TRACKING_STORAGE_KEY, JSON.stringify(clipTrackingData));
      } catch (error) {
        // Keep clip browsing available when local storage is unavailable.
      }
    }

    function initializeClipTrackingData() {
      const now = Date.now();
      favoriteRecords.forEach((record, index) => {
        const key = getClipTrackingKey(record);
        const data = clipTrackingData[key] || {};
        if (!Number.isFinite(Number(data.addedAt)) || !Number(data.addedAt)) {
          data.addedAt = now - (favoriteRecords.length - index) * 1000;
        }
        if (!Number.isFinite(Number(data.insertCount))) data.insertCount = 0;
        if (!Number.isFinite(Number(data.randomRank))) data.randomRank = Math.random();
        clipTrackingData[key] = data;
      });
      saveClipTrackingData();
    }

    function incrementClipInsertCount(record) {
      const key = getClipTrackingKey(record);
      const data = clipTrackingData[key] || { addedAt: Date.now(), randomRank: Math.random() };
      data.insertCount = Math.max(0, Number(data.insertCount) || 0) + 1;
      clipTrackingData[key] = data;
      saveClipTrackingData();
      renderFavoriteClips();
    }

    function insertFavoriteRecord(record, onSuccess) {
      callAE(`insertClipFavorite(${record.storageIndex})`, "", (response) => {
        if (response && response.indexOf("ERROR:") === 0) {
          setResult(response.substring(6), "error");
          return;
        }
        incrementClipInsertCount(record);
        if (onSuccess) onSuccess(response);
      });
    }

    function applyClipPreviewFormat(format) {
      clipPreviewFormat = format === "landscape" ? "landscape" : "square";
      const isLandscape = clipPreviewFormat === "landscape";
      clipPreviewSizeSquare.setAttribute("aria-pressed", String(!isLandscape));
      clipPreviewSizeLandscape.setAttribute("aria-pressed", String(isLandscape));
      favoriteList.classList.toggle("landscape-clip-previews", clipPreviewFormat === "landscape");
    }

    function saveClipDefaults() {
      try {
        window.localStorage.setItem(SAVE_CLIP_DEFAULTS_STORAGE_KEY, JSON.stringify({
          position: saveDefaultPosition.checked,
          scale: saveDefaultScale.checked,
          audio: saveDefaultAudio.checked
        }));
      } catch (error) {
        setResult(`Could not save clip defaults: ${error.message}`, "error");
      }
      persistQuickSaveShortcutSettings();
    }

    function persistQuickSaveShortcutSettings(folderId) {
      const cep = window.__adobe_cep__;
      if (!cep || typeof cep.evalScript !== "function") return;
      const targetFolderId = typeof folderId === "string" ? folderId : (favoriteFolders.some((folder) => folder.id === selectedFolderId)
        ? selectedFolderId
        : "");
      const encodedFolderId = JSON.stringify(encodeURIComponent(targetFolderId));
      cep.evalScript(`storeClipQuickSaveShortcutSettings(${encodedFolderId}, ${saveDefaultPosition.checked}, ${saveDefaultScale.checked}, ${saveDefaultAudio.checked})`, () => {});
    }

    function loadClipDefaults() {
      try {
        const stored = window.localStorage.getItem(SAVE_CLIP_DEFAULTS_STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed.position !== "boolean" ||
            typeof parsed.scale !== "boolean" || typeof parsed.audio !== "boolean") {
          throw new Error("Saved clip defaults have an invalid format.");
        }
        saveDefaultPosition.checked = parsed.position;
        saveDefaultScale.checked = parsed.scale;
        saveDefaultAudio.checked = parsed.audio;
      } catch (error) {
        setResult(`Could not load clip defaults: ${error.message}`, "error");
      }
    }

    loadClipDefaults();

    function loadClipPreviewFormat() {
      try {
        const storedFormat = window.localStorage.getItem(CLIP_PREVIEW_FORMAT_STORAGE_KEY);
        applyClipPreviewFormat(storedFormat === "landscape" ? "landscape" : "square");
      } catch (error) {
        applyClipPreviewFormat("square");
        setResult(`Could not load clip preview setting: ${error.message}`, "error");
      }
    }

    loadClipPreviewFormat();

    function loadLibraryFavoriteKeys() {
      try {
        const stored = window.localStorage.getItem(LIBRARY_FAVORITES_STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (!parsed || !Array.isArray(parsed.folders) || !Array.isArray(parsed.clips) ||
            !parsed.folders.every((key) => typeof key === "string") ||
            !parsed.clips.every((key) => typeof key === "string")) {
          throw new Error("Saved library favorites have an invalid format.");
        }
        libraryFavoriteKeys = new Set([
          ...parsed.folders.map((key) => `folder:${key}`),
          ...parsed.clips.map((key) => `clip:${key}`)
        ]);
      } catch (error) {
        setResult(`Could not load library favorites: ${error.message}`, "error");
      }
    }

    function saveLibraryFavoriteKeys() {
      try {
        const folders = [];
        const clips = [];
        libraryFavoriteKeys.forEach((key) => {
          if (key.startsWith("folder:")) folders.push(key.slice("folder:".length));
          else if (key.startsWith("clip:")) clips.push(key.slice("clip:".length));
        });
        window.localStorage.setItem(LIBRARY_FAVORITES_STORAGE_KEY, JSON.stringify({ folders, clips }));
        return true;
      } catch (error) {
        setResult(`Could not save library favorites: ${error.message}`, "error");
        return false;
      }
    }

    function getLibraryFavoriteKeys(entry) {
      if (entry.type === "folder") return [`folder:${entry.folder.id}`];
      const clip = entry.clip;
      const keys = [`clip:${clip.clipId || JSON.stringify([clip.sourcePath, clip.displayName, clip.sourceIn, clip.sourceOut])}`];
      const legacyNames = [clip.displayName];
      const folder = favoriteFolders.find((item) => item.id === clip.folderId);
      if (folder && /^Clip \d+$/i.test(clip.displayName)) {
        legacyNames.push(`${clip.displayName} - ${folder.name}`);
      }
      legacyNames.forEach((name) => {
        keys.push(`clip:${JSON.stringify([clip.sourcePath, name, clip.sourceIn, clip.sourceOut])}`);
      });
      return Array.from(new Set(keys));
    }

    function isLibraryFavorite(entry) {
      return getLibraryFavoriteKeys(entry).some((key) => libraryFavoriteKeys.has(key));
    }

    function getClipFootageName(clip) {
      const sourcePath = String(clip && clip.sourcePath || "")
        .trim()
        .replace(/\\/g, "/")
        .replace(/\/+$/, "");
      const fileName = sourcePath.split("/").pop();
      if (fileName) return fileName;
      return String(clip && clip.sourceName || "").trim() || "Unknown footage";
    }

    function getClipFootageGroupKey(clip) {
      const sourcePath = String(clip && clip.sourcePath || "").trim().replace(/\\/g, "/");
      return sourcePath ? `path:${sourcePath.toLocaleLowerCase()}` : `name:${getClipFootageName(clip).toLocaleLowerCase()}`;
    }

    function sortClipRecords(clips, mode = clipSortMode) {
      return clips
        .map((clip, index) => ({ clip, index }))
        .sort((first, second) => {
          if (mode === "footage") {
            const firstName = getClipFootageName(first.clip);
            const secondName = getClipFootageName(second.clip);
            const nameDifference = firstName.localeCompare(secondName, undefined, { sensitivity: "base", numeric: true });
            if (nameDifference) return nameDifference;
            const firstPath = String(first.clip.sourcePath || "").toLocaleLowerCase();
            const secondPath = String(second.clip.sourcePath || "").toLocaleLowerCase();
            const pathDifference = firstPath.localeCompare(secondPath, undefined, { sensitivity: "base", numeric: true });
            if (pathDifference) return pathDifference;
            const firstFavorite = isLibraryFavorite({ type: "clip", clip: first.clip });
            const secondFavorite = isLibraryFavorite({ type: "clip", clip: second.clip });
            const favoriteDifference = Number(secondFavorite) - Number(firstFavorite);
            if (favoriteDifference) return favoriteDifference;
            const firstIn = Number(first.clip.sourceIn);
            const secondIn = Number(second.clip.sourceIn);
            const safeFirstIn = Number.isFinite(firstIn) ? firstIn : Number.POSITIVE_INFINITY;
            const safeSecondIn = Number.isFinite(secondIn) ? secondIn : Number.POSITIVE_INFINITY;
            if (safeFirstIn !== safeSecondIn) return safeFirstIn - safeSecondIn;
            return first.index - second.index;
          }
          const firstFavorite = isLibraryFavorite({ type: "clip", clip: first.clip });
          const secondFavorite = isLibraryFavorite({ type: "clip", clip: second.clip });
          const favoriteDifference = Number(secondFavorite) - Number(firstFavorite);
          if (favoriteDifference) return favoriteDifference;
          const firstData = getClipTrackingData(first.clip);
          const secondData = getClipTrackingData(second.clip);
          if (mode === "inserted" && firstData.insertCount !== secondData.insertCount) {
            return secondData.insertCount - firstData.insertCount;
          }
          if (mode === "leastInserted" && firstData.insertCount !== secondData.insertCount) {
            return firstData.insertCount - secondData.insertCount;
          }
          if (mode === "recent" && firstData.addedAt !== secondData.addedAt) {
            return secondData.addedAt - firstData.addedAt;
          }
          if (mode === "manual") {
            const firstOrder = Number.isInteger(first.clip.sortOrder) ? first.clip.sortOrder : null;
            const secondOrder = Number.isInteger(second.clip.sortOrder) ? second.clip.sortOrder : null;
            if (firstOrder !== null && secondOrder === null) return -1;
            if (firstOrder === null && secondOrder !== null) return 1;
            if (firstOrder !== null && secondOrder !== null && firstOrder !== secondOrder) return firstOrder - secondOrder;
          }
          return first.index - second.index;
        })
        .map(({ clip }) => clip);
    }

    function sortFolderRecords(folders) {
      return folders
        .map((folder, index) => ({ folder, index }))
        .sort((first, second) => {
          const firstFavorite = libraryFavoriteKeys.has(`folder:${first.folder.id}`);
          const secondFavorite = libraryFavoriteKeys.has(`folder:${second.folder.id}`);
          const favoriteDifference = Number(secondFavorite) - Number(firstFavorite);
          if (favoriteDifference) return favoriteDifference;
          const firstOrder = Number.isInteger(first.folder.sortOrder) ? first.folder.sortOrder : null;
          const secondOrder = Number.isInteger(second.folder.sortOrder) ? second.folder.sortOrder : null;
          if (firstOrder !== null && secondOrder === null) return -1;
          if (firstOrder === null && secondOrder !== null) return 1;
          if (firstOrder !== null && secondOrder !== null && firstOrder !== secondOrder) return firstOrder - secondOrder;
          return first.folder.name.localeCompare(second.folder.name) || first.index - second.index;
        })
        .map(({ folder }) => folder);
    }

    function getLibraryCollectionEntries(folderId) {
      const folders = sortFolderRecords(
        favoriteFolders.filter((folder) => (folder.parentId || "") === folderId)
      );
      const clips = sortClipRecords(
        favoriteRecords.filter((record) => (record.folderId || "") === folderId)
      );
      if (clipSortMode !== "manual") {
        return folders.map((folder) => ({ type: "folder", folder }))
          .concat(clips.map((clip) => ({ type: "clip", clip })));
      }
      const entries = folders.map((folder) => ({ type: "folder", folder }))
        .concat(clips.map((clip) => ({ type: "clip", clip })));
      return entries
        .map((entry, index) => ({ entry, index }))
        .sort((first, second) => {
          const firstFavorite = first.entry.type === "folder"
            ? libraryFavoriteKeys.has(`folder:${first.entry.folder.id}`)
            : isLibraryFavorite({ type: "clip", clip: first.entry.clip });
          const secondFavorite = second.entry.type === "folder"
            ? libraryFavoriteKeys.has(`folder:${second.entry.folder.id}`)
            : isLibraryFavorite({ type: "clip", clip: second.entry.clip });
          const favoriteDifference = Number(secondFavorite) - Number(firstFavorite);
          if (favoriteDifference) return favoriteDifference;
          const firstOrder = first.entry.type === "folder" ? first.entry.folder.sortOrder : first.entry.clip.sortOrder;
          const secondOrder = second.entry.type === "folder" ? second.entry.folder.sortOrder : second.entry.clip.sortOrder;
          const firstHasOrder = Number.isInteger(firstOrder);
          const secondHasOrder = Number.isInteger(secondOrder);
          if (firstHasOrder && !secondHasOrder) return -1;
          if (!firstHasOrder && secondHasOrder) return 1;
          if (firstHasOrder && secondHasOrder && firstOrder !== secondOrder) return firstOrder - secondOrder;
          return first.index - second.index;
        })
        .map(({ entry }) => entry);
    }

    function getCollectionOrderId(entry) {
      return entry.type === "folder" ? `folder:${entry.folder.id}` : `clip:${entry.clip.clipId}`;
    }

    function reorderLibraryClips(sourceClipId, targetClip, insertAfter) {
      if (clipReorderRequestActive || !pendingClipReorderIds) return;
      const source = favoriteRecords.find((record) => record.clipId === sourceClipId);
      if (!source || !targetClip || source.clipId === targetClip.clipId ||
          (source.folderId || "") !== clipReorderFolderId ||
          (targetClip.folderId || "") !== clipReorderFolderId) return;
      const sourceFavorite = isLibraryFavorite({ type: "clip", clip: source });
      const targetFavorite = isLibraryFavorite({ type: "clip", clip: targetClip });
      if (sourceFavorite !== targetFavorite) return;

      const sourceIndex = pendingClipReorderIds.indexOf(sourceClipId);
      const targetIndex = pendingClipReorderIds.indexOf(targetClip.clipId);
      if (sourceIndex < 0 || targetIndex < 0) return;
      const [movedClipId] = pendingClipReorderIds.splice(sourceIndex, 1);
      const adjustedTargetIndex = pendingClipReorderIds.indexOf(targetClip.clipId);
      pendingClipReorderIds.splice(adjustedTargetIndex + (insertAfter ? 1 : 0), 0, movedClipId);

      const rowsByClipId = new Map(
        Array.from(clipReorderList.querySelectorAll(".clip-reorder-item"))
          .map((row) => [row.dataset.clipId, row])
      );
      pendingClipReorderIds.forEach((clipId, index) => {
        const row = rowsByClipId.get(clipId);
        if (!row) return;
        clipReorderList.appendChild(row);
        row.querySelector(".clip-reorder-position").textContent = String(index + 1);
      });
    }

    function getClipDisplayName(record) {
      const folder = favoriteFolders.find((entry) => entry.id === record.folderId);
      const suffix = folder ? ` - ${folder.name}` : "";
      if (suffix && record.displayName.toLocaleLowerCase().endsWith(suffix.toLocaleLowerCase())) return record.displayName.slice(0, -suffix.length);
      return record.displayName;
    }

    function syncMissingFootageCount() {
      const missingSources = new Set(
        favoriteRecords.filter((record) => record.sourceMissing).map((record) => record.sourcePath)
      );
      missingFootageButton.textContent = `Missing Footage (${missingSources.size})`;
      missingFootageButton.disabled = missingSources.size === 0;
    }

    function renderMissingFootageList() {
      const grouped = new Map();
      favoriteRecords.filter((record) => record.sourceMissing).forEach((record) => {
        const existing = grouped.get(record.sourcePath);
        if (existing) {
          existing.count += 1;
        } else {
          grouped.set(record.sourcePath, {
            sourcePath: record.sourcePath,
            sourceName: record.sourceName,
            storageIndex: record.storageIndex,
            count: 1
          });
        }
      });
      missingFootageList.innerHTML = "";
      Array.from(grouped.values()).forEach((source) => {
        const displayPath = source.sourcePath.replace(/%20/g, " ");
        const displayName = (source.sourceName || displayPath).replace(/%20/g, " ");
        const row = document.createElement("div");
        row.className = "missing-footage-entry";
        row.setAttribute("role", "listitem");
        const copy = document.createElement("div");
        copy.className = "missing-footage-copy";
        const name = document.createElement("strong");
        name.textContent = displayName;
        name.title = displayPath;
        const path = document.createElement("small");
        path.textContent = displayPath;
        path.title = displayPath;
        copy.append(name, path);
        const relinkButton = document.createElement("button");
        relinkButton.type = "button";
        relinkButton.className = "secondary";
        relinkButton.textContent = "Relink";
        relinkButton.addEventListener("click", () => {
          missingFootageModal.hidden = true;
          relinkFootageByPath(source.sourcePath);
        });
        row.append(copy, relinkButton);
        missingFootageList.appendChild(row);
      });
      if (!grouped.size) {
        const empty = document.createElement("p");
        empty.className = "favorite-results-empty";
        empty.textContent = "No missing footage sources.";
        missingFootageList.appendChild(empty);
      }
    }

    function openMissingFootageList() {
      renderMissingFootageList();
      missingFootageModal.hidden = false;
      focusFullscreenCloseButton();
    }

    function refreshFootageStatus(onComplete) {
      if (footageStatusRequestActive) {
        if (onComplete) pendingFootageStatusCallback = onComplete;
        return;
      }
      footageStatusRequestActive = true;
      const finishRequest = () => {
        footageStatusRequestActive = false;
        const callback = pendingFootageStatusCallback || onComplete;
        pendingFootageStatusCallback = null;
        if (callback) callback();
      };
      callAE("listClipFavoriteFootageStatus()", "", (response) => {
        const missingByPath = new Map();
        if (response !== "NO_FAVORITES") {
          response.split(/\r?\n/).filter(Boolean).forEach((line) => {
            const fields = line.split("\t");
            if (fields.length !== 2) return;
            try {
              missingByPath.set(decodeURIComponent(fields[0]), fields[1] === "1");
            } catch (error) {
              // Ignore malformed source status entries.
            }
          });
        }
        let changed = false;
        favoriteRecords.forEach((record) => {
          const isMissing = missingByPath.get(record.sourcePath) || false;
          if (record.sourceMissing !== isMissing) {
            record.sourceMissing = isMissing;
            changed = true;
          }
        });
        syncMissingFootageCount();
        if (changed) renderFavoriteClips();
        if (!missingFootageModal.hidden) renderMissingFootageList();
        finishRequest();
      }, (message) => {
        footageStatusRequestActive = false;
        pendingFootageStatusCallback = null;
        setResult(message, "error");
      });
    }

    function toggleLibraryFavorite(entry) {
      const keys = getLibraryFavoriteKeys(entry);
      const wasFavorite = keys.some((key) => libraryFavoriteKeys.has(key));
      const previouslySavedKeys = keys.filter((key) => libraryFavoriteKeys.has(key));
      if (wasFavorite) keys.forEach((key) => libraryFavoriteKeys.delete(key));
      else libraryFavoriteKeys.add(keys[0]);
      if (saveLibraryFavoriteKeys()) {
        renderFavoriteClips();
        scrollLibraryItemIntoView(entry.key);
      }
      else {
        keys.forEach((key) => libraryFavoriteKeys.delete(key));
        previouslySavedKeys.forEach((key) => libraryFavoriteKeys.add(key));
        renderFavoriteClips();
      }
    }

    loadLibraryFavoriteKeys();

    function getUniqueFootageRecords() {
      const unique = [];
      favoriteRecords.forEach((record) => {
        if (!record || !record.sourcePath) return;
        if (!unique.some((entry) => entry.sourcePath === record.sourcePath)) {
          unique.push({ sourcePath: record.sourcePath, sourceName: record.sourceName });
        }
      });
      return unique;
    }

    function syncExportSelectionList() {
      exportFootageChoiceList.innerHTML = "";
      const isFootageMode = exportSelectionMode === "footage";
      const allChoices = isFootageMode
        ? getUniqueFootageRecords()
        : favoriteFolders.slice();
      const searchQuery = exportChoiceSearchQuery.trim().toLocaleLowerCase();
      const selectedValues = isFootageMode ? exportSelectedFootagePaths : exportSelectedFolderIds;
      const isSelected = (choice) => selectedValues.includes(isFootageMode ? choice.sourcePath : choice.id);
      const matchesSearch = (choice) => {
        const searchableText = isFootageMode
          ? `${choice.sourceName || ""} ${choice.sourcePath || ""}`
          : choice.name;
        return searchableText.toLocaleLowerCase().includes(searchQuery);
      };
      exportFootageModeButton.setAttribute("aria-pressed", String(isFootageMode));
      exportFolderModeButton.setAttribute("aria-pressed", String(!isFootageMode));

      if (!isFootageMode) {
        const foldersByParent = new Map();
        favoriteFolders.forEach((folder) => {
          const parentId = favoriteFolders.some((candidate) => candidate.id === folder.parentId) ? folder.parentId : "";
          if (!foldersByParent.has(parentId)) foldersByParent.set(parentId, []);
          foldersByParent.get(parentId).push(folder);
        });
        foldersByParent.forEach((folders, parentId) => foldersByParent.set(parentId, sortFolderRecords(folders)));
        const relevantSubtree = new Map();
        const searchMatchDescendantSubtree = new Map();
        const analyzeFolderMatches = (folder) => {
          const children = foldersByParent.get(folder.id) || [];
          const childStates = children.map(analyzeFolderMatches);
          const selected = selectedValues.includes(folder.id);
          const searchMatched = Boolean(searchQuery) && matchesSearch(folder);
          const relevantHere = !selected && (!searchQuery || searchMatched);
          const hasMatch = relevantHere || childStates.some((state) => state.hasMatch);
          const hasSearchMatch = searchMatched || childStates.some((state) => state.hasSearchMatch);
          relevantSubtree.set(folder.id, hasMatch);
          const hasSearchMatchDescendant = childStates.some((state) => state.hasSearchMatch);
          searchMatchDescendantSubtree.set(folder.id, hasSearchMatchDescendant);
          return { hasMatch, hasSearchMatch };
        };
        (foldersByParent.get("") || []).forEach(analyzeFolderMatches);

        const selectedFolders = favoriteFolders
          .filter((folder) => selectedValues.includes(folder.id))
          .sort((first, second) =>
            getFolderTrail(first.id).map((folder) => folder.name).join(" / ")
              .localeCompare(getFolderTrail(second.id).map((folder) => folder.name).join(" / "))
          );
        if (selectedFolders.length) {
          const heading = document.createElement("p");
          heading.className = "export-choice-group-label";
          heading.textContent = "Selected";
          exportFootageChoiceList.appendChild(heading);

          selectedFolders.forEach((folder) => {
            const label = document.createElement("label");
            label.className = "export-footage-option";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            checkbox.addEventListener("change", () => {
              const index = selectedValues.indexOf(folder.id);
              if (index !== -1) selectedValues.splice(index, 1);
              syncExportSelectionList();
            });
            const text = document.createElement("span");
            text.textContent = getFolderTrail(folder.id).map((item) => item.name).join(" / ");
            label.append(checkbox, text);
            exportFootageChoiceList.appendChild(label);
          });
        }

        const roots = (foldersByParent.get("") || []).filter((folder) => relevantSubtree.get(folder.id));
        if (!roots.length) {
          if (!selectedFolders.length || searchQuery) {
            const heading = document.createElement("p");
            heading.className = "export-choice-group-label";
            heading.textContent = "Matches";
            exportFootageChoiceList.appendChild(heading);
            const empty = document.createElement("p");
            empty.className = "favorite-results-empty";
            empty.textContent = searchQuery
              ? `No folders match "${exportChoiceSearchQuery.trim()}".`
              : "No folders have been created yet.";
            exportFootageChoiceList.appendChild(empty);
          }
          exportSelectedFootageButton.disabled = selectedValues.length === 0;
          return;
        }

        if (selectedFolders.length) {
          const heading = document.createElement("p");
          heading.className = "export-choice-group-label";
          heading.textContent = "Matches";
          exportFootageChoiceList.appendChild(heading);
        }

        const appendFolder = (folder, depth) => {
          const children = (foldersByParent.get(folder.id) || []).filter((child) => relevantSubtree.get(child.id));
          const isExpanded = expandedExportFolderIds.has(folder.id) ||
            searchMatchDescendantSubtree.get(folder.id);
          const node = document.createElement("div");
          node.className = "export-folder-node";

          const row = document.createElement("div");
          row.className = "export-folder-row";
          row.style.setProperty("--folder-depth", String(depth));

          if (children.length) {
            const disclosure = document.createElement("button");
            disclosure.type = "button";
            disclosure.className = "export-folder-disclosure";
            disclosure.setAttribute("aria-expanded", String(isExpanded));
            disclosure.setAttribute("aria-label", `${isExpanded ? "Collapse" : "Expand"} ${folder.name}`);
            disclosure.textContent = isExpanded ? "▾" : "▸";
            disclosure.addEventListener("click", () => {
              if (expandedExportFolderIds.has(folder.id)) expandedExportFolderIds.delete(folder.id);
              else expandedExportFolderIds.add(folder.id);
              syncExportSelectionList();
            });
            row.appendChild(disclosure);
          } else {
            const spacer = document.createElement("span");
            spacer.className = "export-folder-disclosure-spacer";
            row.appendChild(spacer);
          }

          if (selectedValues.includes(folder.id)) {
            const context = document.createElement("span");
            context.className = "export-folder-context";
            context.textContent = folder.name;
            context.title = getFolderTrail(folder.id).map((item) => item.name).join(" / ");
            row.appendChild(context);
          } else {
            const label = document.createElement("label");
            label.className = "export-footage-option export-folder-option";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = false;
            checkbox.addEventListener("change", () => {
              if (!selectedValues.includes(folder.id)) selectedValues.push(folder.id);
              syncExportSelectionList();
            });
            const text = document.createElement("span");
            text.textContent = folder.name;
            text.title = getFolderTrail(folder.id).map((item) => item.name).join(" / ");
            label.append(checkbox, text);
            row.appendChild(label);
          }
          node.appendChild(row);

          if (children.length && isExpanded) {
            const childList = document.createElement("div");
            childList.className = "export-folder-children";
            children.forEach((child) => childList.appendChild(appendFolder(child, depth + 1)));
            node.appendChild(childList);
          }
          return node;
        };

        roots.forEach((folder) => exportFootageChoiceList.appendChild(appendFolder(folder, 0)));
        exportSelectedFootageButton.disabled = selectedValues.length === 0;
        return;
      }

      const selectedChoices = allChoices.filter(isSelected);
      const matchingChoices = allChoices.filter((choice) => !isSelected(choice) && matchesSearch(choice));
      const choices = selectedChoices.concat(matchingChoices);
      if (!choices.length) {
        const empty = document.createElement("p");
        empty.className = "favorite-results-empty";
        empty.textContent = searchQuery
          ? `No ${isFootageMode ? "footage" : "folders"} match "${exportChoiceSearchQuery.trim()}".`
          : (isFootageMode ? "No footage has saved data yet." : "No folders have been created yet.");
        exportFootageChoiceList.appendChild(empty);
        exportSelectedFootageButton.disabled = selectedValues.length === 0;
        return;
      }

      if (selectedChoices.length) {
        const heading = document.createElement("p");
        heading.className = "export-choice-group-label";
        heading.textContent = "Selected";
        exportFootageChoiceList.appendChild(heading);
      }

      choices.forEach((choice) => {
        const label = document.createElement("label");
        label.className = "export-footage-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        const choiceValue = isFootageMode ? choice.sourcePath : choice.id;
        checkbox.checked = isSelected(choice);
        checkbox.addEventListener("change", () => {
          const currentSelection = isFootageMode ? exportSelectedFootagePaths : exportSelectedFolderIds;
          if (checkbox.checked) {
            if (!currentSelection.includes(choiceValue)) {
              currentSelection.push(choiceValue);
            }
          } else {
            const index = currentSelection.indexOf(choiceValue);
            if (index !== -1) currentSelection.splice(index, 1);
          }
          exportSelectedFootageButton.disabled = currentSelection.length === 0;
        });

        const text = document.createElement("span");
        if (isFootageMode) {
          text.textContent = choice.sourceName || choice.sourcePath;
        } else {
          text.textContent = getFolderTrail(choice.id).map((folder) => folder.name).join(" / ");
        }
        label.appendChild(checkbox);
        label.appendChild(text);
        exportFootageChoiceList.appendChild(label);

        if (selectedChoices.length && matchingChoices.length && choice === selectedChoices[selectedChoices.length - 1]) {
          const matchesHeading = document.createElement("p");
          matchesHeading.className = "export-choice-group-label";
          matchesHeading.textContent = "Matches";
          exportFootageChoiceList.appendChild(matchesHeading);
        }
      });

      exportSelectedFootageButton.disabled = selectedValues.length === 0;
    }

    function syncSearchClearButtons() {
      clearLibrarySearch.hidden = !librarySearch.value;
    }

    librarySearch.addEventListener("input", syncSearchClearButtons);

    function selectSearchTextOnFocus(input) {
      input.addEventListener("focus", () => {
        window.setTimeout(() => {
          if (document.activeElement === input) input.select();
        }, 0);
      });
    }

    selectSearchTextOnFocus(librarySearch);
    selectSearchTextOnFocus(exportChoiceSearch);

    function formatTimestamp(value) {
      const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (part) => String(part).padStart(2, "0");
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    function localFileUrl(path) {
      const sourcePath = String(path || "");
      if (/^https?:\/\//i.test(sourcePath)) return sourcePath;
      const normalizedPath = sourcePath.replace(/\\/g, "/");
      const encodedPath = normalizedPath.split("/").map((part) => encodeURIComponent(part)).join("/");
      return `file://${encodedPath.startsWith("/") ? "" : "/"}${encodedPath}`;
    }

    const storedPreviewQueue = [];
    const permanentlyDeletedPreviewKeys = new Set();
    let storedPreviewConversionActive = false;
    let storedPreviewCacheDirectory = "";
    let storedPreviewCacheDirectoryHostVerified = false;

    function getStoredPreviewIdentity(record) {
      return `${record.sourcePath}|${record.sourceIn}|${record.sourceOut}`;
    }

    function getStoredPreviewPath(record, requestedVersion, directoryOverride) {
      const cep = window.__adobe_cep__;
      const fs = window.cep && window.cep.fs;
      if (!cep || !fs || typeof fs.makedir !== "function" || typeof fs.stat !== "function") {
        throw new Error("CEP file APIs are unavailable.");
      }
      let userDataPath = decodeURI(cep.getSystemPath("userData") || "").replace(/^file:\/\//, "").replace(/\\/g, "/");
      userDataPath = userDataPath.replace(/^\/([A-Za-z]:\/)/, "$1").replace(/\/$/, "");
      const cacheDirectory = directoryOverride || storedPreviewCacheDirectory || (userDataPath + "/CEP Tool/preview-cache");
      const clipDuration = Math.max(0, Number(record.sourceOut) - Number(record.sourceIn));
      const cacheVersion = requestedVersion || (clipDuration > 15 ? "small-h264-v3-15s" : "small-h264-v2");
      const cacheKey = `${cacheVersion}|${record.sourcePath}|${record.sourceIn}|${record.sourceOut}`;
      let hash = 2166136261;
      for (let index = 0; index < cacheKey.length; index++) {
        hash = Math.imul(hash ^ cacheKey.charCodeAt(index), 16777619);
      }
      return cacheDirectory + "/clip-" + (hash >>> 0).toString(16) + ".mp4";
    }

    function removeStoredPreviews(records, excludedRecords, ignoredFavoriteRecords) {
      const fs = window.cep && window.cep.fs;
      if (!fs || typeof fs.stat !== "function" || typeof fs.deleteFile !== "function") {
        return "CEP file APIs are unavailable; preview files could not be removed.";
      }
      const cacheVersions = ["small-h264-v1", "small-h264-v2", "small-h264-v3-15s"];
      const remainingCacheKeys = new Set();
      const ignoredIdentities = new Set(
        (ignoredFavoriteRecords || []).map((record) => getStoredPreviewIdentity(record))
      );
      (favoriteRecords || []).filter((record) =>
        !ignoredIdentities.has(getStoredPreviewIdentity(record))
      ).concat(excludedRecords || []).forEach((record) => {
        if (!record || !record.sourcePath) return;
        cacheVersions.forEach((version) => remainingCacheKeys.add(`${version}|${getStoredPreviewIdentity(record)}`));
      });
      const deletedIdentities = new Set();
      let removedCount = 0;

      for (const record of records || []) {
        if (!record || !record.sourcePath) continue;
        const identity = getStoredPreviewIdentity(record);
        deletedIdentities.add(identity);
        for (const version of cacheVersions) {
          const cacheKey = `${version}|${identity}`;
          if (remainingCacheKeys.has(cacheKey)) continue;
          let previewPath;
          try {
            previewPath = getStoredPreviewPath(record, version);
          } catch (error) {
            return error.message || "Could not locate the preview cache.";
          }
          const file = fs.stat(previewPath);
          if (!file) {
            return `Could not inspect saved preview: ${previewPath}`;
          }
          if (file.err !== 0) {
            const notFoundError = typeof fs.ERR_NOT_FOUND === "number" ? fs.ERR_NOT_FOUND : 3;
            if (file.err === notFoundError) continue;
            return `Could not inspect saved preview: ${previewPath}`;
          }
          if (!file.data || typeof file.data.isFile !== "function") {
            return `Could not inspect saved preview: ${previewPath}`;
          }
          if (!file.data.isFile()) continue;
          const removed = fs.deleteFile(previewPath);
          if (!removed || removed.err !== 0) {
            return `Could not remove saved preview: ${previewPath}`;
          }
          removedCount++;
        }
      }
      deletedIdentities.forEach((identity) => {
        const stillUsed = cacheVersions.some((version) => remainingCacheKeys.has(`${version}|${identity}`));
        if (stillUsed) {
          permanentlyDeletedPreviewKeys.delete(identity);
        } else {
          permanentlyDeletedPreviewKeys.add(identity);
        }
      });
      return removedCount ? `Removed ${removedCount} saved preview file(s).` : "";
    }

    function hasStoredPreview(path) {
      const fs = window.cep && window.cep.fs;
      if (!fs || typeof fs.stat !== "function") return false;
      const file = fs.stat(path);
      return Boolean(
        file &&
        file.err === 0 &&
        file.data &&
        typeof file.data.isFile === "function" &&
        file.data.isFile()
      );
    }

    function resolveStoredPreviewCacheDirectory(callback) {
      const cep = window.__adobe_cep__;
      if (!cep || typeof cep.evalScript !== "function") {
        callback("", "After Effects could not provide a writable preview folder.");
        return;
      }
      cep.evalScript("getSceneKeeperPreviewCacheDirectory()", (response) => {
        const value = String(response || "").trim();
        if (!value || value === "EvalScript error." || value.indexOf("ERROR:") === 0) {
          callback("", value || "After Effects could not provide a writable preview folder.");
          return;
        }
        const directory = value.replace(/^file:\/\//i, "").replace(/\\/g, "/")
          .replace(/^\/([A-Za-z]:\/)/, "$1").replace(/\/+$/, "");
        callback(directory, "");
      });
    }

    function getCachedStoredPreviewPath(record) {
      try {
        const path = getStoredPreviewPath(record);
        return hasStoredPreview(path) ? path : "";
      } catch (error) {
        return "";
      }
    }

    function finishStoredPreviewJob(job, path, errorMessage) {
      if (path && permanentlyDeletedPreviewKeys.has(getStoredPreviewIdentity(job.record))) {
        const previewPath = path;
        const fs = window.cep && window.cep.fs;
        const removed = fs && typeof fs.deleteFile === "function" ? fs.deleteFile(previewPath) : null;
        if (!removed || removed.err !== 0) {
          path = "";
          errorMessage = `Could not remove saved preview: ${previewPath}`;
        }
      }
      try {
        job.callback(path, errorMessage);
      } finally {
        storedPreviewConversionActive = false;
        window.setTimeout(processStoredPreviewQueue, 0);
      }
    }

    function buildStoredPreviewConverters(job) {
      const sourcePath = String(job.record.sourcePath || "");
      const start = String(Math.max(0, Number(job.record.sourceIn) || 0));
      const duration = String(Math.max(0.04, Math.min(15, Number(job.record.sourceOut) - Number(job.record.sourceIn))));
      const args = [
        "-y", "-ss", start, "-i", sourcePath, "-t", duration,
        "-vf", "scale=480:480:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=15",
        "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
        "-maxrate", "200k", "-bufsize", "400k", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", job.outputPath
      ];
      const isWindows = /Windows/i.test(navigator.userAgent || "");
      if (isWindows) {
        const converters = [
          { command: "ffmpeg.exe", args },
          { command: "C:\\ffmpeg\\bin\\ffmpeg.exe", args },
          { command: "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe", args },
          { command: "C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe", args }
        ];
        const cep = window.__adobe_cep__;
        if (cep && typeof cep.getSystemPath === "function") {
          const extensionPath = decodeURI(cep.getSystemPath("extension") || "")
            .replace(/^file:\/\//i, "")
            .replace(/^\/([A-Za-z]:)/, "$1")
            .replace(/\//g, "\\")
            .replace(/\\$/, "");
          if (extensionPath) {
            const helperPath = `${extensionPath}\\scripts\\transcode-preview-windows.ps1`;
            converters.push({
              command: "powershell.exe",
              args: [
                "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden",
                "-ExecutionPolicy", "Bypass", "-File", helperPath,
                "-SourcePath", sourcePath,
                "-StartSeconds", start,
                "-DurationSeconds", duration,
                "-OutputPath", job.outputPath
              ]
            });
          }
        }
        return converters;
      }

      return [
        { command: "/opt/homebrew/bin/ffmpeg", args },
        { command: "/usr/local/bin/ffmpeg", args },
        { command: "ffmpeg", args },
        {
          command: "/usr/bin/avconvert",
          args: [
            "--source", sourcePath,
            "--preset", "Preset640x480",
            "--output", job.outputPath,
            "--start", start,
            "--duration", duration,
            "--replace"
          ]
        }
      ];
    }

    function processStoredPreviewQueue() {
      if (storedPreviewConversionActive || !storedPreviewQueue.length) return;
      const job = storedPreviewQueue.shift();
      if (storedPreviewCacheDirectoryHostVerified) {
        try {
          job.outputPath = getStoredPreviewPath(job.record);
        } catch (pathError) {
          finishStoredPreviewJob(job, "", pathError.message || "Could not locate the preview cache.");
          return;
        }
      }
      if (hasStoredPreview(job.outputPath)) {
        finishStoredPreviewJob(job, job.outputPath, "");
        return;
      }

      const processApi = window.cep && window.cep.process;
      if (!processApi || typeof processApi.createProcess !== "function" || typeof processApi.isRunning !== "function") {
        finishStoredPreviewJob(job, "", "CEP process APIs are unavailable.");
        return;
      }

      if (!storedPreviewCacheDirectoryHostVerified) {
        resolveStoredPreviewCacheDirectory((fallbackDirectory, fallbackError) => {
          if (!fallbackDirectory) {
            finishStoredPreviewJob(job, "", fallbackError || "After Effects could not prepare a writable preview folder.");
            return;
          }
          storedPreviewCacheDirectory = fallbackDirectory;
          storedPreviewCacheDirectoryHostVerified = true;
          try {
            job.outputPath = getStoredPreviewPath(job.record);
          } catch (pathError) {
            finishStoredPreviewJob(job, "", pathError.message || "Could not locate a writable preview folder.");
            return;
          }
          if (hasStoredPreview(job.outputPath)) {
            finishStoredPreviewJob(job, job.outputPath, "");
            return;
          }
          storedPreviewQueue.unshift(job);
          window.setTimeout(processStoredPreviewQueue, 0);
        });
        return;
      }

      const candidates = buildStoredPreviewConverters(job);
      storedPreviewConversionActive = true;
      const tryCandidate = (index, lastError) => {
        if (index >= candidates.length) {
          finishStoredPreviewJob(job, "", lastError);
          return;
        }
        const candidate = candidates[index];
        const launched = processApi.createProcess(candidate.command, ...candidate.args);
        if (!launched || launched.err !== 0 || !launched.data) {
          tryCandidate(index + 1, `Could not start ${candidate.command}.`);
          return;
        }
        let converterError = "";
        if (typeof processApi.stderr === "function") {
          processApi.stderr(launched.data, (output) => {
            converterError += String(output || "");
          });
        }
        const poll = () => {
          const state = processApi.isRunning(launched.data);
          if (!state || state.err !== 0) {
            finishStoredPreviewJob(job, "", "Could not check preview conversion status.");
          } else if (state.data === true) {
            window.setTimeout(poll, 250);
          } else if (hasStoredPreview(job.outputPath)) {
            finishStoredPreviewJob(job, job.outputPath, "");
          } else {
            const details = converterError.trim().slice(-400);
            const failure = `${candidate.command} could not convert this clip${details ? `: ${details}` : "."}`;
            tryCandidate(index + 1, failure);
          }
        };
        window.setTimeout(poll, 250);
      };
      tryCandidate(0, "No video converter is available.");
    }

    function requestStoredPreview(record, callback) {
      permanentlyDeletedPreviewKeys.delete(getStoredPreviewIdentity(record));
      let outputPath;
      try {
        outputPath = getStoredPreviewPath(record);
      } catch (error) {
        callback("", error.message);
        return;
      }
      if (hasStoredPreview(outputPath)) {
        callback(outputPath, "");
        return;
      }
      storedPreviewQueue.push({ record, outputPath, callback });
      processStoredPreviewQueue();
    }

    function hideFavoritePreview() {
      favoritePreviewRequest++;
      favoritePreviewRange = null;
      favoritePreviewVideo.pause();
      favoritePreviewVideo.onloadedmetadata = null;
      favoritePreviewVideo.onloadeddata = null;
      favoritePreviewVideo.onseeked = null;
      favoritePreviewVideo.onerror = null;
      favoritePreviewVideo.removeAttribute("src");
      favoritePreviewVideo.load();
      favoritePlayerControls.hidden = true;
      favoritePlayButton.disabled = true;
      favoritePreviewSeek.disabled = true;
      favoriteMuteButton.disabled = true;
      favoritePreview.hidden = true;
    }

    function showFavoritePreview(record) {
      const request = ++favoritePreviewRequest;
      const start = Math.max(0, Number(record.sourceIn) || 0);
      const end = Math.max(start, Number(record.sourceOut) || start);
      favoritePreviewRange = { start, end };
      favoritePreview.hidden = false;
      favoritePreviewName.textContent = getClipDisplayName(record);
      favoritePreviewStatus.textContent = "Loading";
      favoritePreviewVideo.hidden = true;
      favoritePreviewMessage.hidden = false;
      favoritePreviewMessage.classList.add("is-loading");
      favoritePreviewMessage.textContent = "Loading preview...";
      favoritePlayerControls.hidden = true;
      favoritePlayButton.disabled = true;
      favoritePreviewSeek.disabled = true;
      favoriteMuteButton.disabled = true;
      favoritePreviewVideo.pause();
      favoritePreviewVideo.muted = true;
      favoritePreviewVideo.removeAttribute("src");
      favoritePreviewVideo.removeAttribute("data-stored-preview");
      favoritePreviewVideo.load();

      let playbackStarted = false;
      const revealPreview = () => {
        if (request !== favoritePreviewRequest) return;
        favoritePreviewVideo.hidden = false;
        favoritePlayerControls.hidden = false;
        favoritePreviewMessage.hidden = true;
        favoritePreviewMessage.classList.remove("is-loading");
        favoritePlayButton.disabled = false;
        favoritePreviewSeek.disabled = false;
        favoriteMuteButton.disabled = false;
        if (!previewAutoplay || !previewPanelFocused) {
          favoritePreviewStatus.textContent = "Ready";
          return;
        }
        if (playbackStarted) return;
        playbackStarted = true;
        favoritePreviewStatus.textContent = "Playing muted";
        const playback = favoritePreviewVideo.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch(() => {
            if (request === favoritePreviewRequest) {
              favoritePreviewStatus.textContent = "Press play";
            }
          });
        }
      };
      favoritePreviewVideo.onloadedmetadata = () => {
        if (request !== favoritePreviewRequest) return;
        const lastFrame = Math.max(0, favoritePreviewVideo.duration - 0.05);
        favoritePreviewRange.start = favoritePreviewVideo.dataset.storedPreview === "true"
          ? 0
          : Math.min(start, lastFrame);
        favoritePreviewRange.end = favoritePreviewVideo.dataset.storedPreview === "true"
          ? Math.min(favoritePreviewVideo.duration, 15)
          : Math.min(end, favoritePreviewVideo.duration);
        favoritePreviewDuration.textContent = formatTimestamp(favoritePreviewRange.end - favoritePreviewRange.start);
        favoritePreviewVideo.currentTime = favoritePreviewRange.start;
      };
      favoritePreviewVideo.onloadeddata = () => {
        if (request !== favoritePreviewRequest) return;
        if (!favoritePreviewVideo.videoWidth || !favoritePreviewVideo.videoHeight) return;
        if (favoritePreviewVideo.dataset.storedPreview !== "true") {
          window.clearTimeout(storedPreviewTimeout);
        }
        revealPreview();
      };
      favoritePreviewVideo.onseeked = revealPreview;
      let storedPreviewRequested = false;
      let storedPreviewTimeout = null;
      const showStoredPreviewError = () => {
        if (request !== favoritePreviewRequest) return;
        const mediaError = favoritePreviewVideo.error;
        favoritePreviewVideo.hidden = true;
        favoritePlayerControls.hidden = true;
        favoritePreviewMessage.hidden = false;
        favoritePreviewMessage.classList.remove("is-loading");
        favoritePreviewStatus.textContent = "Unavailable";
        favoritePreviewMessage.textContent = mediaError
          ? `Saved preview could not be played (media error ${mediaError.code}).`
          : "Saved preview could not be played.";
      };
      const useStoredPreview = () => {
        if (request !== favoritePreviewRequest || storedPreviewRequested) return;
        if (record.sourceMissing && !getCachedStoredPreviewPath(record)) {
          favoritePreviewVideo.hidden = true;
          favoritePlayerControls.hidden = true;
          favoritePreviewMessage.hidden = false;
          favoritePreviewMessage.classList.remove("is-loading");
          favoritePreviewStatus.textContent = "Unavailable";
          favoritePreviewMessage.textContent = "Original footage is offline.";
          return;
        }
        if (!storedPreviewRequested) {
          storedPreviewRequested = true;
          window.clearTimeout(storedPreviewTimeout);
          favoritePreviewVideo.hidden = true;
          favoritePlayerControls.hidden = true;
          favoritePreviewMessage.hidden = false;
          favoritePreviewMessage.classList.add("is-loading");
          favoritePreviewStatus.textContent = "Saving preview";
          favoritePreviewMessage.textContent = "Creating a small saved preview...";
          favoritePreviewVideo.onerror = null;
          requestStoredPreview(record, (previewPath, errorMessage) => {
            if (request !== favoritePreviewRequest) return;
            if (!previewPath) {
              favoritePreviewStatus.textContent = "Unavailable";
              favoritePreviewMessage.classList.remove("is-loading");
              favoritePreviewMessage.textContent = errorMessage || "Could not create a saved preview.";
              return;
            }
            if (favoritePreviewVideo.dataset.storedPreview !== "true" &&
                favoritePreviewVideo.readyState >= 2 &&
                favoritePreviewVideo.videoWidth > 0 &&
                favoritePreviewVideo.videoHeight > 0) {
              return;
            }
            favoritePreviewVideo.dataset.storedPreview = "true";
            favoritePreviewVideo.onerror = showStoredPreviewError;
            favoritePreviewVideo.src = localFileUrl(previewPath);
            favoritePreviewVideo.load();
          });
        }
      };
      favoritePreviewVideo.onerror = () => {
        if (request !== favoritePreviewRequest) return;
        useStoredPreview();
        if (storedPreviewRequested) return;
        favoritePreviewVideo.hidden = true;
        favoritePlayerControls.hidden = true;
        favoritePreviewMessage.hidden = false;
        favoritePreviewMessage.classList.remove("is-loading");
        favoritePreviewStatus.textContent = "Unavailable";
        favoritePreviewMessage.textContent = "Could not play the original footage in the CEP browser.";
      };
      if (getCachedStoredPreviewPath(record)) {
        useStoredPreview();
      } else {
        favoritePreviewVideo.src = localFileUrl(record.sourcePath);
        favoritePreviewVideo.load();
        storedPreviewTimeout = window.setTimeout(useStoredPreview, 4000);
      }
    }

    function updatePreviewPlaybackStatus() {
      if (!favoritePreviewRange || favoritePreviewVideo.paused) return;
      favoritePreviewStatus.textContent = favoritePreviewVideo.muted ? "Looping muted" : "Looping with sound";
    }

    favoritePreviewVideo.addEventListener("timeupdate", () => {
      if (!favoritePreviewRange) return;
      if (!favoritePreviewVideo.paused && favoritePreviewVideo.currentTime >= favoritePreviewRange.end - 0.02) {
        favoritePreviewVideo.currentTime = favoritePreviewRange.start;
        updatePreviewPlaybackStatus();
      }
      const clipDuration = favoritePreviewRange.end - favoritePreviewRange.start;
      const progress = clipDuration > 0
        ? Math.max(0, Math.min(1, (favoritePreviewVideo.currentTime - favoritePreviewRange.start) / clipDuration))
        : 0;
      favoritePreviewSeek.value = String(Math.round(progress * 1000));
      favoritePreviewSeek.style.setProperty("--preview-progress", `${progress * 100}%`);
      favoritePreviewCurrent.textContent = formatTimestamp(favoritePreviewVideo.currentTime - favoritePreviewRange.start);
    });

    favoritePreviewVideo.addEventListener("ended", () => {
      if (!favoritePreviewRange) return;
      favoritePreviewVideo.currentTime = favoritePreviewRange.start;
      if (previewPanelFocused) {
        favoritePreviewVideo.play();
      }
    });

    function pausePreviewWhenPanelInactive() {
      previewPanelFocused = false;
      favoritePreviewVideo.pause();
    }

    window.addEventListener("blur", pausePreviewWhenPanelInactive);
    window.addEventListener("focus", () => {
      previewPanelFocused = true;
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        pausePreviewWhenPanelInactive();
      }
    });

    favoritePreviewVideo.addEventListener("play", () => {
      favoritePlayGlyph.className = "favorite-pause-glyph";
      favoritePlayButton.setAttribute("aria-label", "Pause preview");
      favoritePlayButton.title = "Pause preview";
      updatePreviewPlaybackStatus();
    });

    favoritePreviewVideo.addEventListener("pause", () => {
      favoritePlayGlyph.className = "favorite-play-glyph";
      favoritePlayButton.setAttribute("aria-label", "Play preview");
      favoritePlayButton.title = "Play preview";
      if (favoritePreviewRange && favoritePreviewVideo.currentTime < favoritePreviewRange.end) {
        favoritePreviewStatus.textContent = "Paused";
      }
    });

    favoritePreviewVideo.addEventListener("volumechange", () => {
      favoriteMuteButton.textContent = favoritePreviewVideo.muted ? "Unmute" : "Mute";
      favoriteMuteButton.setAttribute("aria-label", favoritePreviewVideo.muted ? "Unmute preview" : "Mute preview");
      updatePreviewPlaybackStatus();
    });

    function togglePreviewPlayback() {
      if (!favoritePreviewRange || favoritePreviewVideo.hidden) return;
      if (favoritePreviewVideo.paused) {
        const playback = favoritePreviewVideo.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch(() => {
            favoritePreviewStatus.textContent = "Press play";
          });
        }
      } else {
        favoritePreviewVideo.pause();
      }
    }

    favoritePreviewVideo.addEventListener("click", togglePreviewPlayback);
    favoritePlayButton.addEventListener("click", togglePreviewPlayback);

    favoritePreviewSeek.addEventListener("input", () => {
      if (!favoritePreviewRange) return;
      const progress = Number(favoritePreviewSeek.value) / 1000;
      const previewTime = favoritePreviewRange.start +
        progress * (favoritePreviewRange.end - favoritePreviewRange.start);
      favoritePreviewVideo.currentTime = previewTime;
      favoritePreviewCurrent.textContent = formatTimestamp(previewTime - favoritePreviewRange.start);
      favoritePreviewSeek.style.setProperty("--preview-progress", `${progress * 100}%`);
    });

    favoriteMuteButton.addEventListener("click", () => {
      favoritePreviewVideo.muted = !favoritePreviewVideo.muted;
    });

    function callAE(scriptCall, successText, onSuccess, onError) {
      const cep = window.__adobe_cep__;
      if (!cep || typeof cep.evalScript !== "function") {
        const message = "CEP bridge unavailable. Is the panel running in After Effects?";
        if (onError) onError(message);
        else setResult(message, "error");
        return;
      }

      const isBackgroundLoad = /^(listClipFavorites|listClipFavoriteFootageStatus|listClipFolders|getClipSettings|getSceneKeeperQuickSaveStatus|getRandomMarkerSkipSuggestions|getRandomMarkerNames|getSelectedRandomMarkerSlots|createSceneKeeperBackup)\(/.test(scriptCall);
      if (!isBackgroundLoad) setResult("Working...", "");
      const libraryAction = /^(createClipFolder|moveClipFolder|renameClipFolder|deleteClipFolder|assignClipFavoriteFolder|saveSelectedClipFavorite|quickSaveSelectedClipsToFolder|confirmClipFavoriteReplacement|renameClipFavorite|updateClipFavorite|reorderClipFavorites|reorderClipFolders|reorderClipLibraryItems|deleteClipFavorite|deleteClipFavoriteFootage|restoreClipTrashItem|relinkClipFavoriteFootage|importClipFavorites|resolveClipFavoriteImport)\(/.test(scriptCall);
      const timelineAction = /^(insertClipFavorite|insertClipFavoriteIntoSelectedPrecomp|insertRandomClipFavoriteForSelectedFootage|insertRandomClipsBetweenMarkers|replaceRandomMarkerClips|replaceSelectedClipFromFolders|quickReplaceSelectedClip|prepareSelectedClipReplaceSlots|deleteRandomMarkerPrecomps)\(/.test(scriptCall);
      const encodedCommand = JSON.stringify(encodeURIComponent(scriptCall));
      const hostCall = libraryAction
        ? `runClipLibraryAction(${encodedCommand})`
        : (timelineAction ? `runClipTimelineAction(${encodedCommand})` : scriptCall);
      cep.evalScript(hostCall, (response) => {
        if (response === undefined || response === null || response === "EvalScript error.") {
          const message = "After Effects scripting call failed.";
          if (onError) onError(message);
          else setResult(message, "error");
          return;
        }

        if (response.indexOf("ERROR:") === 0) {
          const message = response.substring(6);
          if (onError) onError(message);
          else setResult(message, "error");
          return;
        }

        if (response === "BACKUP_RECENT") return;

        if (onSuccess) {
          onSuccess(response);
          return;
        }

        setResult(response || successText, "success");
      });
    }

    function runHistoryAction(action) {
      callAE(`${action}()`, "", (response) => {
        if (response === "NOTHING_TO_UNDO") {
          showActionNotification("Nothing to undo yet.");
          return;
        }
        if (response === "NOTHING_TO_REDO") {
          showActionNotification("Nothing to redo yet.");
          return;
        }
        const [historyResult, , encodedDescription, encodedFolderParentId] = response.split("|");
        const description = encodedDescription
          ? decodeURIComponent(encodedDescription)
          : "After Effects action";
        if (historyResult === "ACTION_UNDONE" && encodedFolderParentId !== undefined) {
          selectedFolderId = decodeURIComponent(encodedFolderParentId);
          selectedFootagePath = "";
          selectedFavoriteStorageIndex = null;
          selectedLibraryItemKey = "";
          librarySearch.value = "";
          syncSearchClearButtons();
        }
        const statusMessage = historyResult === "ACTION_UNDONE"
          ? `Undid: ${description}`
          : `Redid: ${description}`;
        refreshFavorites(false, statusMessage);
        refreshFavoriteFolders();
        if (!clipTrashModal.hidden) loadClipTrash();
      });
    }

    undoActionButton.addEventListener("click", () => runHistoryAction("undoClipToolAction"));

    function getSelectedFavorite() {
      if (selectedFavoriteStorageIndex === null) return null;
      return favoriteRecords.find((record) => record.storageIndex === selectedFavoriteStorageIndex) || null;
    }

    function getSelectedLibraryEntries() {
      const entries = [];
      favoriteFolders.forEach((folder) => {
        if (selectedLibraryKeys.has(`folder:${folder.id}`)) entries.push({ type: "folder", folder });
      });
      favoriteRecords.forEach((record) => {
        if (selectedLibraryKeys.has(`clip:${record.storageIndex}`)) entries.push({ type: "clip", clip: record });
      });
      return entries;
    }

    function syncSelectionVisualState() {
      favoriteList.querySelectorAll(".favorite-result").forEach((button) => {
        const isSelected = selectedLibraryKeys.has(button.dataset.resultKey);
        button.setAttribute("aria-pressed", String(isSelected));
      });
    }

    function updateLibrarySelectionVisuals() {
      const selectedEntries = getSelectedLibraryEntries();
      const canCopy = selectedEntries.length > 0;
      const canPaste = copiedLibraryEntries.length > 0;
      copySelectionButton.disabled = !canCopy;
      pasteSelectionButton.disabled = !canPaste;
      syncSelectionVisualState();
    }

    function clearLibrarySelection() {
      selectedLibraryKeys.clear();
      selectedLibraryItemKey = "";
      selectedFavoriteStorageIndex = null;
      selectedFootagePath = "";
      updateLibrarySelectionVisuals();
      updateFavoriteSelection();
      renderFavoriteClips();
    }

    favoritesSection.addEventListener("click", (event) => {
      if (event.target.closest(".favorite-result-item, button, input, select, textarea, a, [role='dialog'], .library-context-menu, .favorite-preview")) return;
      clearLibrarySelection();
    });

    copySelectionButton.addEventListener("click", () => {
      if (copySelectionButton.disabled) return;
      copySelectedEntries();
    });
    pasteSelectionButton.addEventListener("click", () => {
      if (pasteSelectionButton.disabled) return;
      pasteCopiedEntries();
    });

    function copySelectedEntries(entries) {
      const source = entries && entries.length ? entries : getSelectedLibraryEntries();
      if (!source.length) {
        setResult("Select at least one clip or folder first.", "error");
        return false;
      }
      copiedLibraryEntries = source.map((entry) => ({ ...entry }));
      updateLibrarySelectionVisuals();
      setResult(`${source.length} item(s) copied.`, "success");
      return true;
    }

    function pasteCopiedEntries() {
      if (!copiedLibraryEntries.length) {
        setResult("Copy something first.", "error");
        return;
      }
      const destinationFolderId = selectedFolderId || "";
      const destinationName = getFolderTrail(destinationFolderId)
        .map((folder) => folder.name)
        .join(" / ") || "Home";
      const clipEntries = copiedLibraryEntries.filter((entry) => entry.type === "clip");
      const folderEntries = copiedLibraryEntries.filter((entry) => entry.type === "folder");

      if (clipEntries.length) {
        clipEntries.forEach((entry) => {
          const encodedFolderId = JSON.stringify(encodeURIComponent(destinationFolderId));
          callAE(`assignClipFavoriteFolder(${entry.clip.storageIndex}, ${encodedFolderId})`, "", () => {
            selectedFolderId = destinationFolderId;
            refreshFavorites(false, `"${getClipDisplayName(entry.clip)}" copied to "${destinationName}".`, entry.clip.storageIndex);
          });
        });
      }

      if (folderEntries.length) {
        folderEntries.forEach((entry, index) => {
          const folder = entry.folder;
          const folderName = `${folder.name}${index === 0 ? " Copy" : " Copy ${index + 1}"}`;
          const id = `folder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
          const encodedId = JSON.stringify(encodeURIComponent(id));
          const encodedName = JSON.stringify(encodeURIComponent(folderName));
          const encodedPath = JSON.stringify(encodeURIComponent(folder.sourcePath || ""));
          const encodedParentId = JSON.stringify(encodeURIComponent(destinationFolderId));
          callAE(`createClipFolder(${encodedId}, ${encodedName}, ${encodedPath}, ${encodedParentId})`, "", () => {
            setResult(`"${folder.name}" copied to "${destinationName}".`, "success");
          });
        });
      }

      if (!clipEntries.length && !folderEntries.length) {
        setResult("Nothing available to paste here.", "error");
      }
    }

    function closeLibraryContextMenu() {
      libraryContextMenu.hidden = true;
      libraryContextMenu.innerHTML = "";
      libraryContextMenuAnchor = null;
    }

    function openLibraryContextMenu(event, actions) {
      event.preventDefault();
      const anchor = event.currentTarget && event.currentTarget !== document
        ? event.currentTarget
        : event.target;
      if (!libraryContextMenu.hidden && libraryContextMenuAnchor === anchor) {
        closeLibraryContextMenu();
        return;
      }
      closeLibraryContextMenu();
      libraryContextMenuAnchor = anchor;
      actions.forEach((action) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "menuitem");
        button.textContent = action.label;
        if (action.danger) button.classList.add("danger");
        button.addEventListener("click", (clickEvent) => {
          closeLibraryContextMenu();
          action.run(clickEvent);
        });
        libraryContextMenu.appendChild(button);
      });
      libraryContextMenu.style.left = `${Math.max(4, Math.min(event.clientX, window.innerWidth - 150))}px`;
      libraryContextMenu.style.top = `${Math.max(4, Math.min(event.clientY, window.innerHeight - actions.length * 32 - 10))}px`;
      libraryContextMenu.hidden = false;
      libraryContextMenu.querySelector("button").focus();
      if (guidedTourActive && guidedTourStep === "organize") {
        const newFolderAction = Array.from(libraryContextMenu.querySelectorAll("button"))
          .find((button) => button.textContent === "New Folder");
        if (newFolderAction) {
          setGuidedTourDynamicTarget(newFolderAction);
          newFolderAction.focus();
        }
      }
    }

    function openRenameDialog(target) {
      pendingRenameTarget = target;
      renameDialogTitle.textContent = target.type === "folder" ? "Rename Folder" : "Rename Clip";
      renameDialogInput.value = target.name;
      renameDialog.hidden = false;
      renameDialogInput.focus();
      renameDialogInput.select();
    }

    function finishRename() {
      const target = pendingRenameTarget;
      const name = renameDialogInput.value.trim();
      if (!target || !name) return;
      const encodedName = JSON.stringify(encodeURIComponent(name));
      if (target.type === "folder") {
        const encodedId = JSON.stringify(encodeURIComponent(target.id));
        callAE(`renameClipFolder(${encodedId}, ${encodedName})`, "", (response) => {
          renameDialog.hidden = true;
          pendingRenameTarget = null;
          setResult(response, "success");
          refreshFavoriteFolders();
        });
        return;
      }
      callAE(`renameClipFavorite(${target.storageIndex}, ${encodedName})`, "", (response) => {
        renameDialog.hidden = true;
        pendingRenameTarget = null;
        refreshFavorites(false, response, target.storageIndex);
      });
    }

    function formatThreeDecimalValue(rawValue) {
      const text = `${rawValue ?? ""}`.trim();
      if (!text) return "";
      const numeric = Number(text);
      if (!Number.isFinite(numeric)) return "";
      return Number(numeric.toFixed(3)).toString();
    }

    function clampThreeDecimalInput(input) {
      const nextValue = formatThreeDecimalValue(input.value);
      if (nextValue === "") {
        input.value = "";
        return;
      }
      input.value = nextValue;
    }

    function syncClipScaleLinkState() {
      clipEditScaleLink.setAttribute("aria-pressed", String(clipEditScalesLinked));
      clipEditScaleLink.setAttribute(
        "aria-label",
        clipEditScalesLinked ? "Unlink scale values" : "Link scale values"
      );
      clipEditScaleLink.title = clipEditScalesLinked ? "Scale values are linked" : "Scale values are unlinked";
    }

    function updateLinkedScale(changedInput) {
      if (!clipEditScalesLinked) return;
      const otherInput = changedInput === clipEditScaleX ? clipEditScaleY : clipEditScaleX;
      const value = formatThreeDecimalValue(changedInput.value);
      if (value !== "") {
        otherInput.value = value;
      } else if (!changedInput.value.trim()) {
        otherInput.value = "";
      }
    }

    function syncClipAudioToggleState() {
      const isOn = clipEditAudioToggle.checked;
      clipEditAudioState.textContent = isOn ? "On" : "Off";
    }

    [clipEditIn, clipEditOut, clipEditPositionX, clipEditPositionY, clipEditScaleX, clipEditScaleY].forEach((input) => {
      input.addEventListener("input", () => {
        if (input.value.trim() === "") {
          if (input === clipEditScaleX || input === clipEditScaleY) updateLinkedScale(input);
          return;
        }
        const numeric = Number(input.value);
        if (!Number.isFinite(numeric)) return;
        input.value = Number(numeric.toFixed(3)).toString();
        if (input === clipEditScaleX || input === clipEditScaleY) updateLinkedScale(input);
      });
      input.addEventListener("blur", () => {
        clampThreeDecimalInput(input);
        if (input === clipEditScaleX || input === clipEditScaleY) updateLinkedScale(input);
      });
    });
    clipEditAudioToggle.addEventListener("change", syncClipAudioToggleState);
    clipEditScaleLink.addEventListener("click", () => {
      clipEditScalesLinked = !clipEditScalesLinked;
      if (clipEditScalesLinked) {
        clipEditScaleY.value = formatThreeDecimalValue(clipEditScaleX.value);
      }
      syncClipScaleLinkState();
    });

    function openClipEditDialog(record) {
      pendingClipEditRecord = record;
      clipEditScalesLinked = true;
      syncClipScaleLinkState();
      clipEditTitle.textContent = `Edit ${getClipDisplayName(record)}`;
      clipEditName.value = getClipDisplayName(record);
      clipEditIn.value = Number.isFinite(record.sourceIn) ? formatThreeDecimalValue(record.sourceIn) : "";
      clipEditOut.value = Number.isFinite(record.sourceOut) ? formatThreeDecimalValue(record.sourceOut) : "";
      clipEditPositionX.value = Number.isFinite(record.positionX) ? formatThreeDecimalValue(record.positionX) : "";
      clipEditPositionY.value = Number.isFinite(record.positionY) ? formatThreeDecimalValue(record.positionY) : "";
      clipEditScaleX.value = Number.isFinite(record.scaleX) ? formatThreeDecimalValue(record.scaleX) : "";
      clipEditScaleY.value = Number.isFinite(record.scaleY) ? formatThreeDecimalValue(record.scaleY) : "";
      updateLinkedScale(clipEditScaleX);
      clipEditAudioToggle.checked = record.audioEnabled === true;
      syncClipAudioToggleState();
      clipEditError.hidden = true;
      clipEditError.textContent = "";
      clipEditDialog.hidden = false;
      clipEditName.focus();
      clipEditName.select();
    }

    function closeClipEditDialog() {
      clipEditDialog.hidden = true;
      pendingClipEditRecord = null;
    }

    function updateClipNameInRenderedList(record) {
      const button = favoriteList.querySelector(`.favorite-result[data-storage-index="${record.storageIndex}"]`);
      const item = button && button.closest(".favorite-result-item");
      if (!button || !item) return;

      const displayName = getClipDisplayName(record);
      if (item.libraryEntry) item.libraryEntry.name = displayName;
      const name = button.querySelector(".favorite-result-name");
      if (name) name.textContent = displayName;

      const moreButton = item.querySelector(".clip-more-button");
      if (moreButton) {
        moreButton.dataset.entryName = displayName;
        moreButton.setAttribute(
          "aria-label",
          moreButton.classList.contains("delete-mode")
            ? `Delete clip "${displayName}"`
            : `Actions for ${displayName}`
        );
        if (moreButton.classList.contains("delete-mode")) moreButton.title = `Delete clip "${displayName}"`;
      }

      const favoriteButton = item.querySelector(".library-favorite-toggle");
      if (favoriteButton) {
        const isFavorite = favoriteButton.getAttribute("aria-pressed") === "true";
        favoriteButton.setAttribute(
          "aria-label",
          `${isFavorite ? "Remove" : "Add"} clip "${displayName}" ${isFavorite ? "from" : "to"} favorites`
        );
      }

      const query = librarySearch.value.trim().toLocaleLowerCase();
      const stillMatchesSearch = [
        record.displayName,
        record.sourceName,
        ...getFolderTrail(record.folderId).map((folder) => folder.name)
      ].some((value) => String(value || "").toLocaleLowerCase().includes(query));
      if (query && !stillMatchesSearch) {
        item.remove();
        if (!favoriteList.querySelector(".favorite-result-item")) {
          const empty = document.createElement("p");
          empty.className = "favorite-results-empty";
          empty.textContent = `No results for "${librarySearch.value.trim()}".`;
          favoriteList.appendChild(empty);
        }
      }
    }

    function saveClipEdit() {
      const record = pendingClipEditRecord;
      if (!record) return;

      const displayName = clipEditName.value.trim();
      if (!displayName) {
        clipEditError.textContent = "Clip name cannot be empty.";
        clipEditError.hidden = false;
        clipEditName.focus();
        return;
      }

      const sourceIn = formatThreeDecimalValue(clipEditIn.value);
      const sourceOut = formatThreeDecimalValue(clipEditOut.value);
      if (!sourceIn || !sourceOut || !Number.isFinite(Number(sourceIn)) || !Number.isFinite(Number(sourceOut)) ||
          Number(sourceIn) < 0 || Number(sourceOut) <= Number(sourceIn)) {
        clipEditError.textContent = "Enter valid timestamps; out must be greater than in.";
        clipEditError.hidden = false;
        return;
      }

      const optionalInputs = [
        { input: clipEditPositionX, label: "Position" },
        { input: clipEditPositionY, label: "Position" },
        { input: clipEditScaleX, label: "Scale" },
        { input: clipEditScaleY, label: "Scale" }
      ];
      for (let index = 0; index < optionalInputs.length; index++) {
        const value = optionalInputs[index].input.value.trim();
        if (value && !Number.isFinite(Number(value))) {
          clipEditError.textContent = `${optionalInputs[index].label} values must be valid numbers.`;
          clipEditError.hidden = false;
          return;
        }
      }
      if (Boolean(clipEditPositionX.value.trim()) !== Boolean(clipEditPositionY.value.trim())) {
        clipEditError.textContent = "Enter both position values or leave both empty.";
        clipEditError.hidden = false;
        return;
      }
      if (Boolean(clipEditScaleX.value.trim()) !== Boolean(clipEditScaleY.value.trim())) {
        clipEditError.textContent = "Enter both scale values or leave both empty.";
        clipEditError.hidden = false;
        return;
      }

      const values = [
        sourceIn,
        sourceOut,
        formatThreeDecimalValue(clipEditPositionX.value),
        formatThreeDecimalValue(clipEditPositionY.value),
        formatThreeDecimalValue(clipEditScaleX.value),
        formatThreeDecimalValue(clipEditScaleY.value),
        clipEditAudioToggle.checked ? "1" : "0"
      ];
      if (displayName !== getClipDisplayName(record)) values.push(displayName);
      const encodedValues = values.map((value) => JSON.stringify(encodeURIComponent(value)));
      const previousPreviewRecord = {
        sourcePath: record.sourcePath,
        sourceIn: record.sourceIn,
        sourceOut: record.sourceOut
      };
      const previewRangeChanged = Number(sourceIn) !== Number(record.sourceIn) ||
        Number(sourceOut) !== Number(record.sourceOut);
      const nameOnlyChanged = displayName !== getClipDisplayName(record) &&
        !previewRangeChanged &&
        formatThreeDecimalValue(clipEditPositionX.value) === formatThreeDecimalValue(record.positionX) &&
        formatThreeDecimalValue(clipEditPositionY.value) === formatThreeDecimalValue(record.positionY) &&
        formatThreeDecimalValue(clipEditScaleX.value) === formatThreeDecimalValue(record.scaleX) &&
        formatThreeDecimalValue(clipEditScaleY.value) === formatThreeDecimalValue(record.scaleY) &&
        clipEditAudioToggle.checked === (record.audioEnabled === true);
      callAE(`updateClipFavorite(${record.storageIndex}, ${encodedValues.join(", ")})`, "", (response) => {
        if (response.indexOf("ERROR:") === 0) {
          clipEditError.textContent = response;
          clipEditError.hidden = false;
          return;
        }
        let statusMessage = response;
        if (previewRangeChanged) {
          const updatedPreviewRecord = {
            sourcePath: record.sourcePath,
            sourceIn: Number(sourceIn),
            sourceOut: Number(sourceOut)
          };
          const cleanupMessage = removeStoredPreviews(
            [previousPreviewRecord],
            [updatedPreviewRecord],
            [previousPreviewRecord]
          );
          if (cleanupMessage) statusMessage = `${statusMessage} ${cleanupMessage}`;
        }
        closeClipEditDialog();
        if (nameOnlyChanged) {
          record.displayName = displayName;
          updateClipNameInRenderedList(record);
          if (selectedFavoriteStorageIndex === record.storageIndex && !favoritePreview.hidden) {
            favoritePreviewName.textContent = getClipDisplayName(record);
          }
          setResult(statusMessage, "success");
          return;
        }
        refreshFavorites(false, statusMessage, record.storageIndex);
      }, (message) => {
        clipEditError.textContent = message;
        clipEditError.hidden = false;
      });
    }

    function assignClipToFolder(storageIndex, folderId) {
      const encodedFolderId = JSON.stringify(encodeURIComponent(folderId));
      callAE(`assignClipFavoriteFolder(${storageIndex}, ${encodedFolderId})`, "", (response) => {
        selectedFolderId = folderId;
        refreshFavorites(false, response, Number(storageIndex));
      });
    }

    function assignClipsToFolder(storageIndices, folderId) {
      const encodedFolderId = JSON.stringify(encodeURIComponent(folderId));
      const moveNext = (index) => {
        if (index >= storageIndices.length) {
          selectedFolderId = folderId;
          refreshFavorites(false, `${storageIndices.length} clips moved to folder.`, storageIndices[storageIndices.length - 1]);
          return;
        }
        callAE(`assignClipFavoriteFolder(${storageIndices[index]}, ${encodedFolderId})`, "", () => {
          moveNext(index + 1);
        });
      };
      moveNext(0);
    }

    function moveFolderToFolder(folderId, parentId) {
      const encodedFolderId = JSON.stringify(encodeURIComponent(folderId));
      const encodedParentId = JSON.stringify(encodeURIComponent(parentId));
      callAE(`moveClipFolder(${encodedFolderId}, ${encodedParentId})`, "", (response) => {
        setResult(response, "success");
        refreshFavoriteFolders();
      });
    }

    function relinkFootageByPath(sourcePath) {
      const record = favoriteRecords.find((entry) => entry.sourcePath === sourcePath);
      if (!record) return;
      callAE(`relinkClipFavoriteFootage(${record.storageIndex})`, "", (response) => {
        refreshFavorites(false, response, record.storageIndex);
        refreshFavoriteFolders();
      });
    }

    function getFolderTrail(folderId) {
      const trail = [];
      let current = favoriteFolders.find((folder) => folder.id === folderId);
      while (current && !trail.some((folder) => folder.id === current.id)) {
        trail.unshift(current);
        current = current.parentId ? favoriteFolders.find((folder) => folder.id === current.parentId) : null;
      }
      return trail;
    }

    function getActiveExplorerTab() {
      return explorerTabs.find((tab) => tab.id === activeExplorerTabId) || explorerTabs[0];
    }

    function syncActiveExplorerTab() {
      const tab = getActiveExplorerTab();
      if (!tab) return;
      tab.sourcePath = selectedFootagePath;
      tab.folderId = selectedFolderId;
      tab.search = librarySearch.value;
      tab.selectedFavoriteStorageIndex = selectedFavoriteStorageIndex;
      tab.selectedLibraryItemKey = selectedLibraryItemKey;
    }

    function isExplorerTabDrag(event) {
      return event.dataTransfer &&
        Array.prototype.indexOf.call(event.dataTransfer.types, EXPLORER_TAB_DRAG_TYPE) !== -1;
    }

    function restoreExplorerTab(tab) {
      selectedFootagePath = tab.sourcePath || "";
      selectedFolderId = tab.folderId || "";
      persistQuickSaveShortcutSettings(selectedFolderId);
      librarySearch.value = tab.search || "";
      selectedFavoriteStorageIndex = tab.selectedFavoriteStorageIndex;
      selectedLibraryItemKey = tab.selectedLibraryItemKey || "";
      favoriteResultsMode = selectedFootagePath ? "clips" : "footage";
      syncSearchClearButtons();
    }

    function refreshWorkspaceOptions(selectedId) {
      const previousId = selectedId || workspaceSelect.value;
      workspaceSelect.innerHTML = "";
      const emptyOption = document.createElement("option");
      emptyOption.value = "";
      emptyOption.textContent = savedWorkspaces.length ? "Select a workspace" : "No saved workspaces";
      workspaceSelect.appendChild(emptyOption);
      savedWorkspaces.forEach((workspace) => {
        const option = document.createElement("option");
        option.value = workspace.id;
        option.textContent = workspace.name;
        workspaceSelect.appendChild(option);
      });
      workspaceSelect.value = savedWorkspaces.some((workspace) => workspace.id === previousId)
        ? previousId
        : "";
      const hasSelection = Boolean(workspaceSelect.value);
      workspaceOpenButton.disabled = !hasSelection;
      workspaceUpdateButton.disabled = !hasSelection;
      workspaceDeleteButton.disabled = !hasSelection;
    }

    function loadSavedWorkspaces() {
      try {
        const stored = window.localStorage.getItem(WORKSPACES_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        savedWorkspaces = Array.isArray(parsed)
          ? parsed.filter((workspace) => workspace && typeof workspace.id === "string" &&
            typeof workspace.name === "string" && (Array.isArray(workspace.folders) || Array.isArray(workspace.tabs)))
            .map((workspace) => ({
              id: workspace.id,
              name: workspace.name,
              folders: Array.isArray(workspace.folders)
                ? workspace.folders.filter((folderId) => typeof folderId === "string" && folderId)
                : workspace.tabs.map((tab) => tab && typeof tab.folderId === "string" ? tab.folderId : "").filter(Boolean),
              activeFolderIndex: Number.isInteger(workspace.activeFolderIndex)
                ? workspace.activeFolderIndex
                : Math.max(0, (workspace.tabs || []).findIndex((tab) => tab && tab.folderId))
            }))
          : [];
      } catch (error) {
        savedWorkspaces = [];
        setResult(`Could not load workspaces: ${error.message}`, "error");
      }
      // Rewrite legacy workspace records so settings stored by older versions are discarded.
      try {
        window.localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(savedWorkspaces));
      } catch (error) {
        setResult(`Could not update saved workspaces: ${error.message}`, "error");
      }
      refreshWorkspaceOptions();
    }

    function persistSavedWorkspaces() {
      try {
        window.localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(savedWorkspaces));
        return true;
      } catch (error) {
        setResult(`Could not save workspaces: ${error.message}`, "error");
        return false;
      }
    }

    function saveCurrentWorkspace(workspaceId) {
      const selectedWorkspace = workspaceId
        ? savedWorkspaces.find((workspace) => workspace.id === workspaceId)
        : null;
      if (workspaceId && !selectedWorkspace) return;
      const name = selectedWorkspace ? selectedWorkspace.name : workspaceName.value.trim();
      if (!name) {
        setResult("Enter a name for this workspace.", "error");
        workspaceName.focus();
        return;
      }
      syncActiveExplorerTab();
      const existingIndex = selectedWorkspace
        ? savedWorkspaces.findIndex((workspace) => workspace.id === selectedWorkspace.id)
        : savedWorkspaces.findIndex((workspace) => workspace.name.toLowerCase() === name.toLowerCase());
      const existing = selectedWorkspace || (existingIndex >= 0 ? savedWorkspaces[existingIndex] : null);
      const workspace = {
        id: existing ? existing.id : `workspace-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        folders: explorerTabs.map((tab) => tab.folderId || "").filter(Boolean),
        activeFolderIndex: Math.max(0, explorerTabs.slice(0, Math.max(0, explorerTabs.findIndex((tab) => tab.id === activeExplorerTabId) + 1))
          .filter((tab) => tab.folderId).length - 1)
      };
      if (existingIndex >= 0) savedWorkspaces[existingIndex] = workspace;
      else savedWorkspaces.push(workspace);
      if (!persistSavedWorkspaces()) return;
      workspaceName.value = "";
      refreshWorkspaceOptions(workspace.id);
      setResult(`${selectedWorkspace ? "Saved changes to" : "Saved"} workspace: ${name}`, "success");
    }

    function openSelectedWorkspace() {
      const workspace = savedWorkspaces.find((entry) => entry.id === workspaceSelect.value);
      if (!workspace) return;
      const folderIds = workspace.folders.filter((folderId) => favoriteFolders.some((folder) => folder.id === folderId));
      const restoredTabs = folderIds.map((folderId, index) => {
        return {
          id: `workspace-tab-${Date.now().toString(36)}-${index}`,
          folderId,
          sourcePath: "",
          search: "",
          selectedFavoriteStorageIndex: null,
          selectedLibraryItemKey: ""
        };
      });
      explorerTabs = restoredTabs.length ? restoredTabs : [{
        id: `workspace-tab-${Date.now().toString(36)}-0`,
        sourcePath: "",
        folderId: "",
        search: "",
        selectedFavoriteStorageIndex: null,
        selectedLibraryItemKey: ""
      }];
      const activeIndex = Math.min(Math.max(Number(workspace.activeFolderIndex) || 0, 0), explorerTabs.length - 1);
      activeExplorerTabId = explorerTabs[activeIndex].id;
      nextExplorerTabNumber = explorerTabs.length + 1;
      selectedLibraryKeys.clear();
      restoreExplorerTab(explorerTabs[activeIndex]);

      renderFavoriteClips();
      favoriteList.scrollTop = 0;
      const settingsModal = document.getElementById("settings-modal");
      settingsModal.hidden = true;
      settingsToggle.setAttribute("aria-expanded", "false");
      settingsToggle.focus();
      setResult(`Opened workspace: ${workspace.name}`, "success");
    }

    function deleteSelectedWorkspace() {
      const workspace = savedWorkspaces.find((entry) => entry.id === workspaceSelect.value);
      if (!workspace) return;
      pendingWorkspaceDeleteId = workspace.id;
      workspaceDeleteConfirmationText.textContent = `Delete workspace "${workspace.name}"?`;
      workspaceDeleteConfirmation.hidden = false;
      cancelWorkspaceDeleteButton.focus();
    }

    function confirmDeleteSelectedWorkspace() {
      const workspaceIndex = savedWorkspaces.findIndex((workspace) => workspace.id === pendingWorkspaceDeleteId);
      pendingWorkspaceDeleteId = "";
      workspaceDeleteConfirmation.hidden = true;
      if (workspaceIndex < 0) return;
      const workspace = savedWorkspaces[workspaceIndex];
      savedWorkspaces.splice(workspaceIndex, 1);
      if (!persistSavedWorkspaces()) return;
      refreshWorkspaceOptions();
      setResult(`Deleted workspace: ${workspace.name}`, "success");
    }

    function cancelDeleteSelectedWorkspace() {
      pendingWorkspaceDeleteId = "";
      workspaceDeleteConfirmation.hidden = true;
      workspaceDeleteButton.focus();
    }

    function focusWorkspaceSettings(action) {
      const settingsModal = document.getElementById("settings-modal");
      settingsModal.hidden = false;
      settingsToggle.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => {
        (action === "save" ? workspaceName : workspaceSelect).focus();
      });
    }

    loadSavedWorkspaces();
    workspaceSelect.addEventListener("change", () => refreshWorkspaceOptions(workspaceSelect.value));
    workspaceSaveButton.addEventListener("click", saveCurrentWorkspace);
    workspaceName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveCurrentWorkspace();
      }
    });
    workspaceOpenButton.addEventListener("click", openSelectedWorkspace);
    workspaceUpdateButton.addEventListener("click", () => saveCurrentWorkspace(workspaceSelect.value));
    workspaceDeleteButton.addEventListener("click", deleteSelectedWorkspace);
    cancelWorkspaceDeleteButton.addEventListener("click", cancelDeleteSelectedWorkspace);
    confirmWorkspaceDeleteButton.addEventListener("click", confirmDeleteSelectedWorkspace);
    workspaceDeleteConfirmation.addEventListener("click", (event) => {
      if (event.target === workspaceDeleteConfirmation) cancelDeleteSelectedWorkspace();
    });

    function getExplorerTabLabel(tab) {
      if (tab.search) return "Search";
      if (tab.folderId) {
        const folder = favoriteFolders.find((entry) => entry.id === tab.folderId);
        if (folder) return folder.name;
      }
      return "Home";
    }

    function scrollExplorerTabIntoView(tabId) {
      const tabItem = libraryTabs.querySelector(`[data-tab-id="${tabId}"]`);
      const tabStrip = libraryTabs.parentElement;
      if (!tabItem || !tabStrip) return;
      const stripBounds = tabStrip.getBoundingClientRect();
      const tabBounds = tabItem.getBoundingClientRect();
      if (tabBounds.left < stripBounds.left) {
        tabStrip.scrollLeft -= stripBounds.left - tabBounds.left;
      } else if (tabBounds.right > stripBounds.right) {
        tabStrip.scrollLeft += tabBounds.right - stripBounds.right;
      }
    }

    function renderExplorerTabs() {
      syncActiveExplorerTab();
      if (panelTooltipTarget && libraryTabs.contains(panelTooltipTarget)) hidePanelTooltip();
      libraryTabs.innerHTML = "";
      explorerTabs.forEach((tab) => {
        const label = getExplorerTabLabel(tab);
        const item = document.createElement("div");
        item.className = "library-tab-item";
        item.setAttribute("role", "presentation");
        item.draggable = true;
        item.dataset.tabId = tab.id;
        item.addEventListener("dragstart", (event) => {
          if (event.target.closest(".library-tab-close")) {
            event.preventDefault();
            return;
          }
          draggedExplorerTabId = tab.id;
          event.dataTransfer.setData(EXPLORER_TAB_DRAG_TYPE, tab.id);
          event.dataTransfer.effectAllowed = "move";
          item.classList.add("is-dragging");
        });
        item.addEventListener("dragend", () => {
          draggedExplorerTabId = "";
          item.classList.remove("is-dragging");
          libraryTabs.querySelectorAll(".library-tab-item").forEach((tabItem) => {
            tabItem.classList.remove("is-drop-target");
          });
        });
        item.addEventListener("dragover", (event) => {
          if (!isExplorerTabDrag(event) || !draggedExplorerTabId || draggedExplorerTabId === tab.id) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          item.classList.add("is-drop-target");
        });
        item.addEventListener("dragleave", (event) => {
          if (event.relatedTarget && item.contains(event.relatedTarget)) return;
          item.classList.remove("is-drop-target");
        });
        item.addEventListener("drop", (event) => {
          event.preventDefault();
          event.stopPropagation();
          item.classList.remove("is-drop-target");
          const sourceTabId = isExplorerTabDrag(event)
            ? event.dataTransfer.getData(EXPLORER_TAB_DRAG_TYPE) || draggedExplorerTabId
            : "";
          if (!sourceTabId || sourceTabId === tab.id) return;
          const sourceIndex = explorerTabs.findIndex((entry) => entry.id === sourceTabId);
          const targetIndex = explorerTabs.findIndex((entry) => entry.id === tab.id);
          if (sourceIndex < 0 || targetIndex < 0) return;
          const [movedTab] = explorerTabs.splice(sourceIndex, 1);
          explorerTabs.splice(targetIndex, 0, movedTab);
          renderExplorerTabs();
        });
        const tabButton = document.createElement("button");
        tabButton.type = "button";
        tabButton.className = "library-tab";
        tabButton.setAttribute("role", "tab");
        tabButton.setAttribute("aria-selected", tab.id === activeExplorerTabId ? "true" : "false");
        tabButton.textContent = label;
        tabButton.title = label;
        tabButton.dataset.tooltip = label;
        tabButton.addEventListener("click", () => switchExplorerTab(tab.id));
        item.appendChild(tabButton);

        if (explorerTabs.length > 1) {
          const closeButton = document.createElement("button");
          closeButton.type = "button";
          closeButton.className = "library-tab-close";
          closeButton.setAttribute("aria-label", `Close ${label} tab`);
          closeButton.dataset.tooltip = "Close tab";
          closeButton.textContent = "×";
          closeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            closeExplorerTab(tab.id);
          });
          item.appendChild(closeButton);
        }
        libraryTabs.appendChild(item);
      });
    }

    function switchExplorerTab(tabId) {
      if (tabId === activeExplorerTabId) return;
      syncActiveExplorerTab();
      const tab = explorerTabs.find((entry) => entry.id === tabId);
      if (!tab) return;
      activeExplorerTabId = tabId;
      restoreExplorerTab(tab);
      renderFavoriteClips();
    }

    function createExplorerTab() {
      syncActiveExplorerTab();
      const tab = {
        id: `explorer-tab-${nextExplorerTabNumber++}`,
        sourcePath: "",
        folderId: "",
        search: "",
        selectedFavoriteStorageIndex: null,
        selectedLibraryItemKey: ""
      };
      explorerTabs.push(tab);
      activeExplorerTabId = tab.id;
      restoreExplorerTab(tab);
      renderFavoriteClips();
      requestAnimationFrame(() => scrollExplorerTabIntoView(tab.id));
    }

    function openFolderInNewExplorerTab(folderId) {
      syncActiveExplorerTab();
      const tab = {
        id: `explorer-tab-${nextExplorerTabNumber++}`,
        sourcePath: "",
        folderId,
        search: "",
        selectedFavoriteStorageIndex: null,
        selectedLibraryItemKey: ""
      };
      explorerTabs.push(tab);
      activeExplorerTabId = tab.id;
      restoreExplorerTab(tab);
      renderFavoriteClips();
      requestAnimationFrame(() => scrollExplorerTabIntoView(tab.id));
    }

    function closeExplorerTab(tabId) {
      if (explorerTabs.length === 1) return;
      const closingIndex = explorerTabs.findIndex((tab) => tab.id === tabId);
      if (closingIndex < 0) return;
      explorerTabs.splice(closingIndex, 1);
      if (tabId === activeExplorerTabId) {
        const nextTab = explorerTabs[Math.max(0, closingIndex - 1)];
        activeExplorerTabId = nextTab.id;
        restoreExplorerTab(nextTab);
        renderFavoriteClips();
      } else {
        renderExplorerTabs();
      }
    }

    newLibraryTabButton.addEventListener("click", createExplorerTab);

    function openLibraryLocation(folderId) {
      selectedFootagePath = "";
      selectedFolderId = folderId || "";
      persistQuickSaveShortcutSettings(selectedFolderId);
      selectedFavoriteStorageIndex = null;
      selectedLibraryItemKey = "";
      favoriteResultsMode = selectedFootagePath ? "clips" : "footage";
      librarySearch.value = "";
      syncSearchClearButtons();
      renderFavoriteClips();
    }

    function handleLibraryDrop(event, folderId) {
      event.preventDefault();
      if (isExplorerTabDrag(event)) return;
      const draggedEntry = event.dataTransfer.getData("text/plain");
      if (draggedEntry.indexOf("scenekeeper-order:") === 0) return;
      if (draggedEntry.indexOf("folder:") === 0) {
        moveFolderToFolder(draggedEntry.substring(7), folderId);
      } else if (draggedEntry.indexOf("clips:") === 0) {
        const storageIndices = JSON.parse(draggedEntry.substring(6));
        assignClipsToFolder(storageIndices, folderId);
      } else if (draggedEntry !== "") {
        assignClipToFolder(draggedEntry, folderId);
      }
    }

    function addBreadcrumbItem(label, isCurrent, onClick, dropFolderId) {
      if (libraryBreadcrumb.childElementCount) {
        const separator = document.createElement("span");
        separator.className = "library-breadcrumb-separator";
        separator.textContent = "/";
        libraryBreadcrumb.appendChild(separator);
      }
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.title = label;
      button.dataset.tooltip = label;
      if (isCurrent) button.setAttribute("aria-current", "page");
      button.addEventListener("click", onClick);
      if (dropFolderId !== null) {
        button.addEventListener("dragover", (event) => {
          if (isExplorerTabDrag(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          button.classList.add("is-drop-target");
        });
        button.addEventListener("dragleave", () => button.classList.remove("is-drop-target"));
        button.addEventListener("drop", (event) => {
          button.classList.remove("is-drop-target");
          if (isExplorerTabDrag(event)) {
            event.preventDefault();
            return;
          }
          handleLibraryDrop(event, dropFolderId);
        });
      }
      libraryBreadcrumb.appendChild(button);
    }

    function renderLibraryBreadcrumb() {
      libraryBreadcrumb.innerHTML = "";
      createFolderToggle.hidden = Boolean(librarySearch.value.trim());
      addBreadcrumbItem("Home", !selectedFolderId, () => openLibraryLocation(""), "");
      if (!selectedFolderId) return;

      const trail = getFolderTrail(selectedFolderId);
      trail.forEach((folder, index) => {
        addBreadcrumbItem(folder.name, index === trail.length - 1, () => {
          openLibraryLocation(folder.id);
        }, folder.id);
      });
    }

    function refreshFavoriteFolders(onLoaded) {
      favoriteFoldersLoaded = false;
      callAE("listClipFolders()", "", (response) => {
        const previousFolders = favoriteFolders;
        favoriteFolders = [];
        if (response && response !== "NO_FOLDERS") {
          response.split(/\r?\n/).filter(Boolean).forEach((line) => {
            const fields = line.split("\t");
            if (fields.length !== 3 && fields.length !== 4 && fields.length !== 5) return;
            try {
              favoriteFolders.push({
                id: decodeURIComponent(fields[0]),
                name: decodeURIComponent(fields[1]),
                sourcePath: decodeURIComponent(fields[2]),
                parentId: fields.length >= 4 ? decodeURIComponent(fields[3]) : "",
                sortOrder: fields.length === 5 && fields[4] !== "" ? Number(fields[4]) : null
              });
            } catch (error) {
              // Ignore malformed folder entries.
            }
          });
        }
        if (selectedFolderId && !favoriteFolders.some((folder) => folder.id === selectedFolderId)) {
          let previousFolder = previousFolders.find((folder) => folder.id === selectedFolderId);
          let parentId = previousFolder ? previousFolder.parentId || "" : "";
          const visitedFolderIds = new Set();
          while (parentId && !favoriteFolders.some((folder) => folder.id === parentId) && !visitedFolderIds.has(parentId)) {
            visitedFolderIds.add(parentId);
            previousFolder = previousFolders.find((folder) => folder.id === parentId);
            parentId = previousFolder ? previousFolder.parentId || "" : "";
          }
          selectedFolderId = favoriteFolders.some((folder) => folder.id === parentId) ? parentId : "";
          selectedFootagePath = "";
          selectedFavoriteStorageIndex = null;
          selectedLibraryItemKey = "";
          librarySearch.value = "";
          syncSearchClearButtons();
        }
        favoriteFoldersLoaded = true;
        renderFavoriteClips();
        if (onLoaded) onLoaded();
      });
    }

    function attachClipThumbnail(video, placeholder, record, button, intersectionRoot = favoriteList) {
      let sourceLoaded = false;
      let hoverRequested = false;
      let clipStart = 0;
      let clipEnd = 0;
      let previewResizeObserver = null;
      const updateCompositionPreview = () => {
        const thumbnail = video.parentElement;
        if (!thumbnail) return;
        if (clipPreviewFormat === "landscape") {
          video.style.width = "100%";
          video.style.height = "100%";
          video.style.left = "0";
          video.style.top = "0";
          video.style.objectFit = "contain";
          video.classList.remove("is-composition-positioned");
          video.classList.add("is-fit-preview");
          return;
        }
        video.classList.remove("is-fit-preview");
        if (!video.videoWidth || !video.videoHeight ||
            !Number.isFinite(record.compWidth) || !Number.isFinite(record.compHeight) ||
            record.compWidth <= 0 || record.compHeight <= 0) return;
        const width = thumbnail.clientWidth;
        const height = thumbnail.clientHeight;
        if (!width || !height) return;
        const compositionScale = Math.max(width / record.compWidth, height / record.compHeight);
        const layerScaleX = (Number.isFinite(record.scaleX) ? Math.abs(record.scaleX) : 100) / 100;
        const layerScaleY = (Number.isFinite(record.scaleY) ? Math.abs(record.scaleY) : 100) / 100;
        const footageWidth = video.dataset.storedPreview === "true" &&
          Number.isFinite(record.sourceWidth) && record.sourceWidth > 0
          ? record.sourceWidth
          : video.videoWidth;
        const footageHeight = video.dataset.storedPreview === "true" &&
          Number.isFinite(record.sourceHeight) && record.sourceHeight > 0
          ? record.sourceHeight
          : video.videoHeight;
        const videoWidth = footageWidth * layerScaleX * compositionScale;
        const videoHeight = footageHeight * layerScaleY * compositionScale;
        const positionX = Number.isFinite(record.positionX) ? record.positionX : record.compWidth / 2;
        const positionY = Number.isFinite(record.positionY) ? record.positionY : record.compHeight / 2;
        video.style.width = `${videoWidth}px`;
        video.style.height = `${videoHeight}px`;
        video.style.left = `${width / 2 + (positionX - record.compWidth / 2) * compositionScale - videoWidth / 2}px`;
        video.style.top = `${height / 2 + (positionY - record.compHeight / 2) * compositionScale - videoHeight / 2}px`;
        video.style.objectFit = "fill";
        video.classList.add("is-composition-positioned");
      };
      const playPreview = () => {
        if (!hoverPreviewEnabled || !hoverRequested || !video.classList.contains("is-ready")) return;
        if (video.currentTime < clipStart || video.currentTime >= clipEnd) {
          video.currentTime = clipStart;
        }
        const playback = video.play();
        if (playback && typeof playback.catch === "function") playback.catch(() => {});
      };
      const revealThumbnail = () => {
        if (!video.videoWidth || !video.videoHeight) return;
        window.clearTimeout(storedPreviewTimeout);
        video.pause();
        video.classList.add("is-ready");
        placeholder.classList.remove("is-loading");
        placeholder.hidden = true;
        playPreview();
      };
      video.addEventListener("loadedmetadata", () => {
        updateCompositionPreview();
        if (video.classList.contains("is-composition-positioned") && !previewResizeObserver && "ResizeObserver" in window) {
          previewResizeObserver = new ResizeObserver(() => {
            if (!video.isConnected) {
              previewResizeObserver.disconnect();
              return;
            }
            updateCompositionPreview();
          });
          previewResizeObserver.observe(video.parentElement);
        }
        const lastFrame = Math.max(0, video.duration - 0.05);
        if (video.dataset.storedPreview === "true") {
          clipStart = 0;
          clipEnd = video.duration;
        } else {
          clipStart = Math.min(Math.max(0, Number(record.sourceIn) || 0), lastFrame);
          clipEnd = Math.min(Math.max(clipStart, Number(record.sourceOut) || video.duration), video.duration);
        }
        if (clipStart > 0.05) {
          video.currentTime = clipStart;
        }
      });
      video.addEventListener("loadeddata", revealThumbnail);
      video.addEventListener("seeked", revealThumbnail);
      video.addEventListener("timeupdate", () => {
        if (hoverRequested && hoverPreviewEnabled && clipEnd > clipStart && video.currentTime >= clipEnd - 0.04) {
          video.currentTime = clipStart;
        }
      });
      let storedPreviewRequested = false;
      let storedPreviewTimeout = null;
      const showStoredPreviewError = () => {
        if (!video.isConnected) return;
        const mediaError = video.error;
        video.pause();
        video.classList.remove("is-ready");
        placeholder.hidden = false;
        placeholder.classList.remove("is-loading");
        placeholder.textContent = mediaError
          ? `Saved preview unavailable (media error ${mediaError.code})`
          : "Saved preview unavailable";
      };
      const useStoredPreview = () => {
        if (storedPreviewRequested || video.dataset.storedPreview === "true") return;
        if (record.sourceMissing && !getCachedStoredPreviewPath(record)) {
          placeholder.classList.remove("is-loading");
          placeholder.textContent = "Original footage is offline";
          return;
        }
        if (!storedPreviewRequested) {
          storedPreviewRequested = true;
          window.clearTimeout(storedPreviewTimeout);
          video.pause();
          video.classList.remove("is-ready");
          placeholder.hidden = false;
          placeholder.classList.add("is-loading");
          placeholder.textContent = "Creating small saved preview...";
          video.removeEventListener("error", handleOriginalVideoError);
          requestStoredPreview(record, (previewPath, errorMessage) => {
            if (!video.isConnected) return;
            if (!previewPath) {
              placeholder.classList.remove("is-loading");
              placeholder.textContent = errorMessage || "Preview unavailable";
              placeholder.title = errorMessage || "Could not create a saved preview.";
              return;
            }
            if (video.dataset.storedPreview !== "true" &&
                video.readyState >= 2 &&
                video.videoWidth > 0 &&
                video.videoHeight > 0) {
              return;
            }
            video.dataset.storedPreview = "true";
            video.addEventListener("error", showStoredPreviewError, { once: true });
            video.src = localFileUrl(previewPath);
            video.load();
          });
        }
      };
      const handleOriginalVideoError = () => {
        placeholder.classList.remove("is-loading");
        useStoredPreview();
      };
      video.addEventListener("error", handleOriginalVideoError);
      const loadSource = () => {
        if (sourceLoaded) return;
        sourceLoaded = true;
        if (getCachedStoredPreviewPath(record)) {
          useStoredPreview();
          return;
        }
        video.src = localFileUrl(record.sourcePath);
        video.load();
        storedPreviewTimeout = window.setTimeout(useStoredPreview, 4000);
      };
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          loadSource();
        }, { root: intersectionRoot, rootMargin: "100px" });
        observer.observe(video);
      } else {
        loadSource();
      }
      return {
        update: updateCompositionPreview,
        enter: () => {
          hoverRequested = true;
          playPreview();
        },
        leave: () => {
          hoverRequested = false;
          video.pause();
          if (video.readyState >= 2 && Math.abs(video.currentTime - clipStart) > 0.05) {
            video.currentTime = clipStart;
          }
        }
      };
    }

    window.addEventListener("blur", () => {
      favoriteList.querySelectorAll(".favorite-result video").forEach((video) => video.pause());
      persistQuickSaveShortcutSettings();
    });

    function renderFavoriteClips() {
      const query = librarySearch.value.trim().toLocaleLowerCase();
      syncSearchClearButtons();
      hideFavoritePreview();
      favoriteList.classList.add("favorite-clip-grid");
      favoriteList.classList.toggle("footage-sorted", clipSortMode === "footage");
      let resultItemContainer = favoriteList;
      renderExplorerTabs();
      renderLibraryBreadcrumb();
      favoriteList.innerHTML = "";
      function showEmptyResults(message) {
        const empty = document.createElement("p");
        empty.className = "favorite-results-empty";
        empty.textContent = message;
        favoriteList.appendChild(empty);
      }

      function setSelectedResult(key) {
        selectedLibraryItemKey = key;
        syncSelectionVisualState();
      }

      function createClipDragImage(name) {
        const label = String(name || "Clip").slice(0, 20)
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="176" height="48" viewBox="0 0 176 48"><rect x="1" y="1" width="174" height="46" rx="6" fill="#262a2d" stroke="#62b6e9" stroke-width="2"/><rect x="8" y="8" width="32" height="32" rx="4" fill="#3c515d"/><path d="M18 15h12v18H18zM15 18h3m12 0h3M15 30h3m12 0h3" fill="none" stroke="#d5e6ee" stroke-width="2" stroke-linecap="round"/><text x="48" y="23" fill="#f3f4f5" font-family="Arial,sans-serif" font-size="12" font-weight="700">${label}</text><text x="48" y="38" fill="#aab7bf" font-family="Arial,sans-serif" font-size="10">Insert at playhead</text></svg>`;
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        return image;
      }

      function startLibraryItemDragPreview(button, event) {
        if (activeClipDragGhost && activeClipDragGhost.parentNode) {
          activeClipDragGhost.parentNode.removeChild(activeClipDragGhost);
        }
        activeClipDragGhost = document.createElement("div");
        activeClipDragGhost.className = "favorite-clip-grid scene-keeper-live-drag-ghost";
        const ghostCard = button.cloneNode(true);
        ghostCard.classList.remove("is-dragging");
        ghostCard.removeAttribute("title");
        ghostCard.draggable = false;
        ghostCard.setAttribute("aria-hidden", "true");
        activeClipDragGhost.appendChild(ghostCard);
        document.body.appendChild(activeClipDragGhost);
        moveActiveClipDragGhost(event);
        return ghostCard;
      }

      function stopLibraryItemDragPreview() {
        if (activeClipDragGhost && activeClipDragGhost.parentNode) {
          activeClipDragGhost.parentNode.removeChild(activeClipDragGhost);
        }
        activeClipDragGhost = null;
      }

      function showResultContextMenu(event, entry) {
        event.preventDefault();
        event.stopPropagation();
        selectedLibraryKeys.add(entry.key);
        setSelectedResult(entry.key);
        const actions = [
          { label: "Copy", run: () => copySelectedEntries(getSelectedLibraryEntries()) }
        ];
        if (entry.type === "clip") {
          selectedFavoriteStorageIndex = entry.clip.storageIndex;
          selectedFootagePath = entry.clip.sourcePath;
          actions.push(
            { label: "Edit Clip", run: () => openClipEditDialog(entry.clip) },
            { label: "Add to selected precomp", run: () => {
              callAE(`insertClipFavoriteIntoSelectedPrecomp(${entry.clip.storageIndex})`, "", (response) => {
                if (response && String(response).indexOf("ERROR:") === 0) {
                  setResult(String(response).substring(6), "error");
                  return;
                }
                incrementClipInsertCount(entry.clip);
                setResult(response || `Added “${entry.name}” to the selected precomp.`, "success");
              });
            } },
            { label: "Relink Footage", run: () => relinkFootageByPath(entry.clip.sourcePath) },
            { label: "Reveal Footage", run: () => callAE(`revealClipFavoriteFootage(${entry.clip.storageIndex})`, "") },
            { label: "Delete", danger: true, run: (deleteEvent) => {
              pendingDeleteIndex = entry.clip.storageIndex;
              if (deleteEvent.shiftKey) {
                confirmDeleteButton.click();
                return;
              }
              deleteConfirmationText.textContent = `Delete clip "${entry.name}"?`;
              showDeleteConfirmation();
            } }
          );
          updateFavoriteSelection();
        } else if (entry.type === "folder") {
          actions.push(
            { label: "Open in New Window", run: () => openFolderInNewExplorerTab(entry.folder.id) },
            { label: "Rename", run: () => openRenameDialog({ type: "folder", id: entry.folder.id, name: entry.folder.name }) },
            { label: "Delete", danger: true, run: (deleteEvent) => {
              pendingDeleteFolderId = entry.folder.id;
              if (deleteEvent.shiftKey) {
                confirmDeleteButton.click();
                return;
              }
              deleteConfirmationText.textContent = `Delete folder "${entry.folder.name}", all its subfolders, and all clips inside?`;
              showDeleteConfirmation();
            } }
          );
        }
        updateLibrarySelectionVisuals();
        openLibraryContextMenu(event, actions);
      }

      function deleteEntryImmediately(entry) {
        pendingDeleteIndex = entry.type === "clip" ? entry.clip.storageIndex : null;
        pendingDeleteFolderId = entry.type === "folder" ? entry.folder.id : null;
        pendingDeleteFootagePath = null;
        confirmDeleteButton.click();
      }

      function createResultButton(entry) {
        const item = document.createElement("div");
        item.className = "favorite-result-item";
        item.setAttribute("role", "listitem");
        if (entry.type === "folder") item.dataset.folderId = entry.folder.id;

        item.dataset.resultKey = entry.key;
        const isFavorite = isLibraryFavorite(entry);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "favorite-result";
        button.setAttribute("aria-pressed", String(selectedLibraryKeys.has(entry.key) || selectedLibraryItemKey === entry.key));
        button.dataset.resultKey = entry.key;
        if (entry.type === "clip") {
          button.draggable = true;
          button.dataset.storageIndex = entry.clip.storageIndex;
          button.title = "Drag outside SceneKeeper to insert this saved clip at the After Effects playhead";
          const clipDragImage = createClipDragImage(entry.name);
          button.addEventListener("dragstart", (event) => {
            draggedClipOrderId = "";
            startLibraryItemDragPreview(button, event);
            const selectedClipIndices = getSelectedLibraryEntries()
              .filter((selectedEntry) => selectedEntry.type === "clip")
              .map((selectedEntry) => selectedEntry.clip.storageIndex);
            const dragIndices = selectedLibraryKeys.has(entry.key) && selectedClipIndices.length > 1
              ? selectedClipIndices
              : [entry.clip.storageIndex];
            const dragData = dragIndices.length > 1 ? `clips:${JSON.stringify(dragIndices)}` : String(dragIndices[0]);
            event.dataTransfer.setData("text/plain", dragData);
            event.dataTransfer.effectAllowed = "copyMove";
            if (typeof event.dataTransfer.setDragImage === "function") {
              if (clipDragImage.complete && clipDragImage.naturalWidth > 0) {
                event.dataTransfer.setDragImage(clipDragImage, 8, 12);
              } else {
                const bounds = button.getBoundingClientRect();
                event.dataTransfer.setDragImage(button,
                  Math.max(0, Math.min(bounds.width, event.clientX - bounds.left)),
                  Math.max(0, Math.min(bounds.height, event.clientY - bounds.top)));
              }
            }
            button.classList.add("is-dragging");
          });
          button.addEventListener("dragend", (event) => {
            button.classList.remove("is-dragging");
            stopLibraryItemDragPreview();
            const pointerOutsidePanel = event.clientX < 0 || event.clientY < 0 ||
              event.clientX > document.documentElement.clientWidth ||
              event.clientY > document.documentElement.clientHeight;
            if (pointerOutsidePanel && event.dataTransfer && event.dataTransfer.dropEffect !== "move") {
              insertFavoriteRecord(entry.clip, (response) => {
                setResult(response || `Inserted “${entry.name}” at the playhead.`, "success");
              });
            }
            draggedClipOrderId = "";
          });
        } else if (entry.type === "folder") {
          button.draggable = true;
          button.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", `folder:${entry.folder.id}`);
            event.dataTransfer.effectAllowed = "move";
            const ghostCard = startLibraryItemDragPreview(button, event);
            if (typeof event.dataTransfer.setDragImage === "function") {
              const bounds = button.getBoundingClientRect();
              event.dataTransfer.setDragImage(ghostCard,
                Math.max(0, Math.min(92, (event.clientX - bounds.left) * 92 / Math.max(1, bounds.width))),
                Math.max(0, Math.min(92, (event.clientY - bounds.top) * 92 / Math.max(1, bounds.height))));
            }
            button.classList.add("is-dragging");
          });
          button.addEventListener("dragend", () => {
            button.classList.remove("is-dragging");
            stopLibraryItemDragPreview();
          });
        }

        if (entry.type === "clip") {
          item.classList.add("has-clip-preview");
          const cacheKey = `${entry.clip.clipId || entry.clip.storageIndex}|${entry.clip.sourcePath}|${entry.clip.sourceIn}|${entry.clip.sourceOut}|${entry.clip.sourceMissing ? "offline" : "online"}`;
          let cachedThumbnail = entry.clip.sourceMissing ? null : clipThumbnailCache.get(cacheKey);
          let thumbnail;
          let thumbnailControls;
          if (cachedThumbnail) {
            thumbnail = cachedThumbnail.thumbnail;
            thumbnailControls = cachedThumbnail.controls;
            Object.assign(cachedThumbnail.record, entry.clip);
            thumbnailControls.update();
            clipThumbnailCache.delete(cacheKey);
            clipThumbnailCache.set(cacheKey, cachedThumbnail);
          } else {
            thumbnail = document.createElement("span");
            thumbnail.className = "favorite-clip-thumbnail";
          }
          if (entry.clip.sourceMissing) {
            thumbnail.classList.add("is-offline");
            const bars = document.createElement("span");
            bars.className = "favorite-offline-preview";
            const offlineLabel = document.createElement("span");
            offlineLabel.className = "favorite-offline-label";
            offlineLabel.textContent = "MEDIA OFFLINE";
            thumbnail.appendChild(bars);
            thumbnail.appendChild(offlineLabel);
          } else if (!cachedThumbnail) {
            const placeholder = document.createElement("span");
            placeholder.className = "clip-preview-loading-state is-loading";
            placeholder.textContent = "Loading preview...";
            const video = document.createElement("video");
            video.muted = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.setAttribute("aria-hidden", "true");
            thumbnail.appendChild(placeholder);
            thumbnail.appendChild(video);
            thumbnailControls = attachClipThumbnail(video, placeholder, entry.clip, button);
            cachedThumbnail = { thumbnail, controls: thumbnailControls, record: entry.clip };
            clipThumbnailCache.set(cacheKey, cachedThumbnail);
            while (clipThumbnailCache.size > 80) {
              const oldestKey = clipThumbnailCache.keys().next().value;
              const oldestThumbnail = clipThumbnailCache.get(oldestKey);
              clipThumbnailCache.delete(oldestKey);
              if (oldestThumbnail && oldestThumbnail.thumbnail && !oldestThumbnail.thumbnail.isConnected) {
                const oldVideo = oldestThumbnail.thumbnail.querySelector("video");
                if (oldVideo) {
                  oldVideo.pause();
                  oldVideo.removeAttribute("src");
                  oldVideo.load();
                }
              }
            }
          }
          button.appendChild(thumbnail);
          if (thumbnailControls) {
            button.addEventListener("pointerenter", thumbnailControls.enter);
            button.addEventListener("pointerleave", thumbnailControls.leave);
          }
        } else if (entry.type === "folder") {
          const preview = document.createElement("span");
          preview.className = "folder-preview";
          const glyph = document.createElement("span");
          glyph.className = "folder-glyph";
          preview.appendChild(glyph);
          button.appendChild(preview);
          button.addEventListener("dragover", (event) => {
            if (isExplorerTabDrag(event)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            item.classList.add("is-drop-target");
          });
          button.addEventListener("dragleave", (event) => {
            if (event.relatedTarget && button.contains(event.relatedTarget)) return;
            item.classList.remove("is-drop-target");
          });
          button.addEventListener("drop", (event) => {
            item.classList.remove("is-drop-target");
            if (isExplorerTabDrag(event)) {
              event.preventDefault();
              return;
            }
            handleLibraryDrop(event, entry.folder.id);
          });
        }

        const name = document.createElement("span");
        name.className = "favorite-result-name";
        name.textContent = entry.name;
        button.appendChild(name);
        if (entry.type === "clip") {
          const folderLabel = document.createElement("span");
          folderLabel.className = "favorite-result-folder";
          folderLabel.textContent = entry.folderName || "Home";
          button.appendChild(folderLabel);
        }
        const details = document.createElement("span");
        details.className = "favorite-result-details";
        details.textContent = entry.details;
        button.appendChild(details);
        if (entry.type === "clip") {
          const insertCount = getClipTrackingData(entry.clip).insertCount;
          const insertCountLabel = document.createElement("span");
          insertCountLabel.className = "favorite-result-insert-count";
          insertCountLabel.textContent = `${insertCount} inserts`;
          insertCountLabel.title = `Inserted ${insertCount} ${insertCount === 1 ? "time" : "times"}`;
          button.appendChild(insertCountLabel);
        }
        button.addEventListener("click", (event) => {
          hideDeleteConfirmation();
          const isMultiSelect = event.ctrlKey || event.metaKey || event.shiftKey;
          if (isMultiSelect) {
            if (selectedLibraryKeys.has(entry.key)) {
              selectedLibraryKeys.delete(entry.key);
            } else {
              selectedLibraryKeys.add(entry.key);
            }
          } else {
            selectedLibraryKeys.clear();
            selectedLibraryKeys.add(entry.key);
          }
          setSelectedResult(entry.key);
          if (entry.type === "clip") {
            selectedFavoriteStorageIndex = entry.clip.storageIndex;
            selectedFootagePath = entry.clip.sourcePath;
            selectedFolderId = entry.clip.folderId || "";
            favoriteResultsMode = "clips";
            updateFavoriteSelection();
          }
          updateLibrarySelectionVisuals();
          if (pendingManualReplaceSlots && entry.type === "clip") {
            const slots = pendingManualReplaceSlots;
            const clipId = entry.clip.clipId;
            pendingManualReplaceSlots = null;
            replaceSelectedClipSlots(slots, clipId, true);
            return;
          }
          if (entry.onClick) entry.onClick();
        });
        button.addEventListener("contextmenu", (event) => showResultContextMenu(event, entry));
        if (entry.onDoubleClick) button.addEventListener("dblclick", entry.onDoubleClick);
        item.appendChild(button);

        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "library-favorite-toggle";
        favoriteButton.setAttribute("aria-label", `${isFavorite ? "Remove" : "Add"} ${entry.type} "${entry.name}" ${isFavorite ? "from" : "to"} favorites`);
        favoriteButton.setAttribute("aria-pressed", String(isFavorite));
        favoriteButton.dataset.tooltip = isFavorite ? "Remove from favorites" : "Add to favorites";
        favoriteButton.textContent = isFavorite ? "★" : "☆";
        favoriteButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleLibraryFavorite(entry);
        });
        item.appendChild(favoriteButton);

        const moreButton = document.createElement("button");
        moreButton.type = "button";
        moreButton.className = "clip-more-button";
        moreButton.dataset.entryType = entry.type;
        moreButton.dataset.entryName = entry.name;
        moreButton.setAttribute("aria-label", `Actions for ${entry.name}`);
        moreButton.title = "More actions";
        const dots = document.createElement("span");
        dots.className = "clip-more-dots";
        for (let index = 0; index < 3; index++) dots.appendChild(document.createElement("span"));
        moreButton.appendChild(dots);
        const trash = document.createElement("span");
        trash.className = "clip-more-trash";
        trash.setAttribute("aria-hidden", "true");
        const trashIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        trashIcon.setAttribute("viewBox", "0 0 16 16");
        trashIcon.setAttribute("focusable", "false");
        const trashShape = document.createElementNS("http://www.w3.org/2000/svg", "path");
        trashShape.setAttribute("d", "M3 4h10M6 4V2.5h4V4m2 0-.7 10H4.7L4 4m2.5 2v5m3-5v5");
        trashShape.setAttribute("fill", "none");
        trashShape.setAttribute("stroke", "currentColor");
        trashShape.setAttribute("stroke-linecap", "round");
        trashShape.setAttribute("stroke-linejoin", "round");
        trashShape.setAttribute("stroke-width", "1.5");
        trashIcon.appendChild(trashShape);
        trash.appendChild(trashIcon);
        moreButton.appendChild(trash);
        moreButton.addEventListener("click", (event) => {
          if (event.shiftKey || moreButton.classList.contains("delete-mode")) {
            event.preventDefault();
            event.stopPropagation();
            deleteEntryImmediately(entry);
            return;
          }
          showResultContextMenu(event, entry);
        });
        moreButton.addEventListener("contextmenu", (event) => showResultContextMenu(event, entry));
        item.appendChild(moreButton);
        resultItemContainer.appendChild(item);
        if (shiftDeleteMode) {
          moreButton.classList.add("delete-mode");
          moreButton.setAttribute("aria-label", `Delete ${entry.type} "${entry.name}"`);
          moreButton.title = `Delete ${entry.type} "${entry.name}"`;
        }
      }

      function addFolderEntry(folder) {
        const childFolderCount = favoriteFolders.filter((entry) => entry.parentId === folder.id).length;
        const clipCount = favoriteRecords.filter((record) => record.folderId === folder.id).length;
        const total = childFolderCount + clipCount;
        createResultButton({
          type: "folder",
          key: `folder:${folder.id}`,
          name: folder.name,
          details: `${total} item${total === 1 ? "" : "s"}`,
          folder,
          onDoubleClick: () => openLibraryLocation(folder.id)
        });
      }

      function addClipEntry(record) {
        const folder = favoriteFolders.find((entry) => entry.id === record.folderId);
        const displayName = getClipDisplayName(record);
        const details = `${formatTimestamp(record.sourceIn)}–${formatTimestamp(record.sourceOut)}`;
        createResultButton({
          type: "clip",
          key: `clip:${record.storageIndex}`,
          name: displayName,
          details,
          folderName: folder ? folder.name : "Home",
          clip: record,
          onDoubleClick: () => {
            const isGuidedTutorialInsert = guidedTourActive && guidedTourStep === "insert" &&
              record.storageIndex === guidedTourSampleStorageIndex;
            insertFavoriteRecord(record, (response) => {
              setResult(response || "Clip inserted.", "success");
              if (isGuidedTutorialInsert && guidedTourActive && guidedTourStep === "insert") {
                setGuidedTourStep("search");
              }
            });
          }
        });
      }

      function addFootageGroupHeading(clip) {
        const group = document.createElement("div");
        group.className = "favorite-footage-group";
        const heading = document.createElement("div");
        heading.className = "favorite-footage-group-heading";
        heading.setAttribute("role", "presentation");
        heading.textContent = getClipFootageName(clip);
        heading.title = String(clip.sourcePath || clip.sourceName || "");
        const items = document.createElement("div");
        items.className = "favorite-footage-group-items";
        group.appendChild(heading);
        group.appendChild(items);
        favoriteList.appendChild(group);
        resultItemContainer = items;
      }

      function addSortedClipEntries(clips) {
        let previousGroupKey = null;
        clips.forEach((clip) => {
          if (clipSortMode === "footage") {
            const groupKey = getClipFootageGroupKey(clip);
            if (groupKey !== previousGroupKey) addFootageGroupHeading(clip);
            previousGroupKey = groupKey;
          }
          addClipEntry(clip);
        });
      }

      function addCollectionEntries(folderId) {
        const entries = getLibraryCollectionEntries(folderId);
        if (clipSortMode === "footage") {
          const folders = entries.filter((entry) => entry.type === "folder");
          if (folders.length) {
            const folderGrid = document.createElement("div");
            folderGrid.className = "favorite-footage-folder-grid";
            favoriteList.appendChild(folderGrid);
            resultItemContainer = folderGrid;
            folders.forEach((entry) => addFolderEntry(entry.folder));
          }
          const clips = entries.filter((entry) => entry.type === "clip").map((entry) => entry.clip);
          addSortedClipEntries(clips);
          resultItemContainer = favoriteList;
          return;
        }
        let previousGroupKey = null;
        entries.forEach((entry) => {
          if (entry.type === "folder") addFolderEntry(entry.folder);
          else {
            if (clipSortMode === "footage") {
              const groupKey = getClipFootageGroupKey(entry.clip);
              if (groupKey !== previousGroupKey) addFootageGroupHeading(entry.clip);
              previousGroupKey = groupKey;
            }
            addClipEntry(entry.clip);
          }
        });
      }

      function sortClips(clips) {
        return sortClipRecords(clips);
      }

      if (query) {
        const matchingFolders = sortFolderRecords(favoriteFolders.filter((folder) => folder.name.toLocaleLowerCase().includes(query)));
        if (clipSortMode === "footage" && matchingFolders.length) {
          const folderGrid = document.createElement("div");
          folderGrid.className = "favorite-footage-folder-grid";
          favoriteList.appendChild(folderGrid);
          resultItemContainer = folderGrid;
          matchingFolders.forEach(addFolderEntry);
          resultItemContainer = favoriteList;
        } else {
          matchingFolders.forEach(addFolderEntry);
        }
        addSortedClipEntries(sortClips(favoriteRecords.filter((record) => {
          const searchableText = [
            record.displayName,
            record.sourceName,
            ...getFolderTrail(record.folderId).map((folder) => folder.name)
          ];
          return searchableText.some((value) => String(value || "").toLocaleLowerCase().includes(query));
        })));
        if (!favoriteList.childElementCount) showEmptyResults(`No results for "${librarySearch.value.trim()}".`);
        updateFavoriteSelection();
        return;
      }

      if (!selectedFolderId) {
        addCollectionEntries("");
        if (!favoriteList.childElementCount) showEmptyResults("No collections or clips yet. Create a folder to get started.");
      } else {
        addCollectionEntries(selectedFolderId);
        if (!favoriteList.childElementCount) {
          showEmptyResults("This collection is empty. Create a folder or save a clip here.");
        }
      }
      updateFavoriteSelection();
    }

    function scrollSelectedFavoriteIntoView() {
      if (selectedFavoriteStorageIndex === null || selectedFavoriteStorageIndex === undefined) return;
      const selectedButton = favoriteList.querySelector(`[data-storage-index="${selectedFavoriteStorageIndex}"]`);
      if (!selectedButton) return;
      const listBounds = favoriteList.getBoundingClientRect();
      const buttonBounds = selectedButton.getBoundingClientRect();
      if (buttonBounds.top < listBounds.top) {
        favoriteList.scrollTop -= listBounds.top - buttonBounds.top;
      } else if (buttonBounds.bottom > listBounds.bottom) {
        favoriteList.scrollTop += buttonBounds.bottom - listBounds.bottom;
      }
    }

    function scrollLibraryItemIntoView(resultKey) {
      const item = Array.from(favoriteList.querySelectorAll(".favorite-result-item"))
        .find((entry) => entry.dataset.resultKey === resultKey);
      if (!item) return;
      const listBounds = favoriteList.getBoundingClientRect();
      const itemBounds = item.getBoundingClientRect();
      if (itemBounds.top < listBounds.top) {
        favoriteList.scrollTop -= listBounds.top - itemBounds.top;
      } else if (itemBounds.bottom > listBounds.bottom) {
        favoriteList.scrollTop += itemBounds.bottom - listBounds.bottom;
      }
    }

    function scrollSaveClipFolderIntoView(folderId) {
      const item = Array.from(saveClipFolderList.querySelectorAll(".save-clip-folder-item"))
        .find((entry) => entry.dataset.folderId === folderId);
      if (!item) return;
      const listBounds = saveClipFolderList.getBoundingClientRect();
      const itemBounds = item.getBoundingClientRect();
      if (itemBounds.top < listBounds.top) {
        saveClipFolderList.scrollTop -= listBounds.top - itemBounds.top;
      } else if (itemBounds.bottom > listBounds.bottom) {
        saveClipFolderList.scrollTop += itemBounds.bottom - listBounds.bottom;
      }
    }

    function updateFavoriteSelection() {
      const record = getSelectedFavorite();
      insertFavoriteButton.disabled = !record;
    }

    function hideDeleteConfirmation() {
      pendingDeleteIndex = null;
      pendingDeleteFootagePath = null;
      pendingDeleteFolderId = null;
      deleteConfirmation.hidden = true;
    }

    function showDeleteConfirmation() {
      deleteConfirmation.hidden = false;
      cancelDeleteButton.focus();
    }

    function closeClipTrash() {
      clipTrashModal.hidden = true;
      clipTrashToggle.focus();
    }

    function closeClipReorderDialog() {
      if (clipReorderRequestActive || folderReorderRequestActive) return;
      clipReorderModal.hidden = true;
      clipReorderTitle.textContent = "Reorder Clips & Folders";
      pendingClipReorderIds = null;
      originalClipReorderIds = null;
      clipReorderFolderId = "";
      pendingFolderReorderIds = null;
      originalFolderReorderIds = null;
      folderReorderParentId = "";
      pendingCollectionOrderIds = null;
      originalCollectionOrderIds = null;
      collectionReorderParentId = "";
      librarySearch.focus();
    }

    function renderClipReorderList() {
      clipReorderTitle.textContent = "Reorder Clips";
      const folderId = pendingClipReorderIds ? clipReorderFolderId : selectedFolderId;
      const collectionClips = favoriteRecords.filter((record) => (record.folderId || "") === folderId);
      const clipsById = new Map(collectionClips.map((clip) => [clip.clipId, clip]));
      const clips = pendingClipReorderIds
        ? pendingClipReorderIds.map((clipId) => clipsById.get(clipId)).filter(Boolean)
        : sortClipRecords(collectionClips, "manual");
      const trail = getFolderTrail(folderId);
      clipReorderLocation.textContent = `Collection: ${["Home"].concat(trail.map((folder) => folder.name)).join(" / ")}`;
      clipReorderList.innerHTML = "";
      clipReorderCancelButton.disabled = clipReorderRequestActive;
      clipReorderDoneButton.disabled = clipReorderRequestActive;

      if (!clips.length) {
        const empty = document.createElement("p");
        empty.className = "favorite-results-empty";
        empty.textContent = "No clips in this collection.";
        clipReorderList.appendChild(empty);
        return;
      }

      clips.forEach((clip, index) => {
        const row = document.createElement("div");
        row.className = "clip-reorder-item";
        row.setAttribute("role", "listitem");
        row.draggable = !clipReorderRequestActive;
        row.dataset.clipId = clip.clipId;

        const handle = document.createElement("span");
        handle.className = "clip-reorder-handle";
        handle.setAttribute("aria-hidden", "true");
        handle.textContent = "⠿";

        const position = document.createElement("span");
        position.className = "clip-reorder-position";
        position.textContent = String(index + 1);

        const thumbnail = document.createElement("span");
        thumbnail.className = "favorite-clip-thumbnail clip-reorder-thumbnail";
        if (clip.sourceMissing) {
          thumbnail.classList.add("is-offline");
          const bars = document.createElement("span");
          bars.className = "favorite-offline-preview";
          const offlineLabel = document.createElement("span");
          offlineLabel.className = "favorite-offline-label";
          offlineLabel.textContent = "MEDIA OFFLINE";
          thumbnail.append(bars, offlineLabel);
        } else {
          const placeholder = document.createElement("span");
          placeholder.className = "clip-preview-loading-state is-loading";
          placeholder.textContent = "Loading preview...";
          const video = document.createElement("video");
          video.muted = true;
          video.playsInline = true;
          video.preload = "metadata";
          video.setAttribute("aria-hidden", "true");
          thumbnail.append(placeholder, video);
          attachClipThumbnail(video, placeholder, clip, row, clipReorderList);
        }

        const copy = document.createElement("span");
        copy.className = "clip-reorder-copy";
        const name = document.createElement("span");
        name.className = "clip-reorder-name";
        name.textContent = getClipDisplayName(clip);
        const details = document.createElement("span");
        details.className = "clip-reorder-details";
        details.textContent = `${formatTimestamp(clip.sourceIn)}–${formatTimestamp(clip.sourceOut)}`;
        copy.append(name, details);
        row.append(handle, position, thumbnail, copy);

        row.addEventListener("dragstart", (event) => {
          if (clipReorderRequestActive) {
            event.preventDefault();
            return;
          }
          draggedClipOrderId = clip.clipId;
          event.dataTransfer.setData("text/plain", `scenekeeper-order:${clip.clipId}`);
          event.dataTransfer.effectAllowed = "move";
          row.classList.add("is-dragging");
        });
        row.addEventListener("dragover", (event) => {
          const source = favoriteRecords.find((record) => record.clipId === draggedClipOrderId);
          if (clipReorderRequestActive || !source || source.clipId === clip.clipId ||
              isLibraryFavorite({ type: "clip", clip: source }) !== isLibraryFavorite({ type: "clip", clip })) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const bounds = row.getBoundingClientRect();
          const insertAfter = event.clientY >= bounds.top + bounds.height / 2;
          row.classList.toggle("is-order-drop-before", !insertAfter);
          row.classList.toggle("is-order-drop-after", insertAfter);
        });
        row.addEventListener("dragleave", (event) => {
          if (event.relatedTarget && row.contains(event.relatedTarget)) return;
          row.classList.remove("is-order-drop-before", "is-order-drop-after");
        });
        row.addEventListener("drop", (event) => {
          if (!draggedClipOrderId) return;
          event.preventDefault();
          event.stopPropagation();
          const insertAfter = row.classList.contains("is-order-drop-after");
          clipReorderList.querySelectorAll(".is-order-drop-before, .is-order-drop-after")
            .forEach((target) => target.classList.remove("is-order-drop-before", "is-order-drop-after"));
          reorderLibraryClips(draggedClipOrderId, clip, insertAfter);
          draggedClipOrderId = "";
        });
        row.addEventListener("dragend", () => {
          draggedClipOrderId = "";
          row.classList.remove("is-dragging");
          clipReorderList.querySelectorAll(".is-order-drop-before, .is-order-drop-after")
            .forEach((target) => target.classList.remove("is-order-drop-before", "is-order-drop-after"));
        });
        clipReorderList.appendChild(row);
      });
    }

    function showClipReorderDialog() {
      pendingFolderReorderIds = null;
      originalFolderReorderIds = null;
      folderReorderParentId = "";
      clipReorderFolderId = selectedFolderId;
      originalClipReorderIds = sortClipRecords(
        favoriteRecords.filter((record) => (record.folderId || "") === clipReorderFolderId)
      ).map((clip) => clip.clipId);
      pendingClipReorderIds = originalClipReorderIds.slice();
      renderClipReorderList();
      clipReorderModal.hidden = false;
      focusFullscreenCloseButton();
    }

    function openClipReorderDialog() {
      requestManualSortForReordering(showClipReorderDialog);
    }

    function reorderLibraryFolders(sourceFolderId, targetFolder, insertAfter) {
      if (folderReorderRequestActive || !pendingFolderReorderIds) return;
      const sourceFolder = favoriteFolders.find((folder) => folder.id === sourceFolderId);
      if (!sourceFolder || !targetFolder || sourceFolder.id === targetFolder.id ||
          (sourceFolder.parentId || "") !== folderReorderParentId ||
          (targetFolder.parentId || "") !== folderReorderParentId) return;
      const sourceFavorite = libraryFavoriteKeys.has(`folder:${sourceFolder.id}`);
      const targetFavorite = libraryFavoriteKeys.has(`folder:${targetFolder.id}`);
      if (sourceFavorite !== targetFavorite) return;

      const sourceIndex = pendingFolderReorderIds.indexOf(sourceFolderId);
      const targetIndex = pendingFolderReorderIds.indexOf(targetFolder.id);
      if (sourceIndex < 0 || targetIndex < 0) return;
      const [movedFolderId] = pendingFolderReorderIds.splice(sourceIndex, 1);
      const adjustedTargetIndex = pendingFolderReorderIds.indexOf(targetFolder.id);
      pendingFolderReorderIds.splice(adjustedTargetIndex + (insertAfter ? 1 : 0), 0, movedFolderId);

      const rowsByFolderId = new Map(
        Array.from(clipReorderList.querySelectorAll(".folder-reorder-item"))
          .map((row) => [row.dataset.folderId, row])
      );
      pendingFolderReorderIds.forEach((folderId, index) => {
        const row = rowsByFolderId.get(folderId);
        if (!row) return;
        clipReorderList.appendChild(row);
        row.querySelector(".clip-reorder-position").textContent = String(index + 1);
      });
    }

    function renderFolderReorderList() {
      clipReorderTitle.textContent = "Reorder Folders";
      const trail = getFolderTrail(folderReorderParentId);
      clipReorderLocation.textContent = `Folders in: ${["Home"].concat(trail.map((folder) => folder.name)).join(" / ")}`;
      clipReorderList.innerHTML = "";
      clipReorderCancelButton.disabled = folderReorderRequestActive;
      clipReorderDoneButton.disabled = folderReorderRequestActive;
      const foldersById = new Map(favoriteFolders.map((folder) => [folder.id, folder]));
      const folders = (pendingFolderReorderIds || [])
        .map((folderId) => foldersById.get(folderId))
        .filter(Boolean);

      folders.forEach((folder, index) => {
        const row = document.createElement("div");
        row.className = "clip-reorder-item folder-reorder-item";
        row.setAttribute("role", "listitem");
        row.draggable = !folderReorderRequestActive;
        row.dataset.folderId = folder.id;

        const handle = document.createElement("span");
        handle.className = "clip-reorder-handle";
        handle.setAttribute("aria-hidden", "true");
        handle.textContent = "⠿";
        const position = document.createElement("span");
        position.className = "clip-reorder-position";
        position.textContent = String(index + 1);
        const copy = document.createElement("span");
        copy.className = "clip-reorder-copy";
        const name = document.createElement("span");
        name.className = "clip-reorder-name";
        name.textContent = folder.name;
        const childCount = favoriteFolders.filter((entry) => entry.parentId === folder.id).length;
        const clipCount = favoriteRecords.filter((record) => record.folderId === folder.id).length;
        const details = document.createElement("span");
        details.className = "clip-reorder-details";
        details.textContent = `${childCount} subfolder${childCount === 1 ? "" : "s"}, ${clipCount} clip${clipCount === 1 ? "" : "s"}`;
        copy.append(name, details);
        row.append(handle, position, copy);

        row.addEventListener("dragstart", (event) => {
          if (folderReorderRequestActive) {
            event.preventDefault();
            return;
          }
          draggedFolderOrderId = folder.id;
          event.dataTransfer.setData("text/plain", `scenekeeper-folder-order:${folder.id}`);
          event.dataTransfer.effectAllowed = "move";
          row.classList.add("is-dragging");
        });
        row.addEventListener("dragover", (event) => {
          const source = favoriteFolders.find((entry) => entry.id === draggedFolderOrderId);
          if (folderReorderRequestActive || !source || source.id === folder.id ||
              libraryFavoriteKeys.has(`folder:${source.id}`) !== libraryFavoriteKeys.has(`folder:${folder.id}`)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const bounds = row.getBoundingClientRect();
          const insertAfter = event.clientY >= bounds.top + bounds.height / 2;
          row.classList.toggle("is-order-drop-before", !insertAfter);
          row.classList.toggle("is-order-drop-after", insertAfter);
        });
        row.addEventListener("dragleave", (event) => {
          if (event.relatedTarget && row.contains(event.relatedTarget)) return;
          row.classList.remove("is-order-drop-before", "is-order-drop-after");
        });
        row.addEventListener("drop", (event) => {
          if (!draggedFolderOrderId) return;
          event.preventDefault();
          event.stopPropagation();
          const insertAfter = row.classList.contains("is-order-drop-after");
          clipReorderList.querySelectorAll(".is-order-drop-before, .is-order-drop-after")
            .forEach((target) => target.classList.remove("is-order-drop-before", "is-order-drop-after"));
          reorderLibraryFolders(draggedFolderOrderId, folder, insertAfter);
          draggedFolderOrderId = "";
        });
        row.addEventListener("dragend", () => {
          draggedFolderOrderId = "";
          row.classList.remove("is-dragging");
          clipReorderList.querySelectorAll(".is-order-drop-before, .is-order-drop-after")
            .forEach((target) => target.classList.remove("is-order-drop-before", "is-order-drop-after"));
        });
        clipReorderList.appendChild(row);
      });
    }

    function openFolderReorderDialog() {
      clipReorderFolderId = "";
      pendingClipReorderIds = null;
      originalClipReorderIds = null;
      folderReorderParentId = selectedFolderId || "";
      originalFolderReorderIds = sortFolderRecords(
        favoriteFolders.filter((folder) => (folder.parentId || "") === folderReorderParentId)
      ).map((folder) => folder.id);
      pendingFolderReorderIds = originalFolderReorderIds.slice();
      renderFolderReorderList();
      clipReorderModal.hidden = false;
      focusFullscreenCloseButton();
    }

    function commitFolderReorderDialog() {
      if (folderReorderRequestActive || !pendingFolderReorderIds) return;
      const orderChanged = pendingFolderReorderIds.some((folderId, index) => folderId !== originalFolderReorderIds[index]);
      if (!orderChanged) {
        closeClipReorderDialog();
        return;
      }

      const encodedParentId = JSON.stringify(encodeURIComponent(folderReorderParentId));
      const encodedOrder = JSON.stringify(encodeURIComponent(JSON.stringify(pendingFolderReorderIds)));
      folderReorderRequestActive = true;
      renderFolderReorderList();
      callAE(`reorderClipFolders(${encodedParentId}, ${encodedOrder})`, "", (response) => {
        folderReorderRequestActive = false;
        closeClipReorderDialog();
        refreshFavoriteFolders(() => setResult(response, "success"));
      }, (message) => {
        folderReorderRequestActive = false;
        renderFolderReorderList();
        setResult(message, "error");
      });
    }

    function reorderCollectionItems(sourceOrderId, targetOrderId, insertAfter) {
      if (clipReorderRequestActive || !pendingCollectionOrderIds) return;
      const sourceIndex = pendingCollectionOrderIds.indexOf(sourceOrderId);
      const targetIndex = pendingCollectionOrderIds.indexOf(targetOrderId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
      const [movedOrderId] = pendingCollectionOrderIds.splice(sourceIndex, 1);
      const adjustedTargetIndex = pendingCollectionOrderIds.indexOf(targetOrderId);
      pendingCollectionOrderIds.splice(adjustedTargetIndex + (insertAfter ? 1 : 0), 0, movedOrderId);

      const rowsByOrderId = new Map(
        Array.from(clipReorderList.querySelectorAll(".clip-reorder-item"))
          .map((row) => [row.dataset.orderId, row])
      );
      pendingCollectionOrderIds.forEach((orderId, index) => {
        const row = rowsByOrderId.get(orderId);
        if (!row) return;
        clipReorderList.appendChild(row);
        row.querySelector(".clip-reorder-position").textContent = String(index + 1);
      });
    }

    function renderCollectionReorderList() {
      clipReorderTitle.textContent = "Reorder Clips & Folders";
      const trail = getFolderTrail(collectionReorderParentId);
      clipReorderLocation.textContent = `Collection: ${["Home"].concat(trail.map((folder) => folder.name)).join(" / ")}`;
      clipReorderList.innerHTML = "";
      clipReorderCancelButton.disabled = clipReorderRequestActive;
      clipReorderDoneButton.disabled = clipReorderRequestActive;

      const entries = getLibraryCollectionEntries(collectionReorderParentId);
      const entriesByOrderId = new Map(entries.map((entry) => [getCollectionOrderId(entry), entry]));
      const orderedEntries = (pendingCollectionOrderIds || [])
        .map((orderId) => entriesByOrderId.get(orderId))
        .filter(Boolean);
      if (!orderedEntries.length) {
        const empty = document.createElement("p");
        empty.className = "favorite-results-empty";
        empty.textContent = "No clips or folders in this collection.";
        clipReorderList.appendChild(empty);
        return;
      }

      orderedEntries.forEach((entry, index) => {
        const orderId = getCollectionOrderId(entry);
        const row = document.createElement("div");
        row.className = `clip-reorder-item${entry.type === "folder" ? " folder-reorder-item" : ""}`;
        row.setAttribute("role", "listitem");
        row.draggable = !clipReorderRequestActive;
        row.dataset.orderId = orderId;

        const handle = document.createElement("span");
        handle.className = "clip-reorder-handle";
        handle.setAttribute("aria-hidden", "true");
        handle.textContent = "⠿";
        const position = document.createElement("span");
        position.className = "clip-reorder-position";
        position.textContent = String(index + 1);
        row.append(handle, position);

        if (entry.type === "clip") {
          const clip = entry.clip;
          const thumbnail = document.createElement("span");
          thumbnail.className = "favorite-clip-thumbnail clip-reorder-thumbnail";
          if (clip.sourceMissing) {
            thumbnail.classList.add("is-offline");
            const bars = document.createElement("span");
            bars.className = "favorite-offline-preview";
            const offlineLabel = document.createElement("span");
            offlineLabel.className = "favorite-offline-label";
            offlineLabel.textContent = "MEDIA OFFLINE";
            thumbnail.append(bars, offlineLabel);
          } else {
            const placeholder = document.createElement("span");
            placeholder.className = "clip-preview-loading-state is-loading";
            placeholder.textContent = "Loading preview...";
            const video = document.createElement("video");
            video.muted = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.setAttribute("aria-hidden", "true");
            thumbnail.append(placeholder, video);
            attachClipThumbnail(video, placeholder, clip, row, clipReorderList);
          }
          row.appendChild(thumbnail);
        }

        const copy = document.createElement("span");
        copy.className = "clip-reorder-copy";
        const name = document.createElement("span");
        name.className = "clip-reorder-name";
        const details = document.createElement("span");
        details.className = "clip-reorder-details";
        if (entry.type === "folder") {
          name.textContent = entry.folder.name;
          const childCount = favoriteFolders.filter((folder) => folder.parentId === entry.folder.id).length;
          const clipCount = favoriteRecords.filter((clip) => clip.folderId === entry.folder.id).length;
          details.textContent = `${childCount} subfolder${childCount === 1 ? "" : "s"}, ${clipCount} clip${clipCount === 1 ? "" : "s"}`;
        } else {
          name.textContent = getClipDisplayName(entry.clip);
          details.textContent = `${formatTimestamp(entry.clip.sourceIn)}–${formatTimestamp(entry.clip.sourceOut)}`;
        }
        copy.append(name, details);
        row.appendChild(copy);

        row.addEventListener("dragstart", (event) => {
          if (clipReorderRequestActive) {
            event.preventDefault();
            return;
          }
          draggedCollectionOrderId = orderId;
          event.dataTransfer.setData("text/plain", orderId);
          event.dataTransfer.effectAllowed = "move";
          row.classList.add("is-dragging");
        });
        row.addEventListener("dragover", (event) => {
          if (clipReorderRequestActive || !draggedCollectionOrderId || draggedCollectionOrderId === orderId) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const bounds = row.getBoundingClientRect();
          const insertAfter = event.clientY >= bounds.top + bounds.height / 2;
          row.classList.toggle("is-order-drop-before", !insertAfter);
          row.classList.toggle("is-order-drop-after", insertAfter);
        });
        row.addEventListener("dragleave", (event) => {
          if (event.relatedTarget && row.contains(event.relatedTarget)) return;
          row.classList.remove("is-order-drop-before", "is-order-drop-after");
        });
        row.addEventListener("drop", (event) => {
          if (!draggedCollectionOrderId) return;
          event.preventDefault();
          event.stopPropagation();
          const insertAfter = row.classList.contains("is-order-drop-after");
          clipReorderList.querySelectorAll(".is-order-drop-before, .is-order-drop-after")
            .forEach((target) => target.classList.remove("is-order-drop-before", "is-order-drop-after"));
          reorderCollectionItems(draggedCollectionOrderId, orderId, insertAfter);
          draggedCollectionOrderId = "";
        });
        row.addEventListener("dragend", () => {
          draggedCollectionOrderId = "";
          row.classList.remove("is-dragging");
          clipReorderList.querySelectorAll(".is-order-drop-before, .is-order-drop-after")
            .forEach((target) => target.classList.remove("is-order-drop-before", "is-order-drop-after"));
        });
        clipReorderList.appendChild(row);
      });
    }

    function showCollectionReorderDialog() {
      collectionReorderParentId = selectedFolderId || "";
      originalCollectionOrderIds = getLibraryCollectionEntries(collectionReorderParentId).map(getCollectionOrderId);
      pendingCollectionOrderIds = originalCollectionOrderIds.slice();
      renderCollectionReorderList();
      clipReorderModal.hidden = false;
      focusFullscreenCloseButton();
    }

    function openCollectionReorderDialog() {
      requestManualSortForReordering(showCollectionReorderDialog);
    }

    function commitCollectionReorderDialog() {
      if (clipReorderRequestActive || !pendingCollectionOrderIds) return;
      const orderChanged = pendingCollectionOrderIds.some((orderId, index) => orderId !== originalCollectionOrderIds[index]);
      if (!orderChanged) {
        closeClipReorderDialog();
        return;
      }

      const encodedParentId = JSON.stringify(encodeURIComponent(collectionReorderParentId));
      const encodedOrder = JSON.stringify(encodeURIComponent(JSON.stringify(pendingCollectionOrderIds)));
      clipReorderRequestActive = true;
      renderCollectionReorderList();
      callAE(`reorderClipLibraryItems(${encodedParentId}, ${encodedOrder})`, "", (response) => {
        clipReorderRequestActive = false;
        pendingCollectionOrderIds.forEach((orderId, index) => {
          if (orderId.indexOf("folder:") === 0) {
            const folder = favoriteFolders.find((entry) => entry.id === orderId.slice(7));
            if (folder) folder.sortOrder = index;
          } else {
            const clip = favoriteRecords.find((entry) => entry.clipId === orderId.slice(5));
            if (clip) clip.sortOrder = index;
          }
        });
        closeClipReorderDialog();
        refreshFavoriteFolders(() => setResult(response, "success"));
      }, (message) => {
        clipReorderRequestActive = false;
        renderCollectionReorderList();
        setResult(message, "error");
      });
    }

    function commitClipReorderDialog() {
      if (pendingFolderReorderIds) {
        commitFolderReorderDialog();
        return;
      }
      if (clipReorderRequestActive || !pendingClipReorderIds) return;
      const orderChanged = pendingClipReorderIds.some((clipId, index) => clipId !== originalClipReorderIds[index]);
      if (!orderChanged) {
        closeClipReorderDialog();
        return;
      }

      const encodedOrder = JSON.stringify(encodeURIComponent(JSON.stringify(pendingClipReorderIds)));
      clipReorderRequestActive = true;
      renderClipReorderList();
      callAE(`reorderClipFavorites(${encodedOrder})`, "", (response) => {
        clipReorderRequestActive = false;
        if (response.indexOf("ERROR:") === 0) {
          setResult(response, "error");
          renderClipReorderList();
          return;
        }
        closeClipReorderDialog();
        refreshFavorites(false, response);
      }, (message) => {
        clipReorderRequestActive = false;
        renderClipReorderList();
        setResult(message, "error");
      });
    }

    function loadClipTrash() {
      callAE("listClipTrash()", "", (response) => {
        clipTrashList.innerHTML = "";
        clipTrashPreviewEntries = [];
        let count = 0;
        if (response !== "NO_TRASH" && response) {
          response.split(/\r?\n/).filter(Boolean).forEach((line, index) => {
            const fields = line.split("\t");
            let entry;
            try {
              if (fields[0] === "F" && fields.length === 2) {
                const folderEntry = JSON.parse(decodeURIComponent(fields[1]));
                entry = {
                  type: "folder",
                  name: folderEntry.folder.name,
                  detail: `${folderEntry.clips.length} clip(s), ${Math.max(0, folderEntry.folders.length - 1)} subfolder(s)`,
                  parentId: folderEntry.folder.parentId || "",
                  previewRecords: folderEntry.clips
                };
              } else if (fields[0] === "C" &&
                  [7, 10, 12, 13, 14, 16, 17, 19].includes(fields.length)) {
                const legacyRecord = fields.length === 7;
                const sourcePathIndex = legacyRecord ? 4 : 5;
                const sourceInIndex = legacyRecord ? 5 : 6;
                const sourceOutIndex = legacyRecord ? 6 : 7;
                entry = {
                  type: "clip",
                  name: decodeURIComponent(fields[3]),
                  folderName: decodeURIComponent(fields[2]),
                  sourceIn: Number(decodeURIComponent(fields[sourceInIndex])),
                  sourceOut: Number(decodeURIComponent(fields[sourceOutIndex])),
                  folderId: fields.length >= 13 ? decodeURIComponent(fields[12]) : "",
                  previewRecords: [{
                    sourcePath: decodeURIComponent(fields[sourcePathIndex]),
                    sourceIn: Number(decodeURIComponent(fields[sourceInIndex])),
                    sourceOut: Number(decodeURIComponent(fields[sourceOutIndex]))
                  }]
                };
              } else if (fields.length === 13) {
                entry = {
                  type: "clip",
                  name: decodeURIComponent(fields[0]),
                  folderName: "",
                  sourceIn: Number(decodeURIComponent(fields[3])),
                  sourceOut: Number(decodeURIComponent(fields[4])),
                  folderId: decodeURIComponent(fields[9]),
                  previewRecords: [{
                    sourcePath: decodeURIComponent(fields[2]),
                    sourceIn: Number(decodeURIComponent(fields[3])),
                    sourceOut: Number(decodeURIComponent(fields[4]))
                  }]
                };
              } else {
                return;
              }
            } catch (error) {
              return;
            }

            clipTrashPreviewEntries[index] = entry.previewRecords || [];
            const row = document.createElement("div");
            row.className = "clip-trash-item";
            row.setAttribute("role", "listitem");
            const copy = document.createElement("div");
            copy.className = "clip-trash-item-copy";
            const name = document.createElement("span");
            name.className = "clip-trash-item-name";
            name.textContent = entry.name;
            const time = document.createElement("span");
            time.className = "clip-trash-item-time";
            time.textContent = entry.type === "folder"
              ? entry.detail
              : `${entry.folderName ? `${entry.folderName} · ` : ""}${formatTimestamp(entry.sourceIn)}–${formatTimestamp(entry.sourceOut)}`;
            copy.append(name, time);

            const restoreButton = document.createElement("button");
            restoreButton.type = "button";
            restoreButton.className = "secondary";
            restoreButton.textContent = entry.type === "folder" ? "Restore folder" : "Restore";
            restoreButton.setAttribute("aria-label", `Restore ${entry.type} ${entry.name}`);
            restoreButton.addEventListener("click", () => {
              const folderExists = entry.type === "folder"
                ? (!entry.parentId || favoriteFolders.some((folder) => folder.id === entry.parentId))
                : (!entry.folderId || favoriteFolders.some((folder) => folder.id === entry.folderId));
              callAE(`restoreClipTrashItem(${index})`, "", (result) => {
                selectedFolderId = folderExists
                  ? (entry.type === "folder" ? entry.parentId : entry.folderId)
                  : "";
                selectedFavoriteStorageIndex = null;
                selectedLibraryItemKey = "";
                refreshFavorites(false, result);
                refreshFavoriteFolders();
                loadClipTrash();
              });
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "danger";
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("aria-label", `Permanently delete ${entry.type} ${entry.name}`);
            deleteButton.addEventListener("click", () => {
              confirmClipTrashDeletion("item", index, `${entry.type} "${entry.name}"`);
            });
            row.append(copy, restoreButton, deleteButton);
            clipTrashList.appendChild(row);
            count++;
          });
        }
        if (!count) {
          const empty = document.createElement("p");
          empty.className = "favorite-results-empty";
          empty.textContent = "The trash is empty.";
          clipTrashList.appendChild(empty);
        }
        emptyClipTrashButton.disabled = count === 0;
        clipTrashToggle.title = count ? `Recently deleted items (${count})` : "Recently deleted items";
        clipTrashToggle.setAttribute("aria-label", clipTrashToggle.title);
      });
    }

    function confirmClipTrashDeletion(type, index, name) {
      const previewRecords = type === "empty"
        ? clipTrashPreviewEntries.flat()
        : clipTrashPreviewEntries[index] || [];
      const remainingRecords = type === "empty"
        ? []
        : clipTrashPreviewEntries.flatMap((records, entryIndex) => entryIndex === index ? [] : records);
      pendingClipTrashAction = { type, index, name, previewRecords, remainingRecords };
      clipTrashConfirmationText.textContent = type === "empty"
        ? "Empty the trash and permanently delete all clips and folders inside?"
        : `Permanently delete ${name}?`;
      clipTrashConfirmation.hidden = false;
      document.getElementById("cancel-clip-trash-action").focus();
    }

    function refreshFavorites(selectNewest, statusMessage, selectStorageIndex, onComplete, silent, selectClipId, selectOnly = false) {
      callAE("listClipFavorites()", "", (response) => {
        favoriteRecords = [];
        favoriteList.innerHTML = "";
        if (response === "NO_FAVORITES" || !response) {
          syncMissingFootageCount();
          favoriteResultsMode = "footage";
          selectedFootagePath = "";
          selectedFolderId = "";
          selectedFavoriteStorageIndex = null;
          selectedLibraryItemKey = "";
          renderFavoriteClips();
          if (!clipReorderModal.hidden) renderCollectionReorderList();
          updateFavoriteSelection();
          const statusTone = statusMessage &&
            (statusMessage.indexOf("ERROR:") === 0 ||
              /could not|unavailable/i.test(statusMessage))
            ? "error"
            : "";
          if (!silent) setResult(statusMessage || "No clips saved yet.", statusTone);
          if (onComplete) onComplete();
          return;
        }

        response.split(/\r?\n/).filter(Boolean).forEach((line) => {
          const fields = line.split("\t");
          if (fields.length !== 4 && fields.length !== 7 && fields.length !== 9 && fields.length !== 10 && fields.length !== 11 && fields.length !== 12 && fields.length !== 13 && fields.length !== 14 && fields.length !== 15 && fields.length !== 16 && fields.length !== 17 && fields.length !== 18 && fields.length !== 19) return;
          try {
            const legacy = fields.length === 4;
            favoriteRecords.push({
              storageIndex: favoriteRecords.length,
              displayName: decodeURIComponent(legacy ? fields[0] : fields[0]),
              sourceName: decodeURIComponent(legacy ? fields[0] : fields[1]),
              sourcePath: decodeURIComponent(legacy ? fields[1] : fields[2]),
              sourceIn: Number(decodeURIComponent(legacy ? fields[2] : fields[3])),
              sourceOut: Number(decodeURIComponent(legacy ? fields[3] : fields[4])),
              positionX: legacy || !fields[5] ? NaN : Number(decodeURIComponent(fields[5])),
              positionY: legacy || !fields[6] ? NaN : Number(decodeURIComponent(fields[6])),
              scaleX: fields.length >= 9 && fields[7] ? Number(decodeURIComponent(fields[7])) : NaN,
              scaleY: fields.length >= 9 && fields[8] ? Number(decodeURIComponent(fields[8])) : NaN,
              folderId: fields.length >= 10 ? decodeURIComponent(fields[9]) : "",
              audioEnabled: fields.length >= 11
                ? (fields[10] === "1" ? true : (fields[10] === "0" ? false : null))
                : null,
              compWidth: fields.length >= 13 && fields[11] ? Number(decodeURIComponent(fields[11])) : NaN,
              compHeight: fields.length >= 13 && fields[12] ? Number(decodeURIComponent(fields[12])) : NaN,
              clipId: fields.length >= 15 ? decodeURIComponent(fields[13]) : "",
              sourceWidth: fields.length >= 17 && fields[14] ? Number(decodeURIComponent(fields[14])) : NaN,
              sourceHeight: fields.length >= 17 && fields[15] ? Number(decodeURIComponent(fields[15])) : NaN,
              sortOrder: fields.length === 19 && fields[17] !== "" ? Number(decodeURIComponent(fields[17])) : null,
              sourceMissing: fields.length === 19
                ? fields[18] === "1"
                : fields.length === 18
                ? fields[17] === "1"
                : fields.length === 17
                ? fields[16] === "1"
                : fields.length === 15
                ? fields[14] === "1"
                : fields.length === 14
                ? fields[13] === "1"
                : (fields.length === 12 ? fields[11] === "1" : fields.length === 11 && fields[10] === "1")
            });
          } catch (error) {
            // Ignore malformed favorite entries.
          }
        });

        initializeClipTrackingData();
        const newestRecord = selectNewest ? favoriteRecords[favoriteRecords.length - 1] : null;
        const selectedRecord = selectClipId
          ? favoriteRecords.find((record) => record.clipId === selectClipId)
          : (selectStorageIndex === undefined
            ? newestRecord
            : favoriteRecords.find((record) => record.storageIndex === selectStorageIndex));
        if (selectOnly && selectedRecord) selectedLibraryKeys.clear();
        if (selectedRecord) {
          selectedFolderId = selectedRecord.folderId || "";
          selectedFootagePath = selectedRecord.sourcePath;
          selectedFavoriteStorageIndex = selectedRecord ? selectedRecord.storageIndex : null;
          selectedLibraryItemKey = selectedRecord ? `clip:${selectedRecord.storageIndex}` : "";
          favoriteResultsMode = "clips";
        } else {
          selectedFootagePath = "";
          if (!favoriteFolders.some((folder) => folder.id === selectedFolderId)) {
            selectedFolderId = "";
          }
          selectedFavoriteStorageIndex = null;
          selectedLibraryItemKey = "";
          favoriteResultsMode = "footage";
        }
        syncMissingFootageCount();
        renderFavoriteClips();
        if (!clipReorderModal.hidden) renderCollectionReorderList();
        requestAnimationFrame(() => scrollSelectedFavoriteIntoView());
        if (onComplete) onComplete();
        const statusTone = statusMessage &&
          (statusMessage.indexOf("ERROR:") === 0 ||
            /could not|unavailable/i.test(statusMessage))
          ? "error"
          : "";
        const isInitialLoad = suppressInitialFavoriteLoadStatus;
        suppressInitialFavoriteLoadStatus = false;
        if (silent) return;
        if (isInitialLoad && !statusMessage) return;
        if (statusMessage || favoriteRecords.length === 0) {
          setResult(statusMessage || "No clips saved yet.", statusTone);
          return;
        }
        if (isInitialLoad) return;
        favoriteLoadNoticeTimer = setTimeout(() => {
          favoriteLoadNoticeTimer = null;
          setResult(`${favoriteRecords.length} clip(s) loaded.`, statusTone);
        }, 2000);
      });
    }

    function renderSaveClipFolderPicker() {
      saveClipBreadcrumb.innerHTML = "";
      const destinationFolderId = saveClipSelectedFolderId || saveClipPickerFolderId;
      const trail = getFolderTrail(destinationFolderId);
      const breadcrumbItems = [{ id: "", name: "Home" }].concat(trail);
      breadcrumbItems.forEach((folder, index) => {
        if (index) {
          const separator = document.createElement("span");
          separator.className = "library-breadcrumb-separator";
          separator.textContent = "/";
          saveClipBreadcrumb.appendChild(separator);
        }
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = folder.name;
        if (index === breadcrumbItems.length - 1) button.setAttribute("aria-current", "page");
        button.addEventListener("click", () => {
          saveClipSelectedFolderId = folder.id;
          saveClipPickerFolderId = folder.id;
          renderSaveClipFolderPicker();
        });
        saveClipBreadcrumb.appendChild(button);
      });

      saveClipFolderList.innerHTML = "";
      const foldersByParent = new Map();
      favoriteFolders.forEach((folder) => {
        const parentId = favoriteFolders.some((candidate) => candidate.id === folder.parentId) ? folder.parentId : "";
        if (!foldersByParent.has(parentId)) foldersByParent.set(parentId, []);
        foldersByParent.get(parentId).push(folder);
      });
      foldersByParent.forEach((folders, parentId) => foldersByParent.set(parentId, sortFolderRecords(folders)));
      const searchQuery = saveClipFolderSearch.value.trim().toLocaleLowerCase();
      const visibleFolderIds = new Set();
      const searchPathFolderIds = new Set();
      if (searchQuery) {
        favoriteFolders.forEach((folder) => {
          if (!folder.name.toLocaleLowerCase().includes(searchQuery)) return;
          let current = favoriteFolders.find((candidate) => candidate.id === folder.parentId);
          while (current && !visibleFolderIds.has(current.id)) {
            visibleFolderIds.add(current.id);
            searchPathFolderIds.add(current.id);
            const parentId = favoriteFolders.some((candidate) => candidate.id === current.parentId) ? current.parentId : "";
            current = favoriteFolders.find((candidate) => candidate.id === parentId);
          }
          visibleFolderIds.add(folder.id);
        });
      }
      const appendFolder = (folder, depth) => {
        const children = foldersByParent.get(folder.id) || [];
        const isExpanded = searchQuery
          ? (searchPathFolderIds.has(folder.id) && !collapsedSaveClipSearchFolderIds.has(folder.id)) || expandedSaveClipFolderIds.has(folder.id)
          : expandedSaveClipFolderIds.has(folder.id);
        const visibleChildren = searchQuery
          ? (isExpanded ? children : children.filter((child) => visibleFolderIds.has(child.id)))
          : children;
        const item = document.createElement("div");
        item.className = "save-clip-folder-item save-clip-folder-node";
        item.setAttribute("role", "listitem");
        item.dataset.folderId = folder.id;
        const row = document.createElement("div");
        row.className = "save-clip-folder-row";
        row.style.setProperty("--folder-depth", String(depth));

        if (children.length) {
          const disclosure = document.createElement("button");
          disclosure.type = "button";
          disclosure.className = "save-clip-folder-disclosure";
          disclosure.setAttribute("aria-expanded", String(isExpanded));
          disclosure.setAttribute("aria-label", `${isExpanded ? "Collapse" : "Expand"} ${folder.name}`);
          disclosure.textContent = isExpanded ? "▾" : "▸";
          disclosure.addEventListener("click", () => {
            if (searchQuery && searchPathFolderIds.has(folder.id) && !expandedSaveClipFolderIds.has(folder.id)) {
              if (collapsedSaveClipSearchFolderIds.has(folder.id)) collapsedSaveClipSearchFolderIds.delete(folder.id);
              else collapsedSaveClipSearchFolderIds.add(folder.id);
            } else if (expandedSaveClipFolderIds.has(folder.id)) expandedSaveClipFolderIds.delete(folder.id);
            else expandedSaveClipFolderIds.add(folder.id);
            renderSaveClipFolderPicker();
          });
          row.appendChild(disclosure);
        } else {
          const spacer = document.createElement("span");
          spacer.className = "save-clip-folder-disclosure-spacer";
          row.appendChild(spacer);
        }

        const selectButton = document.createElement("button");
        selectButton.type = "button";
        selectButton.className = "save-clip-folder-select";
        selectButton.setAttribute("aria-pressed", String(folder.id === destinationFolderId));
        const name = document.createElement("span");
        name.className = "save-clip-folder-name";
        name.textContent = folder.name;
        const childFolderCount = children.length;
        const clipCount = favoriteRecords.filter((record) => record.folderId === folder.id).length;
        const total = childFolderCount + clipCount;
        const details = document.createElement("span");
        details.className = "save-clip-folder-details";
        details.textContent = `${total} item${total === 1 ? "" : "s"}`;
        selectButton.append(name, details);
        selectButton.addEventListener("click", () => {
          saveClipSelectedFolderId = folder.id;
          renderSaveClipFolderPicker();
        });
        row.appendChild(selectButton);
        item.appendChild(row);

        if (visibleChildren.length && isExpanded) {
          const childList = document.createElement("div");
          childList.className = "save-clip-folder-children";
          visibleChildren.forEach((child) => childList.appendChild(appendFolder(child, depth + 1)));
          item.appendChild(childList);
        }
        return item;
      };

      const rootFolders = foldersByParent.get("") || [];
      const visibleRoots = searchQuery ? rootFolders.filter((folder) => visibleFolderIds.has(folder.id)) : rootFolders;
      visibleRoots.forEach((folder) => saveClipFolderList.appendChild(appendFolder(folder, 0)));
      if (!visibleRoots.length) {
        const empty = document.createElement("p");
        empty.className = "favorite-results-empty";
        empty.textContent = searchQuery ? "No matching folders." : "No folders have been created yet.";
        saveClipFolderList.appendChild(empty);
      }
      const activeFolderName = destinationFolderId
        ? (favoriteFolders.find((folder) => folder.id === destinationFolderId)?.name || "Current Folder")
        : "Home";
      saveClipCurrentLocationButton.textContent = `Save in "${activeFolderName}"`;
      const sceneFolder = favoriteFolders.find((folder) => folder.id === saveClipCurrentFolderId);
      saveClipSceneLocationButton.hidden = !sceneFolder;
      if (sceneFolder) saveClipSceneLocationButton.textContent = `Quick save in "${sceneFolder.name}"`;
      updateSaveClipNamePlaceholder(destinationFolderId);
    }

    function updateSaveClipNamePlaceholder(folderId) {
      if (!folderId) {
        saveClipNameInput.placeholder = "Select a folder first";
        return;
      }
      const cep = window.__adobe_cep__;
      if (!cep || typeof cep.evalScript !== "function") {
        setResult("CEP bridge unavailable. Is the panel running in After Effects?", "error");
        return;
      }
      saveClipNameInput.placeholder = "Checking suggested name...";
      const encodedFolderId = JSON.stringify(encodeURIComponent(folderId || ""));
      cep.evalScript(`getNextClipFavoriteName(${encodedFolderId})`, (response) => {
        if (saveClipDialog.hidden || (saveClipSelectedFolderId || saveClipPickerFolderId || "") !== (folderId || "")) return;
        if (!response || response === "EvalScript error." || response.indexOf("ERROR:") === 0) {
          setResult(response && response.indexOf("ERROR:") === 0 ? response.substring(6) : "Could not determine the suggested clip name.", "error");
          return;
        }
        saveClipNameInput.placeholder = response;
      });
    }

    function saveClipToFolder(folderId, confirmLongClip = false, saveFirstTenSeconds = false) {
      const destinationFolderId = folderId || "";
      if (!destinationFolderId) {
        setResult("Please select or create a folder before saving a clip.", "error");
        return;
      }
      selectedFolderId = destinationFolderId;
      saveClipPickerFolderId = destinationFolderId;
      librarySearch.value = "";
      syncSearchClearButtons();
      const encodedFolderId = JSON.stringify(encodeURIComponent(destinationFolderId));
      const encodedCustomName = JSON.stringify(encodeURIComponent(saveClipNameInput.value.trim()));
      const isGuidedTutorialSave = guidedTourActive && guidedTourStep === "saveExample";
      if (isGuidedTutorialSave) {
        guidedTourBusy = true;
        setGuidedTourStep("saving");
      }
      saveClipDialog.hidden = true;
      callAE(`saveSelectedClipFavorite(${encodedFolderId}, ${saveClipPosition.checked}, ${saveClipScale.checked}, ${saveClipAudio.checked}, ${encodedCustomName}, ${confirmLongClip}, ${saveFirstTenSeconds})`, "Clip saved.", (response) => {
        if (response.indexOf("LONG_CLIP_CONFIRM|") === 0) {
          if (isGuidedTutorialSave) {
            guidedTourBusy = false;
            setGuidedTourStep("saveExample");
          }
          const duration = Number(response.split("|")[1]);
          longClipConfirmationText.textContent = `This clip is ${formatTimestamp(duration)} long. Save its full length, or shorten it in After Effects first?`;
          longClipConfirmation.hidden = false;
          shortenLongClipButton.focus();
          return;
        }
        if (response.indexOf("DUPLICATE_CLIP|") === 0) {
          if (isGuidedTutorialSave) {
            guidedTourBusy = false;
            setGuidedTourStep("saveExample");
          }
          const fields = response.split("|");
          pendingClipReplacementIndex = Number(fields[1]);
          let existingClipName = "existing clip";
          try {
            existingClipName = decodeURIComponent(fields[2] || existingClipName);
          } catch (error) {
            existingClipName = fields[2] || existingClipName;
          }
          replaceClipConfirmationText.textContent = `A clip named "${existingClipName}" with the same footage and timestamps already exists. Replace its saved settings?`;
          replaceClipConfirmation.hidden = false;
          cancelClipReplacementButton.focus();
          return;
        }
        expandedSaveClipFolderIds.clear();
        refreshFavorites(true, response, undefined, () => {
          if (isGuidedTutorialSave && guidedTourActive) {
            guidedTourBusy = false;
            guidedTourSampleStorageIndex = selectedFavoriteStorageIndex;
            setGuidedTourStep("preview");
          }
        }, false, undefined, true);
      }, (message) => {
        if (isGuidedTutorialSave) {
          guidedTourBusy = false;
          setGuidedTourStep("saveExample");
        }
        setResult(message, "error");
      });
    }

    function cancelPendingClipReplacement() {
      if (pendingClipReplacementIndex === null) return;
      pendingClipReplacementIndex = null;
      replaceClipConfirmation.hidden = true;
      callAE("cancelClipFavoriteReplacement()", "Replacement canceled.");
    }

    function showSaveClipDialog() {
      saveClipSelectedFolderId = "";
      saveClipFolderSearch.value = "";
      expandedSaveClipFolderIds.clear();
      collapsedSaveClipSearchFolderIds.clear();
      saveClipOptionsDetails.open = false;
      saveClipNameInput.value = "";
      saveClipPosition.checked = saveDefaultPosition.checked;
      saveClipScale.checked = saveDefaultScale.checked;
      saveClipAudio.checked = saveDefaultAudio.checked;
      saveClipCurrentFolderId = favoriteFolders.some((folder) => folder.id === selectedFolderId)
        ? selectedFolderId
        : "";
      persistQuickSaveShortcutSettings(saveClipCurrentFolderId);
      saveClipPickerFolderId = "";
      renderSaveClipFolderPicker();
      saveClipDialog.hidden = false;
      if (guidedTourActive && guidedTourStep === "saveAction") {
        setGuidedTourStep("saveExample");
      }
      saveClipCurrentLocationButton.focus();
    }

    function clearSelectedClipCapture() {
      const cep = window.__adobe_cep__;
      if (cep && typeof cep.evalScript === "function") {
        cep.evalScript("cancelClipFavoriteCapture()", () => {});
      }
    }

    function decodeQuickSaveField(value) {
      try { return decodeURIComponent(value || ""); }
      catch (error) { return value || ""; }
    }

    function runQuickSaveBatch(startAtIndex = 0, confirmLongClip = false, saveFirstTenSeconds = false) {
      if (!pendingQuickSaveBatch) return;
      quickSaveSelectedClipsButton.disabled = true;
      const batch = pendingQuickSaveBatch;
      const encodedFolderId = JSON.stringify(encodeURIComponent(batch.folderId));
      callAE(
        `quickSaveSelectedClipsToFolder(${encodedFolderId}, ${batch.savePosition}, ${batch.saveScale}, ${batch.saveAudio}, ${startAtIndex}, ${confirmLongClip}, ${saveFirstTenSeconds})`,
        "",
        (response) => {
          quickSaveSelectedClipsButton.disabled = false;
          const fields = String(response || "").split("|");
          if (fields[0] === "LONG_CLIP_CONFIRM") {
            batch.savedCount += Number(fields[3]) || 0;
            const failures = decodeQuickSaveField(fields[5]);
            const lastClipId = decodeQuickSaveField(fields[6]);
            const warnings = decodeQuickSaveField(fields[7]);
            if (failures) batch.failures.push(failures);
            if (warnings) batch.longClipWarnings.push(warnings);
            if (lastClipId) batch.lastClipId = lastClipId;
            batch.nextLayerIndex = Number(fields[2]) || 0;
            longClipConfirmationText.textContent = `This clip is ${formatTimestamp(Number(fields[1]))} long. Save its full length, or shorten it in After Effects first?`;
            longClipConfirmation.hidden = false;
            shortenLongClipButton.focus();
            return;
          }
          if (fields[0] !== "QUICKSAVE_DONE") {
            pendingQuickSaveBatch = null;
            setResult(response || "Could not save the selected clips.", "error");
            if (guidedTourActive && guidedTourStep === "saving") {
              guidedTourBusy = false;
              setGuidedTourStep("saveAction");
            }
            return;
          }
          batch.savedCount += Number(fields[1]) || 0;
          const folderName = decodeQuickSaveField(fields[2]);
          const failures = decodeQuickSaveField(fields[3]);
          const clipId = decodeQuickSaveField(fields[4]) || batch.lastClipId || "";
          const warnings = decodeQuickSaveField(fields[5]);
          if (failures) batch.failures.push(failures);
          if (warnings) batch.longClipWarnings.push(warnings);
          pendingQuickSaveBatch = null;
          refreshFavorites(!clipId, "", undefined, () => {
            const success = `Saved ${batch.savedCount} clip${batch.savedCount === 1 ? "" : "s"}${folderName ? ` to ${folderName}` : ""}.`;
            const notices = batch.failures.slice();
            if (batch.skippedLongClipCount) notices.push(`${batch.skippedLongClipCount} long clip${batch.skippedLongClipCount === 1 ? " was" : "s were"} not saved. Shorten ${batch.skippedLongClipCount === 1 ? "it" : "them"} in After Effects and save again.`);
            if (batch.longClipWarnings.length) notices.push(`Saved at full length: ${batch.longClipWarnings.join("; ")}.`);
            setResult(notices.length ? `${success} ${notices.join(" ")}` : success, notices.length ? "warning" : "success");
            if (guidedTourActive && guidedTourStep === "saving") {
              guidedTourBusy = false;
              if (batch.savedCount > 0) {
                guidedTourSampleStorageIndex = selectedFavoriteStorageIndex;
                setGuidedTourStep("preview");
              } else {
                setGuidedTourStep("saveAction");
              }
            }
          }, true, clipId, true);
        },
        (message) => {
          quickSaveSelectedClipsButton.disabled = false;
          pendingQuickSaveBatch = null;
          setResult(message, "error");
          if (guidedTourActive && guidedTourStep === "saving") {
            guidedTourBusy = false;
            setGuidedTourStep("saveAction");
          }
        }
      );
    }

    extraClipActionsToggle.addEventListener("click", () => {
      const expanded = extraClipActionsToggle.getAttribute("aria-expanded") !== "true";
      extraClipActionsToggle.setAttribute("aria-expanded", String(expanded));
      extraClipActions.hidden = !expanded;
    });

    quickSaveSelectedClipsButton.addEventListener("click", () => {
      if (!favoriteFolders.some((folder) => folder.id === selectedFolderId)) {
        setResult("Open a collection folder before saving.", "error");
        return;
      }
      pendingQuickSaveBatch = {
        folderId: selectedFolderId,
        savePosition: saveDefaultPosition.checked,
        saveScale: saveDefaultScale.checked,
        saveAudio: saveDefaultAudio.checked,
        savedCount: 0,
        skippedLongClipCount: 0,
        failures: [],
        longClipWarnings: [],
        lastClipId: ""
      };
      if (guidedTourActive && guidedTourStep === "saveAction") {
        guidedTourBusy = true;
        setGuidedTourStep("saving");
      }
      runQuickSaveBatch();
    });

    saveClipCurrentLocationButton.addEventListener("click", () => {
      saveClipToFolder(saveClipSelectedFolderId || saveClipPickerFolderId);
    });
    saveClipSceneLocationButton.addEventListener("click", () => {
      saveClipToFolder(saveClipCurrentFolderId);
    });
    saveClipNewFolderButton.addEventListener("click", () => {
      const parentFolderId = saveClipSelectedFolderId || saveClipPickerFolderId;
      if (saveClipFolderSearch.value) {
        saveClipFolderSearch.value = "";
        renderSaveClipFolderPicker();
      }
      if (parentFolderId) expandedSaveClipFolderIds.add(parentFolderId);
      getFolderTrail(parentFolderId).forEach((folder) => expandedSaveClipFolderIds.add(folder.id));
      beginFolderCreation(parentFolderId);
    });
    saveClipFolderSearch.addEventListener("input", () => {
      collapsedSaveClipSearchFolderIds.clear();
      renderSaveClipFolderPicker();
    });
    cancelSaveClipButton.addEventListener("click", () => {
      saveClipDialog.hidden = true;
      clearSelectedClipCapture();
    });
    saveLongClipButton.addEventListener("click", () => {
      if (pendingQuickSaveBatch) {
        const nextIndex = pendingQuickSaveBatch.nextLayerIndex;
        longClipConfirmation.hidden = true;
        runQuickSaveBatch(nextIndex, true);
        return;
      }
      longClipConfirmation.hidden = true;
      saveClipToFolder(saveClipSelectedFolderId || saveClipPickerFolderId, true);
    });
    shortenLongClipButton.addEventListener("click", () => {
      if (pendingQuickSaveBatch) {
        pendingQuickSaveBatch.skippedLongClipCount++;
        const nextIndex = pendingQuickSaveBatch.nextLayerIndex + 1;
        longClipConfirmation.hidden = true;
        runQuickSaveBatch(nextIndex, false);
        return;
      }
      longClipConfirmation.hidden = true;
      clearSelectedClipCapture();
      setResult("Clip was not saved. Shorten it in After Effects, then save it again.", "");
    });
    saveFirst10SecondsButton.addEventListener("click", () => {
      if (pendingQuickSaveBatch) {
        const nextIndex = pendingQuickSaveBatch.nextLayerIndex;
        longClipConfirmation.hidden = true;
        runQuickSaveBatch(nextIndex, false, true);
        return;
      }
      longClipConfirmation.hidden = true;
      saveClipToFolder(saveClipSelectedFolderId || saveClipPickerFolderId, false, true);
    });
    longClipConfirmation.addEventListener("click", (event) => {
      if (event.target === longClipConfirmation) {
        longClipConfirmation.hidden = true;
        pendingQuickSaveBatch = null;
        quickSaveSelectedClipsButton.disabled = false;
        clearSelectedClipCapture();
        setResult("Clip was not saved. Shorten it in After Effects, then save it again.", "");
      }
    });

    confirmClipReplacementButton.addEventListener("click", () => {
      if (pendingClipReplacementIndex === null) return;
      const replacementIndex = pendingClipReplacementIndex;
      pendingClipReplacementIndex = null;
      replaceClipConfirmation.hidden = true;
      callAE("confirmClipFavoriteReplacement()", "Clip replaced.", (response) => {
        expandedSaveClipFolderIds.clear();
        refreshFavorites(false, response, replacementIndex, undefined, false, undefined, true);
      });
    });

    cancelClipReplacementButton.addEventListener("click", cancelPendingClipReplacement);

    replaceClipConfirmation.addEventListener("click", (event) => {
      if (event.target === replaceClipConfirmation) cancelPendingClipReplacement();
    });

    saveClipDialog.addEventListener("click", (event) => {
      if (event.target === saveClipDialog) {
        saveClipDialog.hidden = true;
        clearSelectedClipCapture();
      }
    });

    librarySearch.addEventListener("input", () => {
      syncSearchClearButtons();
      hideDeleteConfirmation();
      selectedFavoriteStorageIndex = null;
      selectedLibraryItemKey = "";
      folderCreateRow.hidden = true;
      renderFavoriteClips();
    });

    function syncClipSortMenu() {
      const modeLabels = {
        footage: "Footage and In point",
        manual: "Manual order",
        inserted: "Most inserted",
        leastInserted: "Least inserted",
        recent: "Recently added"
      };
      clipSortMenu.querySelectorAll("[data-sort-mode]").forEach((button) => {
        button.setAttribute("aria-checked", String(button.dataset.sortMode === clipSortMode));
      });
      clipSortMenuToggle.title = `Sort clips: ${modeLabels[clipSortMode] || modeLabels.manual}`;
      clipSortMenuToggle.setAttribute("aria-label", clipSortMenuToggle.title);
      clipSortMenuToggle.setAttribute("aria-pressed", String(!clipSortMenu.hidden));
    }

    function selectManualSortForReordering() {
      if (clipSortMode !== "manual") {
        clipSortMode = "manual";
        try {
          window.localStorage.setItem(CLIP_SORT_MODE_STORAGE_KEY, clipSortMode);
        } catch (error) {
          // Manual order still applies for this session when storage is unavailable.
        }
        syncClipSortMenu();
        renderFavoriteClips();
      }
    }

    function requestManualSortForReordering(openDialog) {
      if (clipSortMode === "manual") {
        openDialog();
        return;
      }
      pendingManualReorderOpen = openDialog;
      manualReorderConfirmation.hidden = false;
      cancelManualReorderButton.focus();
    }

    function closeClipSortMenu(returnFocus) {
      clipSortMenu.hidden = true;
      clipSortMenuToggle.setAttribute("aria-expanded", "false");
      syncClipSortMenu();
      if (returnFocus) clipSortMenuToggle.focus();
    }

    clipSortMenuToggle.addEventListener("click", () => {
      const shouldOpen = clipSortMenu.hidden;
      clipSortMenu.hidden = !shouldOpen;
      clipSortMenuToggle.setAttribute("aria-expanded", String(shouldOpen));
      syncClipSortMenu();
      if (shouldOpen) clipSortMenu.querySelector("[data-sort-mode]").focus();
    });
    clipSortMenu.querySelectorAll("[data-sort-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        clipSortMode = ["manual", "inserted", "leastInserted", "recent", "footage"].includes(button.dataset.sortMode)
          ? button.dataset.sortMode
        : "footage";
        try {
          window.localStorage.setItem(CLIP_SORT_MODE_STORAGE_KEY, clipSortMode);
        } catch (error) {
          // Sorting remains available for the current session.
        }
        closeClipSortMenu(true);
        renderFavoriteClips();
      });
    });
    clipSortMenu.addEventListener("keydown", (event) => {
      const options = Array.from(clipSortMenu.querySelectorAll("[data-sort-mode]"));
      const currentIndex = options.indexOf(document.activeElement);
      let nextIndex = currentIndex;
      if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % options.length;
      else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + options.length) % options.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = options.length - 1;
      else if (event.key === "Escape") {
        event.preventDefault();
        closeClipSortMenu(true);
        return;
      } else {
        return;
      }
      event.preventDefault();
      options[nextIndex].focus();
    });
    document.addEventListener("click", (event) => {
      if (!clipSortMenuControl.contains(event.target) && !clipSortMenu.hidden) closeClipSortMenu(false);
    });

    missingFootageButton.addEventListener("click", () => refreshFootageStatus(openMissingFootageList));
    document.getElementById("missing-footage-close").addEventListener("click", () => {
      missingFootageModal.hidden = true;
    });
    document.getElementById("missing-footage-done").addEventListener("click", () => {
      missingFootageModal.hidden = true;
    });
    missingFootageModal.addEventListener("click", (event) => {
      if (event.target === missingFootageModal) missingFootageModal.hidden = true;
    });

    clearLibrarySearch.addEventListener("click", () => {
      librarySearch.value = "";
      librarySearch.dispatchEvent(new Event("input", { bubbles: true }));
      librarySearch.focus();
    });

    function openFolderCreateDialog(parentFolderId = selectedFolderId) {
      pendingFolderCreateParentId = parentFolderId || "";
      folderCreateName.value = "";
      folderCreateDialog.hidden = false;
      folderCreateName.focus();
      folderCreateName.select();
      if (guidedTourActive && guidedTourStep === "organize") {
        setGuidedTourDynamicTarget(folderCreateName);
      }
    }

    function closeFolderCreateDialog() {
      pendingFolderCreateParentId = "";
      folderCreateDialog.hidden = true;
      if (guidedTourActive && guidedTourStep === "organize") {
        setGuidedTourDynamicTarget(favoriteList, true);
        guidedTourNextButton.focus();
      }
    }

    function beginFolderCreation(parentFolderId = selectedFolderId) {
      if (librarySearch.value.trim()) return;
      folderCreateRow.hidden = true;
      openFolderCreateDialog(parentFolderId);
    }

    createFolderToggle.addEventListener("click", () => {
      if (folderCreateDialog.hidden) {
        beginFolderCreation();
      } else {
        closeFolderCreateDialog();
      }
    });

    function createFolder() {
      const name = folderCreateName.value.trim();
      if (!name) return;
      const createdFromSaveDialog = !saveClipDialog.hidden;
      const parentId = pendingFolderCreateParentId;
      const id = `folder-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const encodedId = JSON.stringify(encodeURIComponent(id));
      const encodedName = JSON.stringify(encodeURIComponent(name));
      const encodedPath = JSON.stringify(encodeURIComponent(""));
      const encodedParentId = JSON.stringify(encodeURIComponent(parentId));
      callAE(`createClipFolder(${encodedId}, ${encodedName}, ${encodedPath}, ${encodedParentId})`, "", (response) => {
        folderCreateName.value = "";
        closeFolderCreateDialog();
        if (!createdFromSaveDialog) {
          selectedFolderId = parentId;
          selectedFootagePath = "";
          selectedFavoriteStorageIndex = null;
          selectedLibraryItemKey = `folder:${id}`;
          selectedLibraryKeys = new Set([selectedLibraryItemKey]);
          librarySearch.value = "";
          syncSearchClearButtons();
        }
        refreshFavoriteFolders(() => {
          if (createdFromSaveDialog) {
            saveClipPickerFolderId = parentId || "";
            saveClipSelectedFolderId = id;
            renderSaveClipFolderPicker();
            requestAnimationFrame(() => scrollSaveClipFolderIntoView(id));
          } else {
            requestAnimationFrame(() => scrollLibraryItemIntoView(`folder:${id}`));
            if (guidedTourActive && guidedTourStep === "organize") {
              requestAnimationFrame(() => setGuidedTourDynamicTarget(guidedTourNextButton));
            }
          }
          setResult(response || `Created folder: ${name}`, "success");
        });
      });
    }

    createFolderButton.addEventListener("click", createFolder);
    confirmFolderCreateButton.addEventListener("click", createFolder);
    cancelFolderCreateButton.addEventListener("click", closeFolderCreateDialog);
    folderCreateName.addEventListener("input", () => {
      if (guidedTourActive && guidedTourStep === "organize") {
        setGuidedTourDynamicTarget(folderCreateName.value.trim() ? confirmFolderCreateButton : folderCreateName);
      }
    });
    folderCreateName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        createFolder();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeFolderCreateDialog();
      }
    });
    newFolderName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        createFolder();
      }
    });

    confirmRenameButton.addEventListener("click", finishRename);
    cancelRenameButton.addEventListener("click", () => {
      renameDialog.hidden = true;
      pendingRenameTarget = null;
    });
    renameDialogInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finishRename();
      }
    });
    renameDialog.addEventListener("click", (event) => {
      if (event.target === renameDialog) {
        renameDialog.hidden = true;
        pendingRenameTarget = null;
      }
    });
    confirmClipEditButton.addEventListener("click", saveClipEdit);
    cancelClipEditButton.addEventListener("click", closeClipEditDialog);
    clipEditDialog.addEventListener("click", (event) => {
      if (event.target === clipEditDialog) closeClipEditDialog();
    });
    clipEditDialog.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.target.tagName === "INPUT") {
        event.preventDefault();
        saveClipEdit();
      }
    });

    document.addEventListener("click", closeLibraryContextMenu);
    document.addEventListener("contextmenu", (event) => {
      const isLibraryWhitespace = event.target.closest(".favorites-section") &&
        !event.target.closest("button, input, select, textarea, a, .favorite-result-item, .library-tab-item, .library-context-menu");
      if (isLibraryWhitespace) {
        const actions = [];
        actions.push({ label: "Save Workspace", run: () => focusWorkspaceSettings("save") });
        actions.push({ label: "Open Workspace", run: () => focusWorkspaceSettings("open") });
        if (copiedLibraryEntries.length) {
          actions.push({ label: "Paste", run: pasteCopiedEntries });
        }
        if (!librarySearch.value.trim() && !clipReorderRequestActive &&
            getLibraryCollectionEntries(selectedFolderId).length > 1) {
          actions.push({ label: "Reorder Clips & Folders", run: openCollectionReorderDialog });
        }
        if (!librarySearch.value.trim()) {
          actions.push({ label: "New Folder", run: () => beginFolderCreation() });
        }
        if (actions.length) {
          openLibraryContextMenu(event, actions);
        } else {
          closeLibraryContextMenu();
        }
        return;
      }
      if (!event.target.closest(".favorite-result, .clip-more-button, .library-breadcrumb button")) closeLibraryContextMenu();
    });

    insertFavoriteButton.addEventListener("click", () => {
      const record = getSelectedFavorite();
      if (!record) {
        setResult("Select a clip first.", "error");
        return;
      }
      const isGuidedTutorialInsert = guidedTourActive && guidedTourStep === "insert";
      insertFavoriteRecord(record, (response) => {
        setResult(response || "Clip inserted.", "success");
        if (isGuidedTutorialInsert && guidedTourActive) setGuidedTourStep("search");
      });
    });

    function syncRandomMarkerSourceUI() {
      randomMarkerCustomFolders.hidden = false;
      renderRandomMarkerFolderTree();
    }

    function renderRandomMarkerFolderTree() {
      randomMarkerFolderTree.innerHTML = "";
      const query = randomMarkerFolderSearch.value.trim().toLocaleLowerCase();
      const foldersByParent = new Map();
      favoriteFolders.forEach((folder) => {
        const parentId = favoriteFolders.some((candidate) => candidate.id === folder.parentId) ? folder.parentId : "";
        if (!foldersByParent.has(parentId)) foldersByParent.set(parentId, []);
        foldersByParent.get(parentId).push(folder);
      });
      foldersByParent.forEach((folders, parentId) => foldersByParent.set(parentId, sortFolderRecords(folders)));

      const subtreeMatches = (folder) => {
        const trail = getFolderTrail(folder.id).map((entry) => entry.name).join(" / ").toLocaleLowerCase();
        if (!query || trail.includes(query)) return true;
        return (foldersByParent.get(folder.id) || []).some(subtreeMatches);
      };

      const appendFolder = (folder, depth) => {
        const children = foldersByParent.get(folder.id) || [];
        const visibleChildren = children.filter(subtreeMatches);
        const isExpanded = Boolean(query) || expandedRandomMarkerFolderIds.has(folder.id);
        const node = document.createElement("div");
        node.className = "random-marker-folder-node";
        const row = document.createElement("div");
        row.className = "random-marker-folder-row";
        row.style.setProperty("--folder-depth", String(depth));
        if (children.length) {
          const disclosure = document.createElement("button");
          disclosure.type = "button";
          disclosure.className = "random-marker-folder-disclosure";
          disclosure.textContent = isExpanded ? "▾" : "▸";
          disclosure.setAttribute("aria-expanded", String(isExpanded));
          disclosure.setAttribute("aria-label", `${isExpanded ? "Collapse" : "Expand"} ${folder.name}`);
          disclosure.addEventListener("click", () => {
            if (expandedRandomMarkerFolderIds.has(folder.id)) expandedRandomMarkerFolderIds.delete(folder.id);
            else expandedRandomMarkerFolderIds.add(folder.id);
            renderRandomMarkerFolderTree();
          });
          row.appendChild(disclosure);
        } else {
          const spacer = document.createElement("span");
          spacer.className = "random-marker-folder-spacer";
          row.appendChild(spacer);
        }

        const label = document.createElement("label");
        label.className = "random-marker-folder-choice";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        const ancestorFolders = getFolderTrail(folder.id).slice(0, -1);
        let inheritedSelection = false;
        ancestorFolders.forEach((ancestor) => {
          if (randomMarkerSelectedFolderIds.has(ancestor.id)) inheritedSelection = true;
          if (randomMarkerExcludedFolderIds.has(ancestor.id)) inheritedSelection = false;
        });
        checkbox.checked = randomMarkerSelectedFolderIds.has(folder.id) || (!randomMarkerExcludedFolderIds.has(folder.id) && inheritedSelection);
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            randomMarkerSelectedFolderIds.add(folder.id);
            randomMarkerExcludedFolderIds.delete(folder.id);
          } else {
            randomMarkerSelectedFolderIds.delete(folder.id);
            if (inheritedSelection) randomMarkerExcludedFolderIds.add(folder.id);
            else randomMarkerExcludedFolderIds.delete(folder.id);
          }
          renderRandomMarkerFolderTree();
          saveRandomMarkerInsertSettings();
        });
        const name = document.createElement("span");
        name.textContent = folder.name;
        name.title = getFolderTrail(folder.id).map((entry) => entry.name).join(" / ");
        label.append(checkbox, name);
        row.appendChild(label);
        node.appendChild(row);

        if (visibleChildren.length && isExpanded) {
          const childList = document.createElement("div");
          childList.className = "random-marker-folder-children";
          visibleChildren.forEach((child) => childList.appendChild(appendFolder(child, depth + 1)));
          node.appendChild(childList);
        }
        return node;
      };

      const rootFolders = foldersByParent.get("") || [];
      if (!rootFolders.length) {
        const empty = document.createElement("p");
        empty.className = "random-marker-folder-empty";
        empty.textContent = "No folders have been created.";
        randomMarkerFolderTree.appendChild(empty);
        return;
      }
      const visibleRoots = rootFolders.filter(subtreeMatches);
      if (!visibleRoots.length) {
        const empty = document.createElement("p");
        empty.className = "random-marker-folder-empty";
        empty.textContent = query ? "No matching folders." : "No folders have been created.";
        randomMarkerFolderTree.appendChild(empty);
        return;
      }
      visibleRoots.forEach((folder) => randomMarkerFolderTree.appendChild(appendFolder(folder, 0)));
    }

    randomMarkerFolderSearch.addEventListener("input", renderRandomMarkerFolderTree);

    function loadRandomMarkerInsertSettings() {
      let saved = {};
      try {
        saved = JSON.parse(window.localStorage.getItem(RANDOM_MARKER_INSERT_SETTINGS_KEY) || "{}");
      } catch (error) {}
      const savedRecentPresets = Array.isArray(saved.recentTwixtorPresets)
        ? saved.recentTwixtorPresets
        : (typeof saved.twixtorPresetPath === "string" && saved.twixtorPresetPath ? [saved.twixtorPresetPath] : []);
      randomMarkerRecentTwixtorPresets = Array.from(new Set(savedRecentPresets.filter((path) => typeof path === "string" && path))).slice(0, 10);
      const lastUsedPreset = typeof saved.lastUsedTwixtorPresetPath === "string" ? saved.lastUsedTwixtorPresetPath : "";
      if (lastUsedPreset) {
        randomMarkerRecentTwixtorPresets = [lastUsedPreset, ...randomMarkerRecentTwixtorPresets.filter((path) => path !== lastUsedPreset)].slice(0, 10);
      }
      randomMarkerSkipNames.value = "";
      randomMarkerSkippedNames = [];
      randomMarkerSkipEntry.value = "";
      randomMarkerAvailableNames = [];
      randomMarkerNameOptions.hidden = true;
      randomMarkerCloseMarkerSuggestions = [];
      renderRandomMarkerSkipChips();
      randomMarkerSelectedFolderIds.clear();
      randomMarkerExcludedFolderIds.clear();
      randomMarkerCreatePrecomps.checked = true;
      randomMarkerTwixtorPresetPath = lastUsedPreset || randomMarkerRecentTwixtorPresets[0] || "";
      randomMarkerPresetPicker.hidden = !randomMarkerCreatePrecomps.checked;
      updateRandomMarkerPresetLabel();
      saveRandomMarkerInsertSettings();
    }

    function saveRandomMarkerInsertSettings() {
      try {
        window.localStorage.setItem(RANDOM_MARKER_INSERT_SETTINGS_KEY, JSON.stringify({
          recentTwixtorPresets: randomMarkerRecentTwixtorPresets.slice(0, 10),
          lastUsedTwixtorPresetPath: randomMarkerTwixtorPresetPath
        }));
      } catch (error) {
        // Preset history stays in memory for the current panel session.
      }
    }

    function syncRandomMarkerSkipNamesValue() {
      randomMarkerSkipNames.value = randomMarkerSkippedNames.join(", ");
    }

    function renderRandomMarkerSkipChips() {
      randomMarkerSkipChips.replaceChildren();
      randomMarkerSkippedNames.forEach((name) => {
        const chip = document.createElement("span");
        chip.className = "random-marker-skip-chip";
        const text = document.createElement("span");
        text.textContent = name;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "random-marker-skip-chip-remove";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Remove ${name}`);
        remove.addEventListener("click", () => {
          randomMarkerSkippedNames = randomMarkerSkippedNames.filter((entry) => entry.toLocaleLowerCase() !== name.toLocaleLowerCase());
          syncRandomMarkerSkipNamesValue();
          renderRandomMarkerSkipChips();
        });
        chip.append(text, remove);
        randomMarkerSkipChips.appendChild(chip);
      });
      syncRandomMarkerSkipNamesValue();
    }

    function renderRandomMarkerNameOptions() {
      const query = randomMarkerSkipEntry.value.trim().toLocaleLowerCase();
      randomMarkerNameOptions.replaceChildren();
      if (!query) {
        randomMarkerNameOptions.hidden = true;
        return;
      }
      const alreadySkipped = new Set(randomMarkerSkippedNames.map((name) => name.toLocaleLowerCase()));
      const matches = randomMarkerAvailableNames
        .filter((name) => name.toLocaleLowerCase().includes(query) && !alreadySkipped.has(name.toLocaleLowerCase()))
        .slice(0, 8);
      matches.forEach((name) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "random-marker-name-option";
        option.setAttribute("role", "option");
        option.textContent = name;
        option.addEventListener("click", () => addRandomMarkerSkipName(name));
        randomMarkerNameOptions.appendChild(option);
      });
      randomMarkerNameOptions.hidden = !matches.length;
    }

    function addRandomMarkerSkipName(name) {
      const markerName = randomMarkerAvailableNames.find((entry) => entry.toLocaleLowerCase() === String(name || "").trim().toLocaleLowerCase());
      if (!markerName || randomMarkerSkippedNames.some((entry) => entry.toLocaleLowerCase() === markerName.toLocaleLowerCase())) return false;
      randomMarkerSkippedNames.push(markerName);
      randomMarkerSkipEntry.value = "";
      randomMarkerNameOptions.hidden = true;
      renderRandomMarkerSkipChips();
      randomMarkerSkipEntry.focus();
      return true;
    }

    function commitRandomMarkerSkipEntry() {
      const query = randomMarkerSkipEntry.value.trim().toLocaleLowerCase();
      if (!query) return;
      const exact = randomMarkerAvailableNames.find((name) => name.toLocaleLowerCase() === query);
      if (exact) {
        addRandomMarkerSkipName(exact);
        return;
      }
      const matches = randomMarkerAvailableNames.filter((name) => name.toLocaleLowerCase().includes(query));
      if (matches.length === 1) addRandomMarkerSkipName(matches[0]);
      else renderRandomMarkerNameOptions();
    }

    function openRandomMarkerDialog(mode) {
      randomMarkerDialogMode = mode === "replaceSelected" || mode === "replaceSelectedSources" ? mode : "insert";
      loadRandomMarkerInsertSettings();
      randomMarkerFolderSearch.value = "";
      expandedRandomMarkerFolderIds.clear();
      const replacingSelectedClip = randomMarkerDialogMode === "replaceSelected" || randomMarkerDialogMode === "replaceSelectedSources";
      randomMarkerInsertDialog.classList.toggle("replace-selected-mode", replacingSelectedClip);
      randomMarkerInsertTitle.textContent = randomMarkerDialogMode === "replaceSelectedSources" ? "Choose replacement folders" : replacingSelectedClip ? "Replace clips in selected precomps" : "Random clips between markers";
      randomMarkerInsertRunButton.textContent = randomMarkerDialogMode === "replaceSelectedSources" ? "Replace selected" : replacingSelectedClip ? "Replace Clips" : "Insert Between Markers";
      randomMarkerReplaceCurrentFolderButton.hidden = !replacingSelectedClip;
      randomMarkerReplaceCurrentFolderButton.disabled = true;
      randomMarkerInsertHelp.dataset.tooltip = replacingSelectedClip
        ? "Select one or more precomp layers in After Effects. Each selected precomp's existing clip layers are removed when a replacement clip is successfully inserted. Choose source folders manually, or use the separate button to use the folder currently open in the clip library."
        : "Finds markers in the active composition and inserts one random saved clip between each consecutive pair. Clips are trimmed to fit.";
      randomMarkerInsertHelp.setAttribute("aria-label", replacingSelectedClip ? "About adding clips to selected precomps" : "About inserting random clips between markers");
      randomMarkerSkipEntry.value = "";
      syncRandomMarkerSourceUI();
      const prepareSelectedClipFolders = () => {
        if (!replacingSelectedClip) return;
        randomMarkerSelectedFolderIds.clear();
        randomMarkerExcludedFolderIds.clear();
        const currentFolder = favoriteFolders.find((folder) => folder.id === selectedFolderId);
        randomMarkerReplaceCurrentFolderButton.hidden = !currentFolder;
        randomMarkerReplaceCurrentFolderButton.disabled = !currentFolder;
        if (currentFolder) {
          randomMarkerReplaceCurrentFolderButton.textContent = `Replace from ${currentFolder.name}`;
          randomMarkerReplaceCurrentFolderButton.title = `Replace using clips from ${currentFolder.name}`;
        }
        renderRandomMarkerFolderTree();
      };
      randomMarkerSkipSuggestions.hidden = true;
      const insertDialogContent = randomMarkerInsertDialog.querySelector(".random-marker-dialog-content");
      randomMarkerInsertDialog.hidden = false;
      try { randomMarkerInsertRunButton.focus({ preventScroll: true }); }
      catch (focusError) { randomMarkerInsertRunButton.focus(); }
      if (insertDialogContent) {
        insertDialogContent.scrollTop = 0;
        requestAnimationFrame(() => {
          if (!randomMarkerInsertDialog.hidden) insertDialogContent.scrollTop = 0;
        });
      }
      if (!favoriteFoldersLoaded) refreshFavoriteFolders(() => {
        if (replacingSelectedClip) prepareSelectedClipFolders();
        else renderRandomMarkerFolderTree();
      });
      else if (replacingSelectedClip) prepareSelectedClipFolders();
      if (replacingSelectedClip) return;
      callAE("getRandomMarkerNames()", "", (response) => {
        if (randomMarkerInsertDialog.hidden || response.indexOf("MARKER_NAMES|") !== 0) return;
        try { randomMarkerAvailableNames = JSON.parse(decodeURIComponent(response.substring("MARKER_NAMES|".length))); }
        catch (error) { randomMarkerAvailableNames = []; }
        if (randomMarkerSkipEntry.value.trim()) renderRandomMarkerNameOptions();
      });
      callAE("getRandomMarkerSkipSuggestions()", "", (response) => {
        if (randomMarkerInsertDialog.hidden || response.indexOf("MARKER_SKIP_SUGGESTIONS|") !== 0) return;
        const suggestions = response.substring("MARKER_SKIP_SUGGESTIONS|".length)
          .split("|")
          .filter(Boolean)
          .map((name) => decodeURIComponent(name));
        randomMarkerCloseMarkerSuggestions = suggestions;
        if (!suggestions.length) return;
        randomMarkerSkipSuggestionCopy.textContent = `Close beat markers found: ${suggestions.join(", ")}`;
        randomMarkerSkipSuggestions.hidden = false;
      });
    }
    randomMarkerInsertOpenButton.addEventListener("click", () => openRandomMarkerDialog("insert"));
    replaceSelectedClipOpenButton.addEventListener("click", openSelectedClipReplaceList);
    quickReplaceSelectedClipButton.addEventListener("click", () => {
      quickReplaceSelectedClipButton.disabled = true;
      callAE("quickReplaceSelectedClip()", "", (response) => {
        quickReplaceSelectedClipButton.disabled = false;
        const fields = String(response || "").split("|");
        if (fields[0] !== "QUICK_REPLACE_DONE") {
          setResult(response || "Quick Replace could not replace the selected clips.", "error");
          return;
        }
        let replacedIds = [];
        let failures = "";
        try {
          replacedIds = JSON.parse(decodeURIComponent(fields[2] || "%5B%5D"));
          failures = decodeURIComponent(fields[3] || "");
        } catch (error) {
          failures = fields[3] || "Could not read the replacement result.";
        }
        replacedIds.forEach((clipId) => {
          const record = favoriteRecords.find((entry) => entry.clipId === clipId);
          if (!record) return;
          const key = getClipTrackingKey(record);
          const data = clipTrackingData[key] || { addedAt: Date.now(), randomRank: Math.random() };
          data.insertCount = Math.max(0, Number(data.insertCount) || 0) + 1;
          clipTrackingData[key] = data;
        });
        saveClipTrackingData();
        renderFavoriteClips();
        const success = `Quick-replaced ${replacedIds.length} clip${replacedIds.length === 1 ? "" : "s"}.`;
        setResult(failures ? `${success} ${failures}` : success, failures ? "warning" : "success");
      }, (message) => {
        quickReplaceSelectedClipButton.disabled = false;
        setResult(message, "error");
      });
    });
    randomMarkerSkipEntry.addEventListener("input", renderRandomMarkerNameOptions);
    randomMarkerSkipEntry.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === "," || event.key === ";") {
        event.preventDefault();
        commitRandomMarkerSkipEntry();
      } else if (event.key === "Backspace" && !randomMarkerSkipEntry.value && randomMarkerSkippedNames.length) {
        randomMarkerSkippedNames.pop();
        renderRandomMarkerSkipChips();
      } else if (event.key === "Escape") {
        randomMarkerNameOptions.hidden = true;
      }
    });
    randomMarkerSkipSuggestionAdd.addEventListener("click", () => {
      randomMarkerCloseMarkerSuggestions.forEach(addRandomMarkerSkipName);
      randomMarkerSkipEntry.focus();
    });
    randomMarkerInsertCancelButton.addEventListener("click", () => {
      if (closeRandomMarkerSourcePicker()) return;
      randomMarkerInsertDialog.hidden = true;
    });
    randomMarkerCreatePrecomps.addEventListener("change", () => {
      randomMarkerPresetPicker.hidden = !randomMarkerCreatePrecomps.checked;
    });
    function updateRandomMarkerPresetLabel() {
      const presetPath = String(randomMarkerTwixtorPresetPath || "").replace(/\\/g, "/");
      randomMarkerPresetName.textContent = presetPath ? presetPath.substring(presetPath.lastIndexOf("/") + 1) : "No preset selected";
      randomMarkerPresetName.title = randomMarkerTwixtorPresetPath || "No preset selected";
      randomMarkerPresetClearButton.disabled = !randomMarkerTwixtorPresetPath;
      randomMarkerPresetRecentSelect.replaceChildren();
      const noneOption = document.createElement("option");
      noneOption.value = "";
      noneOption.textContent = "No preset";
      randomMarkerPresetRecentSelect.appendChild(noneOption);
      randomMarkerRecentTwixtorPresets.forEach((path) => {
        const option = document.createElement("option");
        option.value = path;
        option.textContent = path.replace(/\\/g, "/").split("/").pop();
        option.title = path;
        randomMarkerPresetRecentSelect.appendChild(option);
      });
      randomMarkerPresetRecentSelect.value = randomMarkerTwixtorPresetPath;
    }

    randomMarkerPresetRecentSelect.addEventListener("change", () => {
      randomMarkerTwixtorPresetPath = randomMarkerPresetRecentSelect.value;
      if (randomMarkerTwixtorPresetPath) {
        randomMarkerRecentTwixtorPresets = [randomMarkerTwixtorPresetPath, ...randomMarkerRecentTwixtorPresets.filter((path) => path !== randomMarkerTwixtorPresetPath)].slice(0, 10);
      }
      updateRandomMarkerPresetLabel();
      saveRandomMarkerInsertSettings();
    });

    randomMarkerPresetChooseButton.addEventListener("click", () => {
      randomMarkerPresetChooseButton.disabled = true;
      callAE("chooseTwixtorPresetFile()", "", (response) => {
        randomMarkerPresetChooseButton.disabled = false;
        if (response === "TWIXTOR_PRESET_CANCELLED") return;
        if (response.indexOf("TWIXTOR_PRESET|") !== 0) {
          setResult(response || "Could not select a Twixtor preset.", "error");
          return;
        }
        try {
          randomMarkerTwixtorPresetPath = decodeURIComponent(response.substring("TWIXTOR_PRESET|".length));
        } catch (error) {
          setResult("The selected preset path could not be read.", "error");
          return;
        }
        randomMarkerRecentTwixtorPresets = [randomMarkerTwixtorPresetPath, ...randomMarkerRecentTwixtorPresets.filter((path) => path !== randomMarkerTwixtorPresetPath)].slice(0, 10);
        updateRandomMarkerPresetLabel();
        saveRandomMarkerInsertSettings();
      }, (message) => {
        randomMarkerPresetChooseButton.disabled = false;
        setResult(message, "error");
      });
    });
    randomMarkerPresetClearButton.addEventListener("click", () => {
      randomMarkerTwixtorPresetPath = "";
      updateRandomMarkerPresetLabel();
      saveRandomMarkerInsertSettings();
    });
    function updateRandomMarkerDeleteButtons() {
      const precompSlots = randomMarkerReplaceSlots.filter((slot) => slot.precomp);
      const selectedKeys = new Set(Array.from(randomMarkerReplaceList.querySelectorAll("input:checked"), (checkbox) => checkbox.dataset.slotKey));
      const selectedPrecompCount = precompSlots.filter((slot) => selectedKeys.has(slot.key)).length;
      randomMarkerDeleteSelectedPrecompsButton.hidden = !precompSlots.length;
      randomMarkerDeleteSelectedPrecompsButton.disabled = selectedPrecompCount === 0;
    }
    function renderRandomMarkerReplaceList() {
      randomMarkerReplaceList.replaceChildren();
      randomMarkerReplaceSlots.forEach((slot) => {
        const row = document.createElement("label");
        row.className = "random-marker-replace-row";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.dataset.slotKey = slot.key;
        checkbox.addEventListener("change", () => {
          updateRandomMarkerDeleteButtons();
        });
        const copy = document.createElement("span");
        copy.textContent = `${slot.markerLabel || `Marker · ${Number(slot.time).toFixed(2)}s`} — ${slot.name}`;
        copy.title = `${slot.markerLabel || "Marker interval"} · ${slot.name}`;
        row.append(checkbox, copy);
        randomMarkerReplaceList.appendChild(row);
      });
      randomMarkerReplaceSelectedButton.disabled = !randomMarkerReplaceSlots.length;
      updateRandomMarkerDeleteButtons();
    }
    function openSelectedClipReplaceList() {
      pendingManualReplaceSlots = null;
      replaceSelectedClipOpenButton.disabled = true;
      callAE("prepareSelectedClipReplaceSlots()", "", (response) => {
        replaceSelectedClipOpenButton.disabled = false;
        if (String(response || "").indexOf("SELECTED_CLIP_REPLACE_SLOTS|") !== 0) {
          setResult(response || "Could not open the selected clips for replacement.", "error");
          return;
        }
        try {
          randomMarkerReplaceSlots = JSON.parse(decodeURIComponent(String(response).substring("SELECTED_CLIP_REPLACE_SLOTS|".length)));
        } catch (error) {
          randomMarkerReplaceSlots = [];
          setResult("The selected clips could not be read.", "error");
          return;
        }
        if (!randomMarkerReplaceSlots.length) {
          setResult("Select at least one clip or precomp layer.", "error");
          return;
        }
        randomMarkerReplaceMode = "selected";
        randomMarkerReplaceChooseClipButton.disabled = false;
        randomMarkerReplaceChooseClipButton.textContent = lastSelectedClipReplacementFolders
          ? "Source folders ✓"
          : "Choose source folders";
        randomMarkerReplaceChooseClipButton.title = lastSelectedClipReplacementFolders
          ? "Choose different source folders"
          : "Choose which folders Quick Replace uses";
        document.getElementById("random-marker-replace-title").textContent = "Replace selected clips";
        randomMarkerReplaceFolderSelection = "";
        renderRandomMarkerReplaceList();
        randomMarkerReplaceList.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
          checkbox.checked = true;
        });
        updateRandomMarkerDeleteButtons();
        randomMarkerReplaceDialog.hidden = false;
        startRandomMarkerSelectionSync();
      }, (message) => {
        replaceSelectedClipOpenButton.disabled = false;
        setResult(message, "error");
      });
    }

    function getQuickReplaceSourceClipIds(sourceFolderSelection) {
      if (!sourceFolderSelection) return [];
      let selection;
      try { selection = JSON.parse(sourceFolderSelection); } catch (error) { return []; }
      const included = new Set(Array.isArray(selection) ? selection : (selection.include || []));
      const excluded = new Set(Array.isArray(selection) ? [] : (selection.exclude || []));
      const isIncluded = (folderId) => {
        let currentId = String(folderId || "");
        const visited = new Set();
        while (currentId && !visited.has(currentId)) {
          if (excluded.has(currentId)) return false;
          if (included.has(currentId)) return true;
          visited.add(currentId);
          const folder = favoriteFolders.find((entry) => entry.id === currentId);
          currentId = folder ? String(folder.parentId || "") : "";
        }
        return false;
      };
      return favoriteRecords
        .filter((record) => record.clipId && isIncluded(record.folderId))
        .map((record) => String(record.clipId));
    }

    function replaceSelectedClipSlots(slots, manualClipId, reopenAfterManualPick, sourceFolderSelection, protectedMenuSlots) {
      if (!slots.length) {
        setResult("Select at least one clip to replace.", "error");
        return;
      }
      const checkedSlotKeys = new Set(Array.from(randomMarkerReplaceList.querySelectorAll("input:checked"), (checkbox) => checkbox.dataset.slotKey));
      stopRandomMarkerSelectionSync();
      const callArguments = [JSON.stringify(encodeURIComponent(JSON.stringify(slots.map((slot) => slot.key))))];
      randomMarkerReplaceSelectedButton.disabled = true;
      if (manualClipId || sourceFolderSelection || protectedMenuSlots) {
        callArguments.push(JSON.stringify(manualClipId ? encodeURIComponent(manualClipId) : ""));
      }
      if (sourceFolderSelection || protectedMenuSlots) callArguments.push(JSON.stringify(sourceFolderSelection ? encodeURIComponent(sourceFolderSelection) : ""));
      if (sourceFolderSelection || protectedMenuSlots) {
        const allowedSourceClipIds = sourceFolderSelection
          ? encodeURIComponent(JSON.stringify(getQuickReplaceSourceClipIds(sourceFolderSelection)))
          : "";
        callArguments.push(JSON.stringify(allowedSourceClipIds));
      }
      if (protectedMenuSlots) {
        callArguments.push(JSON.stringify(encodeURIComponent(JSON.stringify(protectedMenuSlots.map((slot) => slot.key)))));
      }
      callAE(`quickReplaceSelectedClip(${callArguments.join(", ")})`, "", (response) => {
        randomMarkerReplaceSelectedButton.disabled = false;
        const fields = String(response || "").split("|");
        if (fields[0] !== "QUICK_REPLACE_DONE") {
          setResult(response || "Could not replace the selected clips.", "error");
          resumeReplaceDialogSelectionSync();
          if (reopenAfterManualPick) randomMarkerReplaceDialog.hidden = false;
          return;
        }
        let replacedSlots = [];
        let failures = "";
        try {
          replacedSlots = JSON.parse(decodeURIComponent(fields[4] || "%5B%5D"));
          failures = decodeURIComponent(fields[3] || "");
        } catch (error) {
          failures = fields[3] || "Could not read the replacement result.";
        }
        replacedSlots.forEach((replacedSlot) => {
          const slot = randomMarkerReplaceSlots.find((entry) => entry.key === replacedSlot.key);
          if (!slot) return;
          slot.name = replacedSlot.name;
          slot.clipId = replacedSlot.clipId;
          const record = favoriteRecords.find((clip) => clip.clipId === replacedSlot.clipId);
          if (!record) return;
          const trackingKey = getClipTrackingKey(record);
          const data = clipTrackingData[trackingKey] || { addedAt: Date.now(), randomRank: Math.random() };
          data.insertCount = Math.max(0, Number(data.insertCount) || 0) + 1;
          clipTrackingData[trackingKey] = data;
        });
        saveClipTrackingData();
        renderFavoriteClips();
        renderRandomMarkerReplaceList();
        randomMarkerReplaceList.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
          checkbox.checked = checkedSlotKeys.has(checkbox.dataset.slotKey);
        });
        updateRandomMarkerDeleteButtons();
        const success = `Replaced ${replacedSlots.length} selected clip${replacedSlots.length === 1 ? "" : "s"}.`;
        setResult(failures ? `${success} ${failures}` : success, failures ? "warning" : "success");
        if (reopenAfterManualPick) randomMarkerReplaceDialog.hidden = false;
        resumeReplaceDialogSelectionSync();
      }, (message) => {
        randomMarkerReplaceSelectedButton.disabled = false;
        setResult(message, "error");
        if (reopenAfterManualPick) randomMarkerReplaceDialog.hidden = false;
        resumeReplaceDialogSelectionSync();
      });
    }

    randomMarkerReplaceChooseClipButton.addEventListener("click", () => {
      if (randomMarkerReplaceMode !== "selected") {
        setResult("Open Replace selected clips first to choose replacement folders.", "info");
        return;
      }
      randomMarkerReplaceFolderSelection = "";
      stopRandomMarkerSelectionSync();
      randomMarkerReplaceDialog.hidden = true;
      openRandomMarkerDialog("replaceSelectedSources");
    });
    function closeRandomMarkerSourcePicker() {
      if (randomMarkerDialogMode !== "replaceSelectedSources") return false;
      randomMarkerInsertDialog.hidden = true;
      randomMarkerDialogMode = "replaceSelected";
      randomMarkerReplaceDialog.hidden = false;
      startRandomMarkerSelectionSync();
      return true;
    }
    function replaceRandomMarkerSlots(slots) {
      if (!slots.length) {
        setResult("Select at least one clip to replace.", "error");
        return;
      }
      stopRandomMarkerSelectionSync();
      const encodedFolderId = JSON.stringify(encodeURIComponent(randomMarkerReplaceFolderSelection));
      const encodedSlots = JSON.stringify(encodeURIComponent(JSON.stringify(slots)));
      randomMarkerReplaceSelectedButton.disabled = true;
      callAE(`replaceRandomMarkerClips(${encodedFolderId}, ${encodedSlots})`, "", (response) => {
        const fields = response.split("|");
        if (fields[0] !== "MARKER_RANDOM_REPLACED") {
          randomMarkerReplaceSelectedButton.disabled = false;
          setResult(response || "Could not replace the selected clips.", "error");
          resumeReplaceDialogSelectionSync();
          return;
        }
        let replaced = [];
        let failed = [];
        try {
          replaced = JSON.parse(decodeURIComponent(fields[1] || "%5B%5D"));
          failed = JSON.parse(decodeURIComponent(fields[2] || "%5B%5D"));
        } catch (error) {}
        replaced.forEach((item) => {
          const slot = randomMarkerReplaceSlots.find((entry) => entry.key === item.key);
          if (slot) {
            slot.name = item.name;
            slot.clipId = item.clipId;
          }
          const record = favoriteRecords.find((clip) => clip.clipId === item.clipId);
          if (record) {
            const key = getClipTrackingKey(record);
            const data = clipTrackingData[key] || { addedAt: Date.now(), randomRank: Math.random() };
            data.insertCount = Math.max(0, Number(data.insertCount) || 0) + 1;
            clipTrackingData[key] = data;
          }
        });
        saveClipTrackingData();
        renderFavoriteClips();
        const previouslySelectedKeys = new Set(Array.from(randomMarkerReplaceList.querySelectorAll("input:checked"), (checkbox) => checkbox.dataset.slotKey));
        renderRandomMarkerReplaceList();
        randomMarkerReplaceList.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
          checkbox.checked = previouslySelectedKeys.has(checkbox.dataset.slotKey);
        });
        updateRandomMarkerDeleteButtons();
        const failureSummary = failed.slice(0, 5).map((item) => {
          const name = String(item.name || "Clip");
          const reason = String(item.reason || "No available replacement clip.").split(/[\r\n]/)[0];
          return `• ${name.length > 36 ? `${name.slice(0, 33)}…` : name}: ${reason}`;
        }).join("\n");
        const moreFailures = failed.length > 5 ? `\n• And ${failed.length - 5} more.` : "";
        setResult(`Replaced: ${replaced.length}\nNot replaced: ${failed.length}${failed.length ? `\n\n${failureSummary}${moreFailures}` : ""}`, failed.length ? "error" : "success");
        resumeReplaceDialogSelectionSync();
      }, (message) => {
        randomMarkerReplaceSelectedButton.disabled = false;
        setResult(message, "error");
        resumeReplaceDialogSelectionSync();
      });
    }
    function stopRandomMarkerSelectionSync() {
      if (randomMarkerSelectionPollTimer !== null) {
        window.clearInterval(randomMarkerSelectionPollTimer);
        randomMarkerSelectionPollTimer = null;
      }
      randomMarkerSelectionSyncGeneration++;
      randomMarkerSelectionSyncInFlight = false;
      pendingRandomMarkerAESelectionSignature = null;
      pendingRandomMarkerAESelectionCount = 0;
    }
    function syncRandomMarkerSelectionFromAE() {
      if (randomMarkerReplaceDialog.hidden) {
        stopRandomMarkerSelectionSync();
        return;
      }
      randomMarkerReplaceChooseClipButton.disabled = randomMarkerReplaceMode !== "selected";
      if (randomMarkerSelectionSyncInFlight) return;
      const requestGeneration = randomMarkerSelectionSyncGeneration;
      randomMarkerSelectionSyncInFlight = true;
      callAE("getSelectedRandomMarkerSlots()", "", (response) => {
        if (requestGeneration !== randomMarkerSelectionSyncGeneration) return;
        randomMarkerSelectionSyncInFlight = false;
        if (randomMarkerReplaceDialog.hidden) return;
        if (response.indexOf("MARKER_RANDOM_SELECTION|") !== 0) {
          return;
        }
        let selectedKeys = [];
        try {
          selectedKeys = JSON.parse(decodeURIComponent(response.substring("MARKER_RANDOM_SELECTION|".length)));
        } catch (error) {}
        const signature = Array.from(new Set(selectedKeys)).sort().join("|");
        if (signature === lastRandomMarkerAESelectionSignature) return;
        if (signature !== pendingRandomMarkerAESelectionSignature) {
          pendingRandomMarkerAESelectionSignature = signature;
          pendingRandomMarkerAESelectionCount = 1;
          return;
        }
        pendingRandomMarkerAESelectionCount++;
        if (pendingRandomMarkerAESelectionCount < 2) return;
        lastRandomMarkerAESelectionSignature = signature;
        pendingRandomMarkerAESelectionSignature = null;
        pendingRandomMarkerAESelectionCount = 0;
        const selected = new Set(selectedKeys);
        randomMarkerReplaceList.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
          checkbox.checked = selected.has(checkbox.dataset.slotKey);
        });
        updateRandomMarkerDeleteButtons();
      }, () => {
        if (requestGeneration !== randomMarkerSelectionSyncGeneration) return;
        randomMarkerSelectionSyncInFlight = false;
      });
    }
    function startRandomMarkerSelectionSync() {
      if (randomMarkerReplaceDialog.hidden) return;
      if (randomMarkerSelectionPollTimer !== null) window.clearInterval(randomMarkerSelectionPollTimer);
      lastRandomMarkerAESelectionSignature = null;
      pendingRandomMarkerAESelectionSignature = null;
      pendingRandomMarkerAESelectionCount = 0;
      syncRandomMarkerSelectionFromAE();
      randomMarkerSelectionPollTimer = window.setInterval(syncRandomMarkerSelectionFromAE, 150);
    }
    function resumeRandomMarkerSelectionSync() {
      if (randomMarkerReplaceDialog.hidden) return;
      if (randomMarkerSelectionPollTimer !== null) window.clearInterval(randomMarkerSelectionPollTimer);
      randomMarkerSelectionPollTimer = window.setInterval(syncRandomMarkerSelectionFromAE, 150);
    }
    function resumeReplaceDialogSelectionSync() {
      resumeRandomMarkerSelectionSync();
    }
    randomMarkerReplaceSelectedButton.addEventListener("click", () => {
      const selectedKeys = new Set(Array.from(randomMarkerReplaceList.querySelectorAll("input:checked"), (input) => input.dataset.slotKey));
      if (randomMarkerReplaceMode === "selected") {
        const selectedSlots = randomMarkerReplaceSlots.filter((slot) => selectedKeys.has(slot.key));
        if (!selectedSlots.length) {
          setResult("Select at least one clip in the Replace menu.", "error");
          return;
        }
        const sourceSelection = lastSelectedClipReplacementFolders
          ? JSON.stringify(lastSelectedClipReplacementFolders)
          : "";
        replaceSelectedClipSlots(selectedSlots, null, false, sourceSelection, randomMarkerReplaceSlots);
      } else {
        const selectedSlots = randomMarkerReplaceSlots.filter((slot) => selectedKeys.has(slot.key));
        replaceRandomMarkerSlots(selectedSlots);
      }
    });
    randomMarkerDeleteSelectedPrecompsButton.addEventListener("click", () => {
      const selectedKeys = new Set(Array.from(randomMarkerReplaceList.querySelectorAll("input:checked"), (checkbox) => checkbox.dataset.slotKey));
      const slots = randomMarkerReplaceSlots.filter((slot) => slot.precomp && selectedKeys.has(slot.key));
      if (!slots.length) return;
      openRandomMarkerPrecompDeleteConfirmation(slots);
    });
    function openRandomMarkerPrecompDeleteConfirmation(slots) {
      randomMarkerPendingPrecompDeleteSlots = slots;
      document.getElementById("random-marker-delete-confirmation-title").textContent = "Delete selected precomps?";
      randomMarkerDeleteConfirmation.hidden = false;
      randomMarkerDeleteConfirmationConfirmButton.focus();
    }
    function deleteCreatedRandomMarkerPrecomps() {
      randomMarkerDeleteConfirmation.hidden = true;
      stopRandomMarkerSelectionSync();
      randomMarkerDeleteSelectedPrecompsButton.disabled = true;
      const encodedSlots = JSON.stringify(encodeURIComponent(JSON.stringify(randomMarkerPendingPrecompDeleteSlots || [])));
      const scriptCall = `deleteRandomMarkerPrecomps(${encodedSlots})`;
      callAE(scriptCall, "", (response) => {
        randomMarkerPendingPrecompDeleteSlots = null;
        const fields = response.split("|");
        if (fields[0] !== "MARKER_RANDOM_PRECOMPS_DELETED") {
          randomMarkerDeleteSelectedPrecompsButton.disabled = false;
          randomMarkerPendingPrecompDeleteSlots = null;
          setResult(response || "Could not delete the created precomps.", "error");
          resumeReplaceDialogSelectionSync();
          return;
        }
        const deletedPrecomps = Number(fields[1]) || 0;
        const deletedFootage = Number(fields[2]) || 0;
        let deletedKeys = [];
        try { deletedKeys = JSON.parse(decodeURIComponent(fields[3] || "%5B%5D")); } catch (error) {}
        const deletedKeySet = new Set(deletedKeys);
        randomMarkerReplaceSlots = randomMarkerReplaceSlots.filter((slot) => !deletedKeySet.has(slot.key));
        renderRandomMarkerReplaceList();
        if (!randomMarkerReplaceSlots.length) randomMarkerReplaceDialog.hidden = true;
        setResult(`Deleted ${deletedPrecomps} precomp${deletedPrecomps === 1 ? "" : "s"} and ${deletedFootage} unused footage item${deletedFootage === 1 ? "" : "s"}.`, "success");
        resumeReplaceDialogSelectionSync();
      }, (message) => {
        randomMarkerDeleteSelectedPrecompsButton.disabled = false;
        randomMarkerPendingPrecompDeleteSlots = null;
        setResult(message, "error");
        resumeReplaceDialogSelectionSync();
      });
    }
    randomMarkerDeleteConfirmationConfirmButton.addEventListener("click", deleteCreatedRandomMarkerPrecomps);
    randomMarkerDeleteConfirmationCancelButton.addEventListener("click", () => {
      randomMarkerDeleteConfirmation.hidden = true;
      randomMarkerPendingPrecompDeleteSlots = null;
      randomMarkerDeleteSelectedPrecompsButton.focus();
    });
    randomMarkerDeleteConfirmation.addEventListener("click", (event) => {
      if (event.target === randomMarkerDeleteConfirmation) {
        randomMarkerDeleteConfirmation.hidden = true;
        randomMarkerPendingPrecompDeleteSlots = null;
        randomMarkerDeleteSelectedPrecompsButton.focus();
      }
    });
    randomMarkerReplaceDoneButton.addEventListener("click", () => {
      randomMarkerReplaceDialog.hidden = true;
      stopRandomMarkerSelectionSync();
    });
    randomMarkerInsertDialog.addEventListener("click", (event) => {
      if (event.target === randomMarkerInsertDialog && !randomMarkerInsertRunButton.disabled) {
        if (closeRandomMarkerSourcePicker()) return;
        randomMarkerInsertDialog.hidden = true;
      }
    });
    randomMarkerInsertRunButton.addEventListener("click", () => {
      if (randomMarkerDialogMode === "replaceSelectedSources") {
        if (!randomMarkerSelectedFolderIds.size) {
          setResult("Choose at least one source folder.", "error");
          return;
        }
        lastSelectedClipReplacementFolders = {
          include: Array.from(randomMarkerSelectedFolderIds),
          exclude: Array.from(randomMarkerExcludedFolderIds)
        };
        const sourceFolderNames = lastSelectedClipReplacementFolders.include
          .map((id) => favoriteFolders.find((folder) => folder.id === id))
          .filter(Boolean)
          .map((folder) => folder.name);
        const sourceClipCount = getQuickReplaceSourceClipIds(JSON.stringify(lastSelectedClipReplacementFolders)).length;
        randomMarkerReplaceChooseClipButton.textContent = "Source folders ✓";
        randomMarkerReplaceChooseClipButton.title = `Quick Replace source: ${sourceFolderNames.join(", ") || "selected folders"} · ${sourceClipCount} saved clips`;
        randomMarkerReplaceFolderSelection = JSON.stringify(lastSelectedClipReplacementFolders);
        randomMarkerInsertDialog.hidden = true;
        randomMarkerDialogMode = "replaceSelected";
        randomMarkerReplaceDialog.hidden = false;
        startRandomMarkerSelectionSync();
        setResult(`Replacement source updated: ${sourceFolderNames.join(", ") || "selected folders"} · ${sourceClipCount} saved clip${sourceClipCount === 1 ? "" : "s"}.`, "success");
        return;
      }
      if (randomMarkerDialogMode === "replaceSelected") {
        if (!randomMarkerSelectedFolderIds.size) {
          setResult("Choose at least one source folder.", "error");
          return;
        }
        const sourceSelection = JSON.stringify({ include: Array.from(randomMarkerSelectedFolderIds), exclude: Array.from(randomMarkerExcludedFolderIds) });
        lastSelectedClipReplacementFolders = {
          include: Array.from(randomMarkerSelectedFolderIds),
          exclude: Array.from(randomMarkerExcludedFolderIds)
        };
        const encodedFolderSelection = JSON.stringify(encodeURIComponent(sourceSelection));
        randomMarkerInsertRunButton.disabled = true;
        callAE(`replaceSelectedClipFromFolders(${encodedFolderSelection})`, "", (response) => {
          randomMarkerInsertRunButton.disabled = false;
          const fields = String(response || "").split("|");
          if (fields[0] === "SELECTED_CLIPS_REPLACED") {
            let outcomes = [];
            try { outcomes = JSON.parse(decodeURIComponent(fields[1] || "%5B%5D")); } catch (error) {}
            const replaced = outcomes.filter((outcome) => String(outcome).indexOf("SELECTED_CLIP_REPLACED|") === 0);
            const failed = outcomes.length - replaced.length;
            replaced.forEach((outcome) => {
              const item = String(outcome).split("|");
              let clipId = "";
              try { clipId = decodeURIComponent(item[4] || ""); } catch (error) {}
              const record = favoriteRecords.find((entry) => entry.clipId === clipId);
              if (!record) return;
              const trackingKey = getClipTrackingKey(record);
              const data = clipTrackingData[trackingKey] || { addedAt: Date.now(), randomRank: Math.random() };
              data.insertCount = Math.max(0, Number(data.insertCount) || 0) + 1;
              clipTrackingData[trackingKey] = data;
            });
            if (replaced.length) {
              saveClipTrackingData();
              renderFavoriteClips();
              randomMarkerInsertDialog.hidden = true;
              setResult(`Replaced clips in ${replaced.length} selected precomp${replaced.length === 1 ? "" : "s"}${failed ? `; ${failed} could not be replaced` : ""}.`, failed ? "warning" : "success");
            } else {
              setResult(outcomes.map((outcome) => String(outcome).replace(/^ERROR: ?/, "")).join("\n") || "Could not replace the selected clips.", "error");
            }
            return;
          }
          if (fields[0] !== "SELECTED_CLIP_REPLACED") {
            setResult(response || "Could not replace the selected clip.", "error");
            return;
          }
          let displayName = "Clip";
          try { displayName = decodeURIComponent(fields[1] || "Clip"); } catch (error) {}
          const targetType = fields[2] === "precomp" ? "in the selected precomp" : "on the selected layer";
          let slotKey = "";
          try { slotKey = decodeURIComponent(fields[3] || ""); } catch (error) {}
          let replacementClipId = "";
          try { replacementClipId = decodeURIComponent(fields[4] || ""); } catch (error) {}
          if (slotKey) {
            const slot = randomMarkerReplaceSlots.find((entry) => entry.key === slotKey);
            if (slot) {
              slot.name = displayName;
              if (replacementClipId) slot.clipId = replacementClipId;
            }
          }
          const matchingRecord = favoriteRecords.find((record) => record.clipId === replacementClipId);
          if (matchingRecord) {
            const key = getClipTrackingKey(matchingRecord);
            const data = clipTrackingData[key] || { addedAt: Date.now(), randomRank: Math.random() };
            data.insertCount = Math.max(0, Number(data.insertCount) || 0) + 1;
            clipTrackingData[key] = data;
            saveClipTrackingData();
            renderFavoriteClips();
          }
          randomMarkerInsertDialog.hidden = true;
          replaceSelectedNextDialog.hidden = false;
          setResult(`Replaced the clip with “${displayName}” ${targetType}.`, "success");
        }, (message) => {
          randomMarkerInsertRunButton.disabled = false;
          setResult(message, "error");
        });
        return;
      }
      if (randomMarkerSkipEntry.value.trim()) {
        commitRandomMarkerSkipEntry();
        if (randomMarkerSkipEntry.value.trim()) {
          setResult("Choose a marker name from the suggestions before continuing.", "error");
          randomMarkerSkipEntry.focus();
          return;
        }
      }
      if (!randomMarkerSelectedFolderIds.size) {
        setResult("Choose at least one source folder.", "error");
        return;
      }
      saveRandomMarkerInsertSettings();
      const sourceSelection = JSON.stringify({ include: Array.from(randomMarkerSelectedFolderIds), exclude: Array.from(randomMarkerExcludedFolderIds) });
      randomMarkerReplaceFolderSelection = sourceSelection;
      const encodedFolderId = JSON.stringify(encodeURIComponent(sourceSelection));
      const encodedSkipNames = JSON.stringify(encodeURIComponent(randomMarkerSkipNames.value));
      const encodedPresetPath = JSON.stringify(encodeURIComponent(
        randomMarkerCreatePrecomps.checked ? randomMarkerTwixtorPresetPath : ""
      ));
      const createPrecomps = randomMarkerCreatePrecomps.checked;
      const applyTwixtorPreset = createPrecomps && Boolean(randomMarkerTwixtorPresetPath);
      randomMarkerInsertRunButton.disabled = true;
      callAE(`insertRandomClipsBetweenMarkers(${encodedFolderId}, ${randomMarkerCreatePrecomps.checked}, ${encodedSkipNames}, ${encodedPresetPath})`, "", (response) => {
        randomMarkerInsertRunButton.disabled = false;
        const fields = response.split("|");
        if (fields[0] === "MARKER_RANDOM_DONE") {
          const insertedClipIds = fields[2] ? fields[2].split(",").map((id) => decodeURIComponent(id)) : [];
          insertedClipIds.forEach((clipId) => {
            const record = favoriteRecords.find((clip) => clip.clipId === clipId);
            if (!record) return;
            const key = getClipTrackingKey(record);
            const data = clipTrackingData[key] || { addedAt: Date.now(), randomRank: Math.random() };
            data.insertCount = Math.max(0, Number(data.insertCount) || 0) + 1;
            clipTrackingData[key] = data;
          });
          try {
            randomMarkerReplaceSlots = JSON.parse(decodeURIComponent(fields[14] || "%5B%5D"));
          } catch (error) {
            randomMarkerReplaceSlots = [];
          }
          saveClipTrackingData();
          renderFavoriteClips();
          randomMarkerInsertDialog.hidden = true;
          const inserted = Number(fields[1]) || 0;
          const skipped = Number(fields[3]) || 0;
          const precompCount = Number(fields[4]) || 0;
          const failedPrecompCount = Number(fields[5]) || 0;
          const failedClipCount = Number(fields[15]) || 0;
          const skippedForReuse = Number(fields[7]) || 0;
          const precompMessage = createPrecomps
            ? ` Created ${precompCount} precomp${precompCount === 1 ? "" : "s"}${failedPrecompCount ? `; ${failedPrecompCount} could not be created` : ""}.`
            : "";
          const appliedPresetCount = Number(fields[8]) || 0;
          const failedPresetCount = Number(fields[9]) || 0;
          const fittedKeyframeCount = Number(fields[10]) || 0;
          const unfittedKeyframeCount = Number(fields[11]) || 0;
          let presetError = "";
          let fitError = "";
          try {
            if (fields[12]) presetError = decodeURIComponent(fields[12]);
            if (fields[13]) fitError = decodeURIComponent(fields[13]);
          } catch (error) {
            presetError = "";
            fitError = "";
          }
          const presetMessage = applyTwixtorPreset
            ? ` Applied Twixtor preset to ${appliedPresetCount} precomp layer${appliedPresetCount === 1 ? "" : "s"}${failedPresetCount ? `; ${failedPresetCount} failed${presetError ? ` (${presetError})` : ""}` : ""}. Fitted keyframes on ${fittedKeyframeCount} layer${fittedKeyframeCount === 1 ? "" : "s"}${unfittedKeyframeCount ? `; ${unfittedKeyframeCount} could not be fitted${fitError ? ` (${fitError})` : ""}` : ""}.`
            : "";
          const uniquenessHint = skippedForReuse
            ? ` Not enough different clips were available for every interval; each clip is used only once. Add more clips to the selected folders or reduce the number of intervals.`
            : "";
          let clipFailureMessage = "";
          if (failedClipCount) {
            try { clipFailureMessage = decodeURIComponent(fields[16] || ""); } catch (error) {}
            clipFailureMessage = ` ${failedClipCount} clip${failedClipCount === 1 ? " was" : "s were"} not created${clipFailureMessage ? `: ${clipFailureMessage}.` : "."}`;
          }
          const hasCreationFailures = failedClipCount > 0 || failedPrecompCount > 0;
          setResult(`Inserted ${inserted} random clip${inserted === 1 ? "" : "s"} between markers${skipped ? `; skipped ${skipped} interval${skipped === 1 ? "" : "s"}` : ""}.${clipFailureMessage}${precompMessage}${presetMessage}${uniquenessHint}`, hasCreationFailures ? "warning" : "success");
          if (randomMarkerReplaceSlots.length) {
            randomMarkerReplaceMode = "marker";
            document.getElementById("random-marker-replace-title").textContent = "Replace inserted clips";
            renderRandomMarkerReplaceList();
            randomMarkerReplaceDialog.hidden = false;
            startRandomMarkerSelectionSync();
          }
        } else {
          randomMarkerInsertDialog.hidden = true;
          setResult(response || "No clips were inserted.", "error");
        }
      }, (message) => {
        randomMarkerInsertRunButton.disabled = false;
        setResult(message, "error");
      });
    });
    randomMarkerReplaceCurrentFolderButton.addEventListener("click", () => {
      const currentFolder = favoriteFolders.find((folder) => folder.id === selectedFolderId);
      if (!currentFolder || randomMarkerInsertRunButton.disabled) return;
      const previousIncluded = Array.from(randomMarkerSelectedFolderIds);
      const previousExcluded = Array.from(randomMarkerExcludedFolderIds);
      randomMarkerSelectedFolderIds.clear();
      randomMarkerExcludedFolderIds.clear();
      randomMarkerSelectedFolderIds.add(currentFolder.id);
      renderRandomMarkerFolderTree();
      randomMarkerInsertRunButton.click();
      randomMarkerSelectedFolderIds.clear();
      randomMarkerExcludedFolderIds.clear();
      previousIncluded.forEach((id) => randomMarkerSelectedFolderIds.add(id));
      previousExcluded.forEach((id) => randomMarkerExcludedFolderIds.add(id));
      renderRandomMarkerFolderTree();
    });
    replaceSelectedAgainButton.addEventListener("click", () => {
      if (!lastSelectedClipReplacementFolders || randomMarkerInsertRunButton.disabled) return;
      replaceSelectedNextDialog.hidden = true;
      randomMarkerSelectedFolderIds.clear();
      randomMarkerExcludedFolderIds.clear();
      lastSelectedClipReplacementFolders.include.forEach((id) => randomMarkerSelectedFolderIds.add(id));
      lastSelectedClipReplacementFolders.exclude.forEach((id) => randomMarkerExcludedFolderIds.add(id));
      randomMarkerDialogMode = "replaceSelected";
      randomMarkerInsertRunButton.click();
    });
    replaceSelectedChangeFoldersButton.addEventListener("click", () => {
      replaceSelectedNextDialog.hidden = true;
      openRandomMarkerDialog("replaceSelected");
    });
    replaceSelectedNextDoneButton.addEventListener("click", () => {
      replaceSelectedNextDialog.hidden = true;
    });
    replaceSelectedNextDialog.addEventListener("click", (event) => {
      if (event.target === replaceSelectedNextDialog) replaceSelectedNextDialog.hidden = true;
    });

    function openExportDataDialog() {
      exportChoiceSearchQuery = "";
      exportChoiceSearch.value = "";
      exportSelectedFootagePaths = selectedFootagePath ? [selectedFootagePath] : [];
      exportSelectedFolderIds = [];
      exportSelectionMode = "folders";
      syncExportSelectionList();
      exportChoiceSearch.placeholder = exportSelectionMode === "footage" ? "Search footage..." : "Search folders...";
      exportChoiceSearch.setAttribute("aria-label", exportSelectionMode === "footage" ? "Search footage" : "Search folders");
      exportDataConfirmation.hidden = false;
      const hasSelection = exportSelectionMode === "footage"
        ? exportSelectedFootagePaths.length > 0
        : exportSelectedFolderIds.length > 0;
      exportSelectedFootageButton.disabled = !hasSelection;
      if (hasSelection) {
        exportSelectedFootageButton.focus();
      } else {
        exportFootageChoiceList.querySelector("input")?.focus();
      }
    }

    function showDeleteLibraryFinalConfirmation() {
      deleteLibraryOffer.hidden = true;
      deleteLibraryConfirmInput.value = "";
      deleteLibraryConfirmButton.disabled = true;
      deleteLibraryFinal.hidden = false;
      deleteLibraryConfirmInput.focus();
    }

    function exportAllLibraryData(onComplete) {
      callAE(`exportClipFavorites(${JSON.stringify("ALL")}, ${JSON.stringify("")})`, "", (response) => {
        const canceled = response === "Export canceled.";
        setResult(response || "All library data exported.", canceled ? "" : "success");
        if (onComplete) onComplete(response, canceled, false);
      }, (message) => {
        setResult(message, "error");
        if (onComplete) onComplete(message, false, true);
      });
    }

    libraryDataToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      openLibraryContextMenu(event, [
        { label: "Export Data", run: openExportDataDialog },
        { label: "Import Data", run: importLibraryData }
      ]);
    });

    exportFootageModeButton.addEventListener("click", () => {
      exportSelectionMode = "footage";
      exportChoiceSearch.value = "";
      exportChoiceSearchQuery = "";
      exportChoiceSearch.placeholder = "Search footage...";
      exportChoiceSearch.setAttribute("aria-label", "Search footage");
      syncExportSelectionList();
    });

    exportFolderModeButton.addEventListener("click", () => {
      exportSelectionMode = "folders";
      exportChoiceSearch.value = "";
      exportChoiceSearchQuery = "";
      exportChoiceSearch.placeholder = "Search folders...";
      exportChoiceSearch.setAttribute("aria-label", "Search folders");
      syncExportSelectionList();
    });

    exportChoiceSearch.addEventListener("input", () => {
      exportChoiceSearchQuery = exportChoiceSearch.value;
      syncExportSelectionList();
    });

    exportSelectedFootageButton.addEventListener("click", () => {
      exportDataConfirmation.hidden = true;
      const isFootageMode = exportSelectionMode === "footage";
      const selectedValues = isFootageMode ? exportSelectedFootagePaths : exportSelectedFolderIds;
      if (!selectedValues.length) {
        setResult(isFootageMode ? "Select at least one footage to export." : "Select at least one folder to export.", "error");
        return;
      }
      const payload = JSON.stringify(selectedValues);
      const scope = isFootageMode ? "SELECTED" : "FOLDERS";
      callAE(`exportClipFavorites(${JSON.stringify(scope)}, ${JSON.stringify(payload)})`, "", (response) => {
        const canceled = response === "Export canceled.";
        setResult(response || "Selected footage data exported.", canceled ? "" : "success");
      });
    });

    exportAllDataButton.addEventListener("click", () => {
      exportDataConfirmation.hidden = true;
      exportAllLibraryData();
    });

    cancelExportDataButton.addEventListener("click", () => {
      exportDataConfirmation.hidden = true;
    });

    exportDataConfirmation.addEventListener("click", (event) => {
      if (event.target === exportDataConfirmation) {
        exportDataConfirmation.hidden = true;
      }
    });

    function importLibraryData() {
      callAE("importClipFavorites()", "", handleLibraryImportResponse);
    }

    function handleLibraryImportResponse(response) {
        if (response.indexOf("FOLDER_CONFLICT|") === 0) {
          let folderNames = [];
          try {
            folderNames = JSON.parse(decodeURIComponent(response.substring("FOLDER_CONFLICT|".length)));
          } catch (error) {
            folderNames = [];
          }
          const visibleNames = folderNames.slice(0, 5).join(", ");
          const remainingCount = folderNames.length - 5;
          importFolderConflictCopy.textContent = folderNames.length
            ? `Existing folder(s): ${visibleNames}${remainingCount > 0 ? ` and ${remainingCount} more` : ""}. Replace removes their current contents.`
            : "An imported folder conflicts with one in the library.";
          importFolderConflict.hidden = false;
          importFolderConflictReplaceButton.focus();
          return;
        }
        if (response.indexOf("IMPORT_DONE|") !== 0) {
          const canceled = response === "Import canceled." || response === "IMPORT_CANCELED";
          setResult(response || "Clip import complete.", canceled ? "" : "success");
          return;
        }
        const summary = response.substring("IMPORT_DONE|".length).split("|");
        const added = Number(summary[0]) || 0;
        const unlinked = Number(summary[1]) || 0;
        let importFocus = { folderIds: [], storageIndex: null };
        if (summary[2]) {
          try {
            importFocus = JSON.parse(decodeURIComponent(summary[2]));
          } catch (error) {
            importFocus = { folderIds: [], storageIndex: null };
          }
        }
        const message = `Imported ${added} clip(s). ${unlinked} footage source(s) still need relinking.`;
        refreshFavoriteFolders(() => {
          refreshFavorites(false, message, undefined, () => {
            const importedFolderIds = Array.isArray(importFocus.folderIds) ? importFocus.folderIds : [];
            if (importedFolderIds.length) {
              selectedFolderId = "";
              selectedFootagePath = "";
              selectedFavoriteStorageIndex = null;
              librarySearch.value = "";
              syncSearchClearButtons();
              selectedLibraryKeys = new Set(importedFolderIds.map((folderId) => `folder:${folderId}`));
              selectedLibraryItemKey = `folder:${importedFolderIds[0]}`;
              favoriteResultsMode = "footage";
              syncActiveExplorerTab();
              renderFavoriteClips();
              requestAnimationFrame(() => scrollLibraryItemIntoView(`folder:${importedFolderIds[0]}`));
            } else if (importFocus.storageIndex !== null && importFocus.storageIndex !== undefined &&
              Number.isInteger(Number(importFocus.storageIndex))) {
              const importedRecord = favoriteRecords.find((record) =>
                record.storageIndex === Number(importFocus.storageIndex));
              if (importedRecord) {
                const clipKey = `clip:${importedRecord.storageIndex}`;
                selectedFolderId = importedRecord.folderId || "";
                selectedFootagePath = importedRecord.sourcePath;
                selectedFavoriteStorageIndex = importedRecord.storageIndex;
                selectedLibraryItemKey = clipKey;
                selectedLibraryKeys = new Set([clipKey]);
                favoriteResultsMode = "clips";
                syncActiveExplorerTab();
                renderFavoriteClips();
                requestAnimationFrame(() => scrollSelectedFavoriteIntoView());
              }
            }
            if (added > 0) {
              importSuccessConfirmationText.textContent = `Imported ${added} clip(s).`;
              importSuccessConfirmation.hidden = false;
              importSuccessOkButton.focus();
            }
          });
        });
    }

    function resolveLibraryFolderConflict(choice) {
      importFolderConflict.hidden = true;
      callAE(
        `resolveClipFavoriteImport(${JSON.stringify(encodeURIComponent(choice))})`,
        "",
        handleLibraryImportResponse
      );
    }

    importFolderConflictReplaceButton.addEventListener("click", () => resolveLibraryFolderConflict("REPLACE"));
    importFolderConflictKeepButton.addEventListener("click", () => resolveLibraryFolderConflict("KEEP_BOTH"));
    importFolderConflictCancelButton.addEventListener("click", () => resolveLibraryFolderConflict("CANCEL"));
    importFolderConflict.addEventListener("click", (event) => {
      if (event.target === importFolderConflict) resolveLibraryFolderConflict("CANCEL");
    });

    importSuccessOkButton.addEventListener("click", () => {
      importSuccessConfirmation.hidden = true;
    });

    importSuccessConfirmation.addEventListener("click", (event) => {
      if (event.target === importSuccessConfirmation) {
        importSuccessConfirmation.hidden = true;
      }
    });

    deleteLibraryOpenButton.addEventListener("click", () => {
      deleteLibraryOffer.hidden = false;
      deleteLibraryExportButton.focus();
    });

    deleteLibraryExportButton.addEventListener("click", () => {
      deleteLibraryOffer.hidden = true;
      exportAllLibraryData((response, canceled, failed) => {
        if (!failed && !canceled && response.indexOf("Exported ") === 0) {
          showDeleteLibraryFinalConfirmation();
          return;
        }
        deleteLibraryOffer.hidden = false;
        deleteLibraryExportButton.focus();
      });
    });

    deleteLibraryContinueButton.addEventListener("click", showDeleteLibraryFinalConfirmation);
    deleteLibraryCancelButton.addEventListener("click", () => {
      deleteLibraryOffer.hidden = true;
      deleteLibraryOpenButton.focus();
    });
    deleteLibraryOffer.addEventListener("click", (event) => {
      if (event.target === deleteLibraryOffer) {
        deleteLibraryOffer.hidden = true;
        deleteLibraryOpenButton.focus();
      }
    });

    deleteLibraryConfirmInput.addEventListener("input", () => {
      deleteLibraryConfirmButton.disabled = deleteLibraryConfirmInput.value.trim() !== "DELETE";
    });

    deleteLibraryFinalCancelButton.addEventListener("click", () => {
      deleteLibraryFinal.hidden = true;
      deleteLibraryConfirmInput.value = "";
      deleteLibraryConfirmButton.disabled = true;
      deleteLibraryOpenButton.focus();
    });
    deleteLibraryFinal.addEventListener("click", (event) => {
      if (event.target === deleteLibraryFinal && !deleteLibraryConfirmButton.disabled) return;
      if (event.target === deleteLibraryFinal) deleteLibraryFinalCancelButton.click();
    });

    deleteLibraryConfirmButton.addEventListener("click", () => {
      if (deleteLibraryConfirmInput.value.trim() !== "DELETE") return;
      deleteLibraryConfirmButton.disabled = true;
      deleteLibraryConfirmButton.textContent = "Deleting...";
      deleteLibraryFinalCancelButton.disabled = true;
      const deletingRecords = favoriteRecords.slice();
      deletingRecords.forEach((record) => permanentlyDeletedPreviewKeys.add(getStoredPreviewIdentity(record)));
      storedPreviewQueue.length = 0;
      favoriteList.querySelectorAll("video").forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
      hideFavoritePreview();

      const finishDeleteFailure = (message) => {
        deletingRecords.forEach((record) => permanentlyDeletedPreviewKeys.delete(getStoredPreviewIdentity(record)));
        deleteLibraryConfirmButton.disabled = false;
        deleteLibraryConfirmButton.textContent = "Delete Permanently";
        deleteLibraryFinalCancelButton.disabled = false;
        setResult(message, "error");
      };

      callAE("createSceneKeeperBackup()", "", (backupResponse) => {
        if (backupResponse !== "BACKUP_SAVED") {
          finishDeleteFailure(backupResponse || "Could not create a backup before deleting the library.");
          return;
        }
        callAE("deleteAllClipLibraryData()", "", (response) => {
        if (response !== "LIBRARY_DELETED") {
          finishDeleteFailure(response || "Could not delete the library data.");
          return;
        }

        deleteLibraryFinal.hidden = true;
        deleteLibraryConfirmInput.value = "";
        deleteLibraryConfirmButton.textContent = "Delete Permanently";
        deleteLibraryFinalCancelButton.disabled = false;
        document.getElementById("settings-modal").hidden = true;
        settingsToggle.setAttribute("aria-expanded", "false");
        clipTrashModal.hidden = true;
        favoriteRecords = [];
        favoriteFolders = [];
        selectedFolderId = "";
        selectedFootagePath = "";
        selectedFavoriteStorageIndex = null;
        selectedLibraryItemKey = "";
        selectedLibraryKeys.clear();
        copiedLibraryEntries = [];
        libraryFavoriteKeys.clear();
        saveLibraryFavoriteKeys();
        savedWorkspaces = [];
        try {
          window.localStorage.removeItem(WORKSPACES_STORAGE_KEY);
        } catch (error) {
          setResult(`Could not clear saved workspaces: ${error.message}`, "error");
        }
        refreshWorkspaceOptions();
        librarySearch.value = "";
        syncSearchClearButtons();
        favoriteResultsMode = "footage";
        explorerTabs = [{
          id: "explorer-tab-1",
          sourcePath: "",
          folderId: "",
          search: "",
          selectedFavoriteStorageIndex: null,
          selectedLibraryItemKey: ""
        }];
        activeExplorerTabId = "explorer-tab-1";
        nextExplorerTabNumber = 2;
        renderExplorerTabs();
        renderFavoriteClips();
        loadClipTrash();
        refreshFavoriteFolders(() => refreshFavorites(false, "Library data permanently deleted."));
        settingsToggle.focus();
        }, finishDeleteFailure);
      }, finishDeleteFailure);
    });

    settingsToggle.addEventListener("click", () => {
      document.getElementById("settings-modal").hidden = false;
      settingsToggle.setAttribute("aria-expanded", "true");
    });

    document.getElementById("settings-close").addEventListener("click", () => {
      document.getElementById("settings-modal").hidden = true;
      settingsToggle.setAttribute("aria-expanded", "false");
    });

    helpToggle.addEventListener("click", () => {
      helpModal.hidden = false;
      focusFullscreenCloseButton();
    });

    startGuidedTutorialButton.addEventListener("click", startGuidedTutorial);
    guidedTourSkipButton.addEventListener("click", skipGuidedTutorial);
    guidedTourBackButton.addEventListener("click", handleGuidedTourBack);
    guidedTourNextButton.addEventListener("click", handleGuidedTourNext);

    document.getElementById("help-close").addEventListener("click", () => {
      helpModal.hidden = true;
      helpToggle.focus();
    });

    clipTrashToggle.addEventListener("click", () => {
      clipTrashModal.hidden = false;
      loadClipTrash();
      focusFullscreenCloseButton();
    });

    document.getElementById("clip-trash-close").addEventListener("click", closeClipTrash);
    document.getElementById("clip-trash-done").addEventListener("click", closeClipTrash);
    document.getElementById("clip-reorder-close").addEventListener("click", closeClipReorderDialog);
    clipReorderCancelButton.addEventListener("click", closeClipReorderDialog);
    clipReorderDoneButton.addEventListener("click", commitCollectionReorderDialog);
    cancelManualReorderButton.addEventListener("click", () => {
      pendingManualReorderOpen = null;
      manualReorderConfirmation.hidden = true;
      librarySearch.focus();
    });
    confirmManualReorderButton.addEventListener("click", () => {
      const openDialog = pendingManualReorderOpen;
      pendingManualReorderOpen = null;
      manualReorderConfirmation.hidden = true;
      selectManualSortForReordering();
      if (openDialog) openDialog();
    });
    manualReorderConfirmation.addEventListener("click", (event) => {
      if (event.target === manualReorderConfirmation) cancelManualReorderButton.click();
    });
    emptyClipTrashButton.addEventListener("click", () => confirmClipTrashDeletion("empty"));

    document.getElementById("cancel-clip-trash-action").addEventListener("click", () => {
      pendingClipTrashAction = null;
      clipTrashConfirmation.hidden = true;
    });

    confirmClipTrashAction.addEventListener("click", () => {
      if (!pendingClipTrashAction) return;
      const action = pendingClipTrashAction;
      pendingClipTrashAction = null;
      clipTrashConfirmation.hidden = true;
      const command = action.type === "empty"
        ? "emptyClipTrash()"
        : `permanentlyDeleteClipTrashItem(${action.index})`;
      callAE(command, "", (response) => {
        if (response.indexOf("ERROR:") === 0) {
          setResult(response, "error");
          return;
        }
        const previewCleanupResult = removeStoredPreviews(action.previewRecords, action.remainingRecords);
        const previewCleanupFailed = /could not|unavailable/i.test(previewCleanupResult);
        setResult(
          [response, previewCleanupResult].filter(Boolean).join(" "),
          previewCleanupFailed ? "error" : "success"
        );
        loadClipTrash();
      });
    });

    clipTrashModal.addEventListener("click", (event) => {
      if (event.target === clipTrashModal) closeClipTrash();
    });

    clipReorderModal.addEventListener("click", (event) => {
      if (event.target === clipReorderModal) closeClipReorderDialog();
    });

    clipTrashConfirmation.addEventListener("click", (event) => {
      if (event.target === clipTrashConfirmation) {
        pendingClipTrashAction = null;
        clipTrashConfirmation.hidden = true;
      }
    });

    // Close modal when clicking outside content
    document.getElementById("settings-modal").addEventListener("click", (e) => {
      if (e.target === document.getElementById("settings-modal")) {
        document.getElementById("settings-modal").hidden = true;
        settingsToggle.setAttribute("aria-expanded", "false");
      }
    });

    helpModal.addEventListener("click", (e) => {
      if (e.target === helpModal) {
        helpModal.hidden = true;
        helpToggle.focus();
      }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (!errorDialog.hidden) {
        if (e.key === "Escape") {
          e.preventDefault();
          closeErrorDialog();
        }
        return;
      }
      if (e.key !== "Escape") return;
      if (!clipSortMenu.hidden) {
        closeClipSortMenu(true);
      } else if (!manualReorderConfirmation.hidden) {
        cancelManualReorderButton.click();
      } else if (!workspaceDeleteConfirmation.hidden) {
        cancelDeleteSelectedWorkspace();
      } else if (!clipTrashConfirmation.hidden) {
        pendingClipTrashAction = null;
        clipTrashConfirmation.hidden = true;
      } else if (!deleteConfirmation.hidden) {
        hideDeleteConfirmation();
      } else if (!replaceClipConfirmation.hidden) {
        cancelPendingClipReplacement();
      } else if (!clipEditDialog.hidden) {
        closeClipEditDialog();
      } else if (!randomMarkerReplaceDialog.hidden) {
        randomMarkerReplaceDialog.hidden = true;
        stopRandomMarkerSelectionSync();
      } else if (!randomMarkerInsertDialog.hidden && !randomMarkerInsertRunButton.disabled) {
        if (!closeRandomMarkerSourcePicker()) randomMarkerInsertDialog.hidden = true;
      } else if (!missingFootageModal.hidden) {
        missingFootageModal.hidden = true;
      } else if (!saveClipDialog.hidden) {
        saveClipDialog.hidden = true;
      } else if (!renameDialog.hidden) {
        renameDialog.hidden = true;
        pendingRenameTarget = null;
      } else if (!helpModal.hidden) {
        helpModal.hidden = true;
        helpToggle.focus();
      } else if (!clipReorderModal.hidden) {
        closeClipReorderDialog();
      } else if (!clipTrashModal.hidden) {
        closeClipTrash();
      } else if (!document.getElementById("settings-modal").hidden) {
        document.getElementById("settings-modal").hidden = true;
        settingsToggle.setAttribute("aria-expanded", "false");
      }
    });

    deleteConfirmation.addEventListener("click", (event) => {
      if (event.target === deleteConfirmation) {
        hideDeleteConfirmation();
      }
    });

    function saveSettings() {
      previewAutoplay = previewAutoplayToggle.checked;
      hoverPreviewEnabled = previewAutoplay;
      previewAutoplayState.textContent = previewAutoplay ? "On" : "Off";
      frameBlendingState.textContent = frameBlendingEnabled.checked ? "On" : "Off";
      mutedInsertState.textContent = mutedInsertEnabled.checked ? "On" : "Off";
      const mode = JSON.stringify(encodeURIComponent(frameBlendingEnabled.checked ? "PIXEL_MOTION" : "OFF"));
      const autoplay = JSON.stringify(encodeURIComponent(previewAutoplay ? "ON" : "OFF"));
      const mutedInsert = JSON.stringify(encodeURIComponent(mutedInsertEnabled.checked ? "ON" : "OFF"));
      callAE(`saveClipSettings(${mode}, ${autoplay}, ${mutedInsert})`, "Settings saved.");
    }

    previewAutoplayToggle.addEventListener("change", () => {
      saveSettings();
      if (!hoverPreviewEnabled) {
        favoriteList.querySelectorAll(".favorite-result video").forEach((video) => video.pause());
      }
    });

    function saveClipPreviewFormat(format) {
      applyClipPreviewFormat(format);
      try {
        window.localStorage.setItem(CLIP_PREVIEW_FORMAT_STORAGE_KEY, clipPreviewFormat);
      } catch (error) {
        setResult(`Could not save clip preview setting: ${error.message}`, "error");
      }
      renderFavoriteClips();
    }

    clipPreviewSizeSquare.addEventListener("click", () => saveClipPreviewFormat("square"));
    clipPreviewSizeLandscape.addEventListener("click", () => saveClipPreviewFormat("landscape"));

    [saveDefaultPosition, saveDefaultScale, saveDefaultAudio].forEach((toggle) => {
      toggle.addEventListener("change", saveClipDefaults);
    });

    frameBlendingEnabled.addEventListener("change", saveSettings);
    mutedInsertEnabled.addEventListener("change", saveSettings);

    cancelDeleteButton.addEventListener("click", () => {
      hideDeleteConfirmation();
      setResult("Delete canceled.", "");
    });

    confirmDeleteButton.addEventListener("click", () => {
      if (pendingDeleteFolderId !== null) {
        const encodedId = JSON.stringify(encodeURIComponent(pendingDeleteFolderId));
        const deletedFolder = favoriteFolders.find((folder) => folder.id === pendingDeleteFolderId);
        const parentFolderToRestore = deletedFolder ? deletedFolder.parentId : "";
        hideDeleteConfirmation();
        callAE(`deleteClipFolder(${encodedId})`, "", (response) => {
          librarySearch.value = "";
          selectedFolderId = parentFolderToRestore;
          selectedFavoriteStorageIndex = null;
          selectedLibraryItemKey = "";
          syncSearchClearButtons();
          refreshFavorites(false, response);
          refreshFavoriteFolders();
        });
        return;
      }
      if (pendingDeleteFootagePath !== null) {
        const encodedPath = JSON.stringify(encodeURIComponent(pendingDeleteFootagePath));
        hideDeleteConfirmation();
        callAE(`deleteClipFavoriteFootage(${encodedPath})`, "", (response) => {
          refreshFavorites(false, response);
          refreshFavoriteFolders();
        });
        return;
      }
      if (pendingDeleteIndex === null) return;
      const indexToDelete = pendingDeleteIndex;
      const folderIdToRestore = selectedFolderId;
      hideDeleteConfirmation();
      callAE(`deleteClipFavorite(${indexToDelete})`, "", (response) => {
        selectedFolderId = folderIdToRestore;
        refreshFavorites(false, response);
      });
    });

    refreshFavorites(false);
    refreshFavoriteFolders();
    callAE("createSceneKeeperBackup(true)", "");
    window.setInterval(() => {
      callAE("createSceneKeeperBackup()", "");
    }, 60 * 60 * 1000);
    window.setInterval(() => {
      if (document.visibilityState === "visible") refreshFootageStatus();
    }, 5000);
    let quickSaveRefreshRevision = null;
    let quickSaveRevisionCheckInFlight = false;
    function checkQuickSaveRefreshRevision() {
      const cep = window.__adobe_cep__;
      if (!cep || typeof cep.evalScript !== "function" || quickSaveRevisionCheckInFlight) return;
      quickSaveRevisionCheckInFlight = true;
      cep.evalScript("getSceneKeeperQuickSaveStatus()", (response) => {
        quickSaveRevisionCheckInFlight = false;
        if (response === undefined || response === null || response === "EvalScript error.") return;
        const responseParts = String(response).split("|");
        const revision = responseParts[0];
        if (quickSaveRefreshRevision === null) {
          quickSaveRefreshRevision = revision;
          return;
        }
        if (revision !== quickSaveRefreshRevision) {
          quickSaveRefreshRevision = revision;
          let clipId = "";
          try { clipId = decodeURIComponent(responseParts[1] || ""); }
          catch (decodeError) { clipId = responseParts[1] || ""; }
          let longClipWarnings = "";
          try { longClipWarnings = decodeURIComponent(responseParts[2] || ""); }
          catch (decodeError) { longClipWarnings = responseParts[2] || ""; }
          refreshFavorites(false, "", undefined, () => {
            if (longClipWarnings) {
              setResult(`Quick Save: long clips were saved at full length: ${longClipWarnings}.`, "warning");
            }
          }, true, clipId, true);
        }
      });
    }
    checkQuickSaveRefreshRevision();
    window.setInterval(checkQuickSaveRefreshRevision, 300);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshFootageStatus();
      }
    });
    window.addEventListener("focus", () => {
      refreshFootageStatus();
    });
    callAE("getClipSettings()", "PIXEL_MOTION|ON|OFF", (settings) => {
      const values = settings.split("|");
      const mode = values[0];
      if (["PIXEL_MOTION", "FRAME_MIX", "OFF"].includes(mode)) {
        frameBlendingEnabled.checked = mode !== "OFF";
      }
      previewAutoplay = values[1] !== "OFF";
      hoverPreviewEnabled = previewAutoplay;
      previewAutoplayToggle.checked = previewAutoplay;
      mutedInsertEnabled.checked = (values[2] || "OFF") === "ON";
      previewAutoplayState.textContent = previewAutoplay ? "On" : "Off";
      frameBlendingState.textContent = frameBlendingEnabled.checked ? "On" : "Off";
      mutedInsertState.textContent = mutedInsertEnabled.checked ? "On" : "Off";
    });

    function maybeStartFirstRunGuidedTutorial() {
      try {
        if (window.localStorage.getItem(GUIDED_TUTORIAL_SEEN_KEY) === "true") return;
      } catch (error) {
        return;
      }
      startGuidedTutorial();
    }

    if (window.SceneKeeperAppReady) {
      requestAnimationFrame(maybeStartFirstRunGuidedTutorial);
    } else {
      window.addEventListener("scenekeeper-app-ready", maybeStartFirstRunGuidedTutorial, { once: true });
    }
