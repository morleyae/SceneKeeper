#!/bin/bash

set -u

SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/SceneKeeper"

if [[ ! -f "$SOURCE_DIR/CSXS/manifest.xml" ]]; then
  osascript -e 'display dialog "SceneKeeper payload not found. Keep this installer in the SceneKeeper folder next to CSXS/manifest.xml." buttons {"OK"} default button 1 with icon stop' >/dev/null
  exit 1
fi

if [[ "$SOURCE_DIR" == "$TARGET_DIR" ]]; then
  osascript -e 'display dialog "SceneKeeper is already in its install location." buttons {"OK"} default button 1'
  exit 0
fi

osascript -e 'display dialog "Close After Effects before installing SceneKeeper. Continue?" buttons {"Cancel", "Install"} default button "Install" with icon note' >/dev/null || exit 0

mkdir -p "$(dirname "$TARGET_DIR")" || exit 1
mkdir -p "$TARGET_DIR" || exit 1
ditto "$SOURCE_DIR" "$TARGET_DIR" || {
  osascript -e 'display dialog "SceneKeeper could not be copied. Check your permissions and try again." buttons {"OK"} default button 1 with icon stop' >/dev/null
  exit 1
}

defaults write com.adobe.CSXS.11 PlayerDebugMode 1 || exit 1
osascript -e 'display dialog "SceneKeeper was installed and CEP extensions were enabled. Restart After Effects, then open Window > Extensions (Legacy) > SceneKeeper." buttons {"OK"} default button 1'
