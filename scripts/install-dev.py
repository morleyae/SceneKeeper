#!/usr/bin/env python3
"""Install/update a separate local SceneKeeper Dev CEP extension."""

from pathlib import Path
from shutil import copytree, ignore_patterns
import re


SOURCE = Path(__file__).resolve().parent.parent
TARGET = (
    Path.home()
    / "Library/Application Support/Adobe/CEP/extensions/SceneKeeperDev"
)

copytree(
    SOURCE,
    TARGET,
    dirs_exist_ok=True,
    ignore=ignore_patterns(".git", ".DS_Store"),
)

manifest_path = TARGET / "CSXS/manifest.xml"
manifest = manifest_path.read_text(encoding="utf-8")
manifest = manifest.replace(
    "com.endlessaudios.ceptest", "com.morleyae.scenekeeper.dev"
).replace("<Menu>SceneKeeper</Menu>", "<Menu>SceneKeeper Dev</Menu>")
manifest_path.write_text(manifest, encoding="utf-8")

index_path = TARGET / "index.html"
index = index_path.read_text(encoding="utf-8")
index = index.replace("<title>SceneKeeper</title>", "<title>SceneKeeper Dev</title>")
index = index.replace("<h1>SceneKeeper</h1>", "<h1>SceneKeeper Dev</h1>", 1)
index_path.write_text(index, encoding="utf-8")

config_path = TARGET / "assets/js/update-config.js"
config = config_path.read_text(encoding="utf-8")
config = re.sub(r'currentVersion:\s*"[^"]*"', 'currentVersion: "DEV"', config, count=1)
if re.search(r"\bdevelopment\s*:", config):
    config = re.sub(r"\bdevelopment\s*:\s*(?:true|false)", "development: true", config, count=1)
else:
    config = config.replace('currentVersion: "DEV",', 'currentVersion: "DEV",\n  development: true,', 1)
config_path.write_text(config, encoding="utf-8")

# Remove files from the earlier button/watcher experiment if present.
for obsolete in (TARGET / "scripts/dev-reload.js", TARGET / "scripts/watch-dev.py"):
    if obsolete.exists():
        obsolete.unlink()

print(f"Installed SceneKeeper Dev at: {TARGET}")
