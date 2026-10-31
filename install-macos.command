#!/bin/bash

set -u

SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$HOME/Library/Application Support/Adobe/CEP/extensions/SceneKeeper"

pause_before_exit() {
  printf '\nPress Enter to close this window... '
  read -r _
}

fail() {
  printf '\nINSTALLATION STOPPED\n%s\n' "$1"
  pause_before_exit
  exit 1
}

printf 'SceneKeeper Installer for macOS\n'
printf '================================\n\n'

if [[ ! -f "$SOURCE_DIR/CSXS/manifest.xml" ]]; then
  fail "Installer files are incomplete. Extract the ZIP, open its SceneKeeper folder, and run this file there."
fi

if [[ "$SOURCE_DIR" == "$TARGET_DIR" ]]; then
  fail "You opened the installer from the installed SceneKeeper folder. Extract a fresh release ZIP and run the installer from that folder."
fi

printf 'This installs or updates SceneKeeper for your macOS user.\n'
printf 'Your saved clip library and panel settings are kept. No administrator password is needed.\n\n'
printf 'Install location:\n%s\n\n' "$TARGET_DIR"
printf 'Before continuing, save your work and quit After Effects completely.\n'
printf 'Press Enter to install, or Control+C to cancel. '
read -r _

printf '\n[1/3] Preparing the install folder...\n'
if ! mkdir -p "$(dirname "$TARGET_DIR")" || ! mkdir -p "$TARGET_DIR"; then
  fail "Could not create the install folder. Check that your macOS user can write to its Library folder."
fi

printf '[2/3] Copying SceneKeeper files...\n'
if ! ditto "$SOURCE_DIR" "$TARGET_DIR"; then
  fail "SceneKeeper could not be copied. Check the install folder permissions and try again."
fi

printf '[3/3] Enabling CEP extensions...\n'
if ! defaults write com.adobe.CSXS.11 PlayerDebugMode 1; then
  printf '\nSceneKeeper files were copied, but CEP could not be enabled automatically.\n'
  printf 'Open Terminal and run this command:\n\n'
  printf 'defaults write com.adobe.CSXS.11 PlayerDebugMode 1\n'
  pause_before_exit
  exit 1
fi

printf '\nINSTALLATION COMPLETE\n'
printf '1. Start or restart After Effects.\n'
printf '2. Open Window > Extensions (Legacy) > SceneKeeper.\n'
pause_before_exit
