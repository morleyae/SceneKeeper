var sceneKeeperHostScript = new File("/Library/Application Support/Adobe/CEP/extensions/SceneKeeper/jsx/hostscript.jsx");

try {
    if (!sceneKeeperHostScript.exists) {
        throw new Error("SceneKeeper host script was not found.");
    }
    $.evalFile(sceneKeeperHostScript);
    if (typeof quickSaveSelectedClipsFromShortcut !== "function") {
        throw new Error("SceneKeeper could not load its Quick Save action.");
    }

    var sceneKeeperQuickSaveResult = String(quickSaveSelectedClipsFromShortcut() || "");
    if (sceneKeeperQuickSaveResult.indexOf("ERROR:") === 0) {
        alert(sceneKeeperQuickSaveResult.substring(6));
    } else if (sceneKeeperQuickSaveResult.indexOf("QUICKSAVE_DONE|") === 0) {
        var sceneKeeperQuickSaveParts = sceneKeeperQuickSaveResult.split("|");
        var sceneKeeperQuickSaveErrors = "";
        try {
            sceneKeeperQuickSaveErrors = decodeURIComponent(sceneKeeperQuickSaveParts[3] || "");
        } catch (decodeError) {
            sceneKeeperQuickSaveErrors = sceneKeeperQuickSaveParts[3] || "";
        }
        if (sceneKeeperQuickSaveErrors) {
            alert("Some selected layers could not be saved: " + sceneKeeperQuickSaveErrors);
        }
    } else {
        throw new Error("SceneKeeper Quick Save returned an unexpected result.");
    }
} catch (sceneKeeperQuickSaveError) {
    alert("SceneKeeper Quick Save failed: " + sceneKeeperQuickSaveError.toString());
}
