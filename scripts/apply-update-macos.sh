#!/bin/bash

set -u
STATE_FILE="$1"
LOG_FILE="${STATE_FILE}.log"
exec >>"$LOG_FILE" 2>&1
ARCHIVE="$(sed -n '1p' "$STATE_FILE")"
TARGET="$(sed -n '2p' "$STATE_FILE")"
VERSION="$(sed -n '3p' "$STATE_FILE")"

show_dialog() {
  /usr/bin/osascript - "$1" "$2" <<'APPLESCRIPT' >/dev/null 2>&1 || true
on run argv
  display dialog (item 1 of argv) with title (item 2 of argv) buttons {"OK"} default button "OK"
end run
APPLESCRIPT
}

fail() {
  local message="$1"
  echo "SceneKeeper update failed: $message"
  show_dialog "SceneKeeper ${VERSION:-update} could not be installed. Close After Effects and check that your account can modify:\n${TARGET:-the SceneKeeper extension folder}\n\nDetails: ${message}\n\nLog: ${LOG_FILE}" "SceneKeeper update failed"
  exit 10
}

[[ -n "$ARCHIVE" && -n "$TARGET" && -f "$ARCHIVE" ]] || fail "The update archive or install path is missing."

# macOS permits replacing an extension directory while AE is open. The
# currently loaded panel keeps running from memory; the new files are used
# after AE restarts.

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/scenekeeper-update.XXXXXX")" || fail "Could not create a temporary install folder."
unzip -q "$ARCHIVE" -d "$WORK_DIR" || { rm -rf "$WORK_DIR"; fail "Could not extract the update archive."; }
PAYLOAD="$WORK_DIR/SceneKeeper"
BACKUP="${TARGET}.update-backup"
if [[ ! -f "$PAYLOAD/CSXS/manifest.xml" ]]; then
  rm -rf "$WORK_DIR"
  fail "The update archive does not contain a valid SceneKeeper extension."
fi

rm -rf "$BACKUP"
if [[ -e "$TARGET" ]]; then
  mv "$TARGET" "$BACKUP" || { rm -rf "$WORK_DIR"; fail "Could not move the installed extension. Check permissions for: $TARGET"; }
fi
if ! mv "$PAYLOAD" "$TARGET"; then
  if [[ -e "$BACKUP" ]]; then mv "$BACKUP" "$TARGET"; fi
  rm -rf "$WORK_DIR"
  fail "Could not install files into: $TARGET. Check folder permissions."
fi

rm -rf "$BACKUP" "$WORK_DIR" "$ARCHIVE" "$STATE_FILE"
show_dialog "SceneKeeper ${VERSION} is installed. Reopen After Effects to use it." "SceneKeeper updated"
