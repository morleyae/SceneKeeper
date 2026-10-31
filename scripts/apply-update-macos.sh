#!/bin/bash

set -u
STATE_FILE="$1"
ARCHIVE="$(sed -n '1p' "$STATE_FILE")"
TARGET="$(sed -n '2p' "$STATE_FILE")"
VERSION="$(sed -n '3p' "$STATE_FILE")"

if [[ -z "$ARCHIVE" || -z "$TARGET" || ! -f "$ARCHIVE" ]]; then
  exit 2
fi

# Wait until every After Effects process has exited before replacing its panel.
while pgrep -f '/Adobe After Effects[^/]*/.*After Effects' >/dev/null 2>&1; do
  sleep 2
done

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/scenekeeper-update.XXXXXX")" || exit 3
unzip -q "$ARCHIVE" -d "$WORK_DIR" || { rm -rf "$WORK_DIR"; exit 4; }
PAYLOAD="$WORK_DIR/SceneKeeper"
BACKUP="${TARGET}.update-backup"
if [[ ! -f "$PAYLOAD/CSXS/manifest.xml" ]]; then
  rm -rf "$WORK_DIR"
  exit 5
fi

rm -rf "$BACKUP"
if [[ -e "$TARGET" ]]; then
  mv "$TARGET" "$BACKUP" || { rm -rf "$WORK_DIR"; exit 6; }
fi
if ! mv "$PAYLOAD" "$TARGET"; then
  if [[ -e "$BACKUP" ]]; then mv "$BACKUP" "$TARGET"; fi
  rm -rf "$WORK_DIR"
  exit 7
fi

rm -rf "$BACKUP" "$WORK_DIR" "$ARCHIVE" "$STATE_FILE"
osascript -e "display notification \"SceneKeeper $VERSION installed. Reopen After Effects to use it.\" with title \"SceneKeeper updated\"" >/dev/null 2>&1 || true
