if (typeof JSON === "undefined") JSON = {};

if (typeof JSON.stringify !== "function") {
    JSON.stringify = function (value) {
        function quote(text) {
            return '"' + String(text).replace(/[\\"\u0000-\u001f]/g, function (character) {
                var escapes = { '"': '\\"', "\\": "\\\\", "\b": "\\b", "\f": "\\f", "\n": "\\n", "\r": "\\r", "\t": "\\t" };
                if (escapes[character]) return escapes[character];
                var hex = character.charCodeAt(0).toString(16);
                return "\\u" + (hex.length < 4 ? ("0000" + hex).slice(-4) : hex);
            }) + '"';
        }

        function serialize(item) {
            if (item === null) return "null";
            var type = typeof item;
            if (type === "string") return quote(item);
            if (type === "number") return isFinite(item) ? String(item) : "null";
            if (type === "boolean") return item ? "true" : "false";
            if (type === "undefined" || type === "function") return undefined;
            if (item instanceof Array) {
                var arrayValues = [];
                for (var arrayIndex = 0; arrayIndex < item.length; arrayIndex++) {
                    var arrayValue = serialize(item[arrayIndex]);
                    arrayValues.push(arrayValue === undefined ? "null" : arrayValue);
                }
                return "[" + arrayValues.join(",") + "]";
            }
            var objectValues = [];
            for (var key in item) {
                if (!Object.prototype.hasOwnProperty.call(item, key)) continue;
                var objectValue = serialize(item[key]);
                if (objectValue !== undefined) objectValues.push(quote(key) + ":" + objectValue);
            }
            return "{" + objectValues.join(",") + "}";
        }

        return serialize(value);
    };
}

if (typeof JSON.parse !== "function") {
    JSON.parse = function (input) {
        var source = String(input);
        var position = 0;

        function fail() { throw new Error("Invalid JSON at character " + position + "."); }
        function skipWhitespace() {
            while (position < source.length && /[\x20\t\r\n]/.test(source.charAt(position))) position++;
        }
        function parseString() {
            if (source.charAt(position++) !== '"') fail();
            var result = "";
            while (position < source.length) {
                var character = source.charAt(position++);
                if (character === '"') return result;
                if (character === "\\") {
                    if (position >= source.length) fail();
                    var escaped = source.charAt(position++);
                    if (escaped === '"' || escaped === "\\" || escaped === "/") result += escaped;
                    else if (escaped === "b") result += "\b";
                    else if (escaped === "f") result += "\f";
                    else if (escaped === "n") result += "\n";
                    else if (escaped === "r") result += "\r";
                    else if (escaped === "t") result += "\t";
                    else if (escaped === "u") {
                        var hex = source.substr(position, 4);
                        if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail();
                        result += String.fromCharCode(parseInt(hex, 16));
                        position += 4;
                    } else fail();
                } else {
                    if (character.charCodeAt(0) < 32) fail();
                    result += character;
                }
            }
            fail();
        }
        function parseValue() {
            skipWhitespace();
            var character = source.charAt(position);
            if (character === '"') return parseString();
            if (character === "{") {
                position++;
                var object = {};
                skipWhitespace();
                if (source.charAt(position) === "}") { position++; return object; }
                while (position < source.length) {
                    skipWhitespace();
                    if (source.charAt(position) !== '"') fail();
                    var key = parseString();
                    skipWhitespace();
                    if (source.charAt(position++) !== ":") fail();
                    object[key] = parseValue();
                    skipWhitespace();
                    var separator = source.charAt(position++);
                    if (separator === "}") return object;
                    if (separator !== ",") fail();
                }
                fail();
            }
            if (character === "[") {
                position++;
                var array = [];
                skipWhitespace();
                if (source.charAt(position) === "]") { position++; return array; }
                while (position < source.length) {
                    array.push(parseValue());
                    skipWhitespace();
                    var arraySeparator = source.charAt(position++);
                    if (arraySeparator === "]") return array;
                    if (arraySeparator !== ",") fail();
                }
                fail();
            }
            var literal;
            if (source.substr(position, 4) === "true") { position += 4; return true; }
            if (source.substr(position, 5) === "false") { position += 5; return false; }
            if (source.substr(position, 4) === "null") { position += 4; return null; }
            literal = source.substring(position).match(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+\-]?[0-9]+)?/);
            if (literal) { position += literal[0].length; return Number(literal[0]); }
            fail();
        }

        var parsed = parseValue();
        skipWhitespace();
        if (position !== source.length) fail();
        return parsed;
    };
}

function cepTest() {
    return "After Effects " + app.version;
}

function getActiveComp() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        return null;
    }
    return comp;
}

var FOOTAGE_END_TOLERANCE = 0.002;
var CLIP_TIMESTAMP_MATCH_TOLERANCE = 0.000001;
var pendingClipFavoriteReplacement = null;
var lastClipFavoriteSavedId = "";
var sceneLastReplacedLayer = null;
var pendingClipFavoriteCapture = null;
var pendingClipFavoriteImportContents = "";
var clipToolUndoHistory = [];
var clipToolRedoHistory = [];
var CLIP_TOOL_HISTORY_LIMIT = 100;
var clipTrashSequence = 0;
var clipRecordSequence = 0;
var sceneKeeperDataFolderCache = null;
var sceneKeeperDataFolderError = "";

function sceneKeeperFolderIsWritable(folder) {
    if (!folder) return false;
    try {
        if (!folder.exists && !folder.create()) return false;
        var probe = new File(folder.fsName + "/.SceneKeeper-write-test-" + new Date().getTime() + ".tmp");
        probe.encoding = "UTF-8";
        if (!probe.open("w")) return false;
        try { probe.write("SceneKeeper"); } catch (writeError) { probe.close(); try { probe.remove(); } catch (removeError) {} return false; }
        probe.close();
        try { if (probe.exists) probe.remove(); } catch (cleanupError) {}
        return true;
    } catch (folderError) {
        return false;
    }
}

function sceneKeeperMigrateDataFiles(sourceFolder, destinationFolder) {
    if (!sourceFolder || !sourceFolder.exists || !destinationFolder || !destinationFolder.exists) return true;
    var names = ["clip-favorites.txt", "clip-folders.txt", "clip-trash.txt", "settings.txt"];
    for (var i = 0; i < names.length; i++) {
        var sourceFile = new File(sourceFolder.fsName + "/" + names[i]);
        var destinationFile = new File(destinationFolder.fsName + "/" + names[i]);
        if (sourceFile.exists && !destinationFile.exists && !sourceFile.copy(destinationFile.fsName)) return false;
    }

    var sourceBackups = new Folder(sourceFolder.fsName + "/SceneKeeper Backups");
    if (sourceBackups.exists) {
        var destinationBackups = new Folder(destinationFolder.fsName + "/SceneKeeper Backups");
        if (!destinationBackups.exists && !destinationBackups.create()) return false;
        var backupFiles = sourceBackups.getFiles("SceneKeeper-*.json") || [];
        for (i = 0; i < backupFiles.length; i++) {
            var destinationBackup = new File(destinationBackups.fsName + "/" + backupFiles[i].name);
            if (!destinationBackup.exists && !backupFiles[i].copy(destinationBackup.fsName)) return false;
        }
    }
    return true;
}

function sceneKeeperDocumentsDataFolder() {
    try { return new Folder(Folder.myDocuments.fsName + "/SceneKeeper Data"); }
    catch (documentsPathError) { return null; }
}

function sceneKeeperUseDocumentsDataFolder(sourceFolder) {
    var fallbackFolder = sceneKeeperDocumentsDataFolder();
    if (!sceneKeeperFolderIsWritable(fallbackFolder)) return null;
    if (sourceFolder && sourceFolder.fsName !== fallbackFolder.fsName && sourceFolder.exists &&
        !sceneKeeperMigrateDataFiles(sourceFolder, fallbackFolder)) {
        sceneKeeperDataFolderError = "SceneKeeper cannot copy its existing library from " + sourceFolder.fsName + " to " + fallbackFolder.fsName + ". Check the folder permissions.";
        return null;
    }
    var markerFile = new File(fallbackFolder.fsName + "/.SceneKeeper-storage-location");
    if (!markerFile.exists) {
        markerFile.encoding = "UTF-8";
        if (markerFile.open("w")) {
            try { markerFile.write("Documents"); } catch (markerWriteError) {}
            markerFile.close();
        }
    }
    sceneKeeperDataFolderCache = fallbackFolder;
    sceneKeeperDataFolderError = "SceneKeeper is using its Documents data folder because the Adobe user-data folder is not writable.";
    return sceneKeeperDataFolderCache;
}

function getSceneKeeperDataFolder() {
    if (sceneKeeperDataFolderCache && sceneKeeperDataFolderCache.exists) return sceneKeeperDataFolderCache;

    var primaryFolder = null;
    try { primaryFolder = new Folder(Folder.userData.fsName + "/CEP Tool"); } catch (primaryPathError) {}
    var fallbackFolder = sceneKeeperDocumentsDataFolder();
    var markerFile = fallbackFolder ? new File(fallbackFolder.fsName + "/.SceneKeeper-storage-location") : null;
    if (markerFile && markerFile.exists) {
        if (sceneKeeperFolderIsWritable(fallbackFolder)) {
            sceneKeeperDataFolderCache = fallbackFolder;
            sceneKeeperDataFolderError = "";
            return sceneKeeperDataFolderCache;
        }
        sceneKeeperDataFolderError = "SceneKeeper's saved data folder is not writable: " + fallbackFolder.fsName + ". Check its permissions and available disk space.";
        return null;
    }

    if (sceneKeeperFolderIsWritable(primaryFolder)) {
        sceneKeeperDataFolderCache = primaryFolder;
        sceneKeeperDataFolderError = "";
        return sceneKeeperDataFolderCache;
    }

    var documentsFallback = sceneKeeperUseDocumentsDataFolder(primaryFolder);
    if (documentsFallback) return documentsFallback;

    var primaryPath = primaryFolder ? primaryFolder.fsName : "Adobe user-data folder";
    var fallbackPath = fallbackFolder ? fallbackFolder.fsName : "Documents folder";
    sceneKeeperDataFolderError = "SceneKeeper cannot write to " + primaryPath + " or " + fallbackPath + ". Check folder permissions and available disk space.";
    return null;
}

function sceneCreateBackupInDataFolder(dataFolder, snapshot) {
    if (!dataFolder) return "ERROR: Could not access SceneKeeper storage. " + sceneKeeperDataFolderError;
    var folder = new Folder(dataFolder.fsName + "/SceneKeeper Backups");
    if (!folder.exists && !folder.create()) return "ERROR: Could not create backup folder at " + folder.fsName + ". Check folder permissions and available disk space.";
    var stamp = (new Date()).getTime();
    var file = new File(folder.fsName + "/SceneKeeper-" + stamp + ".json");
    file.encoding = "UTF-8";
    if (!file.open("w")) return "ERROR: Could not write SceneKeeper backup to " + file.fsName + ". Check folder permissions and available disk space.";
    try { file.write(JSON.stringify(snapshot)); } catch (e) { file.close(); return "ERROR: Could not write SceneKeeper backup to " + file.fsName + ". " + e.toString(); }
    file.close();
    var backups = folder.getFiles("SceneKeeper-*.json");
    backups.sort(function (a, b) { return b.modified.getTime() - a.modified.getTime(); });
    for (var i = 10; i < backups.length; i++) backups[i].remove();
    return "BACKUP_SAVED";
}

function sceneHasRecentBackup(dataFolder) {
    if (!dataFolder) return false;
    var folder = new Folder(dataFolder.fsName + "/SceneKeeper Backups");
    if (!folder.exists) return false;
    var backups = folder.getFiles("SceneKeeper-*.json") || [];
    var newestTime = 0;
    for (var i = 0; i < backups.length; i++) {
        var backup = backups[i];
        var backupTime = backup.modified ? backup.modified.getTime() : 0;
        if (!backupTime) {
            var match = backup.name.match(/^SceneKeeper-(\d+)\.json$/);
            if (match) backupTime = Number(match[1]);
        }
        if (backupTime > newestTime) newestTime = backupTime;
    }
    var age = (new Date()).getTime() - newestTime;
    return newestTime > 0 && age >= 0 && age < 10 * 60 * 1000;
}

function createSceneKeeperBackup(skipIfRecent) {
    var dataFolder = getSceneKeeperDataFolder();
    if (!dataFolder) return "ERROR: Could not access SceneKeeper storage. " + sceneKeeperDataFolderError;
    if (skipIfRecent && sceneHasRecentBackup(dataFolder)) return "BACKUP_RECENT";
    var snapshot = {
        version: 1,
        createdAt: String(new Date()),
        favorites: readClipFavoriteRecords(),
        folders: readClipFolderRecords(),
        trash: readClipTrashRecords()
    };
    var result = sceneCreateBackupInDataFolder(dataFolder, snapshot);
    if (result === "BACKUP_SAVED") return result;

    var fallbackFolder = sceneKeeperUseDocumentsDataFolder(dataFolder);
    if (!fallbackFolder || fallbackFolder.fsName === dataFolder.fsName) return result;
    return sceneCreateBackupInDataFolder(fallbackFolder, snapshot);
}

function getClipFavoritesFile() {
    var folder = getSceneKeeperDataFolder();
    if (!folder) return null;
    return new File(folder.fsName + "/clip-favorites.txt");
}

function getClipFoldersFile() {
    var folder = getSceneKeeperDataFolder();
    if (!folder) return null;
    return new File(folder.fsName + "/clip-folders.txt");
}

function getClipTrashFile() {
    var folder = getSceneKeeperDataFolder();
    if (!folder) return null;
    return new File(folder.fsName + "/clip-trash.txt");
}

function decodeClipFavoriteRecords(contents) {
    var records = [];
    var lines = contents.split(/[\r\n]+/);
    for (var i = 0; i < lines.length; i++) {
        if (!lines[i] || lines[i].indexOf("#SCENEKEEPER_FAVORITES") === 0) {
            continue;
        }
        var fields = lines[i].split("\t");
        if (fields.length !== 4 && fields.length !== 7 && fields.length !== 9 && fields.length !== 10 && fields.length !== 11 && fields.length !== 13 && fields.length !== 14 && fields.length !== 16 && fields.length !== 17 && fields.length !== 18) {
            continue;
        }
        try {
            if (fields.length === 4) {
                records.push({
                    displayName: decodeURIComponent(fields[0]),
                    sourceName: decodeURIComponent(fields[0]),
                    sourcePath: decodeURIComponent(fields[1]),
                    sourceIn: parseFloat(decodeURIComponent(fields[2])),
                    sourceOut: parseFloat(decodeURIComponent(fields[3])),
                    positionX: null,
                    positionY: null,
                    scaleX: null,
                    scaleY: null,
                    folderId: "",
                    audioEnabled: null,
                    compWidth: null,
                    compHeight: null,
                    sourceWidth: null,
                    sourceHeight: null
                });
            } else {
                var audioState = fields.length >= 11 ? decodeURIComponent(fields[10]) : "";
                records.push({
                    displayName: decodeURIComponent(fields[0]),
                    sourceName: decodeURIComponent(fields[1]),
                    sourcePath: decodeURIComponent(fields[2]),
                    sourceIn: parseFloat(decodeURIComponent(fields[3])),
                    sourceOut: parseFloat(decodeURIComponent(fields[4])),
                    positionX: parseFloat(decodeURIComponent(fields[5])),
                    positionY: parseFloat(decodeURIComponent(fields[6])),
                    scaleX: fields.length >= 9 ? parseFloat(decodeURIComponent(fields[7])) : null,
                    scaleY: fields.length >= 9 ? parseFloat(decodeURIComponent(fields[8])) : null,
                    folderId: fields.length >= 10 ? decodeURIComponent(fields[9]) : "",
                    audioEnabled: audioState === "1" ? true : (audioState === "0" ? false : null),
                    compWidth: fields.length >= 13 ? parseFloat(decodeURIComponent(fields[11])) : null,
                    compHeight: fields.length >= 13 ? parseFloat(decodeURIComponent(fields[12])) : null,
                    clipId: fields.length >= 14 ? decodeURIComponent(fields[13]) : "",
                    sourceWidth: fields.length >= 16 ? parseFloat(decodeURIComponent(fields[14])) : null,
                    sourceHeight: fields.length >= 16 ? parseFloat(decodeURIComponent(fields[15])) : null,
                    footageMetadata: fields.length >= 17 ? parseClipFootageMetadata(decodeURIComponent(fields[16])) : null,
                    sortOrder: fields.length === 18 && decodeURIComponent(fields[17]) !== ""
                        ? parseInt(decodeURIComponent(fields[17]), 10)
                        : null
                });
            }
        } catch (e) {
            // Ignore malformed favorite entries.
        }
    }
    return records;
}

function parseClipFootageMetadata(value) {
    if (!value) return null;
    try {
        var metadata = JSON.parse(value);
        if (metadata && typeof metadata === "object") return metadata;
    } catch (e) {}
    return null;
}

function normalizeClipFavoriteRecordNames(records, folders) {
    for (var i = 0; i < records.length; i++) {
        if (!records[i].folderId) {
            continue;
        }
        var folderExists = false;
        for (var folderIndex = 0; folderIndex < folders.length; folderIndex++) {
            if (folders[folderIndex].id === records[i].folderId) {
                folderExists = true;
                break;
            }
        }
        if (!folderExists) {
            continue;
        }
        var legacyNameMatch = (records[i].displayName || "").match(/^(Clip \d+) - .+$/i);
        if (legacyNameMatch) {
            records[i].displayName = legacyNameMatch[1];
        }
    }
    return records;
}

function getClipRecordId() {
    clipRecordSequence++;
    return String(new Date().getTime()) + "-clip-" + clipRecordSequence;
}

function ensureClipRecordIds(records) {
    for (var i = 0; i < records.length; i++) {
        if (!records[i].clipId) {
            var identity = [
                records[i].displayName,
                records[i].sourcePath,
                records[i].sourceIn,
                records[i].sourceOut,
                records[i].folderId || ""
            ].join("|");
            var hash = 2166136261;
            for (var characterIndex = 0; characterIndex < identity.length; characterIndex++) {
                hash ^= identity.charCodeAt(characterIndex);
                hash = (hash * 16777619) >>> 0;
            }
            records[i].clipId = "legacy-" + i + "-" + hash;
        }
    }
    return records;
}

function readClipFavoriteRecords() {
    var file = getClipFavoritesFile();
    if (!file || !file.exists) {
        return [];
    }
    file.encoding = "UTF-8";
    if (!file.open("r")) {
        return [];
    }
    var contents = file.read();
    file.close();
    return ensureClipRecordIds(
        normalizeClipFavoriteRecordNames(decodeClipFavoriteRecords(contents), readClipFolderRecords())
    );
}

function getClipTrashObjectId() {
    clipTrashSequence++;
    return String(new Date().getTime()) + "-" + clipTrashSequence;
}

function readClipTrashRecords() {
    var file = getClipTrashFile();
    if (!file || !file.exists) {
        return [];
    }
    file.encoding = "UTF-8";
    if (!file.open("r")) {
        return [];
    }
    var contents = file.read();
    file.close();
    var entries = [];
    var lines = contents.split(/[\r\n]+/);
    for (var i = 0; i < lines.length; i++) {
        if (!lines[i]) {
            continue;
        }
        if (lines[i].indexOf("C\t") === 0) {
            var clipFields = lines[i].split("\t");
            var trashId = clipFields.length > 2 ? decodeURIComponent(clipFields[1]) : "";
            var folderName = clipFields.length > 2 ? decodeURIComponent(clipFields[2]) : "";
            var clipLine = clipFields.length > 2 ? clipFields.slice(3).join("\t") : lines[i].substring(2);
            var clips = decodeClipFavoriteRecords(clipLine);
            if (clips.length) {
                entries.push({
                    type: "clip",
                    trashId: trashId || ("legacy-" + encodeURIComponent(clipLine)),
                    record: clips[0],
                    folderName: folderName
                });
            }
        } else if (lines[i].indexOf("F\t") === 0) {
            try {
                var folderEntry = JSON.parse(decodeURIComponent(lines[i].substring(2)));
                if (folderEntry && folderEntry.type === "folder" && folderEntry.trashId &&
                    folderEntry.folder && folderEntry.folders && folderEntry.clips) {
                    entries.push(folderEntry);
                }
            } catch (e) {
                // Ignore malformed trash entries.
            }
        } else {
            var legacyClips = decodeClipFavoriteRecords(lines[i]);
            if (legacyClips.length) {
                entries.push({ type: "clip", trashId: "legacy-" + encodeURIComponent(lines[i]), record: legacyClips[0], folderName: "" });
            }
        }
    }
    for (var entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        if (entries[entryIndex].type === "clip") {
            ensureClipRecordIds([entries[entryIndex].record]);
        } else {
            ensureClipRecordIds(entries[entryIndex].clips);
        }
    }
    return entries;
}

function writeClipTrashRecords(records) {
    var file = getClipTrashFile();
    if (!file) {
        return false;
    }
    var lines = [];
    for (var i = 0; i < records.length; i++) {
        if (records[i].type === "folder") {
            lines.push("F\t" + encodeURIComponent(JSON.stringify(records[i])));
        } else if (records[i].type === "clip" && records[i].record) {
            lines.push("C\t" + encodeURIComponent(records[i].trashId) + "\t" +
                encodeURIComponent(records[i].folderName || "") + "\t" +
                encodeClipFavoriteRecord(records[i].record));
        }
    }
    file.encoding = "UTF-8";
    if (!file.open("w")) {
        return false;
    }
    try {
        file.write(lines.length ? lines.join("\n") + "\n" : "");
    } catch (e) {
        file.close();
        return false;
    }
    file.close();
    return true;
}

var clipPreviewCleanupWarning = "";

function sceneEnsurePreviewFolder(folder) {
    if (!folder) return false;
    try {
        if (folder.exists) return true;
        var parent = folder.parent;
        if (parent && !parent.exists && !parent.create()) return false;
        return folder.create() || folder.exists;
    } catch (folderError) {
        return false;
    }
}

function getSceneKeeperPreviewCacheFolders() {
    var folders = [];
    try {
        folders.push(new Folder(Folder.userData.fsName + "/CEP Tool/preview-cache"));
    } catch (primaryCacheError) {}
    try {
        var documentsFolder = sceneKeeperDocumentsDataFolder();
        if (documentsFolder) {
            var documentsCache = new Folder(documentsFolder.fsName + "/preview-cache");
            var duplicate = false;
            for (var i = 0; i < folders.length; i++) {
                if (folders[i].fsName === documentsCache.fsName) duplicate = true;
            }
            if (!duplicate) folders.push(documentsCache);
        }
    } catch (documentsCacheError) {}
    try {
        var temporaryFolder = new Folder(Folder.temp.fsName + "/SceneKeeper/preview-cache");
        var duplicateTemporary = false;
        for (var temporaryIndex = 0; temporaryIndex < folders.length; temporaryIndex++) {
            if (folders[temporaryIndex].fsName === temporaryFolder.fsName) duplicateTemporary = true;
        }
        if (!duplicateTemporary) folders.push(temporaryFolder);
    } catch (temporaryCacheError) {}
    return folders;
}

function getSceneKeeperPreviewCacheDirectory() {
    var folders = getSceneKeeperPreviewCacheFolders();
    for (var i = 0; i < folders.length; i++) {
        if (sceneEnsurePreviewFolder(folders[i].parent) && sceneEnsurePreviewFolder(folders[i]) && sceneKeeperFolderIsWritable(folders[i])) {
            return folders[i].fsName.replace(/\\/g, "/");
        }
    }
    return "ERROR: SceneKeeper cannot create a preview cache in Adobe user data, Documents, or temporary storage.";
}

function getClipPreviewCachePath(record, version, folderOverride) {
    var folder = folderOverride || new Folder(Folder.userData.fsName + "/CEP Tool/preview-cache");
    var identity = record.sourcePath + "|" + record.sourceIn + "|" + record.sourceOut;
    var key = version + "|" + identity;
    var hash = 2166136261;
    for (var i = 0; i < key.length; i++) {
        var value = (hash ^ key.charCodeAt(i)) >>> 0;
        var lowProduct = (value & 65535) * 403;
        var lowWord = lowProduct & 65535;
        var highWord = (((value >>> 16) * 403) + ((value & 65535) * 256) + Math.floor(lowProduct / 65536)) & 65535;
        hash = highWord * 65536 + lowWord;
    }
    return new File(folder.fsName + "/clip-" + hash.toString(16) + ".mp4");
}

function getClipRecordsFromTrashEntry(entry) {
    if (!entry) {
        return [];
    }
    if (entry.type === "clip" && entry.record) {
        return [entry.record];
    }
    if (entry.type === "folder" && entry.clips) {
        return entry.clips;
    }
    return [];
}

function removeOrphanedClipPreviews(entries) {
    clipPreviewCleanupWarning = "";
    var candidates = [];
    var retainedKeys = {};
    var versions = ["small-h264-v1", "small-h264-v2", "small-h264-v3-15s"];
    function addRetainedRecord(record) {
        if (record && record.sourcePath) {
            retainedKeys["$" + record.sourcePath + "|" + record.sourceIn + "|" + record.sourceOut] = true;
        }
    }
    var favoriteRecords = readClipFavoriteRecords();
    for (var favoriteIndex = 0; favoriteIndex < favoriteRecords.length; favoriteIndex++) {
        addRetainedRecord(favoriteRecords[favoriteIndex]);
    }
    var trashRecords = readClipTrashRecords();
    for (var trashIndex = 0; trashIndex < trashRecords.length; trashIndex++) {
        var retainedTrashClips = getClipRecordsFromTrashEntry(trashRecords[trashIndex]);
        for (var retainedIndex = 0; retainedIndex < retainedTrashClips.length; retainedIndex++) {
            addRetainedRecord(retainedTrashClips[retainedIndex]);
        }
    }
    for (var entryIndex = 0; entryIndex < entries.length; entryIndex++) {
        var removedClips = getClipRecordsFromTrashEntry(entries[entryIndex]);
        for (var clipIndex = 0; clipIndex < removedClips.length; clipIndex++) {
            var clip = removedClips[clipIndex];
            if (!clip || !clip.sourcePath) {
                continue;
            }
            var identity = clip.sourcePath + "|" + clip.sourceIn + "|" + clip.sourceOut;
            if (!retainedKeys["$" + identity]) {
                candidates.push(clip);
            }
        }
    }
    for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
        for (var versionIndex = 0; versionIndex < versions.length; versionIndex++) {
            var cacheFolders = getSceneKeeperPreviewCacheFolders();
            for (var folderIndex = 0; folderIndex < cacheFolders.length; folderIndex++) {
                var previewFile = getClipPreviewCachePath(candidates[candidateIndex], versions[versionIndex], cacheFolders[folderIndex]);
                if (!previewFile.exists) continue;
                if (!previewFile.remove()) {
                    clipPreviewCleanupWarning = " A preview file could not be removed: " + previewFile.fsName;
                }
            }
        }
    }
    return clipPreviewCleanupWarning;
}

function addClipRecordsToTrash(records) {
    if (!records.length) {
        clipPreviewCleanupWarning = "";
        return true;
    }
    clipPreviewCleanupWarning = "";
    var trashRecords = readClipTrashRecords();
    var folders = readClipFolderRecords();
    for (var i = records.length - 1; i >= 0; i--) {
        var folderName = "";
        for (var folderIndex = 0; folderIndex < folders.length; folderIndex++) {
            if (folders[folderIndex].id === records[i].folderId) {
                folderName = folders[folderIndex].name;
                break;
            }
        }
        trashRecords.unshift({
            type: "clip",
            trashId: getClipTrashObjectId(),
            record: records[i],
            folderName: folderName
        });
    }
    var evictedEntries = [];
    while (trashRecords.length > 10) {
        evictedEntries.push(trashRecords.pop());
    }
    if (!writeClipTrashRecords(trashRecords)) {
        return false;
    }
    removeOrphanedClipPreviews(evictedEntries);
    return true;
}

function listClipTrash() {
    var records = readClipTrashRecords();
    if (!records.length) {
        return "NO_TRASH";
    }
    var lines = [];
    for (var i = 0; i < records.length; i++) {
        if (records[i].type === "folder") {
            lines.push("F\t" + encodeURIComponent(JSON.stringify(records[i])));
        } else if (records[i].type === "clip" && records[i].record) {
            lines.push("C\t" + encodeURIComponent(records[i].trashId) + "\t" +
                encodeURIComponent(records[i].folderName || "") + "\t" +
                encodeClipFavoriteRecord(records[i].record));
        }
    }
    return lines.join("\n");
}

function encodeClipFavoriteRecord(record) {
    function encodeField(value) {
        return encodeURIComponent(value).replace(/%20/g, " ");
    }
    return encodeField(record.displayName) + "\t" +
        encodeField(record.sourceName) + "\t" +
        encodeField(record.sourcePath) + "\t" +
        encodeField(record.sourceIn.toString()) + "\t" +
        encodeField(record.sourceOut.toString()) + "\t" +
        encodeField(record.positionX === null ? "" : record.positionX.toString()) + "\t" +
        encodeField(record.positionY === null ? "" : record.positionY.toString()) + "\t" +
        encodeField(record.scaleX === null ? "" : record.scaleX.toString()) + "\t" +
        encodeField(record.scaleY === null ? "" : record.scaleY.toString()) + "\t" +
        encodeField(record.folderId || "") + "\t" +
        encodeField(record.audioEnabled === null || record.audioEnabled === undefined ? "" : (record.audioEnabled ? "1" : "0")) + "\t" +
        encodeField(record.compWidth === null || record.compWidth === undefined ? "" : record.compWidth.toString()) + "\t" +
        encodeField(record.compHeight === null || record.compHeight === undefined ? "" : record.compHeight.toString()) + "\t" +
        encodeField(record.clipId || (record.clipId = getClipRecordId())) + "\t" +
        encodeField(record.sourceWidth === null || record.sourceWidth === undefined ? "" : record.sourceWidth.toString()) + "\t" +
        encodeField(record.sourceHeight === null || record.sourceHeight === undefined ? "" : record.sourceHeight.toString()) + "\t" +
        encodeField(record.footageMetadata ? JSON.stringify(record.footageMetadata) : "") + "\t" +
        encodeField(typeof record.sortOrder === "number" && !isNaN(record.sortOrder) ? record.sortOrder.toString() : "");
}

function isClipFavoriteNameTakenInFolder(records, name, folderId, excludedIndex) {
    var normalizedName = name.toLowerCase();
    for (var i = 0; i < records.length; i++) {
        if (i !== excludedIndex && (records[i].folderId || "") === (folderId || "") &&
            records[i].displayName.toLowerCase() === normalizedName) {
            return true;
        }
    }
    var trashEntries = readClipTrashRecords();
    for (var trashIndex = 0; trashIndex < trashEntries.length; trashIndex++) {
        var trashEntry = trashEntries[trashIndex];
        var trashedClips = trashEntry.type === "folder" ? trashEntry.clips :
            (trashEntry.record ? [trashEntry.record] : []);
        for (var clipIndex = 0; clipIndex < trashedClips.length; clipIndex++) {
            var trashedClip = trashedClips[clipIndex];
            if ((trashedClip.folderId || "") === (folderId || "") &&
                trashedClip.displayName.toLowerCase() === normalizedName) {
                return true;
            }
        }
    }
    return false;
}

function makeUniqueClipFavoriteNameInFolder(records, requestedName, folderId, excludedIndex) {
    var name = requestedName;
    var suffix = 2;
    while (isClipFavoriteNameTakenInFolder(records, name, folderId, excludedIndex)) {
        name = requestedName + " (" + suffix + ")";
        suffix++;
    }
    return name;
}

function readClipFolderRecords() {
    var file = getClipFoldersFile();
    if (!file || !file.exists) {
        return [];
    }
    file.encoding = "UTF-8";
    if (!file.open("r")) {
        return [];
    }
    var contents = file.read();
    file.close();
    var records = [];
    var lines = contents.split(/[\r\n]+/);
    for (var i = 0; i < lines.length; i++) {
        if (!lines[i]) {
            continue;
        }
        var fields = lines[i].split("\t");
        if (fields.length !== 3 && fields.length !== 4 && fields.length !== 5) {
            continue;
        }
        try {
            records.push({
                id: decodeURIComponent(fields[0]),
                name: decodeURIComponent(fields[1]),
                sourcePath: decodeURIComponent(fields[2]),
                parentId: fields.length >= 4 ? decodeURIComponent(fields[3]) : "",
                sortOrder: fields.length === 5 && fields[4] !== "" ? parseInt(fields[4], 10) : null
            });
        } catch (e) {
            // Ignore malformed folder entries.
        }
    }
    return records;
}

function writeClipFolderRecords(records) {
    var file = getClipFoldersFile();
    if (!file) {
        return false;
    }
    var lines = [];
    for (var i = 0; i < records.length; i++) {
        lines.push(encodeURIComponent(records[i].id) + "\t" +
            encodeURIComponent(records[i].name).replace(/%20/g, " ") + "\t" +
            encodeURIComponent(records[i].sourcePath).replace(/%20/g, " ") + "\t" +
            encodeURIComponent(records[i].parentId || "") + "\t" +
            (typeof records[i].sortOrder === "number" && !isNaN(records[i].sortOrder) ? String(records[i].sortOrder) : ""));
    }
    if (sceneWriteDataFileLines(file, lines)) return true;
    var failedFolder = sceneKeeperDataFolderCache;
    var fallbackFolder = sceneKeeperUseDocumentsDataFolder(failedFolder);
    if (!fallbackFolder || (failedFolder && fallbackFolder.fsName === failedFolder.fsName)) return false;
    return sceneWriteDataFileLines(new File(fallbackFolder.fsName + "/clip-folders.txt"), lines);
}

function listClipFolders() {
    var records = readClipFolderRecords();
    if (!records.length) {
        return "NO_FOLDERS";
    }
    var lines = [];
    for (var i = 0; i < records.length; i++) {
        lines.push(encodeURIComponent(records[i].id) + "\t" +
            encodeURIComponent(records[i].name).replace(/%20/g, " ") + "\t" +
            encodeURIComponent(records[i].sourcePath).replace(/%20/g, " ") + "\t" +
            encodeURIComponent(records[i].parentId || "") + "\t" +
            (typeof records[i].sortOrder === "number" && !isNaN(records[i].sortOrder) ? String(records[i].sortOrder) : ""));
    }
    return lines.join("\n");
}

function createClipFolder(encodedId, encodedName, encodedSourcePath, encodedParentId) {
    var id = decodeURIComponent(encodedId || "");
    var name = decodeURIComponent(encodedName || "").replace(/^\s+|\s+$/g, "");
    var sourcePath = decodeURIComponent(encodedSourcePath || "");
    var parentId = decodeURIComponent(encodedParentId || "");
    if (!id || !name) {
        return "ERROR: Enter a folder name first.";
    }
    var records = readClipFolderRecords();
    for (var i = 0; i < records.length; i++) {
        if (records[i].id === id) {
            return "ERROR: Folder already exists.";
        }
    }
    if (parentId) {
        var parentExists = false;
        for (var p = 0; p < records.length; p++) {
            if (records[p].id === parentId) {
                parentExists = true;
                break;
            }
        }
        if (!parentExists) {
            return "ERROR: Parent folder not found.";
        }
    }
    records.push({ id: id, name: name, sourcePath: sourcePath, parentId: parentId, sortOrder: null });
    if (!writeClipFolderRecords(records)) {
        return "ERROR: Could not create the folder.";
    }
    return "Created folder: " + name;
}

function moveClipFolder(encodedId, encodedParentId) {
    var id = decodeURIComponent(encodedId || "");
    var parentId = decodeURIComponent(encodedParentId || "");
    var records = readClipFolderRecords();
    var sourceIndex = -1;
    for (var i = 0; i < records.length; i++) {
        if (records[i].id === id) {
            sourceIndex = i;
            break;
        }
    }
    if (sourceIndex < 0) {
        return "ERROR: Folder not found.";
    }
    if ((records[sourceIndex].parentId || "") === parentId) {
        return "Folder is already in this location.";
    }

    var visitedParents = {};
    var currentParentId = parentId;
    while (currentParentId) {
        if (currentParentId === id) {
            return "ERROR: A folder cannot be moved inside itself.";
        }
        var parentKey = "$" + currentParentId;
        if (visitedParents[parentKey]) {
            return "ERROR: The destination folder hierarchy is invalid.";
        }
        visitedParents[parentKey] = true;

        var nextParentId = "";
        var parentExists = false;
        for (var p = 0; p < records.length; p++) {
            if (records[p].id === currentParentId) {
                parentExists = true;
                nextParentId = records[p].parentId || "";
                break;
            }
        }
        if (!parentExists) {
            return "ERROR: Parent folder not found.";
        }
        currentParentId = nextParentId;
    }

    records[sourceIndex].parentId = parentId;
    records[sourceIndex].sortOrder = null;
    if (!writeClipFolderRecords(records)) {
        return "ERROR: Could not move the folder.";
    }
    return "Moved folder: " + records[sourceIndex].name;
}

function reorderClipFolders(encodedParentId, encodedFolderIds) {
    var parentId = decodeURIComponent(encodedParentId || "");
    var requestedIds;
    try {
        requestedIds = JSON.parse(decodeURIComponent(encodedFolderIds || ""));
    } catch (e) {
        return "ERROR: The requested folder order is invalid.";
    }
    if (!(requestedIds instanceof Array) || !requestedIds.length) {
        return "ERROR: Select sibling folders to reorder.";
    }

    var records = readClipFolderRecords();
    var siblingIds = {};
    var folderCount = 0;
    for (var i = 0; i < records.length; i++) {
        if ((records[i].parentId || "") === parentId) {
            siblingIds["$" + records[i].id] = records[i];
            folderCount++;
        }
    }
    if (requestedIds.length !== folderCount) {
        return "ERROR: The folder order is incomplete or includes another collection.";
    }

    var orderedFolders = [];
    var seenIds = {};
    for (var idIndex = 0; idIndex < requestedIds.length; idIndex++) {
        var requestedId = requestedIds[idIndex];
        var lookupKey = "$" + requestedId;
        if (typeof requestedId !== "string" || seenIds[lookupKey] || !siblingIds[lookupKey]) {
            return "ERROR: The folder order contains an invalid or duplicate folder.";
        }
        seenIds[lookupKey] = true;
        orderedFolders.push(siblingIds[lookupKey]);
    }

    var orderedIndex = 0;
    for (var slotIndex = 0; slotIndex < records.length; slotIndex++) {
        if ((records[slotIndex].parentId || "") === parentId) {
            records[slotIndex] = orderedFolders[orderedIndex];
            records[slotIndex].sortOrder = orderedIndex;
            orderedIndex++;
        }
    }
    if (!writeClipFolderRecords(records)) {
        return "ERROR: Could not save the folder order.";
    }
    return "Folder order updated.";
}

function reorderClipLibraryItems(encodedParentId, encodedOrder) {
    var parentId = decodeURIComponent(encodedParentId || "");
    var requestedIds;
    try {
        requestedIds = JSON.parse(decodeURIComponent(encodedOrder || ""));
    } catch (e) {
        return "ERROR: The requested item order is invalid.";
    }
    if (!(requestedIds instanceof Array) || !requestedIds.length) {
        return "ERROR: Select items in one collection to reorder.";
    }

    var folders = readClipFolderRecords();
    var clips = readClipFavoriteRecords();
    var itemMap = {};
    var itemCount = 0;
    var folderIndex;
    var clipIndex;
    for (folderIndex = 0; folderIndex < folders.length; folderIndex++) {
        if ((folders[folderIndex].parentId || "") === parentId) {
            itemMap["$folder:" + folders[folderIndex].id] = { type: "folder", record: folders[folderIndex] };
            itemCount++;
        }
    }
    for (clipIndex = 0; clipIndex < clips.length; clipIndex++) {
        if ((clips[clipIndex].folderId || "") === parentId) {
            itemMap["$clip:" + clips[clipIndex].clipId] = { type: "clip", record: clips[clipIndex] };
            itemCount++;
        }
    }
    if (requestedIds.length !== itemCount) {
        return "ERROR: The item order is incomplete or includes another collection.";
    }

    var seenIds = {};
    for (var orderIndex = 0; orderIndex < requestedIds.length; orderIndex++) {
        var requestedId = requestedIds[orderIndex];
        var lookupKey = "$" + requestedId;
        if (typeof requestedId !== "string" || seenIds[lookupKey] || !itemMap[lookupKey]) {
            return "ERROR: The item order contains an invalid or duplicate item.";
        }
        seenIds[lookupKey] = true;
        itemMap[lookupKey].record.sortOrder = orderIndex;
    }

    if (!writeClipFolderRecords(folders) || !writeClipFavoriteRecords(clips)) {
        return "ERROR: Could not save the item order.";
    }
    return "Collection order updated.";
}

function renameClipFolder(encodedId, encodedName) {
    var id = decodeURIComponent(encodedId || "");
    var name = decodeURIComponent(encodedName || "").replace(/^\s+|\s+$/g, "");
    if (!name) {
        return "ERROR: Folder name cannot be empty.";
    }
    var records = readClipFolderRecords();
    for (var i = 0; i < records.length; i++) {
        if (records[i].id === id) {
            records[i].name = name;
            if (!writeClipFolderRecords(records)) {
                return "ERROR: Could not save the folder name.";
            }
            return "Renamed folder: " + name;
        }
    }
    return "ERROR: Folder not found.";
}

function deleteClipFolder(encodedId) {
    var id = decodeURIComponent(encodedId || "");
    var folders = readClipFolderRecords();
    var folderName = "";
    var rootFolderRecord = null;
    var keptFolders = [];
    var deletedFolderIds = {};
    deletedFolderIds["$" + id] = true;
    for (var i = 0; i < folders.length; i++) {
        if (folders[i].id === id) {
            folderName = folders[i].name;
            rootFolderRecord = folders[i];
        }
    }
    if (!folderName) {
        return "ERROR: Folder not found.";
    }
    var foundChild = true;
    while (foundChild) {
        foundChild = false;
        for (var f = 0; f < folders.length; f++) {
            if (folders[f].parentId && deletedFolderIds["$" + folders[f].parentId] &&
                !deletedFolderIds["$" + folders[f].id]) {
                deletedFolderIds["$" + folders[f].id] = true;
                foundChild = true;
            }
        }
    }
    for (var k = 0; k < folders.length; k++) {
        if (!deletedFolderIds["$" + folders[k].id]) {
            keptFolders.push(folders[k]);
        }
    }
    var deletedFolders = [];
    for (var deletedFolderIndex = 0; deletedFolderIndex < folders.length; deletedFolderIndex++) {
        if (deletedFolderIds["$" + folders[deletedFolderIndex].id]) {
            deletedFolders.push(folders[deletedFolderIndex]);
        }
    }
    var clips = readClipFavoriteRecords();
    var keptClips = [];
    var deletedClips = [];
    for (var c = 0; c < clips.length; c++) {
        if (!deletedFolderIds["$" + clips[c].folderId]) {
            keptClips.push(clips[c]);
        } else {
            deletedClips.push(clips[c]);
        }
    }
    var trashEntries = readClipTrashRecords();
    trashEntries.unshift({
        type: "folder",
        trashId: getClipTrashObjectId(),
        folder: rootFolderRecord,
        folders: deletedFolders,
        clips: deletedClips
    });
    var evictedEntries = [];
    while (trashEntries.length > 10) {
        evictedEntries.push(trashEntries.pop());
    }
    if (!writeClipTrashRecords(trashEntries) ||
        !writeClipFavoriteRecords(keptClips) ||
        !writeClipFolderRecords(keptFolders)) {
        return "ERROR: Could not delete the folder.";
    }
    var cleanupWarning = removeOrphanedClipPreviews(evictedEntries);
    return "Deleted folder and its contents: " + folderName + "." + cleanupWarning;
}

function assignClipFavoriteFolder(index, encodedFolderId) {
    var folderId = decodeURIComponent(encodedFolderId || "");
    var clips = readClipFavoriteRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= clips.length) {
        return "ERROR: Select a clip first.";
    }
    if (folderId) {
        var folders = readClipFolderRecords();
        var matchingFolder = false;
        for (var f = 0; f < folders.length; f++) {
            if (folders[f].id === folderId) {
                matchingFolder = true;
                break;
            }
        }
        if (!matchingFolder) {
            return "ERROR: Folder not found.";
        }
    }
    clips[index].displayName = makeUniqueClipFavoriteNameInFolder(
        clips,
        clips[index].displayName,
        folderId,
        index
    );
    clips[index].folderId = folderId;
    if (!writeClipFavoriteRecords(clips)) {
        return "ERROR: Could not move the clip.";
    }
    return folderId ? "Moved clip to collection." : "Moved clip to Home.";
}

function sceneWriteDataFileLines(file, lines) {
    if (!file) return false;
    file.encoding = "UTF-8";
    if (!file.open("w")) {
        sceneKeeperDataFolderError = "SceneKeeper could not write to " + file.fsName + ". Check folder permissions and available disk space.";
        return false;
    }
    try {
        file.write(lines.length ? lines.join("\n") + "\n" : "");
    } catch (e) {
        file.close();
        sceneKeeperDataFolderError = "SceneKeeper could not write to " + file.fsName + ". " + e.toString();
        return false;
    }
    file.close();
    return true;
}

function writeClipFavoriteRecords(records) {
    var lines = [];
    for (var i = 0; i < records.length; i++) lines.push(encodeClipFavoriteRecord(records[i]));
    var file = getClipFavoritesFile();
    if (sceneWriteDataFileLines(file, lines)) return true;

    var failedFolder = sceneKeeperDataFolderCache;
    var fallbackFolder = sceneKeeperUseDocumentsDataFolder(failedFolder);
    if (!fallbackFolder || (failedFolder && fallbackFolder.fsName === failedFolder.fsName)) return false;
    return sceneWriteDataFileLines(new File(fallbackFolder.fsName + "/clip-favorites.txt"), lines);
}

function getClipLibrarySnapshot() {
    return {
        favorites: readClipFavoriteRecords(),
        folders: readClipFolderRecords(),
        trash: readClipTrashRecords()
    };
}

function clipLibrarySnapshotsMatch(first, second) {
    return JSON.stringify(first) === JSON.stringify(second);
}

function pushClipToolUndoAction(action) {
    clipToolUndoHistory.push(action);
    if (clipToolUndoHistory.length > CLIP_TOOL_HISTORY_LIMIT) {
        clipToolUndoHistory.shift();
    }
    clipToolRedoHistory = [];
}

function removeClipRecordsFromHistory(records) {
    var recordKeys = {};
    var trashIds = {};
    var folderIds = {};
    function getHistoryClipKey(record) {
        return record.clipId
            ? "$id:" + record.clipId
            : "$legacy:" + JSON.stringify([
                record.sourcePath,
                record.sourceIn,
                record.sourceOut,
                record.folderId,
                record.displayName
            ]);
    }
    for (var i = 0; i < records.length; i++) {
        var entry = records[i];
        if (entry.type === "folder") {
            trashIds["$" + entry.trashId] = true;
            for (var folderIndex = 0; folderIndex < entry.folders.length; folderIndex++) {
                folderIds["$" + entry.folders[folderIndex].id] = true;
            }
            for (var folderClipIndex = 0; folderClipIndex < entry.clips.length; folderClipIndex++) {
                var folderClip = entry.clips[folderClipIndex];
                recordKeys[getHistoryClipKey(folderClip)] = true;
            }
        } else if (entry.type === "clip" && entry.record) {
            var clip = entry.record;
            recordKeys[getHistoryClipKey(clip)] = true;
            trashIds["$" + entry.trashId] = true;
        }
    }
    var histories = [clipToolUndoHistory, clipToolRedoHistory];
    for (var historyIndex = 0; historyIndex < histories.length; historyIndex++) {
        for (var actionIndex = 0; actionIndex < histories[historyIndex].length; actionIndex++) {
            var action = histories[historyIndex][actionIndex];
            if (action.type !== "library" || !action.snapshot) {
                continue;
            }
            var retainedFavorites = [];
            var snapshotFavorites = action.snapshot.favorites || [];
            for (var favoriteIndex = 0; favoriteIndex < snapshotFavorites.length; favoriteIndex++) {
                var favoriteRecord = snapshotFavorites[favoriteIndex];
                var favoriteKey = getHistoryClipKey(favoriteRecord);
                if (!recordKeys[favoriteKey]) {
                    retainedFavorites.push(favoriteRecord);
                }
            }
            action.snapshot.favorites = retainedFavorites;

            var retainedTrash = [];
            var snapshotTrash = action.snapshot.trash || [];
            for (var trashIndex = 0; trashIndex < snapshotTrash.length; trashIndex++) {
                var trashEntry = snapshotTrash[trashIndex];
                if (trashIds["$" + trashEntry.trashId]) {
                    continue;
                }
                if (trashEntry.type === "clip" && trashEntry.record) {
                    var trashClipKey = getHistoryClipKey(trashEntry.record);
                    if (recordKeys[trashClipKey]) {
                        continue;
                    }
                } else if (trashEntry.type === "folder") {
                    var keptFolderClips = [];
                    for (var nestedClipIndex = 0; nestedClipIndex < trashEntry.clips.length; nestedClipIndex++) {
                        var nestedClip = trashEntry.clips[nestedClipIndex];
                        var nestedClipKey = getHistoryClipKey(nestedClip);
                        if (!recordKeys[nestedClipKey]) {
                            keptFolderClips.push(nestedClip);
                        }
                    }
                    trashEntry.clips = keptFolderClips;
                }
                retainedTrash.push(trashEntry);
            }
            action.snapshot.trash = retainedTrash;

            if (action.snapshot.folders) {
                var retainedFolders = [];
                for (var snapshotFolderIndex = 0; snapshotFolderIndex < action.snapshot.folders.length; snapshotFolderIndex++) {
                    if (!folderIds["$" + action.snapshot.folders[snapshotFolderIndex].id]) {
                        retainedFolders.push(action.snapshot.folders[snapshotFolderIndex]);
                    }
                }
                action.snapshot.folders = retainedFolders;
            }
        }
    }
}

function runClipLibraryAction(encodedCommand) {
    var command = decodeURIComponent(encodedCommand || "");
    var before = getClipLibrarySnapshot();
    var result;
    try {
        result = eval(command);
    } catch (e) {
        result = "ERROR: " + e.toString();
    }
    result = String(result);
    if (result.indexOf("ERROR:") === 0) {
        var failedActionState = getClipLibrarySnapshot();
        if (!clipLibrarySnapshotsMatch(before, failedActionState) && !restoreClipLibrarySnapshot(before)) {
            return "ERROR: The action failed and its previous library state could not be restored.";
        }
        return result;
    }
    var after = getClipLibrarySnapshot();
    if (!clipLibrarySnapshotsMatch(before, after)) {
        pushClipToolUndoAction({ type: "library", snapshot: before, description: result });
        createSceneKeeperBackup();
    }
    return result;
}

function runClipTimelineAction(encodedCommand) {
    var command = decodeURIComponent(encodedCommand || "");
    var result;
    try {
        result = String(eval(command));
    } catch (e) {
        return "ERROR: " + e.toString();
    }
    if (result.indexOf("Inserted clip:") === 0 || result.indexOf("MARKER_RANDOM_DONE|") === 0 || result.indexOf("MARKER_RANDOM_REPLACED|") === 0 || result.indexOf("MARKER_RANDOM_PRECOMPS_DELETED|") === 0 || result.indexOf("SELECTED_CLIP_REPLACED|") === 0 || result.indexOf("QUICK_REPLACE_DONE|") === 0 || result.indexOf("SELECTED_CLIP_REPLACE_SLOTS|") === 0) {
        pushClipToolUndoAction({
            type: "after-effects",
            description: result.indexOf("MARKER_RANDOM_DONE|") === 0
                ? "Inserted random clips between markers"
                : (result.indexOf("MARKER_RANDOM_REPLACED|") === 0
                    ? "Replaced random marker clips"
                    : (result.indexOf("MARKER_RANDOM_PRECOMPS_DELETED|") === 0
                        ? "Deleted created random precomps"
                        : (result.indexOf("SELECTED_CLIP_REPLACED|") === 0
                            ? "Replaced selected clip"
                            : (result.indexOf("QUICK_REPLACE_DONE|") === 0
                                ? "Quick Replaced selected clips"
                                : (result.indexOf("SELECTED_CLIP_REPLACE_SLOTS|") === 0 ? "Prepare selected clip replacement" : result)))))
        });
    }
    return result;
}

function restoreClipLibrarySnapshot(snapshot) {
    var current = getClipLibrarySnapshot();
    if (!writeClipFavoriteRecords(snapshot.favorites)) {
        return false;
    }
    if (!writeClipFolderRecords(snapshot.folders)) {
        writeClipFavoriteRecords(current.favorites);
        return false;
    }
    if (!writeClipTrashRecords(snapshot.trash || [])) {
        writeClipFavoriteRecords(current.favorites);
        writeClipFolderRecords(current.folders);
        return false;
    }
    return true;
}

function getRestoredFolderParentId(snapshotFolders, currentFolders) {
    var currentFolderIds = {};
    var restoredFolderIds = {};
    var restoredFolders = [];
    for (var i = 0; i < currentFolders.length; i++) {
        currentFolderIds["$" + currentFolders[i].id] = true;
    }
    for (var j = 0; j < snapshotFolders.length; j++) {
        if (!currentFolderIds["$" + snapshotFolders[j].id]) {
            restoredFolderIds["$" + snapshotFolders[j].id] = true;
            restoredFolders.push(snapshotFolders[j]);
        }
    }
    for (var k = 0; k < restoredFolders.length; k++) {
        var parentId = restoredFolders[k].parentId || "";
        if (!parentId || !restoredFolderIds["$" + parentId]) {
            return parentId;
        }
    }
    return "";
}

function executeClipToolHistoryCommand(commandName) {
    var commandId = app.findMenuCommandId(commandName);
    if (!commandId) {
        return false;
    }
    try {
        app.executeCommand(commandId);
        return true;
    } catch (e) {
        return false;
    }
}

function undoClipToolAction() {
    if (!clipToolUndoHistory.length) {
        if (executeClipToolHistoryCommand("Undo")) {
            clipToolRedoHistory.push({ type: "after-effects", description: "After Effects action" });
            return "ACTION_UNDONE|AFTER_EFFECTS|After%20Effects%20action";
        }
        return "NOTHING_TO_UNDO";
    }

    var action = clipToolUndoHistory.pop();
    if (action.type === "library") {
        var current = getClipLibrarySnapshot();
        if (!restoreClipLibrarySnapshot(action.snapshot)) {
            clipToolUndoHistory.push(action);
            return "ERROR: Could not undo the library change.";
        }
        clipToolRedoHistory.push({ type: "library", snapshot: current, description: action.description });
        var restoredFolderParentId = "";
        if (action.description && action.description.indexOf("Deleted folder and its contents:") === 0) {
            restoredFolderParentId = getRestoredFolderParentId(action.snapshot.folders, current.folders);
            return "ACTION_UNDONE|LIBRARY|" + encodeURIComponent(action.description) +
                "|" + encodeURIComponent(restoredFolderParentId);
        }
        return "ACTION_UNDONE|LIBRARY|" + encodeURIComponent(action.description || "Library change");
    }
    if (!executeClipToolHistoryCommand("Undo")) {
        clipToolUndoHistory.push(action);
        return "ERROR: After Effects could not undo the last action.";
    }
    clipToolRedoHistory.push(action);
    return "ACTION_UNDONE|AFTER_EFFECTS|" + encodeURIComponent(action.description || "After Effects action");
}

function redoClipToolAction() {
    if (!clipToolRedoHistory.length) {
        if (executeClipToolHistoryCommand("Redo")) {
            clipToolUndoHistory.push({ type: "after-effects", description: "After Effects action" });
            return "ACTION_REDONE|AFTER_EFFECTS|After%20Effects%20action";
        }
        return "NOTHING_TO_REDO";
    }

    var action = clipToolRedoHistory.pop();
    if (action.type === "library") {
        var current = getClipLibrarySnapshot();
        if (!restoreClipLibrarySnapshot(action.snapshot)) {
            clipToolRedoHistory.push(action);
            return "ERROR: Could not redo the library change.";
        }
        clipToolUndoHistory.push({ type: "library", snapshot: current, description: action.description });
        return "ACTION_REDONE|LIBRARY|" + encodeURIComponent(action.description || "Library change");
    }
    if (!executeClipToolHistoryCommand("Redo")) {
        clipToolRedoHistory.push(action);
        return "ERROR: After Effects could not redo the last action.";
    }
    clipToolUndoHistory.push(action);
    return "ACTION_REDONE|AFTER_EFFECTS|" + encodeURIComponent(action.description || "After Effects action");
}

function listClipFavorites() {
    var file = getClipFavoritesFile();
    if (!file || !file.exists) {
        return "NO_FAVORITES";
    }
    file.encoding = "UTF-8";
    if (!file.open("r")) {
        return "ERROR: Could not read the clip library file.";
    }
    var contents = file.read();
    file.close();
    var records = ensureClipRecordIds(
        normalizeClipFavoriteRecordNames(decodeClipFavoriteRecords(contents), readClipFolderRecords())
    );
    if (!records.length) {
        return "NO_FAVORITES";
    }
    var lines = [];
    for (var i = 0; i < records.length; i++) {
        if (!(records[i].sourceWidth > 0) || !(records[i].sourceHeight > 0)) {
            for (var projectIndex = 1; projectIndex <= app.project.numItems; projectIndex++) {
                var projectItem = app.project.item(projectIndex);
                if (!(projectItem instanceof FootageItem) || !(projectItem.mainSource instanceof FileSource)) {
                    continue;
                }
                try {
                    if (projectItem.mainSource.file.fsName === records[i].sourcePath) {
                        records[i].sourceWidth = projectItem.width;
                        records[i].sourceHeight = projectItem.height;
                        break;
                    }
                } catch (e) {
                    // Continue if this project item does not expose a readable source file.
                }
            }
        }
        var sourceFile = new File(records[i].sourcePath);
        lines.push(encodeClipFavoriteRecord(records[i]) + "\t" + (sourceFile.exists ? "0" : "1"));
    }
    return lines.join("\n");
}

function listClipFavoriteFootageStatus() {
    var records = readClipFavoriteRecords();
    if (!records.length) {
        return "NO_FAVORITES";
    }
    var statuses = {};
    var lines = [];
    for (var i = 0; i < records.length; i++) {
        var sourcePath = records[i].sourcePath;
        if (statuses[sourcePath] !== undefined) {
            continue;
        }
        var isMissing = !new File(sourcePath).exists;
        statuses[sourcePath] = isMissing;
        lines.push(encodeURIComponent(sourcePath) + "\t" + (isMissing ? "1" : "0"));
    }
    return lines.join("\n");
}

function getClipSettingsFile() {
    var folder = getSceneKeeperDataFolder();
    if (!folder) return null;
    return new File(folder.fsName + "/settings.txt");
}

function getClipFrameBlendingMode() {
    var file = getClipSettingsFile();
    if (!file || !file.exists || !file.open("r")) {
        return "PIXEL_MOTION";
    }
    var settings = file.read().split(/[\r\n]+/);
    file.close();
    var mode = settings[0];
    if (mode !== "PIXEL_MOTION" && mode !== "FRAME_MIX" && mode !== "OFF") {
        return "PIXEL_MOTION";
    }
    return mode;
}

function getClipPreviewAutoplay() {
    var file = getClipSettingsFile();
    if (!file || !file.exists || !file.open("r")) {
        return "ON";
    }
    var settings = file.read().split(/[\r\n]+/);
    file.close();
    return settings.length > 1 && settings[1] === "OFF" ? "OFF" : "ON";
}

function getClipMutedInsert() {
    var file = getClipSettingsFile();
    if (!file || !file.exists || !file.open("r")) {
        return "OFF";
    }
    var settings = file.read().split(/[\r\n]+/);
    file.close();
    return settings.length > 2 && settings[2] === "ON" ? "ON" : "OFF";
}

function getClipSettings() {
    return getClipFrameBlendingMode() + "|" + getClipPreviewAutoplay() + "|" + getClipMutedInsert();
}

function writeClipSettings(mode, previewAutoplay, mutedInsert) {
    var file = getClipSettingsFile();
    if (!file) {
        return false;
    }
    file.encoding = "UTF-8";
    if (!file.open("w")) {
        return false;
    }
    try {
        file.write(mode + "\n" + previewAutoplay + "\n" + mutedInsert);
    } catch (e) {
        file.close();
        return false;
    }
    file.close();
    return true;
}

function saveClipSettings(encodedMode, encodedPreviewAutoplay, encodedMutedInsert) {
    var mode = decodeURIComponent(encodedMode || "");
    var previewAutoplay = decodeURIComponent(encodedPreviewAutoplay || "");
    var mutedInsert = decodeURIComponent(encodedMutedInsert || "OFF");
    if (mode !== "PIXEL_MOTION" && mode !== "OFF") {
        return "ERROR: Unsupported frame blending setting.";
    }
    if (previewAutoplay !== "ON" && previewAutoplay !== "OFF") {
        return "ERROR: Unsupported preview autoplay setting.";
    }
    if (mutedInsert !== "ON" && mutedInsert !== "OFF") {
        return "ERROR: Unsupported muted insert setting.";
    }
    if (!writeClipSettings(mode, previewAutoplay, mutedInsert)) {
        return "ERROR: Could not save settings.";
    }
    return "Settings saved.";
}

function saveClipFrameBlendingMode(mode) {
    mode = decodeURIComponent(mode || "");
    if (mode !== "PIXEL_MOTION" && mode !== "FRAME_MIX" && mode !== "OFF") {
        return "ERROR: Unsupported frame blending mode.";
    }
    if (!writeClipSettings(mode, getClipPreviewAutoplay())) {
        return "ERROR: Could not save settings.";
    }
    return "Frame blending setting saved.";
}

function exportClipFavorites(encodedScope, encodedSourcePath) {
    var scope = (encodedScope ? decodeURIComponent(encodedScope) : "ALL");
    var sourcePath = encodedSourcePath ? decodeURIComponent(encodedSourcePath) : "";
    var file = File.saveDialog("Export SceneKeeper data");
    if (!file) {
        return "Export canceled.";
    }
    if (!/\.keeper$/i.test(file.name)) {
        var exportPath = file.fsName.replace(/\.(morfav|keeper)$/i, "") + ".keeper";
        file = new File(exportPath);
    }
    var records = readClipFavoriteRecords();
    var exportedFolders = [];
    var exportedTrash = [];
    if (scope === "CURRENT") {
        var filteredRecords = [];
        for (var i = 0; i < records.length; i++) {
            if (records[i].sourcePath === sourcePath) {
                filteredRecords.push(records[i]);
            }
        }
        records = filteredRecords;
    } else if (scope === "SELECTED") {
        var selectedPaths = [];
        try {
            selectedPaths = JSON.parse(sourcePath || "[]");
        } catch (e) {
            selectedPaths = [];
        }
        var selectedMap = {};
        for (var s = 0; s < selectedPaths.length; s++) {
            if (selectedPaths[s]) {
                selectedMap[String(selectedPaths[s])] = true;
            }
        }
        var selectedRecords = [];
        for (var i = 0; i < records.length; i++) {
            if (selectedMap[String(records[i].sourcePath)]) {
                selectedRecords.push(records[i]);
            }
        }
        records = selectedRecords;
        if (records.length) {
            var importedFootageFolderId = "imported-footage-" + String(new Date().getTime());
            exportedFolders.push({
                id: importedFootageFolderId,
                name: "Imported Footage",
                sourcePath: "",
                parentId: ""
            });
            for (var importedFootageIndex = 0; importedFootageIndex < records.length; importedFootageIndex++) {
                records[importedFootageIndex].folderId = importedFootageFolderId;
            }
        }
    } else if (scope === "FOLDERS") {
        var selectedFolderIds = [];
        try {
            selectedFolderIds = JSON.parse(sourcePath || "[]");
        } catch (e) {
            return "ERROR: Could not read the selected export folders.";
        }
        var includedFolderMap = {};
        for (var selectedIndex = 0; selectedIndex < selectedFolderIds.length; selectedIndex++) {
            if (selectedFolderIds[selectedIndex]) {
                includedFolderMap["$" + String(selectedFolderIds[selectedIndex])] = true;
            }
        }
        var folders = readClipFolderRecords();
        var addedFolder = true;
        while (addedFolder) {
            addedFolder = false;
            for (var folderIndex = 0; folderIndex < folders.length; folderIndex++) {
                var folderKey = "$" + String(folders[folderIndex].id);
                var parentKey = "$" + String(folders[folderIndex].parentId || "");
                if (includedFolderMap[parentKey] && !includedFolderMap[folderKey]) {
                    includedFolderMap[folderKey] = true;
                    addedFolder = true;
                }
            }
        }
        for (var exportedFolderIndex = 0; exportedFolderIndex < folders.length; exportedFolderIndex++) {
            var sourceFolder = folders[exportedFolderIndex];
            if (!includedFolderMap["$" + String(sourceFolder.id)]) {
                continue;
            }
            var exportedParentId = sourceFolder.parentId || "";
            if (exportedParentId && !includedFolderMap["$" + String(exportedParentId)]) {
                exportedParentId = "";
            }
            exportedFolders.push({
                id: sourceFolder.id,
                name: sourceFolder.name,
                sourcePath: sourceFolder.sourcePath || "",
                parentId: exportedParentId
            });
        }
        var folderRecords = [];
        for (var folderRecordIndex = 0; folderRecordIndex < records.length; folderRecordIndex++) {
            if (includedFolderMap["$" + String(records[folderRecordIndex].folderId || "")]) {
                folderRecords.push(records[folderRecordIndex]);
            }
        }
        records = folderRecords;
    } else if (scope === "ALL") {
        exportedFolders = readClipFolderRecords();
        exportedTrash = readClipTrashRecords();
    }
    if (!records.length && scope !== "ALL" && !exportedFolders.length) {
        return "ERROR: No saved data found for the selected export scope.";
    }
    var lines = ["#SCENEKEEPER_FAVORITES\t1"];
    if (scope === "ALL" || scope === "FOLDERS" || scope === "SELECTED") {
        lines.push("#SCENEKEEPER_LIBRARY\t1\t" + encodeURIComponent(JSON.stringify({
            folders: exportedFolders,
            trash: exportedTrash
        })));
    }
    for (var i = 0; i < records.length; i++) {
        lines.push(encodeClipFavoriteRecord(records[i]));
    }
    file.encoding = "UTF-8";
    if (!file.open("w")) {
        return "ERROR: Could not create the export file.";
    }
    var written = file.write(lines.join("\n") + "\n");
    file.close();
    if (!written) {
        return "ERROR: Could not write the export file.";
    }
    var scopeText = scope === "CURRENT" ? "selected footage." :
        (scope === "SELECTED" ? "selected footage(s)." :
        (scope === "FOLDERS" ? "selected folder(s), including subfolders." : "the complete library."));
    return "Exported " + records.length + " clip(s) from " + scopeText;
}

function removeClipPreviewCacheFolder(folder) {
    if (!folder.exists) {
        return true;
    }
    var entries = folder.getFiles();
    if (!entries) {
        return false;
    }
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry instanceof Folder) {
            if (!removeClipPreviewCacheFolder(entry)) {
                return false;
            }
        } else if (!entry.remove()) {
            return false;
        }
    }
    return folder.remove();
}

function deleteAllClipLibraryData() {
    clipToolUndoHistory = [];
    clipToolRedoHistory = [];
    pendingClipFavoriteReplacement = null;

    var dataFolder = getSceneKeeperDataFolder();
    if (!dataFolder) return "ERROR: Could not access SceneKeeper storage. " + sceneKeeperDataFolderError;
    var previewCacheFolders = getSceneKeeperPreviewCacheFolders();
    for (var previewFolderIndex = 0; previewFolderIndex < previewCacheFolders.length; previewFolderIndex++) {
        if (!removeClipPreviewCacheFolder(previewCacheFolders[previewFolderIndex])) {
            return "ERROR: Could not completely remove cached preview videos.";
        }
    }

    var libraryFiles = ["clip-favorites.txt", "clip-folders.txt", "clip-trash.txt"];
    for (var i = 0; i < libraryFiles.length; i++) {
        var file = new File(dataFolder.fsName + "/" + libraryFiles[i]);
        if (file.exists && !file.remove()) {
            return "ERROR: Could not remove " + libraryFiles[i] + ".";
        }
    }
    return "LIBRARY_DELETED";
}

function findFilesByName(folder, targetName, results) {
    var entries = folder.getFiles();
    if (!entries) {
        return;
    }
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry instanceof Folder) {
            findFilesByName(entry, targetName, results);
        } else if (entry.name.toLowerCase() === targetName.toLowerCase()) {
            results.push(entry);
        }
    }
}

function getPortableFileName(path) {
    var normalizedPath = (path || "").replace(/\\/g, "/");
    return normalizedPath.substring(normalizedPath.lastIndexOf("/") + 1);
}

function replaceFavoriteSourcePath(records, oldPath, newPath, newName) {
    for (var i = 0; i < records.length; i++) {
        if (records[i].sourcePath === oldPath) {
            records[i].sourcePath = newPath;
            records[i].sourceName = newName;
        }
    }
}

function replaceClipFolderSourcePath(oldPath, newPath) {
    var folders = readClipFolderRecords();
    var changed = false;
    for (var i = 0; i < folders.length; i++) {
        if (folders[i].sourcePath === oldPath) {
            folders[i].sourcePath = newPath;
            changed = true;
        }
    }
    return !changed || writeClipFolderRecords(folders);
}

function sameClipFavorite(first, second) {
    return first.sourcePath === second.sourcePath &&
        first.displayName === second.displayName &&
        (first.folderId || "") === (second.folderId || "") &&
        first.sourceIn === second.sourceIn &&
        first.sourceOut === second.sourceOut;
}

function importClipFavorites(encodedFolderConflictChoice) {
    var folderConflictChoice = encodedFolderConflictChoice ? decodeURIComponent(encodedFolderConflictChoice) : "";
    var importContents = "";
    if (folderConflictChoice) {
        if (!pendingClipFavoriteImportContents) {
            return "ERROR: The pending folder import is no longer available.";
        }
        importContents = pendingClipFavoriteImportContents;
        pendingClipFavoriteImportContents = "";
        if (folderConflictChoice === "CANCEL") {
            return "IMPORT_CANCELED";
        }
        if (folderConflictChoice !== "REPLACE" && folderConflictChoice !== "KEEP_BOTH") {
            return "ERROR: Unsupported folder conflict choice.";
        }
    } else {
        var importFile = File.openDialog("Import SceneKeeper clips");
        if (!importFile) {
            return "Import canceled.";
        }
        importFile.encoding = "UTF-8";
        if (!importFile.open("r")) {
            return "ERROR: Could not read the import file.";
        }
        importContents = importFile.read();
        importFile.close();
    }
    var importedRecords = decodeClipFavoriteRecords(importContents);
    var importedLibraryData = null;
    var importLines = importContents.split(/[\r\n]+/);
    for (var importLineIndex = 0; importLineIndex < importLines.length; importLineIndex++) {
        var libraryMetadataPrefix = "#SCENEKEEPER_LIBRARY\t1\t";
        if (importLines[importLineIndex].indexOf(libraryMetadataPrefix) !== 0) {
            continue;
        }
        try {
            importedLibraryData = JSON.parse(decodeURIComponent(importLines[importLineIndex].substring(libraryMetadataPrefix.length)));
        } catch (e) {
            return "ERROR: The exported library data is invalid.";
        }
        break;
    }
    if (!importedRecords.length && !importedLibraryData) {
        return "ERROR: No valid clips were found in that file.";
    }
    var conflictingFolderNames = [];
    if (importedLibraryData && importedLibraryData.folders instanceof Array) {
        var existingConflictFolders = readClipFolderRecords();
        for (var conflictImportIndex = 0; conflictImportIndex < importedLibraryData.folders.length; conflictImportIndex++) {
            var conflictImportFolder = importedLibraryData.folders[conflictImportIndex];
            if (!conflictImportFolder || conflictImportFolder.parentId) {
                continue;
            }
            for (var conflictExistingIndex = 0; conflictExistingIndex < existingConflictFolders.length; conflictExistingIndex++) {
                var conflictExistingFolder = existingConflictFolders[conflictExistingIndex];
                if (conflictExistingFolder.id === conflictImportFolder.id ||
                    conflictExistingFolder.name.toLowerCase() === String(conflictImportFolder.name).toLowerCase()) {
                    conflictingFolderNames.push(conflictImportFolder.name);
                    break;
                }
            }
        }
        if (conflictingFolderNames.length && !folderConflictChoice) {
            pendingClipFavoriteImportContents = importContents;
            return "FOLDER_CONFLICT|" + encodeURIComponent(JSON.stringify(conflictingFolderNames));
        }
    }
    var headerFields = importContents.split(/[\r\n]+/)[0].split("\t");
    var importedBlendingMode = "";
    if (headerFields.length > 2 && headerFields[0] === "#SCENEKEEPER_FAVORITES" &&
        (headerFields[2] === "PIXEL_MOTION" || headerFields[2] === "FRAME_MIX" || headerFields[2] === "OFF")) {
        importedBlendingMode = "";
    }

    var missingPaths = [];
    for (var i = 0; i < importedRecords.length; i++) {
        var record = importedRecords[i];
        if (new File(record.sourcePath).exists) {
            continue;
        }
        var known = false;
        for (var j = 0; j < missingPaths.length; j++) {
            if (missingPaths[j] === record.sourcePath) {
                known = true;
                break;
            }
        }
        if (!known) {
            missingPaths.push(record.sourcePath);
        }
    }

    if (missingPaths.length) {
        var searchFolder = Folder.selectDialog("Choose a folder to search for missing footage by filename. Cancel to relink later.");
        if (searchFolder) {
            for (var p = 0; p < missingPaths.length; p++) {
                var oldPath = missingPaths[p];
                var expectedName = getPortableFileName(oldPath);
                var candidates = [];
                findFilesByName(searchFolder, expectedName, candidates);
                if (candidates.length === 1) {
                    replaceFavoriteSourcePath(importedRecords, oldPath, candidates[0].fsName, candidates[0].name);
                }
            }
        }
    }

    var knownFolders = readClipFolderRecords();
    var importedFolderIds = {};
    var foldersToAdd = [];
    var replacementRootIds = {};
    var replacedFolderIds = {};
    var replacementRootCount = 0;
    var forceDuplicateImportedFolders = folderConflictChoice === "KEEP_BOTH" && conflictingFolderNames.length > 0;
    if (importedLibraryData && importedLibraryData.folders instanceof Array) {
        if (folderConflictChoice === "REPLACE") {
            var claimedReplacementIds = {};
            for (var replacementIndex = 0; replacementIndex < importedLibraryData.folders.length; replacementIndex++) {
                var replacementFolder = importedLibraryData.folders[replacementIndex];
                if (!replacementFolder || replacementFolder.parentId) {
                    continue;
                }
                for (var existingReplacementIndex = 0; existingReplacementIndex < knownFolders.length; existingReplacementIndex++) {
                    var existingReplacement = knownFolders[existingReplacementIndex];
                    if (claimedReplacementIds["$" + existingReplacement.id]) {
                        continue;
                    }
                    if (existingReplacement.id === replacementFolder.id ||
                        existingReplacement.name.toLowerCase() === String(replacementFolder.name).toLowerCase()) {
                        replacementRootIds["$" + replacementFolder.id] = existingReplacement.id;
                        claimedReplacementIds["$" + existingReplacement.id] = true;
                        replacedFolderIds["$" + existingReplacement.id] = true;
                        replacementRootCount++;
                        break;
                    }
                }
            }
            var foundReplacedFolder = true;
            while (foundReplacedFolder) {
                foundReplacedFolder = false;
                for (var replacedIndex = 0; replacedIndex < knownFolders.length; replacedIndex++) {
                    var possibleDescendant = knownFolders[replacedIndex];
                    if (possibleDescendant.parentId && replacedFolderIds["$" + possibleDescendant.parentId] &&
                        !replacedFolderIds["$" + possibleDescendant.id]) {
                        replacedFolderIds["$" + possibleDescendant.id] = true;
                        foundReplacedFolder = true;
                    }
                }
            }
            knownFolders = knownFolders.filter(function (folder) {
                return !replacedFolderIds["$" + folder.id] || claimedReplacementIds["$" + folder.id];
            });
        }
        var importFolderSuffix = String(new Date().getTime());
        for (var importedFolderIndex = 0; importedFolderIndex < importedLibraryData.folders.length; importedFolderIndex++) {
            var importedFolder = importedLibraryData.folders[importedFolderIndex];
            if (!importedFolder || !importedFolder.id || !importedFolder.name) {
                continue;
            }
            var matchingFolder = null;
            var replacementId = replacementRootIds["$" + importedFolder.id];
            if (replacementId) {
                for (var replacementMatchIndex = 0; replacementMatchIndex < knownFolders.length; replacementMatchIndex++) {
                    if (knownFolders[replacementMatchIndex].id === replacementId) {
                        matchingFolder = knownFolders[replacementMatchIndex];
                        break;
                    }
                }
            } else if (!forceDuplicateImportedFolders) {
                for (var knownFolderIndex = 0; knownFolderIndex < knownFolders.length; knownFolderIndex++) {
                    if (knownFolders[knownFolderIndex].id === importedFolder.id &&
                        knownFolders[knownFolderIndex].name === importedFolder.name &&
                        knownFolders[knownFolderIndex].sourcePath === (importedFolder.sourcePath || "")) {
                        matchingFolder = knownFolders[knownFolderIndex];
                        break;
                    }
                }
            }
            var mappedFolderId = matchingFolder ? matchingFolder.id : importedFolder.id;
            if (matchingFolder && replacementId) {
                matchingFolder.name = importedFolder.name;
                matchingFolder.sourcePath = importedFolder.sourcePath || "";
            }
            if (!matchingFolder) {
                var collisionIndex = 0;
                if (forceDuplicateImportedFolders) {
                    mappedFolderId = importedFolder.id + "-import-" + importFolderSuffix + "-" + collisionIndex++;
                }
                var idInUse = true;
                while (idInUse) {
                    idInUse = false;
                    for (var collisionCheck = 0; collisionCheck < knownFolders.length; collisionCheck++) {
                        if (knownFolders[collisionCheck].id === mappedFolderId) {
                            idInUse = true;
                            mappedFolderId = importedFolder.id + "-import-" + importFolderSuffix + "-" + collisionIndex++;
                            break;
                        }
                    }
                }
                foldersToAdd.push({
                    id: mappedFolderId,
                    name: importedFolder.name,
                    sourcePath: importedFolder.sourcePath || "",
                    parentId: importedFolder.parentId || ""
                });
            }
            importedFolderIds["$" + importedFolder.id] = mappedFolderId;
        }
        for (var newFolderIndex = 0; newFolderIndex < foldersToAdd.length; newFolderIndex++) {
            var newFolder = foldersToAdd[newFolderIndex];
            if (newFolder.parentId && importedFolderIds["$" + newFolder.parentId]) {
                newFolder.parentId = importedFolderIds["$" + newFolder.parentId];
            } else if (newFolder.parentId) {
                var parentExists = false;
                for (var parentIndex = 0; parentIndex < knownFolders.length; parentIndex++) {
                    if (knownFolders[parentIndex].id === newFolder.parentId) {
                        parentExists = true;
                        break;
                    }
                }
                if (!parentExists) {
                    newFolder.parentId = "";
                }
            }
            knownFolders.push(newFolder);
        }
        if ((foldersToAdd.length || replacementRootCount) && !writeClipFolderRecords(knownFolders)) {
            return "ERROR: Could not restore exported library folders.";
        }
        for (var remapRecordIndex = 0; remapRecordIndex < importedRecords.length; remapRecordIndex++) {
            var originalFolderId = importedRecords[remapRecordIndex].folderId || "";
            if (originalFolderId && importedFolderIds["$" + originalFolderId]) {
                importedRecords[remapRecordIndex].folderId = importedFolderIds["$" + originalFolderId];
            }
        }
    }
    for (var importedIndex = 0; importedIndex < importedRecords.length; importedIndex++) {
        var importedRecord = importedRecords[importedIndex];
        if (!importedRecord.folderId) {
            continue;
        }
        var folderExists = false;
        for (var folderIndex = 0; folderIndex < knownFolders.length; folderIndex++) {
            if (knownFolders[folderIndex].id === importedRecord.folderId &&
                (importedLibraryData || knownFolders[folderIndex].sourcePath === importedRecord.sourcePath)) {
                folderExists = true;
                break;
            }
        }
        if (!folderExists) {
            importedRecord.folderId = "";
        }
    }
    normalizeClipFavoriteRecordNames(importedRecords, knownFolders);
    ensureClipRecordIds(importedRecords);

    var existingRecords = readClipFavoriteRecords();
    var replacedPreviewEntries = [];
    if (replacementRootCount) {
        existingRecords = existingRecords.filter(function (record) {
            if (!replacedFolderIds["$" + (record.folderId || "")]) {
                return true;
            }
            replacedPreviewEntries.push({ type: "clip", record: record });
            return false;
        });
    }
    var added = 0;
    var importedClipIndices = [];
    for (var r = 0; r < importedRecords.length; r++) {
        var duplicate = false;
        for (var e = 0; e < existingRecords.length; e++) {
            if (sameClipFavorite(existingRecords[e], importedRecords[r])) {
                duplicate = true;
                break;
            }
        }
        if (!duplicate) {
            importedRecords[r].clipId = getClipRecordId();
            importedRecords[r].displayName = makeUniqueClipFavoriteNameInFolder(
                existingRecords,
                importedRecords[r].displayName,
                importedRecords[r].folderId
            );
            importedClipIndices.push(existingRecords.length);
            existingRecords.push(importedRecords[r]);
            added++;
        }
    }
    if (!writeClipFavoriteRecords(existingRecords)) {
        return "ERROR: Could not merge imported clips into the library.";
    }
    if (replacedPreviewEntries.length) {
        removeOrphanedClipPreviews(replacedPreviewEntries);
    }
    if (importedLibraryData && importedLibraryData.trash instanceof Array) {
        var existingTrashRecords = readClipTrashRecords();
        var knownTrashIds = {};
        for (var knownTrashIndex = 0; knownTrashIndex < existingTrashRecords.length; knownTrashIndex++) {
            knownTrashIds["$" + existingTrashRecords[knownTrashIndex].trashId] = true;
        }
        for (var importedTrashIndex = importedLibraryData.trash.length - 1; importedTrashIndex >= 0; importedTrashIndex--) {
            var importedTrashEntry = importedLibraryData.trash[importedTrashIndex];
            if (!importedTrashEntry || !importedTrashEntry.trashId || knownTrashIds["$" + importedTrashEntry.trashId]) {
                continue;
            }
            existingTrashRecords.unshift(importedTrashEntry);
            knownTrashIds["$" + importedTrashEntry.trashId] = true;
        }
        while (existingTrashRecords.length > 10) {
            existingTrashRecords.pop();
        }
        if (!writeClipTrashRecords(existingTrashRecords)) {
            return "ERROR: Could not restore exported Recently Deleted items.";
        }
    }
    var unlinked = [];
    for (var u = 0; u < existingRecords.length; u++) {
        if (!new File(existingRecords[u].sourcePath).exists) {
            var alreadyCounted = false;
            for (var m = 0; m < unlinked.length; m++) {
                if (unlinked[m] === existingRecords[u].sourcePath) {
                    alreadyCounted = true;
                    break;
                }
            }
            if (!alreadyCounted) {
                unlinked.push(existingRecords[u].sourcePath);
            }
        }
    }
    var importedRootFolderIds = [];
    if (importedLibraryData && importedLibraryData.folders instanceof Array) {
        for (var rootFolderIndex = 0; rootFolderIndex < importedLibraryData.folders.length; rootFolderIndex++) {
            var rootFolder = importedLibraryData.folders[rootFolderIndex];
            if (rootFolder && !rootFolder.parentId && importedFolderIds["$" + rootFolder.id]) {
                importedRootFolderIds.push(importedFolderIds["$" + rootFolder.id]);
            }
        }
    }
    var importFocus = {
        folderIds: importedRootFolderIds,
        storageIndex: importedClipIndices.length ? importedClipIndices[0] : null
    };
    return "IMPORT_DONE|" + added + "|" + unlinked.length + "|" + encodeURIComponent(JSON.stringify(importFocus));
}

function resolveClipFavoriteImport(encodedFolderConflictChoice) {
    if (!pendingClipFavoriteImportContents) {
        return "ERROR: There is no pending folder import to resolve.";
    }
    return importClipFavorites(encodedFolderConflictChoice);
}

function relinkClipFavoriteFootage(index) {
    var records = readClipFavoriteRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= records.length) {
        return "ERROR: Select a clip from the footage to relink.";
    }
    var oldPath = records[index].sourcePath;
    var sourceName = records[index].sourceName;
    var selectedFile = File.openDialog("Relink footage for " + sourceName);
    if (!selectedFile || !selectedFile.exists) {
        return "Relink canceled.";
    }

    var maxSourceOut = 0;
    for (var i = 0; i < records.length; i++) {
        if (records[i].sourcePath === oldPath && records[i].sourceOut > maxSourceOut) {
            maxSourceOut = records[i].sourceOut;
        }
    }
    var sourceItem = null;
    for (var projectIndex = 1; projectIndex <= app.project.numItems; projectIndex++) {
        var projectItem = app.project.item(projectIndex);
        if (!(projectItem instanceof FootageItem) || !(projectItem.mainSource instanceof FileSource)) {
            continue;
        }
        try {
            if (projectItem.mainSource.file.fsName === oldPath) {
                sourceItem = projectItem;
                break;
            }
        } catch (e) {
            // Continue searching for the original project footage.
        }
    }
    if (!sourceItem) {
        return "ERROR: Could not find the original footage in the project.";
    }

    var footageCheck = null;
    try {
        footageCheck = app.project.importFile(new ImportOptions(selectedFile));
    } catch (e) {
        return "ERROR: Could not read the selected footage: " + e.toString();
    }
    if (!footageCheck || maxSourceOut - footageCheck.duration > FOOTAGE_END_TOLERANCE) {
        if (footageCheck) {
            footageCheck.remove();
        }
        return "ERROR: The selected footage is shorter than one or more saved clips.";
    }
    footageCheck.remove();

    try {
        sourceItem.replace(selectedFile);
        sourceItem.name = selectedFile.name;
    } catch (e) {
        return "ERROR: Could not replace the project footage: " + e.toString();
    }

    replaceFavoriteSourcePath(records, oldPath, selectedFile.fsName, selectedFile.name);
    if (!writeClipFavoriteRecords(records) || !replaceClipFolderSourcePath(oldPath, selectedFile.fsName)) {
        return "ERROR: Could not save the relinked footage path.";
    }
    return "Replaced project footage " + sourceName + " with " + selectedFile.name + ".";
}

function revealClipFavoriteFootage(index) {
    var records = readClipFavoriteRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= records.length) {
        return "ERROR: Select a clip first.";
    }

    var sourceFile = new File(records[index].sourcePath);
    if (!sourceFile.exists) {
        return "ERROR: Footage file not found: " + records[index].sourcePath;
    }

    try {
        if ($.os.toLowerCase().indexOf("windows") >= 0) {
            var windowsPath = sourceFile.fsName.replace(/"/g, "");
            var windowsCommand = 'explorer.exe /select,"' + windowsPath + '"';
            system.callSystem(windowsCommand);
            return "Revealed footage in Explorer: " + sourceFile.name;
        }

        var macPath = sourceFile.fsName.replace(/'/g, "'\\''");
        system.callSystem("open -R '" + macPath + "'");
        return "Revealed footage in Finder: " + sourceFile.name;
    } catch (e) {
        return "ERROR: Could not reveal the footage in the file browser: " + e.toString();
    }
}

function renameClipFavoriteFootage(encodedSourcePath, encodedName) {
    var sourcePath = decodeURIComponent(encodedSourcePath || "");
    var name = decodeURIComponent(encodedName || "").replace(/^\s+|\s+$/g, "");
    if (!sourcePath || !name) return "ERROR: Footage path and name are required.";
    var records = readClipFavoriteRecords();
    var matched = [];
    var originalName = "";
    var normalizedPath = sourcePath.replace(/\\/g, "/").toLowerCase();
    for (var i = 0; i < records.length; i++) {
        if (String(records[i].sourcePath || "").replace(/\\/g, "/").toLowerCase() !== normalizedPath) continue;
        matched.push(records[i]);
        var metadata = records[i].footageMetadata || {};
        if (metadata.originalName) originalName = metadata.originalName;
        else if (!originalName) {
            var sourcePathParts = sourcePath.replace(/\\/g, "/").split("/");
            originalName = records[i].sourceName || decodeURI(sourcePathParts[sourcePathParts.length - 1]);
        }
    }
    if (!matched.length) return "ERROR: No saved clips use this footage.";
    var projectFootage = null;
    for (var itemIndex = 1; itemIndex <= app.project.numItems; itemIndex++) {
        var item = app.project.item(itemIndex);
        try {
            if (item instanceof FootageItem && item.mainSource instanceof FileSource &&
                String(item.mainSource.file.fsName).replace(/\\/g, "/").toLowerCase() === normalizedPath) {
                projectFootage = item;
                break;
            }
        } catch (e) {}
    }
    if (projectFootage) {
        try { projectFootage.name = name; } catch (e) {
            return "ERROR: Could not rename footage in the After Effects project: " + e.toString();
        }
    }
    for (var recordIndex = 0; recordIndex < matched.length; recordIndex++) {
        matched[recordIndex].footageMetadata = {
            displayName: name,
            originalName: originalName
        };
    }
    if (!writeClipFavoriteRecords(records)) return "ERROR: Could not save the footage name.";
    return "Renamed footage to “" + name + "”. Original name: “" + originalName + "”.";
}

function getNextClipFavoriteNameInFolder(records, folderId) {
    var nextClipNumber = 1;
    for (var i = 0; i < records.length; i++) {
        if ((records[i].folderId || "") !== folderId) {
            continue;
        }
        var clipNumberMatch = (records[i].displayName || "").match(/^Clip (\d+)(?: - .+)?$/i);
        if (clipNumberMatch) {
            nextClipNumber = Math.max(nextClipNumber, parseInt(clipNumberMatch[1], 10) + 1);
        }
    }
    var requestedName = "Clip " + nextClipNumber;
    while (isClipFavoriteNameTakenInFolder(records, requestedName, folderId)) {
        nextClipNumber++;
        requestedName = "Clip " + nextClipNumber;
    }
    return requestedName;
}

function getNextClipFavoriteName(encodedFolderId) {
    var folderId = decodeURIComponent(encodedFolderId || "");
    return getNextClipFavoriteNameInFolder(readClipFavoriteRecords(), folderId);
}

function captureSelectedClipFavorite() {
    var comp = getActiveComp();
    if (!comp) {
        return "ERROR: Select an active composition first.";
    }
    var selectedLayers = comp.selectedLayers || [];
    if (selectedLayers.length !== 1) {
        return "ERROR: Select exactly one footage layer.";
    }
    pendingClipFavoriteCapture = {
        comp: comp,
        layer: selectedLayers[0],
        time: comp.time
    };
    return "Clip selection captured.";
}

function cancelClipFavoriteCapture() {
    pendingClipFavoriteCapture = null;
    return "Clip selection cleared.";
}

function saveSelectedClipFavorite(encodedFolderId, savePosition, saveScale, saveAudioState, encodedCustomName, confirmLongClip, saveFirstTenSeconds) {
    if (savePosition === undefined) {
        savePosition = true;
    }
    if (saveScale === undefined) {
        saveScale = true;
    }
    if (saveAudioState === undefined) {
        saveAudioState = false;
    }
    var folderId = decodeURIComponent(encodedFolderId || "");
    if (!folderId) {
        return "ERROR: Home can only contain folders. Choose a collection folder before saving a clip.";
    }
    var folders = readClipFolderRecords();
    var folderExists = false;
    for (var folderIndex = 0; folderIndex < folders.length; folderIndex++) {
        if (folders[folderIndex].id === folderId) {
            folderExists = true;
            break;
        }
    }
    if (!folderExists) {
        return "ERROR: Collection folder not found.";
    }

    if (!pendingClipFavoriteCapture) {
        return "ERROR: Click Save a selected clip again to choose the clip to save.";
    }
    var comp = pendingClipFavoriteCapture.comp;
    var layer = pendingClipFavoriteCapture.layer;
    var captureTime = pendingClipFavoriteCapture.time;
    if (!comp || !(comp instanceof CompItem) || !layer) {
        pendingClipFavoriteCapture = null;
        return "ERROR: The captured clip is no longer available. Select it and try again.";
    }

    if (!layer || !(layer.source instanceof FootageItem) ||
        !(layer.source.mainSource instanceof FileSource)) {
        return "ERROR: The selected layer is not raw footage.";
    }
    if (layer.locked) {
        return "ERROR: The selected layer is locked.";
    }
    if (layer.timeRemapEnabled || layer.stretch !== 100) {
        return "ERROR: Disable Time Remapping and set Stretch to 100%.";
    }
    if (layer.threeDLayer) {
        return "ERROR: Saved clips currently support X/Y positions on 2D layers only.";
    }

    var positionValue = null;
    if (savePosition) {
        var positionProperty = layer.property("ADBE Transform Group").property("ADBE Position");
        if (!positionProperty || positionProperty.dimensionsSeparated) {
            return "ERROR: Use a combined X/Y Position property, not separated dimensions.";
        }
        positionValue = positionProperty.valueAtTime(captureTime, false);
        if (!positionValue || positionValue.length < 2) {
            return "ERROR: Could not read the layer's X/Y position.";
        }
    }
    var scaleValue = null;
    if (saveScale) {
        var scaleProperty = layer.property("ADBE Transform Group").property("ADBE Scale");
        scaleValue = scaleProperty.valueAtTime(captureTime, false);
        if (!scaleValue || scaleValue.length < 2) {
            return "ERROR: Could not read the layer's X/Y scale.";
        }
    }

    var sourceFile = layer.source.mainSource.file;
    if (!sourceFile || !sourceFile.exists) {
        return "ERROR: The footage file could not be found.";
    }
    var sourceIn = layer.inPoint - layer.startTime;
    var sourceOut = layer.outPoint - layer.startTime;
    if (sourceIn < 0 || sourceOut <= sourceIn || sourceOut > layer.source.duration) {
        return "ERROR: The visible clip range is outside the footage duration.";
    }
    if (saveFirstTenSeconds === true) {
        sourceOut = Math.min(sourceOut, sourceIn + 10);
    }
    if (sourceOut - sourceIn >= 180 && confirmLongClip !== true && saveFirstTenSeconds !== true) {
        return "LONG_CLIP_CONFIRM|" + (sourceOut - sourceIn);
    }

    var records = readClipFavoriteRecords();
    var displayName = decodeURIComponent(encodedCustomName || "").replace(/^\s+|\s+$/g, "");
    var hasCustomName = displayName !== "";
    if (displayName.length > 120) {
        return "ERROR: Clip names can be at most 120 characters long.";
    }
    if (!hasCustomName) {
        displayName = getNextClipFavoriteNameInFolder(records, folderId);
    }
    var newRecord = {
        displayName: displayName,
        sourceName: layer.source.name,
        sourcePath: sourceFile.fsName,
        sourceIn: sourceIn,
        sourceOut: sourceOut,
        positionX: savePosition ? positionValue[0] : null,
        positionY: savePosition ? positionValue[1] : null,
        scaleX: saveScale ? scaleValue[0] : null,
        scaleY: saveScale ? scaleValue[1] : null,
        folderId: folderId,
        audioEnabled: saveAudioState ? layer.audioEnabled : null,
        compWidth: comp.width,
        compHeight: comp.height,
        sourceWidth: layer.source.width,
        sourceHeight: layer.source.height,
        clipId: getClipRecordId()
    };

    for (var footageMetadataIndex = 0; footageMetadataIndex < records.length; footageMetadataIndex++) {
        var savedFootageRecord = records[footageMetadataIndex];
        if (String(savedFootageRecord.sourcePath || "").replace(/\\/g, "/").toLowerCase() ===
            String(newRecord.sourcePath || "").replace(/\\/g, "/").toLowerCase() && savedFootageRecord.footageMetadata) {
            newRecord.footageMetadata = savedFootageRecord.footageMetadata;
            break;
        }
    }

    pendingClipFavoriteReplacement = null;
    var matchingDuplicateIndex = -1;
    for (var duplicateIndex = 0; duplicateIndex < records.length; duplicateIndex++) {
        var existingRecord = records[duplicateIndex];
        if (existingRecord.sourcePath === newRecord.sourcePath &&
            Math.abs(existingRecord.sourceIn - newRecord.sourceIn) <= CLIP_TIMESTAMP_MATCH_TOLERANCE &&
            Math.abs(existingRecord.sourceOut - newRecord.sourceOut) <= CLIP_TIMESTAMP_MATCH_TOLERANCE) {
            matchingDuplicateIndex = duplicateIndex;
            break;
        }
    }
    if (hasCustomName && isClipFavoriteNameTakenInFolder(records, displayName, folderId, matchingDuplicateIndex)) {
        return "ERROR: A clip with this name already exists in this folder.";
    }
    if (matchingDuplicateIndex >= 0) {
        pendingClipFavoriteReplacement = { index: matchingDuplicateIndex, record: newRecord };
        pendingClipFavoriteCapture = null;
        return "DUPLICATE_CLIP|" + matchingDuplicateIndex + "|" + encodeURIComponent(records[matchingDuplicateIndex].displayName);
    }

    records.push(newRecord);

    if (!writeClipFavoriteRecords(records)) {
        return "ERROR: Could not save the clip. " + (sceneKeeperDataFolderError || "Check that the SceneKeeper data folder is writable.");
    }
    lastClipFavoriteSavedId = newRecord.clipId;
    pendingClipFavoriteCapture = null;
    return "Saved clip: " + displayName + " from " + layer.source.name + " (" + sourceIn.toFixed(2) + "–" + sourceOut.toFixed(2) + "s).";
}

function storeClipQuickSaveShortcutSettings(encodedFolderId, savePosition, saveScale, saveAudioState) {
    var folderId = decodeURIComponent(encodedFolderId || "");
    var folders = readClipFolderRecords();
    if (folderId) {
        var folderExists = false;
        for (var i = 0; i < folders.length; i++) {
            if (folders[i].id === folderId) {
                folderExists = true;
                break;
            }
        }
        if (!folderExists) return "ERROR: Quick Save folder was not found.";
    }
    app.settings.saveSetting("SceneKeeper Quick Save", "FolderId", folderId);
    app.settings.saveSetting("SceneKeeper Quick Save", "SavePosition", savePosition ? "1" : "0");
    app.settings.saveSetting("SceneKeeper Quick Save", "SaveScale", saveScale ? "1" : "0");
    app.settings.saveSetting("SceneKeeper Quick Save", "SaveAudio", saveAudioState ? "1" : "0");
    return "QUICK_SAVE_SETTINGS_STORED";
}

function getSceneKeeperQuickSaveRevision() {
    if (!app.settings.haveSetting("SceneKeeper Quick Save", "RefreshRevision")) return "0";
    return app.settings.getSetting("SceneKeeper Quick Save", "RefreshRevision");
}

function getSceneKeeperQuickSaveStatus() {
    return getSceneKeeperQuickSaveRevision() + "|" + encodeURIComponent(
        app.settings.haveSetting("SceneKeeper Quick Save", "RefreshClipId")
            ? app.settings.getSetting("SceneKeeper Quick Save", "RefreshClipId")
            : "") + "|" + encodeURIComponent(
        app.settings.haveSetting("SceneKeeper Quick Save", "RefreshWarning")
            ? app.settings.getSetting("SceneKeeper Quick Save", "RefreshWarning")
            : "");
}

function quickSaveSelectedClipsFromShortcut(skipRevisionUpdate, startAtIndex, confirmLongClip, saveFirstTenSeconds, folderIdOverride, savePositionOverride, saveScaleOverride, saveAudioOverride) {
    var comp = getActiveComp();
    if (!comp) return "ERROR: Select footage clips in an active composition first.";
    if (typeof folderIdOverride !== "string" && !app.settings.haveSetting("SceneKeeper Quick Save", "FolderId")) {
        return "ERROR: Open a collection folder in SceneKeeper before using Quick Save.";
    }
    var folderId = typeof folderIdOverride === "string"
        ? folderIdOverride
        : app.settings.getSetting("SceneKeeper Quick Save", "FolderId");
    if (!folderId) return "ERROR: The currently open SceneKeeper location is Home. Open a collection folder and try again.";
    var folders = readClipFolderRecords();
    var folderExists = false;
    var folderName = "";
    for (var folderIndex = 0; folderIndex < folders.length; folderIndex++) {
        if (folders[folderIndex].id === folderId) {
            folderExists = true;
            folderName = folders[folderIndex].name;
            break;
        }
    }
    if (!folderExists) return "ERROR: The saved Quick Save folder no longer exists. Choose a collection folder in SceneKeeper again.";

    var selectedLayers = comp.selectedLayers || [];
    if (!selectedLayers.length) return "ERROR: Select one or more footage layers first.";
    var savePosition = typeof savePositionOverride === "boolean"
        ? savePositionOverride
        : (!app.settings.haveSetting("SceneKeeper Quick Save", "SavePosition") ||
        app.settings.getSetting("SceneKeeper Quick Save", "SavePosition") !== "0");
    var saveScale = typeof saveScaleOverride === "boolean"
        ? saveScaleOverride
        : (!app.settings.haveSetting("SceneKeeper Quick Save", "SaveScale") ||
        app.settings.getSetting("SceneKeeper Quick Save", "SaveScale") !== "0");
    var saveAudio = typeof saveAudioOverride === "boolean"
        ? saveAudioOverride
        : (app.settings.haveSetting("SceneKeeper Quick Save", "SaveAudio") &&
        app.settings.getSetting("SceneKeeper Quick Save", "SaveAudio") === "1");
    var savedCount = 0;
    var failures = [];
    var longClipWarnings = [];
    var lastSavedClipId = "";
    var firstLayerIndex = Math.max(0, parseInt(startAtIndex, 10) || 0);
    for (var layerIndex = firstLayerIndex; layerIndex < selectedLayers.length; layerIndex++) {
        var layer = selectedLayers[layerIndex];
        pendingClipFavoriteCapture = { comp: comp, layer: layer, time: comp.time };
        var result;
        try {
            result = saveSelectedClipFavorite(
                encodeURIComponent(folderId), savePosition, saveScale, saveAudio, "",
                confirmLongClip === true || skipRevisionUpdate !== true, saveFirstTenSeconds === true);
            if (result.indexOf("LONG_CLIP_CONFIRM|") === 0) {
                pendingClipFavoriteCapture = null;
                pendingClipFavoriteReplacement = null;
                return "LONG_CLIP_CONFIRM|" + result.split("|")[1] + "|" + layerIndex + "|" + savedCount + "|" +
                    encodeURIComponent(folderName) + "|" + encodeURIComponent(failures.join(" | ")) + "|" +
                    encodeURIComponent(lastSavedClipId) + "|" + encodeURIComponent(longClipWarnings.join("; "));
            }
            if (result.indexOf("DUPLICATE_CLIP|") === 0) result = confirmClipFavoriteReplacement();
            if (result.indexOf("Saved clip:") === 0 || result.indexOf("Replaced clip:") === 0) {
                savedCount++;
                lastSavedClipId = lastClipFavoriteSavedId;
                var savedSourceDuration = layer.outPoint - layer.inPoint;
                if (!saveFirstTenSeconds && savedSourceDuration >= 180) {
                    var wholeSeconds = Math.round(savedSourceDuration);
                    var durationLabel = Math.floor(wholeSeconds / 60) + ":" + ("0" + (wholeSeconds % 60)).slice(-2);
                    longClipWarnings.push(layer.name + " (" + durationLabel + ")");
                }
            } else {
                failures.push(layer.name + ": " + String(result).replace(/^ERROR:\s*/, ""));
            }
        } catch (error) {
            failures.push(layer.name + ": " + error.toString());
        }
        pendingClipFavoriteCapture = null;
        pendingClipFavoriteReplacement = null;
    }
    if (savedCount === 0 && firstLayerIndex === 0) {
        return "ERROR: No selected clips were saved. " + failures.join(" | ");
    }
    if (skipRevisionUpdate !== true) {
        var revision = parseInt(getSceneKeeperQuickSaveRevision(), 10);
        if (isNaN(revision)) revision = 0;
        app.settings.saveSetting("SceneKeeper Quick Save", "RefreshClipId", lastSavedClipId);
        app.settings.saveSetting("SceneKeeper Quick Save", "RefreshWarning", longClipWarnings.join("; "));
        app.settings.saveSetting("SceneKeeper Quick Save", "RefreshRevision", String(revision + 1));
    }
    return "QUICKSAVE_DONE|" + savedCount + "|" + encodeURIComponent(folderName) + "|" + encodeURIComponent(failures.join(" | ")) + "|" + encodeURIComponent(lastSavedClipId) + "|" + encodeURIComponent(longClipWarnings.join("; "));
}

function quickSaveSelectedClipsToFolder(encodedFolderId, savePosition, saveScale, saveAudioState, startAtIndex, confirmLongClip, saveFirstTenSeconds) {
    var settingsResult = storeClipQuickSaveShortcutSettings(encodedFolderId, savePosition, saveScale, saveAudioState);
    if (String(settingsResult).indexOf("ERROR:") === 0) return settingsResult;
    return quickSaveSelectedClipsFromShortcut(true, startAtIndex, confirmLongClip, saveFirstTenSeconds);
}

function saveSelectedClipsToFolderOnce(encodedFolderId, savePosition, saveScale, saveAudioState, startAtIndex, confirmLongClip, saveFirstTenSeconds) {
    var folderId;
    try {
        folderId = decodeURIComponent(encodedFolderId || "");
    } catch (decodeError) {
        return "ERROR: The selected save folder is invalid.";
    }
    return quickSaveSelectedClipsFromShortcut(
        true, startAtIndex, confirmLongClip, saveFirstTenSeconds,
        folderId, savePosition === true, saveScale === true, saveAudioState === true);
}

function confirmClipFavoriteReplacement() {
    if (!pendingClipFavoriteReplacement) {
        return "ERROR: No clip replacement is pending.";
    }
    var pending = pendingClipFavoriteReplacement;
    pendingClipFavoriteReplacement = null;
    var records = readClipFavoriteRecords();
    if (pending.index < 0 || pending.index >= records.length) {
        return "ERROR: The existing clip could not be found.";
    }
    var existingRecord = records[pending.index];
    if (existingRecord.sourcePath !== pending.record.sourcePath ||
        Math.abs(existingRecord.sourceIn - pending.record.sourceIn) > CLIP_TIMESTAMP_MATCH_TOLERANCE ||
        Math.abs(existingRecord.sourceOut - pending.record.sourceOut) > CLIP_TIMESTAMP_MATCH_TOLERANCE) {
        return "ERROR: The existing clip changed before it could be replaced.";
    }

    pending.record.displayName = existingRecord.displayName;
    pending.record.folderId = existingRecord.folderId || "";
    records[pending.index] = pending.record;
    if (!writeClipFavoriteRecords(records)) {
        return "ERROR: Could not replace the existing clip.";
    }
    lastClipFavoriteSavedId = pending.record.clipId;
    return "Replaced clip: " + existingRecord.displayName;
}

function cancelClipFavoriteReplacement() {
    pendingClipFavoriteReplacement = null;
    return "Replacement canceled. The existing clip was not changed.";
}

function renameClipFavorite(index, encodedName) {
    var records = readClipFavoriteRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= records.length) {
        return "ERROR: Select a clip first.";
    }
    var name = decodeURIComponent(encodedName || "").replace(/^\s+|\s+$/g, "");
    if (!name) {
        return "ERROR: Clip name cannot be empty.";
    }
    if (isClipFavoriteNameTakenInFolder(records, name, records[index].folderId, index)) {
        return "ERROR: Another clip already uses this name.";
    }
    records[index].displayName = name;
    if (!writeClipFavoriteRecords(records)) {
        return "ERROR: Could not save the clip name.";
    }
    return "Renamed clip: " + name;
}

function reorderClipFavorites(encodedClipIds) {
    var requestedIds;
    try {
        requestedIds = JSON.parse(decodeURIComponent(encodedClipIds || ""));
    } catch (e) {
        return "ERROR: The requested clip order is invalid.";
    }
    if (!(requestedIds instanceof Array) || !requestedIds.length) {
        return "ERROR: Select clips in one collection to reorder.";
    }

    var records = readClipFavoriteRecords();
    var folderId = null;
    var clipsById = {};
    var folderClipCount = 0;
    for (var i = 0; i < records.length; i++) {
        if (records[i].clipId === requestedIds[0]) {
            folderId = records[i].folderId || "";
            break;
        }
    }
    if (folderId === null) {
        return "ERROR: The clips to reorder could not be found.";
    }

    for (var recordIndex = 0; recordIndex < records.length; recordIndex++) {
        if ((records[recordIndex].folderId || "") === folderId) {
            clipsById["$" + records[recordIndex].clipId] = records[recordIndex];
            folderClipCount++;
        }
    }
    if (requestedIds.length !== folderClipCount) {
        return "ERROR: The clip order is incomplete or includes another collection.";
    }

    var orderedClips = [];
    var seenIds = {};
    for (var idIndex = 0; idIndex < requestedIds.length; idIndex++) {
        var requestedId = requestedIds[idIndex];
        var lookupKey = "$" + requestedId;
        if (typeof requestedId !== "string" || seenIds[lookupKey] ||
            !clipsById[lookupKey]) {
            return "ERROR: The clip order contains an invalid or duplicate clip.";
        }
        seenIds[lookupKey] = true;
        orderedClips.push(clipsById[lookupKey]);
    }

    var orderedIndex = 0;
    for (var slotIndex = 0; slotIndex < records.length; slotIndex++) {
        if ((records[slotIndex].folderId || "") === folderId) {
            records[slotIndex] = orderedClips[orderedIndex++];
        }
    }
    if (!writeClipFavoriteRecords(records)) {
        return "ERROR: Could not save the clip order.";
    }
    return "Clip order updated.";
}

function updateClipFavorite(index, encodedSourceIn, encodedSourceOut, encodedPositionX, encodedPositionY, encodedScaleX, encodedScaleY, encodedAudioEnabled, encodedDisplayName) {
    var records = readClipFavoriteRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= records.length) {
        return "ERROR: Select a clip to edit.";
    }

    var sourceIn = parseFloat(decodeURIComponent(encodedSourceIn || ""));
    var sourceOut = parseFloat(decodeURIComponent(encodedSourceOut || ""));
    if (isNaN(sourceIn) || isNaN(sourceOut) || sourceIn < 0 || sourceOut <= sourceIn) {
        return "ERROR: Enter valid in and out timestamps; out must be greater than in.";
    }

    function parseOptionalNumber(encodedValue, label) {
        var value = decodeURIComponent(encodedValue || "");
        if (value === "") {
            return { valid: true, value: null };
        }
        var number = parseFloat(value);
        if (isNaN(number) || !isFinite(number)) {
            return { valid: false, value: null, label: label };
        }
        return { valid: true, value: number };
    }

    var positionX = parseOptionalNumber(encodedPositionX, "X position");
    var positionY = parseOptionalNumber(encodedPositionY, "Y position");
    var scaleX = parseOptionalNumber(encodedScaleX, "X scale");
    var scaleY = parseOptionalNumber(encodedScaleY, "Y scale");
    if (!positionX.valid || !positionY.valid || !scaleX.valid || !scaleY.valid) {
        return "ERROR: Position and scale values must be valid numbers.";
    }
    if ((positionX.value === null) !== (positionY.value === null)) {
        return "ERROR: Enter both X and Y position values, or leave both empty.";
    }
    if ((scaleX.value === null) !== (scaleY.value === null)) {
        return "ERROR: Enter both X and Y scale values, or leave both empty.";
    }

    var audioValue = decodeURIComponent(encodedAudioEnabled || "");
    if (audioValue !== "" && audioValue !== "1" && audioValue !== "0") {
        return "ERROR: Select a valid audio state.";
    }

    var displayName = null;
    if (typeof encodedDisplayName !== "undefined") {
        displayName = decodeURIComponent(encodedDisplayName || "").replace(/^\s+|\s+$/g, "");
        if (!displayName) {
            return "ERROR: Clip name cannot be empty.";
        }
        if (isClipFavoriteNameTakenInFolder(records, displayName, records[index].folderId, index)) {
            return "ERROR: Another clip already uses this name.";
        }
    }

    var record = records[index];
    for (var projectIndex = 1; projectIndex <= app.project.numItems; projectIndex++) {
        var projectItem = app.project.item(projectIndex);
        if (!(projectItem instanceof FootageItem) || !(projectItem.mainSource instanceof FileSource)) {
            continue;
        }
        try {
            if (projectItem.mainSource.file.fsName === record.sourcePath &&
                sourceOut - projectItem.duration > FOOTAGE_END_TOLERANCE) {
                return "ERROR: The out timestamp exceeds the footage duration.";
            }
        } catch (e) {
            // Continue if this project item does not expose a readable source file.
        }
    }

    record.sourceIn = sourceIn;
    record.sourceOut = sourceOut;
    record.positionX = positionX.value;
    record.positionY = positionY.value;
    record.scaleX = scaleX.value;
    record.scaleY = scaleY.value;
    record.audioEnabled = audioValue === "" ? null : audioValue === "1";
    if (displayName !== null) {
        record.displayName = displayName;
    }
    if (!writeClipFavoriteRecords(records)) {
        return "ERROR: Could not save the edited clip.";
    }
    return "Updated clip: " + record.displayName;
}

function deleteClipFavorite(index) {
    var records = readClipFavoriteRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= records.length) {
        return "ERROR: Select a clip first.";
    }
    var name = records[index].displayName;
    if (!addClipRecordsToTrash([records[index]])) {
        return "ERROR: Could not move the clip to the trash.";
    }
    records.splice(index, 1);
    if (!writeClipFavoriteRecords(records)) {
        return "ERROR: Could not delete the clip.";
    }
    return "Deleted clip: " + name + "." + clipPreviewCleanupWarning;
}

function deleteClipFavoriteFootage(encodedSourcePath) {
    var sourcePath = decodeURIComponent(encodedSourcePath || "");
    if (!sourcePath) {
        return "ERROR: Select footage to delete.";
    }
    var records = readClipFavoriteRecords();
    var keptRecords = [];
    var deletedRecords = [];
    var removedCount = 0;
    var sourceName = "";
    for (var i = 0; i < records.length; i++) {
        if (records[i].sourcePath === sourcePath) {
            sourceName = records[i].sourceName;
            removedCount++;
            deletedRecords.push(records[i]);
        } else {
            keptRecords.push(records[i]);
        }
    }
    if (!removedCount) {
        return "ERROR: No saved clips were found for this footage.";
    }
    if (!addClipRecordsToTrash(deletedRecords) || !writeClipFavoriteRecords(keptRecords)) {
        return "ERROR: Could not delete the footage clips.";
    }
    var folders = readClipFolderRecords();
    var keptFolders = [];
    for (var f = 0; f < folders.length; f++) {
        if (folders[f].sourcePath !== sourcePath) {
            keptFolders.push(folders[f]);
        }
    }
    if (!writeClipFolderRecords(keptFolders)) {
        return "ERROR: Could not delete the footage folders.";
    }
    return "Deleted footage " + sourceName + " and " + removedCount + " saved clip(s)." + clipPreviewCleanupWarning;
}

function restoreClipTrashItem(index) {
    var trashRecords = readClipTrashRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= trashRecords.length) {
        return "ERROR: Select an item in the trash first.";
    }
    var folders = readClipFolderRecords();
    var records = readClipFavoriteRecords();
    var entry = trashRecords[index];
    var restoredName = "";

    if (entry.type === "folder") {
        var restoredFolderName = entry.folder.name;
        if (!/\(restored\)$/i.test(restoredFolderName)) entry.folder.name = restoredFolderName + " (restored)";
        var restoredFolderIds = {};
        var existingFolderIds = {};
        for (var existingFolderIndex = 0; existingFolderIndex < folders.length; existingFolderIndex++) {
            existingFolderIds["$" + folders[existingFolderIndex].id] = true;
        }
        for (var folderIndex = 0; folderIndex < entry.folders.length; folderIndex++) {
            var storedFolderId = entry.folders[folderIndex].id;
            var restoredFolderId = storedFolderId;
            if (existingFolderIds["$" + restoredFolderId]) {
                restoredFolderId = "restored-" + entry.trashId + "-" + folderIndex;
            }
            restoredFolderIds["$" + storedFolderId] = restoredFolderId;
            existingFolderIds["$" + restoredFolderId] = true;
        }
        for (var restoredFolderIndex = 0; restoredFolderIndex < entry.folders.length; restoredFolderIndex++) {
            var restoredFolder = entry.folders[restoredFolderIndex];
            if (!/\(restored\)$/i.test(restoredFolder.name)) restoredFolder.name += " (restored)";
            restoredFolder.id = restoredFolderIds["$" + restoredFolder.id];
            restoredFolder.parentId = restoredFolderIds["$" + restoredFolder.parentId] ||
                (restoredFolder.parentId && existingFolderIds["$" + restoredFolder.parentId] ? restoredFolder.parentId : "");
            folders.push(restoredFolder);
        }
        for (var restoredClipIndex = 0; restoredClipIndex < entry.clips.length; restoredClipIndex++) {
            var restoredClip = entry.clips[restoredClipIndex];
            if (!/\(restored\)$/i.test(restoredClip.displayName)) restoredClip.displayName += " (restored)";
            restoredClip.folderId = restoredFolderIds["$" + restoredClip.folderId] || "";
            records.push(restoredClip);
        }
        restoredName = entry.folder.name;
    } else {
        var record = entry.record;
        if (!/\(restored\)$/i.test(record.displayName)) record.displayName += " (restored)";
        var folderExists = !record.folderId;
        for (var clipFolderIndex = 0; clipFolderIndex < folders.length; clipFolderIndex++) {
            if (folders[clipFolderIndex].id === record.folderId) {
                folderExists = true;
                break;
            }
        }
        if (!folderExists) {
            record.folderId = "";
        }
        records.push(record);
        restoredName = record.displayName;
    }

    trashRecords.splice(index, 1);
    if (!writeClipFolderRecords(folders) ||
        !writeClipFavoriteRecords(records) ||
        !writeClipTrashRecords(trashRecords)) {
        return "ERROR: Could not restore the deleted item.";
    }
    return entry.type === "folder"
        ? "Restored folder and its contents: " + restoredName
        : "Restored clip: " + restoredName;
}

function permanentlyDeleteClipTrashItem(index) {
    var records = readClipTrashRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= records.length) {
        return "ERROR: Select an item in the trash first.";
    }
    var deletedEntry = records[index];
    var name = deletedEntry.type === "folder" ? deletedEntry.folder.name : deletedEntry.record.displayName;
    records.splice(index, 1);
    if (!writeClipTrashRecords(records)) {
        return "ERROR: Could not permanently delete the item.";
    }
    removeClipRecordsFromHistory([deletedEntry]);
    return "Permanently deleted: " + name;
}

function emptyClipTrash() {
    var records = readClipTrashRecords();
    if (!records.length) {
        return "The trash is already empty.";
    }
    if (!writeClipTrashRecords([])) {
        return "ERROR: Could not empty the trash.";
    }
    removeClipRecordsFromHistory(records);
    return "Permanently deleted " + records.length + " item(s) from the trash.";
}

function getSceneKeeperProjectFolder() {
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item instanceof FolderItem &&
            item.parentFolder === app.project.rootFolder &&
            item.name === "SceneKeeper") {
            return item;
        }
    }
    return app.project.items.addFolder("SceneKeeper");
}

function prepareSceneKeeperTutorialExample(encodedSamplePath) {
    if (!app.project) {
        return "ERROR: Open or create an After Effects project first.";
    }

    var samplePath = decodeURIComponent(encodedSamplePath || "");
    var sampleFile = new File(samplePath);
    if (!sampleFile.exists) {
        return "ERROR: The SceneKeeper tutorial sample clip could not be found.";
    }

    var sampleFootage = null;
    for (var footageIndex = 1; footageIndex <= app.project.numItems; footageIndex++) {
        var projectItem = app.project.item(footageIndex);
        if (!(projectItem instanceof FootageItem) || !(projectItem.mainSource instanceof FileSource)) {
            continue;
        }
        try {
            if (projectItem.mainSource.file.fsName === sampleFile.fsName) {
                sampleFootage = projectItem;
                break;
            }
        } catch (e) {
            // Continue searching project footage.
        }
    }

    app.beginUndoGroup("SceneKeeper - Prepare Guided Tutorial");
    try {
        var projectFolder = null;
        for (var folderIndex = 1; folderIndex <= app.project.numItems; folderIndex++) {
            var folderItem = app.project.item(folderIndex);
            if (folderItem instanceof FolderItem &&
                folderItem.parentFolder === app.project.rootFolder &&
                folderItem.comment === "SceneKeeper guided tutorial") {
                projectFolder = folderItem;
                break;
            }
        }
        if (!projectFolder) {
            projectFolder = app.project.items.addFolder("SceneKeeper Tutorial");
            projectFolder.comment = "SceneKeeper guided tutorial";
        }

        if (!sampleFootage) {
            sampleFootage = app.project.importFile(new ImportOptions(sampleFile));
        } else {
            sampleFootage.replace(sampleFile);
        }
        if (!sampleFootage) {
            app.endUndoGroup();
            return "ERROR: After Effects could not import the tutorial sample clip.";
        }
        sampleFootage.parentFolder = projectFolder;

        var tutorialComp = null;
        for (var compIndex = 1; compIndex <= app.project.numItems; compIndex++) {
            var compItem = app.project.item(compIndex);
            if (compItem instanceof CompItem && compItem.comment === "SceneKeeper guided tutorial") {
                tutorialComp = compItem;
                break;
            }
        }
        if (!tutorialComp) {
            var frameRate = sampleFootage.frameRate;
            if (!frameRate || isNaN(frameRate)) frameRate = 24;
            tutorialComp = app.project.items.addComp(
                "SceneKeeper Tutorial Example",
                sampleFootage.width,
                sampleFootage.height,
                sampleFootage.pixelAspect,
                sampleFootage.duration,
                frameRate
            );
            tutorialComp.comment = "SceneKeeper guided tutorial";
        }
        tutorialComp.parentFolder = projectFolder;

        var sampleLayer = null;
        for (var layerIndex = 1; layerIndex <= tutorialComp.numLayers; layerIndex++) {
            var existingLayer = tutorialComp.layer(layerIndex);
            if (existingLayer.source === sampleFootage) {
                sampleLayer = existingLayer;
                break;
            }
        }
        if (!sampleLayer) {
            sampleLayer = tutorialComp.layers.add(sampleFootage);
            sampleLayer.name = "SceneKeeper Sample Clip";
            sampleLayer.startTime = 0;
            sampleLayer.inPoint = 0;
            sampleLayer.outPoint = Math.min(sampleFootage.duration, tutorialComp.duration);
        }

        tutorialComp.openInViewer();
        for (var selectedLayerIndex = 1; selectedLayerIndex <= tutorialComp.numLayers; selectedLayerIndex++) {
            tutorialComp.layer(selectedLayerIndex).selected = false;
        }
        sampleLayer.selected = true;
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: Could not prepare the tutorial composition: " + e.toString();
    }
    app.endUndoGroup();

    var tutorialFolderId = "scenekeeper_getting_started";
    var favoriteFolders = readClipFolderRecords();
    var favoriteFolderExists = false;
    var favoriteFolderName = "Getting Started";
    for (var favoriteFolderIndex = 0; favoriteFolderIndex < favoriteFolders.length; favoriteFolderIndex++) {
        if (favoriteFolders[favoriteFolderIndex].id === tutorialFolderId) {
            favoriteFolderExists = true;
        }
        if (favoriteFolders[favoriteFolderIndex].id !== tutorialFolderId &&
            !favoriteFolders[favoriteFolderIndex].parentId &&
            favoriteFolders[favoriteFolderIndex].name.toLowerCase() === favoriteFolderName.toLowerCase()) {
            favoriteFolderName = "Getting Started Tutorial";
        }
    }
    if (!favoriteFolderExists) {
        favoriteFolders.push({ id: tutorialFolderId, name: favoriteFolderName, sourcePath: "", parentId: "" });
        if (!writeClipFolderRecords(favoriteFolders)) {
            return "ERROR: Could not create the tutorial collection.";
        }
    }

    return "TUTORIAL_PREPARED|" + tutorialFolderId;
}

function insertClipFavoriteRecord(comp, record, placement) {
    var duration = record.sourceOut - record.sourceIn;
    if (isNaN(duration) || duration <= 0) {
        return "ERROR: The saved clip is invalid.";
    }

    var sourceFile = new File(record.sourcePath);
    if (!sourceFile.exists) {
        return "ERROR: Footage file not found: " + record.sourcePath + ". Use Relink Selected Footage in Saved Clips.";
    }

    var sourceItem = null;
    var importedSourceItem = false;
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (!(item instanceof FootageItem) || !(item.mainSource instanceof FileSource)) {
            continue;
        }
        try {
            if (item.mainSource.file.fsName === sourceFile.fsName) {
                sourceItem = item;
                break;
            }
        } catch (e) {
            // Continue searching project footage.
        }
    }
    if (!sourceItem) {
        try {
            sourceItem = app.project.importFile(new ImportOptions(sourceFile));
            importedSourceItem = Boolean(sourceItem);
        } catch (e) {
            return "ERROR: Could not import footage: " + e.toString();
        }
    }
    if (!sourceItem) {
        return "ERROR: The saved clip's source range no longer matches the footage file.";
    }
    if (importedSourceItem) {
        try {
            sourceItem.parentFolder = getSceneKeeperProjectFolder();
        } catch (e) {
            try {
                sourceItem.remove();
            } catch (removeError) {
            }
            return "ERROR: Could not place imported footage in the SceneKeeper project folder: " + e.toString();
        }
    }
    var sourceEndDifference = record.sourceOut - sourceItem.duration;
    if (sourceEndDifference > FOOTAGE_END_TOLERANCE) {
        return "ERROR: The saved clip's source range no longer matches the footage file.";
    }
    if (sourceEndDifference > 0) {
        duration = sourceItem.duration - record.sourceIn;
    }
    if (placement && placement.duration !== undefined) {
        if (placement.duration > duration + FOOTAGE_END_TOLERANCE) {
            return "ERROR: The saved clip is too short for this marker interval.";
        }
        duration = placement.duration;
    }
    if (duration <= 0) {
        return "ERROR: The saved clip's source range no longer matches the footage file.";
    }
    var positionX = record.positionX === null || isNaN(record.positionX) ? comp.width / 2 : record.positionX;
    var positionY = record.positionY === null || isNaN(record.positionY) ? comp.height / 2 : record.positionY;
    var scaleX = record.scaleX === null || isNaN(record.scaleX) ? 100 : record.scaleX;
    var scaleY = record.scaleY === null || isNaN(record.scaleY) ? 100 : record.scaleY;

    var insertionTime = placement && placement.time !== undefined ? placement.time : comp.time;
    var blendingMode = getClipFrameBlendingMode();
    var mutedInsert = getClipMutedInsert() === "ON";
    var managesUndoGroup = !(placement && placement.joinUndoGroup === false);
    if (managesUndoGroup) {
        app.beginUndoGroup("SceneKeeper - Insert Clip");
    }
    try {
        var layer = comp.layers.add(sourceItem);
        if (placement) {
            placement.insertedLayer = layer;
        }
        layer.name = sceneClipLayerName(record);
        layer.comment = sceneClipFavoriteComment(record, "");
        layer.startTime = insertionTime - record.sourceIn;
        layer.inPoint = insertionTime;
        layer.outPoint = insertionTime + duration;
        layer.property("ADBE Transform Group").property("ADBE Position").setValue([positionX, positionY]);
        layer.property("ADBE Transform Group").property("ADBE Scale").setValue([scaleX, scaleY]);
        if (mutedInsert) {
            layer.audioEnabled = false;
        } else if (record.audioEnabled !== null && record.audioEnabled !== undefined) {
            layer.audioEnabled = record.audioEnabled;
        }
        if (blendingMode === "PIXEL_MOTION") {
            comp.frameBlending = true;
            layer.frameBlendingType = FrameBlendingType.PIXEL_MOTION;
        } else if (blendingMode === "FRAME_MIX") {
            comp.frameBlending = true;
            layer.frameBlendingType = FrameBlendingType.FRAME_MIX;
        } else {
            layer.frameBlendingType = FrameBlendingType.NO_FRAME_BLEND;
        }
    } catch (e) {
        if (managesUndoGroup) {
            app.endUndoGroup();
        }
        return "ERROR: Could not insert clip: " + e.toString();
    }
    if (managesUndoGroup) {
        app.endUndoGroup();
    }
    return "Inserted clip: " + record.displayName + " (" + duration.toFixed(2) + "s).";
}

function insertClipFavorite(index) {
    var comp = getActiveComp();
    if (!comp) {
        return "ERROR: Select an active composition first.";
    }
    var records = readClipFavoriteRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= records.length) {
        return "ERROR: Select a clip first.";
    }
    return insertClipFavoriteRecord(comp, records[index]);
}

function insertClipFavoriteIntoSelectedPrecomp(index) {
    var comp = getActiveComp();
    if (!comp) return "ERROR: Select the composition containing the precomp first.";
    var selectedLayers = comp.selectedLayers || [];
    if (selectedLayers.length !== 1 || !(selectedLayers[0].source instanceof CompItem)) {
        return "ERROR: Select one precomp layer in the active composition.";
    }
    var precomp = selectedLayers[0].source;
    if (!(precomp.duration > 0)) return "ERROR: The selected precomp has no usable duration.";
    var records = readClipFavoriteRecords();
    index = parseInt(index, 10);
    if (isNaN(index) || index < 0 || index >= records.length) return "ERROR: Select a clip first.";
    var record = records[index];
    var duration = Math.min(record.sourceOut - record.sourceIn, precomp.duration);
    if (!(duration > 0)) return "ERROR: The selected clip has no usable duration.";
    var result = insertClipFavoriteRecord(precomp, record, { time: 0, duration: duration });
    if (result.indexOf("Inserted clip:") === 0) return "Inserted into selected precomp: " + record.displayName + " (" + duration.toFixed(2) + "s).";
    return result;
}

function insertRandomClipFavoriteForSelectedFootage() {
    var comp = getActiveComp();
    if (!comp) {
        return "ERROR: Select an active composition first.";
    }
    var selectedLayers = comp.selectedLayers || [];
    if (selectedLayers.length !== 1) {
        return "ERROR: Select exactly one footage layer in the timeline.";
    }

    var selectedLayer = selectedLayers[0];
    if (!selectedLayer.source || !(selectedLayer.source instanceof FootageItem) ||
        !(selectedLayer.source.mainSource instanceof FileSource)) {
        return "ERROR: The selected layer is not raw footage.";
    }
    var selectedFile = selectedLayer.source.mainSource.file;
    if (!selectedFile || !selectedFile.exists) {
        return "ERROR: The selected footage file could not be found.";
    }

    var records = readClipFavoriteRecords();
    var matchingRecords = [];
    for (var i = 0; i < records.length; i++) {
        if (records[i].sourcePath === selectedFile.fsName) {
            matchingRecords.push(records[i]);
        }
    }
    if (!matchingRecords.length) {
        return "ERROR: No saved clips exist for " + selectedLayer.source.name + ".";
    }

    var randomIndex = Math.floor(Math.random() * matchingRecords.length);
    return insertClipFavoriteRecord(comp, matchingRecords[randomIndex]);
}

function chooseTwixtorPresetFile() {
    var presetFile = File.openDialog("Choose Twixtor FFX preset", "*.ffx", false);
    if (!presetFile) {
        return "TWIXTOR_PRESET_CANCELLED";
    }
    if (!/\.ffx$/i.test(presetFile.name)) {
        return "ERROR: Choose a .ffx preset file.";
    }
    return "TWIXTOR_PRESET|" + encodeURIComponent(presetFile.fsName);
}

function sceneCollectKeyframedProperties(group, properties) {
    var i;
    for (i = 1; i <= group.numProperties; i++) {
        var property = group.property(i);
        if (typeof property.numProperties === "number" && property.numProperties > 0) {
            sceneCollectKeyframedProperties(property, properties);
        } else if (property.propertyType === PropertyType.PROPERTY && property.numKeys > 0) {
            properties.push(property);
        }
    }
}

function sceneSnapshotPropertyKeys(property) {
    var keys = [];
    var i;
    for (i = 1; i <= property.numKeys; i++) {
        var key = {
            time: property.keyTime(i),
            value: property.keyValue(i),
            inInterpolation: property.keyInInterpolationType(i),
            outInterpolation: property.keyOutInterpolationType(i),
            inEase: property.keyInTemporalEase(i),
            outEase: property.keyOutTemporalEase(i),
            temporalContinuous: property.keyTemporalContinuous(i),
            temporalAutoBezier: property.keyTemporalAutoBezier(i)
        };
        if (property.isSpatial) {
            key.inSpatialTangent = property.keyInSpatialTangent(i);
            key.outSpatialTangent = property.keyOutSpatialTangent(i);
            key.spatialContinuous = property.keySpatialContinuous(i);
            key.spatialAutoBezier = property.keySpatialAutoBezier(i);
        }
        keys.push(key);
    }
    return keys;
}

function sceneReplacePropertyKeys(property, keys, firstTime, lastTime, originalFirstTime, originalLastTime, remap) {
    var timeScale = remap ? (lastTime - firstTime) / (originalLastTime - originalFirstTime) : 1;
    var i;
    for (i = property.numKeys; i >= 1; i--) {
        property.removeKey(i);
    }
    for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        var time = remap ? firstTime + (key.time - originalFirstTime) * timeScale : key.time;
        property.setValueAtTime(time, key.value);
        var keyIndex = property.nearestKeyIndex(time);
        var inEase = [];
        var outEase = [];
        var easeIndex;
        for (easeIndex = 0; easeIndex < key.inEase.length; easeIndex++) {
            inEase.push(new KeyframeEase(key.inEase[easeIndex].speed / timeScale, key.inEase[easeIndex].influence));
            outEase.push(new KeyframeEase(key.outEase[easeIndex].speed / timeScale, key.outEase[easeIndex].influence));
        }
        property.setInterpolationTypeAtKey(keyIndex, key.inInterpolation, key.outInterpolation);
        property.setTemporalEaseAtKey(keyIndex, inEase, outEase);
        property.setTemporalContinuousAtKey(keyIndex, key.temporalContinuous);
        property.setTemporalAutoBezierAtKey(keyIndex, key.temporalAutoBezier);
        if (property.isSpatial) {
            property.setSpatialTangentsAtKey(keyIndex, key.inSpatialTangent, key.outSpatialTangent);
            property.setSpatialContinuousAtKey(keyIndex, key.spatialContinuous);
            property.setSpatialAutoBezierAtKey(keyIndex, key.spatialAutoBezier);
        }
    }
}

function sceneFitKeyframesToLayer(layer, frameDuration) {
    var properties = [];
    sceneCollectKeyframedProperties(layer, properties);
    if (!properties.length) {
        return { skipped: true };
    }
    var snapshots = [];
    var firstKeyTime = null;
    var lastKeyTime = null;
    var hasRovingKey = false;
    var i;
    for (i = 0; i < properties.length; i++) {
        var property = properties[i];
        var keys = sceneSnapshotPropertyKeys(property);
        snapshots.push({ property: property, keys: keys });
        if (property.isSpatial) {
            var keyIndex;
            for (keyIndex = 1; keyIndex <= property.numKeys; keyIndex++) {
                if (property.keyRoving(keyIndex)) hasRovingKey = true;
            }
        }
        if (firstKeyTime === null || keys[0].time < firstKeyTime) firstKeyTime = keys[0].time;
        if (lastKeyTime === null || keys[keys.length - 1].time > lastKeyTime) lastKeyTime = keys[keys.length - 1].time;
    }
    var targetFirstTime = layer.inPoint;
    var targetLastTime = layer.outPoint - frameDuration;
    if (hasRovingKey || lastKeyTime <= firstKeyTime || targetLastTime <= targetFirstTime) {
        return { skipped: true };
    }
    var changedSnapshots = [];
    try {
        for (i = 0; i < snapshots.length; i++) {
            changedSnapshots.push(snapshots[i]);
            sceneReplacePropertyKeys(
                snapshots[i].property,
                snapshots[i].keys,
                targetFirstTime,
                targetLastTime,
                firstKeyTime,
                lastKeyTime,
                true
            );
        }
    } catch (error) {
        for (i = changedSnapshots.length - 1; i >= 0; i--) {
            try {
                sceneReplacePropertyKeys(
                    changedSnapshots[i].property,
                    changedSnapshots[i].keys,
                    0,
                    0,
                    0,
                    0,
                    false
                );
            } catch (restoreError) {
            }
        }
        return { failed: error.toString() };
    }
    return { adjusted: true };
}

function sceneApplyPresetAndFitToLayers(comp, targetLayers, presetFile) {
    var stats = {
        appliedPresetCount: 0,
        failedPresetCount: 0,
        fittedKeyframeCount: 0,
        skippedKeyframeCount: 0,
        firstPresetError: "",
        firstFitError: ""
    };
    var previouslySelected = comp.selectedLayers || [];
    var i;
    for (i = 0; i < previouslySelected.length; i++) previouslySelected[i].selected = false;
    try {
        for (i = 0; i < targetLayers.length; i++) {
            var targetLayer = targetLayers[i];
            try {
                targetLayer.selected = true;
                targetLayer.applyPreset(presetFile);
                stats.appliedPresetCount++;
                var fitResult = sceneFitKeyframesToLayer(targetLayer, comp.frameDuration);
                if (fitResult.adjusted) stats.fittedKeyframeCount++;
                else {
                    stats.skippedKeyframeCount++;
                    if (fitResult.failed && !stats.firstFitError) stats.firstFitError = fitResult.failed;
                }
            } catch (presetError) {
                stats.failedPresetCount++;
                if (!stats.firstPresetError) stats.firstPresetError = presetError.toString();
            } finally {
                try { targetLayer.selected = false; } catch (targetRestoreError) {}
            }
        }
    } finally {
        for (i = 0; i < previouslySelected.length; i++) try { previouslySelected[i].selected = true; } catch (selectionRestoreError) {}
    }
    return stats;
}

function sceneCollapseLayerProperties(comp, targetLayer) {
    if (!targetLayer) return;
    var previouslySelected = [];
    var i;
    for (i = 1; i <= comp.numLayers; i++) {
        previouslySelected.push({ layer: comp.layer(i), selected: comp.layer(i).selected });
        comp.layer(i).selected = false;
    }
    try {
        targetLayer.selected = true;
        // Two passes of Reveal Modified Properties leave the selected layer collapsed.
        app.executeCommand(2771);
        app.executeCommand(2771);
    } finally {
        for (i = 0; i < previouslySelected.length; i++) {
            try {
                previouslySelected[i].layer.selected = previouslySelected[i].selected;
            } catch (selectionRestoreError) {
            }
        }
    }
}

function sceneCollapseLayerPropertiesBatch(comp, targetLayers) {
    if (!targetLayers || !targetLayers.length) return;
    var previouslySelected = comp.selectedLayers || [];
    var i;
    for (i = 0; i < previouslySelected.length; i++) previouslySelected[i].selected = false;
    try {
        for (i = 0; i < targetLayers.length; i++) targetLayers[i].selected = true;
        app.executeCommand(2771);
        app.executeCommand(2771);
    } finally {
        for (i = 0; i < targetLayers.length; i++) try { targetLayers[i].selected = false; } catch (targetRestoreError) {}
        for (i = 0; i < previouslySelected.length; i++) try { previouslySelected[i].selected = true; } catch (selectionRestoreError) {}
    }
}

function sceneRandomMarkerSlotKeyFromComment(comment) {
    var prefix = "SceneKeeperRandomSlot:";
    var value = String(comment || "");
    if (value.indexOf(prefix) !== 0) return "";
    var key = value.substring(prefix.length);
    var metadataSeparator = key.indexOf("|");
    return metadataSeparator >= 0 ? key.substring(0, metadataSeparator) : key;
}

function sceneArrangeRandomMarkerLayersChronologically(comp, slots) {
    if (!comp || !slots || !slots.length) return;
    var i;
    for (i = 0; i < slots.length; i++) {
        var targetComment = "SceneKeeperRandomSlot:" + String(slots[i].key || "");
        var targetLayer = null;
        var layerIndex;
        for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
            var candidateLayer = comp.layer(layerIndex);
            if (sceneRandomMarkerSlotKeyFromComment(candidateLayer.comment) === String(slots[i].key || "")) {
                targetLayer = candidateLayer;
                break;
            }
        }
        if (targetLayer) {
            try { targetLayer.moveToBeginning(); } catch (moveError) {}
        }
    }
}

function isLikelyBeatMarkerName(name) {
    var trimmedName = String(name || "").replace(/^\s+|\s+$/g, "");
    return /^\d+(?:\.\d+)?$/.test(trimmedName) || /beat/i.test(trimmedName);
}

function sceneGetRandomMarkerSource(comp) {
    var selectedLayers = comp && comp.selectedLayers ? comp.selectedLayers : [];
    if (selectedLayers.length > 1) {
        return { error: "Select one layer to use its markers, or deselect all layers to use composition markers." };
    }
    if (selectedLayers.length === 1) {
        var markerProperty = null;
        try { markerProperty = selectedLayers[0].property("ADBE Marker"); } catch (markerMatchNameError) {}
        if (!markerProperty) {
            try { markerProperty = selectedLayers[0].property("Marker"); } catch (markerDisplayNameError) {}
        }
        if (!markerProperty) {
            return { error: "Could not read markers from the selected layer. Deselect it to use composition markers." };
        }
        return { property: markerProperty, type: "layer", name: selectedLayers[0].name };
    }
    return { property: comp ? comp.markerProperty : null, type: "composition", name: comp ? comp.name : "composition" };
}

function getRandomMarkerSkipSuggestions() {
    var comp = getActiveComp();
    if (!comp) {
        return "MARKER_SKIP_SUGGESTIONS|";
    }
    var markerSource = sceneGetRandomMarkerSource(comp);
    if (markerSource.error || !markerSource.property || markerSource.property.numKeys < 3) {
        return "MARKER_SKIP_SUGGESTIONS|";
    }
    var markerProperty = markerSource.property;
    var markers = [];
    var i;
    for (i = 1; i <= markerProperty.numKeys; i++) {
        var markerName = "";
        try {
            markerName = markerProperty.keyValue(i).comment || "";
        } catch (e) {
            markerName = "";
        }
        markers.push({ time: markerProperty.keyTime(i), name: String(markerName) });
    }
    markers.sort(function (first, second) { return first.time - second.time; });
    var closeThreshold = Math.max((comp.frameDuration || (1 / comp.frameRate)) * 4, 0.18);
    var suggestions = [];
    var seen = {};
    for (i = 0; i < markers.length - 1; i++) {
        var firstMarker = markers[i];
        var marker = markers[i + 1];
        if (marker.time - firstMarker.time > closeThreshold || !marker.name || !isLikelyBeatMarkerName(marker.name)) {
            continue;
        }
        var key = marker.name.toLocaleLowerCase ? marker.name.toLocaleLowerCase() : marker.name.toLowerCase();
        if (!seen["$" + key]) {
            seen["$" + key] = true;
            suggestions.push(encodeURIComponent(marker.name));
        }
    }
    return "MARKER_SKIP_SUGGESTIONS|" + suggestions.join("|");
}

function getRandomMarkerNames() {
    var comp = getActiveComp();
    if (!comp) return "MARKER_NAMES|%5B%5D";
    var markerSource = sceneGetRandomMarkerSource(comp);
    if (markerSource.error || !markerSource.property) return "MARKER_NAMES|%5B%5D";
    var markerProperty = markerSource.property;
    var names = [];
    var seen = {};
    for (var i = 1; i <= markerProperty.numKeys; i++) {
        var name = "";
        try { name = String(markerProperty.keyValue(i).comment || "").replace(/^\s+|\s+$/g, ""); } catch (e) {}
        if (!name) continue;
        var key = "$" + name.toLowerCase();
        if (seen[key]) continue;
        seen[key] = true;
        names.push(name);
    }
    return "MARKER_NAMES|" + encodeURIComponent(JSON.stringify(names));
}

function sceneRandomMarkerLabel(markerProperty, markerTime, frameDuration) {
    for (var i = 1; i <= markerProperty.numKeys; i++) {
        if (Math.abs(markerProperty.keyTime(i) - markerTime) <= frameDuration / 2) {
            var comment = "";
            try { comment = String(markerProperty.keyValue(i).comment || "").replace(/^\s+|\s+$/g, ""); } catch (e) {}
            return comment || ("Marker " + i);
        }
    }
    return "Marker";
}

function sceneParseRandomFolderSelection(folderId) {
    var selection = { custom: false, include: {}, exclude: {}, folders: {} };
    if (folderId.charAt(0) !== "[" && folderId.charAt(0) !== "{") return selection;
    var parsed;
    try { parsed = JSON.parse(folderId); }
    catch (e) {
        try { parsed = JSON.parse(decodeURIComponent(folderId)); }
        catch (decodeError) { throw new Error("The selected source-folder list is invalid. Close the folder picker, select the folders again, and retry."); }
    }
    var included = parsed instanceof Array ? parsed : (parsed.include || []);
    var excluded = parsed instanceof Array ? [] : (parsed.exclude || []);
    if (!(included instanceof Array) || !(excluded instanceof Array) || !included.length) {
        throw new Error("Choose at least one source folder.");
    }
    selection.custom = true;
    for (var i = 0; i < included.length; i++) selection.include["$" + String(included[i])] = true;
    for (i = 0; i < excluded.length; i++) selection.exclude["$" + String(excluded[i])] = true;
    var folders = readClipFolderRecords();
    for (i = 0; i < folders.length; i++) selection.folders["$" + String(folders[i].id)] = folders[i];
    return selection;
}

function sceneReadRandomMarkerFolderSelection(encodedFolderSelection) {
    var folderSelectionText = decodeURIComponent(encodedFolderSelection || "");
    if (folderSelectionText.indexOf("FILE:") !== 0) return folderSelectionText;

    var selectionFile = new File(folderSelectionText.substring(5));
    if (!selectionFile.exists) throw new Error("The temporary source-folder selection is missing. Reopen the dialog and try again.");
    selectionFile.encoding = "UTF-8";
    if (!selectionFile.open("r")) throw new Error("The temporary source-folder selection could not be opened.");
    try {
        folderSelectionText = String(selectionFile.read() || "").replace(/^\uFEFF/, "").replace(/^\s+|\s+$/g, "");
    } finally {
        selectionFile.close();
    }
    try { selectionFile.remove(); } catch (removeSelectionFileError) {}
    return folderSelectionText;
}

function sceneRandomFolderIsIncluded(folderId, selection) {
    var currentId = String(folderId || "");
    var visited = {};
    while (currentId && !visited["$" + currentId]) {
        var key = "$" + currentId;
        if (selection.exclude[key]) return false;
        if (selection.include[key]) return true;
        visited[key] = true;
        var folder = selection.folders[key];
        if (!folder) break;
        currentId = String(folder.parentId || "");
    }
    return false;
}

function insertRandomClipsBetweenMarkers(encodedFolderId, createPrecomps, encodedSkipMarkerNames, encodedPresetPath) {
    var comp = getActiveComp();
    if (!comp) {
        return "ERROR: Select an active composition first.";
    }
    var markerSource = sceneGetRandomMarkerSource(comp);
    if (markerSource.error) return "ERROR: " + markerSource.error;
    var markerProperty = markerSource.property;
    if (!markerProperty || markerProperty.numKeys < 2) {
        return "ERROR: Add at least two markers to the " + markerSource.type + " to define an interval.";
    }
    var folderId;
    try { folderId = sceneReadRandomMarkerFolderSelection(encodedFolderId); }
    catch (folderReadError) { return "ERROR: " + folderReadError.toString().replace(/^Error: ?/, ""); }
    var folderSelection;
    try { folderSelection = sceneParseRandomFolderSelection(folderId); }
    catch (selectionError) { return "ERROR: " + selectionError.toString().replace(/^Error: ?/, ""); }
    var isCustomFolderSelection = folderSelection.custom;
    var skipNameParts = decodeURIComponent(encodedSkipMarkerNames || "").split(/[,;\r\n]+/);
    var skipNameLookup = {};
    var skipNameIndex;
    for (skipNameIndex = 0; skipNameIndex < skipNameParts.length; skipNameIndex++) {
        var skipName = skipNameParts[skipNameIndex].replace(/^\s+|\s+$/g, "");
        if (!skipName) {
            continue;
        }
        var normalizedSkipName = skipName.toLowerCase();
        skipNameLookup["$" + normalizedSkipName] = true;
    }
    var allFolders = folderId === "*";
    var records = readClipFavoriteRecords();
    var candidates = [];
    var i;
    for (i = 0; i < records.length; i++) {
        if (!allFolders && !isCustomFolderSelection && (records[i].folderId || "") !== folderId) {
            continue;
        }
        if (isCustomFolderSelection && !sceneRandomFolderIsIncluded(records[i].folderId, folderSelection)) {
            continue;
        }
        var recordDuration = records[i].sourceOut - records[i].sourceIn;
        if (isNaN(recordDuration) || recordDuration <= 0) {
            continue;
        }
        var sourceFile = new File(records[i].sourcePath);
        if (!sourceFile.exists) {
            continue;
        }
        candidates.push({ record: records[i], duration: recordDuration });
    }
    if (!candidates.length) {
        return "ERROR: No available saved clips were found in the selected folders. Add clips or choose another source.";
    }
    var presetPath = decodeURIComponent(encodedPresetPath || "");
    var twixtorPresetFile = null;
    if (presetPath && (createPrecomps === true || createPrecomps === "true")) {
        twixtorPresetFile = new File(presetPath);
        if (!twixtorPresetFile.exists || !/\.ffx$/i.test(twixtorPresetFile.name)) {
            return "ERROR: The selected Twixtor preset is missing or is not an .ffx file. Choose it again.";
        }
    }

    var markerTimes = [];
    for (i = 1; i <= markerProperty.numKeys; i++) {
        var markerComment = "";
        try {
            markerComment = markerProperty.keyValue(i).comment || "";
        } catch (e) {
            markerComment = "";
        }
        if (skipNameLookup["$" + String(markerComment).replace(/^\s+|\s+$/g, "").toLowerCase()]) {
            continue;
        }
        markerTimes.push(markerProperty.keyTime(i));
    }
    markerTimes.sort(function (first, second) { return first - second; });
    if (markerTimes.length < 2) {
        return "ERROR: At least two " + markerSource.type + " markers must remain after skipping the selected names.";
    }

    var placements = [];
    var usedClipLookup = {};
    var skipped = 0;
    var skippedForReuse = 0;
    var frameDuration = comp.frameDuration || (1 / comp.frameRate);
    var intervals = [];
    for (i = 0; i < markerTimes.length - 1; i++) {
        var intervalStart = markerTimes[i];
        var intervalDuration = markerTimes[i + 1] - intervalStart;
        if (intervalDuration <= frameDuration / 2) {
            skipped++;
            continue;
        }
        intervals.push({ time: intervalStart, duration: intervalDuration, order: i });
    }
    // Fill the longest gaps first so a short interval cannot randomly consume
    // a long clip that is the only fit for a later interval.
    intervals.sort(function (first, second) {
        if (first.duration !== second.duration) return second.duration - first.duration;
        return first.order - second.order;
    });
    for (i = 0; i < intervals.length; i++) {
        var currentInterval = intervals[i];
        var hasDurationMatch = false;
        var eligibleCount = 0;
        var chosen = null;
        var j;
        for (j = 0; j < candidates.length; j++) {
            if (candidates[j].duration + FOOTAGE_END_TOLERANCE < currentInterval.duration) {
                continue;
            }
            hasDurationMatch = true;
            var candidateKey = "$" + String(candidates[j].record.clipId);
            if (usedClipLookup[candidateKey]) continue;
            eligibleCount++;
            if (Math.floor(Math.random() * eligibleCount) === 0) chosen = candidates[j];
        }
        if (!eligibleCount) {
            skipped++;
            if (hasDurationMatch) {
                skippedForReuse++;
            }
            continue;
        }
        placements.push({ record: chosen.record, time: currentInterval.time, duration: currentInterval.duration });
        usedClipLookup["$" + String(chosen.record.clipId)] = true;
    }
    placements.sort(function (first, second) { return first.time - second.time; });
    if (!placements.length) {
        return "ERROR: No selected clip was long enough to fit a marker interval. Choose folders with longer clips or reduce the interval lengths.";
    }

    var insertedClipIds = [];
    var failedClipCount = 0;
    var firstClipError = "";
    var createdPrecompCount = 0;
    var failedPrecompCount = 0;
    var firstPrecompError = "";
    var appliedPresetCount = 0;
    var failedPresetCount = 0;
    var fittedPresetKeyframeCount = 0;
    var skippedPresetKeyframeCount = 0;
    var firstPresetError = "";
    var firstKeyframeFitError = "";
    var replaceSlots = [];
    var layersToCollapse = [];
    var precompLayersForPreset = [];
    app.beginUndoGroup("SceneKeeper - Random Clips Between Markers");
    try {
        for (i = 0; i < placements.length; i++) {
            var placement = placements[i];
            var insertOptions = {
                time: placement.time,
                duration: placement.duration,
                joinUndoGroup: false
            };
            var result = insertClipFavoriteRecord(comp, placement.record, insertOptions);
            if (result.indexOf("Inserted clip:") === 0) {
                insertedClipIds.push(encodeURIComponent(placement.record.clipId));
                if (createPrecomps === true || createPrecomps === "true") {
                    try {
                        var insertedLayer = insertOptions.insertedLayer;
                        var layerName = insertedLayer.name;
                        var insertedLayerIndex = insertedLayer.index;
                        var precomp = comp.layers.precompose(
                            [insertedLayer.index],
                            layerName + " Precomp",
                            true
                        );
                        var precompLayer = null;
                        try {
                            var layerAtOriginalIndex = comp.layer(insertedLayerIndex);
                            if (layerAtOriginalIndex.source === precomp) precompLayer = layerAtOriginalIndex;
                        } catch (precompLayerLookupError) {
                        }
                        if (!precompLayer) {
                            var parentLayerIndex;
                            for (parentLayerIndex = 1; parentLayerIndex <= comp.numLayers; parentLayerIndex++) {
                                var parentCandidate = comp.layer(parentLayerIndex);
                                if (parentCandidate.source === precomp) {
                                    precompLayer = parentCandidate;
                                    break;
                                }
                            }
                        }
                        if (!precompLayer) {
                            throw new Error("Could not find the precomp layer in the composition.");
                        }
                        var innerLayer = precomp.layer(1);
                        innerLayer.startTime -= placement.time;
                        innerLayer.inPoint = 0;
                        innerLayer.outPoint = placement.duration;
                        precomp.duration = placement.duration;

                        precompLayer.startTime = placement.time;
                        precompLayer.inPoint = placement.time;
                        precompLayer.outPoint = placement.time + placement.duration;
                        createdPrecompCount++;
                        if (twixtorPresetFile) precompLayersForPreset.push(precompLayer);
                    } catch (precompError) {
                        failedPrecompCount++;
                        if (!firstPrecompError) {
                            firstPrecompError = "After Effects could not create a precomp for one clip.";
                        }
                    }
                    if (precompLayer) {
                        try {
                            precompLayer.audioEnabled = false;
                        } catch (muteError) {
                        }
                    }
                }
                var replaceTargetLayer = precompLayer || insertOptions.insertedLayer;
                if (replaceTargetLayer) {
                    layersToCollapse.push(replaceTargetLayer);
                    var slotKey = String(new Date().getTime()) + "_" + String(i) + "_" + String(Math.floor(Math.random() * 1000000000));
                    replaceTargetLayer.comment = "SceneKeeperRandomSlot:" + slotKey + "|clipId=" + encodeURIComponent(placement.record.clipId);
                    var markerLabel = sceneRandomMarkerLabel(markerProperty, placement.time, frameDuration) + " → " + sceneRandomMarkerLabel(markerProperty, placement.time + placement.duration, frameDuration);
                    replaceSlots.push({ key: slotKey, name: placement.record.displayName, clipId: placement.record.clipId, markerLabel: markerLabel, precomp: Boolean(replaceTargetLayer.source instanceof CompItem), time: placement.time, duration: placement.duration });
                }
            } else {
                skipped++;
                failedClipCount++;
                if (!firstClipError) {
                    var insertError = String(result || "");
                    if (insertError.indexOf("Footage file not found:") >= 0) firstClipError = "A saved clip's source file is missing.";
                    else if (insertError.indexOf("Could not import footage:") >= 0) firstClipError = "A saved clip's source file could not be imported.";
                    else if (insertError.indexOf("source range no longer matches") >= 0) firstClipError = "A saved clip's trim no longer fits its source file.";
                    else if (insertError.indexOf("too short for this marker interval") >= 0) firstClipError = "A clip is too short for its marker interval.";
                    else firstClipError = "After Effects could not add a clip to the composition.";
                }
            }
        }
        if (twixtorPresetFile && precompLayersForPreset.length) {
            var presetStats = sceneApplyPresetAndFitToLayers(comp, precompLayersForPreset, twixtorPresetFile);
            appliedPresetCount = presetStats.appliedPresetCount;
            failedPresetCount = presetStats.failedPresetCount;
            fittedPresetKeyframeCount = presetStats.fittedKeyframeCount;
            skippedPresetKeyframeCount = presetStats.skippedKeyframeCount;
            firstPresetError = presetStats.firstPresetError;
            firstKeyframeFitError = presetStats.firstFitError;
        }
        sceneCollapseLayerPropertiesBatch(comp, layersToCollapse);
        // Slots are recorded chronologically. Moving each to the top in order
        // leaves later markers above earlier ones in the timeline.
        sceneArrangeRandomMarkerLayersChronologically(comp, replaceSlots);
    } catch (e) {
        app.endUndoGroup();
        return "ERROR: Could not insert clips between markers: " + e.toString();
    }
    app.endUndoGroup();
    if (!insertedClipIds.length) {
        return "ERROR: No clips were created. " + (firstClipError || "Check that the selected clips are available and fit the marker intervals.");
    }
    return "MARKER_RANDOM_DONE|" + insertedClipIds.length + "|" + insertedClipIds.join(",") + "|" + skipped + "|" + createdPrecompCount + "|" + failedPrecompCount + "|" + encodeURIComponent(firstPrecompError) + "|" + skippedForReuse + "|" + appliedPresetCount + "|" + failedPresetCount + "|" + fittedPresetKeyframeCount + "|" + skippedPresetKeyframeCount + "|" + encodeURIComponent(firstPresetError) + "|" + encodeURIComponent(firstKeyframeFitError) + "|" + encodeURIComponent(JSON.stringify(replaceSlots)) + "|" + failedClipCount + "|" + encodeURIComponent(firstClipError);
}

function sceneFindFirstRandomReplacementFootageLayer(compItem, visited) {
    if (!compItem || visited["$" + String(compItem.id)]) return null;
    visited["$" + String(compItem.id)] = true;
    for (var i = 1; i <= compItem.numLayers; i++) {
        var layer = compItem.layer(i);
        try {
            if (layer.source instanceof FootageItem && layer.source.mainSource instanceof FileSource) {
                return { comp: compItem, layer: layer };
            }
        } catch (footageCheckError) {}
    }
    for (i = 1; i <= compItem.numLayers; i++) {
        var nestedLayer = compItem.layer(i);
        if (nestedLayer.source instanceof CompItem) {
            var nestedResult = sceneFindFirstRandomReplacementFootageLayer(nestedLayer.source, visited);
            if (nestedResult) return nestedResult;
        }
    }
    return null;
}

function sceneLayerContainsReplaceableClip(layer, visited) {
    if (!layer || !layer.source) return false;
    try {
        if (layer.source instanceof FootageItem && layer.source.mainSource instanceof FileSource) return true;
    } catch (footageError) {}
    if (layer.source instanceof CompItem) {
        return Boolean(sceneFindFirstRandomReplacementFootageLayer(layer.source, visited || {}));
    }
    return false;
}

function sceneClearPropertyKeyframes(property) {
    if (!property) return;
    for (var keyIndex = property.numKeys; keyIndex >= 1; keyIndex--) property.removeKey(keyIndex);
}

function sceneApplySavedReplacementProperties(layer, record, comp) {
    var transform = layer.property("ADBE Transform Group");
    if (!transform) return;
    var positionX = record.positionX === null || isNaN(record.positionX) ? comp.width / 2 : record.positionX;
    var positionY = record.positionY === null || isNaN(record.positionY) ? comp.height / 2 : record.positionY;
    var scaleX = record.scaleX === null || isNaN(record.scaleX) ? 100 : record.scaleX;
    var scaleY = record.scaleY === null || isNaN(record.scaleY) ? 100 : record.scaleY;
    var position = transform.property("ADBE Position");
    if (position) {
        if (position.dimensionsSeparated) {
            var xPosition = position.getSeparationFollower(0);
            var yPosition = position.getSeparationFollower(1);
            var zPosition = layer.threeDLayer ? position.getSeparationFollower(2) : null;
            sceneClearPropertyKeyframes(xPosition);
            sceneClearPropertyKeyframes(yPosition);
            sceneClearPropertyKeyframes(zPosition);
            xPosition.setValue(positionX);
            yPosition.setValue(positionY);
            if (zPosition) zPosition.setValue(0);
        } else {
            sceneClearPropertyKeyframes(position);
            position.setValue(layer.threeDLayer ? [positionX, positionY, 0] : [positionX, positionY]);
        }
    }
    var scale = transform.property("ADBE Scale");
    if (scale) {
        sceneClearPropertyKeyframes(scale);
        scale.setValue(layer.threeDLayer ? [scaleX, scaleY, 100] : [scaleX, scaleY]);
    }
    if (getClipMutedInsert() === "ON") layer.audioEnabled = false;
    else if (record.audioEnabled !== null && record.audioEnabled !== undefined) layer.audioEnabled = record.audioEnabled;
    else layer.audioEnabled = true;
    var blendingMode = getClipFrameBlendingMode();
    if (blendingMode === "PIXEL_MOTION") {
        comp.frameBlending = true;
        layer.frameBlendingType = FrameBlendingType.PIXEL_MOTION;
    } else if (blendingMode === "FRAME_MIX") {
        comp.frameBlending = true;
        layer.frameBlendingType = FrameBlendingType.FRAME_MIX;
    } else {
        layer.frameBlendingType = FrameBlendingType.NO_FRAME_BLEND;
    }
}

function sceneClipFolderPath(folderId, folders) {
    var parts = [];
    var currentId = String(folderId || "");
    var visited = {};
    while (currentId && !visited["$" + currentId]) {
        visited["$" + currentId] = true;
        var found = null;
        for (var i = 0; i < folders.length; i++) {
            if (String(folders[i].id) === currentId) {
                found = folders[i];
                break;
            }
        }
        if (!found) break;
        parts.unshift(found.name);
        currentId = String(found.parentId || "");
    }
    return parts.join(" / ");
}

function sceneClipLayerName(record) {
    var folders = readClipFolderRecords();
    var folderPath = sceneClipFolderPath(record.folderId, folders);
    return folderPath ? record.displayName + " [" + folderPath + "]" : record.displayName;
}

function sceneClipFavoriteComment(record, slotKey) {
    if (slotKey) return "SceneKeeperRandomSlot:" + slotKey + "|clipId=" + encodeURIComponent(record.clipId || "");
    return "SceneKeeperClipFavorite:" + encodeURIComponent(record.clipId || "");
}

function sceneReplaceCycleIdsFromComment(comment) {
    var match = String(comment || "").match(/(?:^|\|)cycleIds=([^|]*)/);
    if (!match) return [];
    try {
        var ids = JSON.parse(decodeURIComponent(match[1]));
        return ids instanceof Array ? ids : [];
    } catch (cycleDecodeError) { return []; }
}

function sceneClipIdFromComment(comment) {
    var value = String(comment || "");
    var markerMatch = value.match(/(?:^|\|)clipId=([^|]*)/);
    if (markerMatch) {
        try { return decodeURIComponent(markerMatch[1]); } catch (markerDecodeError) { return markerMatch[1]; }
    }
    var favoritePrefix = "SceneKeeperClipFavorite:";
    if (value.indexOf(favoritePrefix) === 0) {
        var encodedId = value.substring(favoritePrefix.length).split("|")[0];
        try { return decodeURIComponent(encodedId); } catch (favoriteDecodeError) { return encodedId; }
    }
    return "";
}

function sceneClipRecordForLayer(layer, records) {
    var clipId = sceneClipIdFromComment(layer.comment);
    var footageLayer = layer;
    if (!clipId && layer.source instanceof CompItem) {
        var nestedTarget = sceneFindFirstRandomReplacementFootageLayer(layer.source, {});
        if (nestedTarget) {
            footageLayer = nestedTarget.layer;
            clipId = sceneClipIdFromComment(footageLayer.comment);
        }
    }
    if (clipId) {
        for (var i = 0; i < records.length; i++) {
            if (String(records[i].clipId || "") === clipId) return records[i];
        }
    }
    var sourcePath = "";
    try { sourcePath = footageLayer.source.mainSource.file.fsName.toLowerCase(); } catch (sourcePathError) { return null; }
    var sourceIn = Number(footageLayer.inPoint) - Number(footageLayer.startTime);
    var sourceOut = Number(footageLayer.outPoint) - Number(footageLayer.startTime);
    var exactMatches = [];
    for (i = 0; i < records.length; i++) {
        if (String(records[i].sourcePath || "").toLowerCase() === sourcePath &&
            Math.abs(Number(records[i].sourceIn) - sourceIn) <= CLIP_TIMESTAMP_MATCH_TOLERANCE &&
            Math.abs(Number(records[i].sourceOut) - sourceOut) <= CLIP_TIMESTAMP_MATCH_TOLERANCE) {
            exactMatches.push(records[i]);
        }
    }
    if (exactMatches.length === 1) return exactMatches[0];
    var layerName = String(layer.name || "").replace(/ Precomp$/, "");
    var folderLabelStart = layerName.lastIndexOf(" [");
    if (folderLabelStart < 0 || layerName.charAt(layerName.length - 1) !== "]") return null;
    var namedClipName = layerName.substring(0, folderLabelStart);
    var namedFolderPath = layerName.substring(folderLabelStart + 2, layerName.length - 1);
    var folders = readClipFolderRecords();
    for (i = 0; i < exactMatches.length; i++) {
        if (exactMatches[i].displayName === namedClipName &&
            sceneClipFolderPath(exactMatches[i].folderId, folders) === namedFolderPath) return exactMatches[i];
    }
    if (exactMatches.length) return null;
    for (i = 0; i < records.length; i++) {
        if (records[i].displayName === namedClipName &&
            sceneClipFolderPath(records[i].folderId, folders) === namedFolderPath) return records[i];
    }
    return null;
}

function sceneClipRecordsShareSourceRange(first, second) {
    if (!first || !second) return false;
    if (String(first.sourcePath || "").toLowerCase() !== String(second.sourcePath || "").toLowerCase()) return false;
    return Math.abs(Number(first.sourceIn) - Number(second.sourceIn)) <= CLIP_TIMESTAMP_MATCH_TOLERANCE &&
        Math.abs(Number(first.sourceOut) - Number(second.sourceOut)) <= CLIP_TIMESTAMP_MATCH_TOLERANCE;
}

function sceneCollectClipFavoriteIdsFromComp(compItem, records, idLookup, variantRecords, visited) {
    if (!compItem || !idLookup || !visited) return;
    var compKey = "$" + String(compItem.id);
    if (visited[compKey]) return;
    visited[compKey] = true;
    for (var i = 1; i <= compItem.numLayers; i++) {
        var layer = compItem.layer(i);
        if (layer.source instanceof CompItem) {
            sceneCollectClipFavoriteIdsFromComp(layer.source, records, idLookup, variantRecords, visited);
        } else if (layer.source instanceof FootageItem) {
            var record = sceneClipRecordForLayer(layer, records);
            if (record) {
                if (record.clipId) idLookup["$" + String(record.clipId)] = true;
                if (variantRecords) variantRecords.push(record);
            }
        }
    }
}

function quickReplaceSelectedClip(encodedSlotKeys, encodedManualClipId, encodedFolderSelection, encodedAllowedClipIds, encodedProtectedSlotKeys) {
    var comp = getActiveComp();
    if (!comp) return "ERROR: Select a composition containing clips to Quick Replace.";
    var selectedLayers = [];
    if (encodedSlotKeys) {
        var requestedKeys;
        try { requestedKeys = JSON.parse(decodeURIComponent(encodedSlotKeys)); }
        catch (slotKeyError) { return "ERROR: The selected replacement rows could not be read."; }
        if (!(requestedKeys instanceof Array) || !requestedKeys.length) return "ERROR: Select at least one clip to replace.";
        var requestedKeyLookup = {};
        for (var requestedIndex = 0; requestedIndex < requestedKeys.length; requestedIndex++) requestedKeyLookup["$" + String(requestedKeys[requestedIndex])] = true;
        for (var compLayerIndex = 1; compLayerIndex <= comp.numLayers; compLayerIndex++) {
            var compLayer = comp.layer(compLayerIndex);
            var compLayerKey = sceneRandomMarkerSlotKeyFromComment(compLayer.comment);
            if (compLayerKey && requestedKeyLookup["$" + compLayerKey]) selectedLayers.push(compLayer);
        }
        if (selectedLayers.length !== requestedKeys.length) return "ERROR: One or more selected clips are no longer in the active composition.";
    } else {
        selectedLayers = comp.selectedLayers || [];
    }
    if (!selectedLayers.length) return "ERROR: Select one or more inserted clip or precomp layers first.";
    var protectedLayers = selectedLayers.slice(0);
    if (encodedProtectedSlotKeys) {
        var protectedSlotKeys;
        try { protectedSlotKeys = JSON.parse(decodeURIComponent(encodedProtectedSlotKeys)); }
        catch (protectedSlotError) { return "ERROR: The full Replace menu selection could not be read."; }
        if (!(protectedSlotKeys instanceof Array)) return "ERROR: The full Replace menu selection could not be read.";
        var protectedSlotLookup = {};
        for (var protectedKeyIndex = 0; protectedKeyIndex < protectedSlotKeys.length; protectedKeyIndex++) {
            protectedSlotLookup["$" + String(protectedSlotKeys[protectedKeyIndex])] = true;
        }
        protectedLayers = [];
        var foundProtectedCount = 0;
        for (var protectedLayerIndex = 1; protectedLayerIndex <= comp.numLayers; protectedLayerIndex++) {
            var protectedLayer = comp.layer(protectedLayerIndex);
            var protectedLayerKey = sceneRandomMarkerSlotKeyFromComment(protectedLayer.comment);
            if (protectedLayerKey && protectedSlotLookup["$" + protectedLayerKey]) {
                protectedLayers.push(protectedLayer);
                foundProtectedCount++;
            }
        }
        if (foundProtectedCount !== protectedSlotKeys.length) return "ERROR: One or more clips in the full Replace menu are no longer in the active composition.";
    }
    var records = readClipFavoriteRecords();
    var manualClipId = "";
    if (encodedManualClipId) {
        try { manualClipId = decodeURIComponent(encodedManualClipId); }
        catch (manualClipIdError) { manualClipId = String(encodedManualClipId); }
        var manualRecordFound = false;
        for (var manualIndex = 0; manualIndex < records.length; manualIndex++) {
            if (String(records[manualIndex].clipId || "") === manualClipId) manualRecordFound = true;
        }
        if (!manualRecordFound) return "ERROR: The manually selected SceneKeeper clip is no longer available.";
    }
    var selectedFolderSelection = "";
    var selectedFolderSummary = "";
    var selectedSourceClipIds = null;
    if (encodedAllowedClipIds) {
        try { selectedSourceClipIds = JSON.parse(decodeURIComponent(encodedAllowedClipIds)); }
        catch (allowedClipIdsError) { return "ERROR: The clips in the chosen source folders could not be read."; }
        if (!(selectedSourceClipIds instanceof Array)) return "ERROR: The clips in the chosen source folders could not be read.";
    }
    if (encodedFolderSelection) {
        try { selectedFolderSelection = decodeURIComponent(encodedFolderSelection); }
        catch (folderSelectionError) { return "ERROR: The chosen source folders could not be read."; }
        try {
            sceneParseRandomFolderSelection(selectedFolderSelection);
            var selectedFolderData = JSON.parse(selectedFolderSelection);
            var selectedFolderIds = selectedFolderData instanceof Array ? selectedFolderData : (selectedFolderData.include || []);
            var selectedFolderRecords = readClipFolderRecords();
            var selectedFolderNames = [];
            for (var selectedFolderIndex = 0; selectedFolderIndex < selectedFolderIds.length; selectedFolderIndex++) {
                var selectedFolderName = String(selectedFolderIds[selectedFolderIndex]);
                for (var selectedFolderRecordIndex = 0; selectedFolderRecordIndex < selectedFolderRecords.length; selectedFolderRecordIndex++) {
                    if (String(selectedFolderRecords[selectedFolderRecordIndex].id) === selectedFolderName) {
                        selectedFolderName = String(selectedFolderRecords[selectedFolderRecordIndex].name || selectedFolderName);
                        break;
                    }
                }
                selectedFolderNames.push(selectedFolderName);
            }
            selectedFolderSummary = selectedFolderNames.join(", ");
        }
        catch (folderValidationError) { return "ERROR: " + folderValidationError.toString().replace(/^Error: ?/, ""); }
    }
    var targets = [];
    for (var i = 0; i < selectedLayers.length; i++) targets.push(selectedLayers[i]);
    var originalSelection = targets.slice(0);
    var excludedClipLookup = {};
    var excludedClipVariants = [];
    var visitedComps = {};
    for (i = 0; i < protectedLayers.length; i++) {
        var selectedRecord = sceneClipRecordForLayer(protectedLayers[i], records);
        if (selectedRecord) {
            if (selectedRecord.clipId) excludedClipLookup["$" + String(selectedRecord.clipId)] = true;
            excludedClipVariants.push(selectedRecord);
        }
        if (protectedLayers[i].source instanceof CompItem) {
            sceneCollectClipFavoriteIdsFromComp(protectedLayers[i].source, records, excludedClipLookup, excludedClipVariants, visitedComps);
        }
    }
    var replacedIds = [];
    var replacedSlots = [];
    var replacementLayers = [];
    var failures = [];
    for (i = 0; i < targets.length; i++) {
        for (var clearIndex = 0; clearIndex < comp.numLayers; clearIndex++) comp.layer(clearIndex + 1).selected = false;
        targets[i].selected = true;
        var currentRecord = sceneClipRecordForLayer(targets[i], records);
        if (!currentRecord) {
            failures.push(targets[i].name + ": Could not identify its saved clip and source folder. Reinsert it from SceneKeeper first.");
            continue;
        }
        if (!manualClipId && !currentRecord.folderId) {
            failures.push(targets[i].name + ": The saved clip is not in a collection folder.");
            continue;
        }
        var folderSelection = selectedFolderSelection
            ? encodeURIComponent(selectedFolderSelection)
            : manualClipId
            ? encodeURIComponent("*")
            : encodeURIComponent(JSON.stringify({ include: [currentRecord.folderId], exclude: [] }));
        var excludedClipIds = [];
        for (var excludedKey in excludedClipLookup) {
            if (excludedClipLookup.hasOwnProperty(excludedKey)) excludedClipIds.push(excludedKey.substring(1));
        }
        var encodedExcludedVariants = encodeURIComponent(JSON.stringify(excludedClipVariants));
        var cycleIds = sceneReplaceCycleIdsFromComment(targets[i].comment);
        if (!(cycleIds instanceof Array)) cycleIds = [];
        if (currentRecord.clipId) {
            var currentClipAlreadyInCycle = false;
            for (var cycleIndex = 0; cycleIndex < cycleIds.length; cycleIndex++) {
                if (String(cycleIds[cycleIndex]) === String(currentRecord.clipId)) {
                    currentClipAlreadyInCycle = true;
                    break;
                }
            }
            if (!currentClipAlreadyInCycle) cycleIds.push(String(currentRecord.clipId));
        }
        var result = replaceSelectedClipFromFolders(
            folderSelection,
            currentRecord.clipId,
            encodeURIComponent(JSON.stringify(excludedClipIds)),
            manualClipId,
            manualClipId ? "" : encodeURIComponent(JSON.stringify(cycleIds)),
            selectedSourceClipIds ? encodeURIComponent(JSON.stringify(selectedSourceClipIds)) : "",
            encodedExcludedVariants);
        if (result.indexOf("SELECTED_CLIP_REPLACED|") === 0) {
            var fields = result.split("|");
            var replacementClipId = "";
            try { replacementClipId = decodeURIComponent(fields[4] || ""); }
            catch (replacementIdError) { replacementClipId = fields[4] || ""; }
            if (sceneLastReplacedLayer) {
                var updatedCycleIds = [];
                if (manualClipId) updatedCycleIds = cycleIds;
                else try { updatedCycleIds = JSON.parse(decodeURIComponent(fields[5] || "%5B%5D")); } catch (updatedCycleError) {}
                sceneLastReplacedLayer.comment = String(sceneLastReplacedLayer.comment || "") + "|cycleIds=" + encodeURIComponent(JSON.stringify(updatedCycleIds));
            }
            replacedIds.push(replacementClipId);
            var replacementRecord = null;
            for (var replacementIndex = 0; replacementIndex < records.length; replacementIndex++) {
                if (String(records[replacementIndex].clipId || "") === replacementClipId) {
                    replacementRecord = records[replacementIndex];
                    break;
                }
            }
            replacedSlots.push({
                key: sceneRandomMarkerSlotKeyFromComment(sceneLastReplacedLayer ? sceneLastReplacedLayer.comment : targets[i].comment),
                name: replacementRecord ? sceneClipLayerName(replacementRecord) : String(fields[1] || "Clip"),
                clipId: replacementClipId
            });
            if (replacementClipId) excludedClipLookup["$" + replacementClipId] = true;
            if (replacementRecord) excludedClipVariants.push(replacementRecord);
            if (sceneLastReplacedLayer) replacementLayers.push(sceneLastReplacedLayer);
        } else {
            failures.push(targets[i].name + ": " + String(result).replace(/^ERROR:\s*/, "") +
                (selectedFolderSummary ? " Source folders: " + selectedFolderSummary + "." : ""));
        }
    }
    for (var restoreIndex = 0; restoreIndex < comp.numLayers; restoreIndex++) comp.layer(restoreIndex + 1).selected = false;
    if (replacementLayers.length) {
        for (i = 0; i < replacementLayers.length; i++) {
            try { replacementLayers[i].selected = true; } catch (restoreSelectionError) {}
        }
    } else {
        for (i = 0; i < originalSelection.length; i++) {
            try { originalSelection[i].selected = true; } catch (restoreSelectionError) {}
        }
    }
    if (!replacedIds.length) return "ERROR: Quick Replace could not replace any selected clip. " + failures.join(" | ");
    return "QUICK_REPLACE_DONE|" + replacedIds.length + "|" + encodeURIComponent(JSON.stringify(replacedIds)) + "|" + encodeURIComponent(failures.join(" | ")) + "|" + encodeURIComponent(JSON.stringify(replacedSlots));
}

function prepareSelectedClipReplaceSlots() {
    var comp = getActiveComp();
    if (!comp) return "ERROR: Select a composition containing clips to replace.";
    var selectedLayers = comp.selectedLayers || [];
    if (!selectedLayers.length) return "ERROR: Select one or more inserted clip or precomp layers first.";
    var records = readClipFavoriteRecords();
    var prepared = [];
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        if (layer.locked) return "ERROR: Unlock " + layer.name + " before replacing it.";
        var record = sceneClipRecordForLayer(layer, records);
        if (!record) return "ERROR: Could not identify the saved clip and folder for " + layer.name + ". Reinsert it from SceneKeeper first.";
        var key = sceneRandomMarkerSlotKeyFromComment(layer.comment);
        if (!key) key = "selected_" + String(new Date().getTime()) + "_" + String(i) + "_" + String(Math.floor(Math.random() * 1000000000));
        prepared.push({
            layer: layer,
            record: record,
            key: key,
            slot: {
                key: key,
                name: sceneClipLayerName(record),
                clipId: record.clipId,
                precomp: layer.source instanceof CompItem,
                time: layer.inPoint,
                duration: layer.outPoint - layer.inPoint,
                markerLabel: "Layer " + String(i + 1)
            }
        });
    }
    app.beginUndoGroup("SceneKeeper - Prepare Selected Clip Replacement");
    for (i = 0; i < prepared.length; i++) {
        prepared[i].layer.comment = sceneClipFavoriteComment(prepared[i].record, prepared[i].key);
    }
    app.endUndoGroup();
    var slots = [];
    for (i = 0; i < prepared.length; i++) slots.push(prepared[i].slot);
    return "SELECTED_CLIP_REPLACE_SLOTS|" + encodeURIComponent(JSON.stringify(slots));
}

function replaceSelectedClipFromFolders(encodedFolderSelection, excludedClipId, encodedExcludedClipIds, forcedClipId, encodedCycleClipIds, encodedAllowedClipIds, encodedExcludedVariants) {
    var comp = getActiveComp();
    if (!comp) return "ERROR: Select the composition containing the clip to replace.";
    var selectedLayers = comp.selectedLayers || [];
    if (selectedLayers.length > 1) {
        var targets = [];
        for (var selectedIndex = 0; selectedIndex < selectedLayers.length; selectedIndex++) targets.push(selectedLayers[selectedIndex]);
        var originalSelection = targets.slice(0);
        var outcomes = [];
        var replacementLayers = [];
        for (selectedIndex = 0; selectedIndex < targets.length; selectedIndex++) {
            for (var clearIndex = 0; clearIndex < comp.numLayers; clearIndex++) comp.layer(clearIndex + 1).selected = false;
            targets[selectedIndex].selected = true;
            var outcome = replaceSelectedClipFromFolders(encodedFolderSelection, excludedClipId, encodedExcludedClipIds, forcedClipId, encodedCycleClipIds, encodedAllowedClipIds, encodedExcludedVariants);
            outcomes.push(outcome);
            if (outcome.indexOf("SELECTED_CLIP_REPLACED|") === 0 && sceneLastReplacedLayer) replacementLayers.push(sceneLastReplacedLayer);
        }
        for (clearIndex = 0; clearIndex < comp.numLayers; clearIndex++) comp.layer(clearIndex + 1).selected = false;
        if (replacementLayers.length) {
            for (selectedIndex = 0; selectedIndex < replacementLayers.length; selectedIndex++) {
                try { replacementLayers[selectedIndex].selected = true; } catch (replacementSelectionError) {}
            }
        } else {
            for (selectedIndex = 0; selectedIndex < originalSelection.length; selectedIndex++) {
                try { originalSelection[selectedIndex].selected = true; } catch (restoreSelectionError) {}
            }
        }
        return "SELECTED_CLIPS_REPLACED|" + encodeURIComponent(JSON.stringify(outcomes));
    }
    if (selectedLayers.length !== 1) return "ERROR: Select one or more clip or precomp layers in the After Effects timeline.";
    var targetLayer = selectedLayers[0];
    sceneLastReplacedLayer = null;
    if (targetLayer.locked) return "ERROR: Unlock the selected layer before replacing its clip.";
    var folderSelection;
    try { folderSelection = sceneParseRandomFolderSelection(decodeURIComponent(encodedFolderSelection || "")); }
    catch (selectionError) { return "ERROR: " + selectionError.toString().replace(/^Error: ?/, ""); }

    var selectedPrecomp = targetLayer.source instanceof CompItem;
    var footageTarget = selectedPrecomp
        ? sceneFindFirstRandomReplacementFootageLayer(targetLayer.source, {})
        : { comp: comp, layer: targetLayer };
    if (!footageTarget || !(footageTarget.layer.source instanceof FootageItem) || !(footageTarget.layer.source.mainSource instanceof FileSource)) {
        return "ERROR: Select a footage clip or a precomp that contains a footage clip.";
    }
    var contentLayer = footageTarget.layer;
    var destinationComp = selectedPrecomp ? targetLayer.source : comp;
    // Keep composition durations intact. The replacement fills the existing
    // destination composition when replacing inside a precomp, or the active
    // composition when replacing a direct footage layer.
    var duration = selectedPrecomp ? destinationComp.duration : comp.duration;
    if (!(duration > 0)) return "ERROR: The destination composition has no usable duration.";

    var currentPath = "";
    try { currentPath = contentLayer.source.mainSource.file.fsName.toLowerCase(); } catch (currentPathError) {}
    var currentSourceIn = Number(contentLayer.inPoint) - Number(contentLayer.startTime);
    var currentSourceOut = Number(contentLayer.outPoint) - Number(contentLayer.startTime);
    var records = readClipFavoriteRecords();
    var excludedClipLookup = {};
    if (excludedClipId) excludedClipLookup["$" + String(excludedClipId)] = true;
    if (encodedExcludedClipIds) {
        try {
            var excludedIds = JSON.parse(decodeURIComponent(encodedExcludedClipIds));
            if (excludedIds instanceof Array) {
                for (var excludedIndex = 0; excludedIndex < excludedIds.length; excludedIndex++) {
                    excludedClipLookup["$" + String(excludedIds[excludedIndex])] = true;
                }
            }
        } catch (excludedParseError) {
            return "ERROR: The clips already in the selected precomps could not be checked.";
        }
    }
    var cycleClipLookup = {};
    if (encodedCycleClipIds) {
        try {
            var cycleClipIds = JSON.parse(decodeURIComponent(encodedCycleClipIds));
            if (cycleClipIds instanceof Array) {
                for (var cycleIndex = 0; cycleIndex < cycleClipIds.length; cycleIndex++) cycleClipLookup["$" + String(cycleClipIds[cycleIndex])] = true;
            }
        } catch (cycleParseError) { return "ERROR: The replacement cycle could not be read."; }
    }
    var allowedClipLookup = null;
    if (encodedAllowedClipIds) {
        try {
            var allowedClipIds = JSON.parse(decodeURIComponent(encodedAllowedClipIds));
            if (allowedClipIds instanceof Array) {
                allowedClipLookup = {};
                for (var allowedClipIndex = 0; allowedClipIndex < allowedClipIds.length; allowedClipIndex++) {
                    allowedClipLookup["$" + String(allowedClipIds[allowedClipIndex])] = true;
                }
            }
        } catch (allowedClipParseError) { return "ERROR: The clips in the chosen source folders could not be read."; }
    }
    var excludedClipVariants = [];
    if (encodedExcludedVariants) {
        try {
            var parsedExcludedVariants = JSON.parse(decodeURIComponent(encodedExcludedVariants));
            if (parsedExcludedVariants instanceof Array) excludedClipVariants = parsedExcludedVariants;
        } catch (excludedVariantsError) { return "ERROR: The clips already in the selected precomps could not be checked."; }
    }
    if (forcedClipId && excludedClipLookup["$" + String(forcedClipId)]) {
        return "ERROR: That clip is already in one of the selected clips or precomps.";
    }
    if (!excludedClipId) {
        var currentRecord = sceneClipRecordForLayer(targetLayer, records);
        if (currentRecord) excludedClipId = currentRecord.clipId;
    }
    var candidates = [];
    for (var r = 0; r < records.length; r++) {
        var record = records[r];
        if (forcedClipId && String(record.clipId || "") !== String(forcedClipId)) continue;
        if (!forcedClipId && allowedClipLookup) {
            if (!allowedClipLookup["$" + String(record.clipId || "")]) continue;
        } else if (!forcedClipId && !sceneRandomFolderIsIncluded(record.folderId, folderSelection)) continue;
        if (excludedClipLookup["$" + String(record.clipId || "")]) continue;
        var sourceRangeAlreadyPresent = false;
        for (var variantIndex = 0; variantIndex < excludedClipVariants.length; variantIndex++) {
            if (sceneClipRecordsShareSourceRange(record, excludedClipVariants[variantIndex])) {
                sourceRangeAlreadyPresent = true;
                break;
            }
        }
        if (sourceRangeAlreadyPresent) continue;
        if (isNaN(record.sourceOut - record.sourceIn) || record.sourceOut - record.sourceIn <= 0) continue;
        if (!record.sourcePath || !new File(record.sourcePath).exists) continue;
        if (!excludedClipId && !forcedClipId && String(record.sourcePath).toLowerCase() === currentPath &&
            Math.abs(Number(record.sourceIn) - currentSourceIn) <= CLIP_TIMESTAMP_MATCH_TOLERANCE &&
            Math.abs(Number(record.sourceOut) - currentSourceOut) <= CLIP_TIMESTAMP_MATCH_TOLERANCE) continue;
        candidates.push(record);
    }
    if (!candidates.length) {
        if (forcedClipId) return "ERROR: The chosen clip is unavailable or already in one of the selected precomps.";
        var savedInSelectedFolders = 0;
        var alreadyUsedInSelectedComps = 0;
        var missingMediaInSelectedFolders = 0;
        for (var diagnosticIndex = 0; diagnosticIndex < records.length; diagnosticIndex++) {
            var diagnosticRecord = records[diagnosticIndex];
            if (allowedClipLookup) {
                if (!allowedClipLookup["$" + String(diagnosticRecord.clipId || "")]) continue;
            } else if (!sceneRandomFolderIsIncluded(diagnosticRecord.folderId, folderSelection)) continue;
            savedInSelectedFolders++;
            if (excludedClipLookup["$" + String(diagnosticRecord.clipId || "")]) alreadyUsedInSelectedComps++;
            if (!diagnosticRecord.sourcePath || !new File(diagnosticRecord.sourcePath).exists) missingMediaInSelectedFolders++;
        }
        return "ERROR: No eligible saved clip was found in the selected folders (" + savedInSelectedFolders +
            " saved, " + alreadyUsedInSelectedComps + " already present in the selected precomps, " +
            missingMediaInSelectedFolders + " with missing media).";
    }

    var cycleCandidates = [];
    if (!forcedClipId) {
        for (var cycleCandidateIndex = 0; cycleCandidateIndex < candidates.length; cycleCandidateIndex++) {
            if (!cycleClipLookup["$" + String(candidates[cycleCandidateIndex].clipId || "")]) cycleCandidates.push(candidates[cycleCandidateIndex]);
        }
        if (!cycleCandidates.length) {
            cycleClipLookup = {};
            cycleCandidates = candidates;
        }
    }
    var replacement = forcedClipId ? candidates[0] : cycleCandidates[Math.floor(Math.random() * cycleCandidates.length)];
    var sceneSlotKey = sceneRandomMarkerSlotKeyFromComment(targetLayer.comment);
    app.beginUndoGroup("SceneKeeper - Replace Selected Clip");
    var sourceFile = new File(replacement.sourcePath);
    var sourceItem = null;
    for (var p = 1; p <= app.project.numItems; p++) {
        var projectItem = app.project.item(p);
        try {
            if (projectItem instanceof FootageItem && projectItem.mainSource instanceof FileSource &&
                projectItem.mainSource.file.fsName.toLowerCase() === sourceFile.fsName.toLowerCase()) {
                sourceItem = projectItem;
                break;
            }
        } catch (sourceLookupError) {}
    }
    if (!sourceItem) {
        try { sourceItem = app.project.importFile(new ImportOptions(sourceFile)); }
        catch (importError) {
            app.endUndoGroup();
            return "ERROR: The replacement footage could not be imported.";
        }
    }
    if (!sourceItem) {
        app.endUndoGroup();
        return "ERROR: The replacement footage could not be imported.";
    }

    try {
        var insertedLayer = destinationComp.layers.add(sourceItem);
        insertedLayer.name = sceneClipLayerName(replacement);
        insertedLayer.comment = sceneClipFavoriteComment(replacement, sceneSlotKey);
        insertedLayer.startTime = -replacement.sourceIn;
        insertedLayer.inPoint = 0;
        insertedLayer.outPoint = duration;
        sceneApplySavedReplacementProperties(insertedLayer, replacement, destinationComp);
        if (selectedPrecomp) {
            targetLayer.name = sceneClipLayerName(replacement) + " Precomp";
            targetLayer.comment = sceneClipFavoriteComment(replacement, sceneSlotKey);
            // Once the new clip is safely in place, clear prior footage layers
            // (including nested clip precomps) from the selected precomp.
            for (var oldLayerIndex = destinationComp.numLayers; oldLayerIndex >= 1; oldLayerIndex--) {
                var oldLayer = destinationComp.layer(oldLayerIndex);
                if (oldLayer !== insertedLayer && sceneLayerContainsReplaceableClip(oldLayer, {})) {
                    oldLayer.remove();
                }
            }
            sceneLastReplacedLayer = targetLayer;
        } else {
            targetLayer.remove();
            sceneLastReplacedLayer = insertedLayer;
        }
    } catch (replaceError) {
        app.endUndoGroup();
        return "ERROR: After Effects could not insert the clip into the selected composition.";
    }
    app.endUndoGroup();
    var updatedCycleIds = [];
    if (!forcedClipId) {
        for (var updatedCycleKey in cycleClipLookup) if (cycleClipLookup.hasOwnProperty(updatedCycleKey)) updatedCycleIds.push(updatedCycleKey.substring(1));
        var replacementAlreadyInCycle = false;
        for (var updatedCycleIndex = 0; updatedCycleIndex < updatedCycleIds.length; updatedCycleIndex++) {
            if (String(updatedCycleIds[updatedCycleIndex]) === String(replacement.clipId)) {
                replacementAlreadyInCycle = true;
                break;
            }
        }
        if (replacement.clipId && !replacementAlreadyInCycle) updatedCycleIds.push(String(replacement.clipId));
    }
    return "SELECTED_CLIP_REPLACED|" + encodeURIComponent(sceneClipLayerName(replacement)) + "|" + (selectedPrecomp ? "precomp" : "clip") + "|" + encodeURIComponent(sceneSlotKey) + "|" + encodeURIComponent(replacement.clipId) + "|" + encodeURIComponent(JSON.stringify(updatedCycleIds));
}

function replaceRandomMarkerClips(encodedFolderId, encodedSlots) {
    var comp = getActiveComp();
    if (!comp) return "ERROR: Select the composition containing the inserted clips.";
    var folderId = decodeURIComponent(encodedFolderId || "");
    var slots;
    try {
        slots = JSON.parse(decodeURIComponent(encodedSlots || "[]"));
    } catch (e) {
        return "ERROR: The selected clips could not be read.";
    }
    if (!(slots instanceof Array) || !slots.length) return "ERROR: Select at least one clip to replace.";

    var folderSelection;
    try { folderSelection = sceneParseRandomFolderSelection(folderId); }
    catch (selectionError) { return "ERROR: " + selectionError.toString().replace(/^Error: ?/, ""); }
    var customFolders = folderSelection.custom;
    var allFolders = folderId === "*";
    var records = readClipFavoriteRecords();
    var candidates = [];
    for (var r = 0; r < records.length; r++) {
        var record = records[r];
        if (!allFolders && !customFolders && (record.folderId || "") !== folderId) continue;
        if (customFolders && !sceneRandomFolderIsIncluded(record.folderId, folderSelection)) continue;
        if (isNaN(record.sourceOut - record.sourceIn) || record.sourceOut - record.sourceIn <= 0) continue;
        if (!new File(record.sourcePath).exists) continue;
        candidates.push(record);
    }
    if (!candidates.length) return "ERROR: No available saved clips were found in the selected folders.";

    var currentlyUsedPaths = {};
    var currentlyUsedClipIds = {};
    var visitedPrecompIds = {};
    var slotPrefix = "SceneKeeperRandomSlot:";
    for (var currentLayerIndex = 1; currentLayerIndex <= comp.numLayers; currentLayerIndex++) {
        var currentLayer = comp.layer(currentLayerIndex);
        var currentComment = String(currentLayer.comment || "");
        var isTrackedSlot = currentComment.indexOf(slotPrefix) === 0;
        if (isTrackedSlot) {
            var clipIdMatch = currentComment.match(/\|clipId=([^|]*)/);
            if (clipIdMatch && clipIdMatch[1]) {
                try { currentlyUsedClipIds["$" + decodeURIComponent(clipIdMatch[1])] = true; }
                catch (clipIdDecodeError) { currentlyUsedClipIds["$" + clipIdMatch[1]] = true; }
            }
        }
        // Generated slots are the layers being replaced. Their current sources
        // must not make other saved clips look occupied; the replacement loop
        // below tracks newly assigned paths to keep this run unique.
        if (isTrackedSlot) continue;
        if (currentLayer.source instanceof CompItem) {
            sceneCollectPrecompFootagePaths(currentLayer.source, currentlyUsedPaths, visitedPrecompIds);
        } else {
            try {
                if (currentLayer.source instanceof FootageItem && currentLayer.source.mainSource instanceof FileSource) {
                    currentlyUsedPaths["$" + currentLayer.source.mainSource.file.fsName.toLowerCase()] = true;
                }
            } catch (currentSourceError) {}
        }
    }

    var usedIds = [];
    var replaced = [];
    var failed = [];
    app.beginUndoGroup("SceneKeeper - Replace Random Marker Clips");
    try {
        for (var s = 0; s < slots.length; s++) {
            var target = null;
            var targetKey = String(slots[s].key || "");
            for (var l = 1; l <= comp.numLayers; l++) {
                var layer = comp.layer(l);
                var layerComment = String(layer.comment || "");
                var targetSlotPrefix = "SceneKeeperRandomSlot:" + targetKey;
                if (layerComment === targetSlotPrefix || layerComment.indexOf(targetSlotPrefix + "|") === 0) {
                    target = layer;
                    break;
                }
            }
            if (!target) { failed.push({ name: slots[s].name || "clip", reason: "The generated layer is no longer in the active composition." }); continue; }
            var contentLayer = target;
            var sourceComp = target.source instanceof CompItem ? target.source : null;
            if (sourceComp && sourceComp.numLayers > 0) contentLayer = sourceComp.layer(1);
            var intervalDuration = Number(slots[s].duration);
            var eligible = [];
            var longEnoughAlternatives = 0;
            var unusedInCompositionAlternatives = 0;
            var unusedThisRunAlternatives = 0;
            for (r = 0; r < candidates.length; r++) {
                if (candidates[r].clipId === slots[s].clipId || candidates[r].sourceOut - candidates[r].sourceIn + FOOTAGE_END_TOLERANCE < intervalDuration) continue;
                if (currentlyUsedClipIds["$" + String(candidates[r].clipId || "")]) continue;
                longEnoughAlternatives++;
                var candidatePathKey = "$" + String(candidates[r].sourcePath || "").toLowerCase();
                if (currentlyUsedPaths[candidatePathKey]) continue;
                unusedInCompositionAlternatives++;
                var wasUsed = false;
                for (var u = 0; u < usedIds.length; u++) if (usedIds[u] === candidates[r].clipId) wasUsed = true;
                if (!wasUsed) {
                    unusedThisRunAlternatives++;
                    eligible.push(candidates[r]);
                }
            }
            if (!eligible.length) {
                var noCandidateReason = !longEnoughAlternatives
                    ? "No other saved clip in the selected folders is long enough for this interval."
                    : (!unusedInCompositionAlternatives
                        ? "All " + longEnoughAlternatives + " other clip(s) long enough for this interval are already used in the composition or its precomps."
                        : (!unusedThisRunAlternatives
                            ? "The remaining unused clips were already assigned to other selected replacements."
                            : "No unused replacement clip is available in the selected folders."));
                failed.push({ name: slots[s].name || "clip", reason: noCandidateReason });
                continue;
            }
            var replacement = eligible[Math.floor(Math.random() * eligible.length)];
            var sourceFile = new File(replacement.sourcePath);
            var sourceItem = null;
            for (var p = 1; p <= app.project.numItems; p++) {
                var projectItem = app.project.item(p);
                try {
                    if (projectItem instanceof FootageItem && projectItem.mainSource instanceof FileSource && projectItem.mainSource.file.fsName === sourceFile.fsName) { sourceItem = projectItem; break; }
                } catch (sourceLookupError) {}
            }
            if (!sourceItem) {
                try { sourceItem = app.project.importFile(new ImportOptions(sourceFile)); }
                catch (importError) {
                    failed.push({ name: slots[s].name || "clip", reason: "Source file could not be imported." });
                    continue;
                }
            }
            if (!sourceItem) { failed.push({ name: slots[s].name || "clip", reason: "Source file could not be imported." }); continue; }
            var duration = Math.min(intervalDuration, replacement.sourceOut - replacement.sourceIn);
            contentLayer.replaceSource(sourceItem, false);
            if (slots[s].clipId) delete currentlyUsedClipIds["$" + String(slots[s].clipId)];
            contentLayer.startTime = (sourceComp ? 0 : Number(slots[s].time)) - replacement.sourceIn;
            contentLayer.inPoint = sourceComp ? 0 : Number(slots[s].time);
            contentLayer.outPoint = contentLayer.inPoint + duration;
            if (sourceComp) sourceComp.duration = duration;
            var transform = contentLayer.property("ADBE Transform Group");
            if (transform) {
                var position = transform.property("ADBE Position");
                var scale = transform.property("ADBE Scale");
                if (position && position.numKeys === 0 && replacement.positionX !== null && replacement.positionY !== null) position.setValue([replacement.positionX, replacement.positionY]);
                if (scale && scale.numKeys === 0 && replacement.scaleX !== null && replacement.scaleY !== null) scale.setValue([replacement.scaleX, replacement.scaleY]);
            }
            contentLayer.name = sceneClipLayerName(replacement);
            contentLayer.comment = sceneClipFavoriteComment(replacement, "");
            if (!sourceComp) target.name = sceneClipLayerName(replacement);
            else target.name = sceneClipLayerName(replacement) + " Precomp";
            target.comment = sceneClipFavoriteComment(replacement, targetKey);
            if (sourceComp) target.audioEnabled = false;
            usedIds.push(replacement.clipId);
            currentlyUsedClipIds["$" + String(replacement.clipId || "")] = true;
            currentlyUsedPaths["$" + String(replacement.sourcePath || "").toLowerCase()] = true;
            replaced.push({ key: targetKey, name: sceneClipLayerName(replacement), clipId: replacement.clipId });
            try { sceneCollapseLayerProperties(comp, target); } catch (collapseError) {}
        }
    } catch (replaceError) {
        app.endUndoGroup();
        return "ERROR: Replace stopped. After Effects could not update a clip.";
    }
    app.endUndoGroup();
    return "MARKER_RANDOM_REPLACED|" + encodeURIComponent(JSON.stringify(replaced)) + "|" + encodeURIComponent(JSON.stringify(failed));
}

function sceneCollectPrecompFootagePaths(compItem, pathLookup, visited) {
    var compKey = "$" + String(compItem.id);
    if (visited[compKey]) return;
    visited[compKey] = true;
    for (var i = 1; i <= compItem.numLayers; i++) {
        var layer = compItem.layer(i);
        try {
            if (layer.source instanceof CompItem) {
                sceneCollectPrecompFootagePaths(layer.source, pathLookup, visited);
            } else if (layer.source instanceof FootageItem && layer.source.mainSource instanceof FileSource) {
                pathLookup["$" + layer.source.mainSource.file.fsName.toLowerCase()] = true;
            }
        } catch (e) {}
    }
}

function deleteRandomMarkerPrecomps(encodedSlots) {
    var comp = getActiveComp();
    if (!comp) return "ERROR: Select the composition containing the created precomps.";
    var selectedKeyLookup = {};
    var restrictToSelection = false;
    if (encodedSlots) {
        var selectedSlots;
        try { selectedSlots = JSON.parse(decodeURIComponent(encodedSlots)); }
        catch (selectionError) { return "ERROR: The selected precomps could not be read."; }
        if (!(selectedSlots instanceof Array) || !selectedSlots.length) return "ERROR: Select at least one precomp to delete.";
        restrictToSelection = true;
        for (var selectedSlotIndex = 0; selectedSlotIndex < selectedSlots.length; selectedSlotIndex++) {
            selectedKeyLookup["$" + String(selectedSlots[selectedSlotIndex].key || "")] = true;
        }
    }
    var slotPrefix = "SceneKeeperRandomSlot:";
    var trackedLayers = [];
    var precompItems = [];
    var precompLookup = {};
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        var comment = String(layer.comment || "");
        if (comment.indexOf(slotPrefix) !== 0 || !(layer.source instanceof CompItem)) continue;
        var slotKey = sceneRandomMarkerSlotKeyFromComment(comment);
        if (restrictToSelection && !selectedKeyLookup["$" + slotKey]) continue;
        trackedLayers.push(layer);
        var sourceComp = layer.source;
        var itemKey = "$" + String(sourceComp.id);
        if (!precompLookup[itemKey]) {
            precompLookup[itemKey] = true;
            precompItems.push(sourceComp);
        }
    }
    if (!trackedLayers.length) return "MARKER_RANDOM_PRECOMPS_DELETED|0|0|%5B%5D";
    var deletedKeys = [];
    for (i = 0; i < trackedLayers.length; i++) {
        deletedKeys.push(sceneRandomMarkerSlotKeyFromComment(trackedLayers[i].comment));
    }

    var contentFootage = [];
    var footageLookup = {};
    var deletedPrecompCount = 0;
    var deletedFootageCount = 0;
    app.beginUndoGroup("SceneKeeper - Delete Created Random Precomps");
    try {
        for (i = trackedLayers.length - 1; i >= 0; i--) trackedLayers[i].remove();
        for (i = 0; i < precompItems.length; i++) {
            var precompItem = precompItems[i];
            if (precompItem.usedIn && precompItem.usedIn.length > 0) continue;
            for (var childIndex = 1; childIndex <= precompItem.numLayers; childIndex++) {
                var childSource = precompItem.layer(childIndex).source;
                if (childSource instanceof FootageItem) {
                    var footageKey = "$" + String(childSource.id);
                    if (!footageLookup[footageKey]) {
                        footageLookup[footageKey] = true;
                        contentFootage.push(childSource);
                    }
                }
            }
            precompItem.remove();
            deletedPrecompCount++;
        }
        for (i = 0; i < contentFootage.length; i++) {
            var footageItem = contentFootage[i];
            if (footageItem.usedIn && footageItem.usedIn.length > 0) continue;
            footageItem.remove();
            deletedFootageCount++;
        }
    } catch (deleteError) {
        app.endUndoGroup();
        return "ERROR: Could not delete the created precomps: " + deleteError.toString();
    }
    app.endUndoGroup();
    return "MARKER_RANDOM_PRECOMPS_DELETED|" + deletedPrecompCount + "|" + deletedFootageCount + "|" + encodeURIComponent(JSON.stringify(deletedKeys));
}

function getSelectedRandomMarkerSlots() {
    var comp = getActiveComp();
    if (!comp) return "ERROR: Select the composition containing the inserted clips.";
    var keys = [];
    var layers = comp.selectedLayers || [];
    for (var i = 0; i < layers.length; i++) {
        var comment = String(layers[i].comment || "");
        var prefix = "SceneKeeperRandomSlot:";
        if (comment.indexOf(prefix) === 0) keys.push(sceneRandomMarkerSlotKeyFromComment(comment));
    }
    return "MARKER_RANDOM_SELECTION|" + encodeURIComponent(JSON.stringify(keys));
}

function sceneGetRandomMarkerSlotLayer(comp, slotKey) {
    var prefix = "SceneKeeperRandomSlot:";
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        if (sceneRandomMarkerSlotKeyFromComment(layer.comment) === slotKey && String(layer.comment || "").indexOf(prefix) === 0) return layer;
    }
    return null;
}
