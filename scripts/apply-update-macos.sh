#!/bin/bash

set -u
STATE_FILE="$1"
LOG_FILE="${STATE_FILE}.log"
exec >>"$LOG_FILE" 2>&1
ARCHIVE="$(sed -n '1p' "$STATE_FILE")"
TARGET="$(sed -n '2p' "$STATE_FILE")"
VERSION="$(sed -n '3p' "$STATE_FILE")"

RESULT_FILE="${STATE_FILE}.result"

fail() {
  local message="$1"
  echo "SceneKeeper update failed: $message"
  printf 'ERROR\n%s\n' "$message" >"$RESULT_FILE" 2>/dev/null || true
  exit 10
}

[[ -n "$ARCHIVE" && -n "$TARGET" && -f "$ARCHIVE" ]] || fail "The update archive or install path is missing."

# macOS permits replacing an extension directory while AE is open. The
# currently loaded panel keeps running from memory; close and reopen the panel
# after installation to load the new files. After Effects does not need to restart.

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
printf 'INSTALLED\n%s\n' "$VERSION" >"$RESULT_FILE" || exit 11
