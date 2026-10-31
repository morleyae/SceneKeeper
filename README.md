# SceneKeeper

SceneKeeper ist ein CEP-Panel für After Effects zum Speichern, Organisieren und Einfügen von Clips.

## Installation aus der ZIP

> **Vorbereitung:** After Effects muss während der Installation geschlossen sein. Entpacke `SceneKeeper.zip` und öffne den enthaltenen Ordner `SceneKeeper`.

1. **macOS:** Doppelklicke `install-macos.command`. Wenn macOS nachfragt, bestätige das Öffnen. **Windows:** Doppelklicke `install-windows.bat` und bestätige die Installation.
2. Das Installationsprogramm erstellt bei Bedarf den CEP-Ordner, kopiert SceneKeeper an den richtigen Ort und aktiviert den CEP-Debug-Modus für CSXS 11.
3. Starte After Effects neu und öffne **Fenster > Erweiterungen (Legacy) > SceneKeeper**.

Die Installationsdatei muss im entpackten Ordner `SceneKeeper` neben `CSXS` liegen. Die manuelle Installation bleibt möglich: kopiere den Ordner nach `~/Library/Application Support/Adobe/CEP/extensions/` (macOS) beziehungsweise `%APPDATA%\\Adobe\\CEP\\extensions` (Windows). Falls SceneKeeper nicht erscheint, kontrolliere, dass `CSXS/manifest.xml` direkt im installierten Ordner liegt.

### Releases veröffentlichen

SceneKeeper-Releases werden über GitHub Actions gebaut. Committe die Änderungen und erstelle anschließend einen Tag wie `v1.0.1`. Push den Commit und den Tag; die Action setzt die Manifest-Version aus dem Tag, erstellt `SceneKeeper-v1.0.1.zip` und veröffentlicht ihn als GitHub Release. Die ZIP enthält nur SceneKeeper-Dateien sowie beide Installer. Installierte Panels prüfen automatisch auf eine neuere Veröffentlichung, laden sie herunter und installieren sie nach dem Beenden von After Effects. Danach muss AE neu gestartet werden.

```sh
git tag v1.0.1
git push origin main --tags
```

macOS kann beim ersten Öffnen eine Sicherheitsmeldung anzeigen. Öffne die Datei per Rechtsklick > **Öffnen** und bestätige. Falls die `.command`-Datei nicht als ausführbar erhalten bleibt, öffne Terminal, gib `bash ` ein, ziehe die Datei ins Terminal und drücke Enter.

### Panel starten

1. Starte After Effects.
2. Öffne **Fenster > Erweiterungen (Legacy) > SceneKeeper**.

Falls SceneKeeper nicht angezeigt wird, kontrolliere zuerst, dass `CSXS/manifest.xml` direkt im installierten Ordner `SceneKeeper` liegt und nicht in einem zusätzlichen Unterordner. Starte After Effects nach dem Aktivieren des Debug-Modus neu.

Beim ersten Start nach der Lizenzfreigabe führt eine geführte Tour durch SceneKeeper. Sie importiert ein kurzes, bewegtes Beispielvideo in eine separate Komposition namens `SceneKeeper Tutorial`, lässt den Nutzer die Hover-Vorschau in der Clipkarte ansehen und führt durch Speichern und erneutes Einfügen. Anschließend kann die Suche ausprobiert und der Getting-Started-Ordner per Rechtsklick geöffnet werden; der Abschluss stellt Einstellungen, Papierkorb und Import/Export vor. Über **Help > Start Guided Tutorial** lässt sich die Tour jederzeit wiederholen. Wird sie bereits auf der Startseite übersprungen, wird kein Beispiel in das Projekt importiert.

### Video-Vorschau

SceneKeeper spielt MOV- und MP4-Dateien zunächst direkt aus dem Original-Footage ab. Wenn der CEP-Browser ein Video nicht decodieren kann oder die Wiedergabe nach vier Sekunden nicht bereit ist, speichert SceneKeeper einen H.264-Proxy im Ordner `~/Library/Application Support/CEP Tool/preview-cache` (Windows: `%APPDATA%/CEP Tool/preview-cache`). Während des Ladens und der Proxy-Erstellung zeigen Clip-Kachel und große Vorschau eine animierte Ladeanzeige. Proxys werden auf höchstens 15 Sekunden des gespeicherten Szenenbereichs begrenzt, damit die Erstellung kurz bleibt und der Cache klein bleibt. Der Proxy enthält keinen Ton. Mit FFmpeg wird er auf maximal 480 Pixel Kantenlänge, 15 Bilder pro Sekunde und niedrige Bitrate begrenzt. macOS verwendet ersatzweise das eingebaute `avconvert`, falls FFmpeg fehlt; dessen Proxy kann größer ausfallen. Unter Windows muss FFmpeg installiert sein. In der quadratischen Vorschau wird der Proxy anhand der gespeicherten Footage-Abmessungen sowie der gespeicherten Position und Skalierung wie das Original ausgerichtet. Wiederholtes Öffnen lädt einen vorhandenen Proxy direkt, ohne erst auf die Original-Wiedergabe zu warten.

Beim endgültigen Löschen eines Clips aus dem Papierkorb werden seine gespeicherten Proxy-Dateien ebenfalls entfernt. Beim Verschieben in den Papierkorb bleiben sie für eine mögliche Wiederherstellung erhalten. Wird ein Clip oder Ordner durch Überschreiten des 10-Einträge-Limits aus dem Papierkorb verdrängt, entfernt SceneKeeper ebenfalls alle nicht mehr verwendeten Proxys.

Beim Speichern eines Clips ab drei Minuten fragt SceneKeeper, ob der ganze Clip gespeichert oder der Bereich zuerst in After Effects gekürzt werden soll.

Beim Bearbeiten eines Clips sind nur Scale X und Scale Y miteinander verknüpft; Position X und Y bleiben unabhängig. Wird der In-/Out-Bereich geändert, löscht SceneKeeper nicht mehr verwendete Proxys für den vorherigen Bereich.

**Missing Footage** zeigt fehlende Footage-Quellen gesammelt; eine Neuverknüpfung aktualisiert alle Clips, die dieselbe Quelle verwenden. Der Status wird während der Nutzung regelmäßig aktualisiert.

Die Clip-Reihenfolge lässt sich über den Griff `⋮` links am Clip per Drag-and-drop ändern. Favorisierte Clips bleiben oberhalb der übrigen Clips und lassen sich innerhalb ihrer Gruppe sortieren. Die manuelle Reihenfolge bleibt nach dem Neuladen erhalten; bei aktiver Suche muss diese zum Sortieren geleert werden.

### Quick Save per Tastenkürzel

Das Script `14 SceneKeeper - Quick Save Selected Clips.jsx` speichert alle ausgewählten Footage-Layer der aktiven Komposition direkt im aktuell geöffneten SceneKeeper-Ordner. Der Ordner wird beim Öffnen und Wechseln einer Bibliotheks-Tab gespeichert. Die Quick-Save-Optionen für Position, Scale und Audio werden aus den Clip-Speichereinstellungen übernommen. Bei Erfolg erscheint kein Popup; Meldungen erscheinen nur bei Fehlern.

Kopiere das Script in den After-Effects-Ordner `Scripts` (macOS, After Effects 2024):

```sh
sudo cp "/Library/Application Support/Adobe/CEP/extensions/SceneKeeper/scripts/14 SceneKeeper - Quick Save Selected Clips.jsx" "/Applications/Adobe After Effects 2024/Scripts/"
```

Starte After Effects neu und weise dem Script unter **Edit > Keyboard Shortcuts** eine Tastenkombination zu. Suche dort nach `14 SceneKeeper - Quick Save Selected Clips`. Die Nummer 14 folgt auf die vorhandenen globalen Scripts 01–13. Bei mehreren ausgewählten Layern wird jeder Layer gespeichert; bereits vorhandene Clips mit derselben Quelle und denselben In-/Out-Punkten werden aktualisiert.

### Online-Lizenzierung (Cloudflare Workers + D1)

Das optionale Lizenz-Backend liegt unter `cloudflare/license-server`. Es stellt eine HTTPS-API auf einer `workers.dev`-Adresse bereit und verwendet D1. Die aktuell gewählte Lizenzpolitik erlaubt eine Installation pro Lizenz; bei einem vorübergehenden Server- oder Netzwerkfehler bleibt eine zuvor aktivierte Installation bis zu drei Tage nutzbar. Wird ein Lizenzschlüssel auf einem anderen Gerät gebraucht, muss die Gerätebindung über den Admin-Endpunkt zurückgesetzt werden. Für Support oder einen Gerätewechsel mit einem bereits gekauften Lizenzschlüssel können Nutzer `morley.ae` auf Discord anschreiben.

Cloudflare dokumentiert derzeit im Workers-Free-Tarif bis zu 100.000 Worker-Aufrufe pro Tag; D1 Free beinhaltet derzeit 5 Millionen gelesene Zeilen pro Tag, 100.000 geschriebene Zeilen pro Tag und 5 GB Gesamtspeicher. Limits und Tarifbedingungen können sich ändern; `workers.dev` ist für Hobby-/persönliche Projekte statt geschäftskritischer Verfügbarkeit vorgesehen. Siehe [Workers-Preise](https://developers.cloudflare.com/workers/platform/pricing/), [D1-Preise](https://developers.cloudflare.com/d1/platform/pricing/) und [`workers.dev`](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/).

**Vorbereitung und Deployment**

1. Installiere Node.js und melde dich im Projektordner `cloudflare/license-server` mit `npx wrangler login` bei Cloudflare an.
2. Erstelle die Datenbank mit `npx wrangler d1 create scenekeeper-licenses`. Übernimm die ausgegebene ID in `wrangler.toml` anstelle von `REPLACE_WITH_D1_DATABASE_ID`.
3. Erstelle die Tabellen mit `npx wrangler d1 execute scenekeeper-licenses --remote --file=./schema.sql`.
4. Erzeuge ein zufälliges Admin-Geheimnis mit mindestens 32 Zeichen und setze es mit `npx wrangler secret put ADMIN_API_TOKEN`. Dieses Geheimnis gehört **niemals** in SceneKeeper oder in ein öffentliches Repository.
5. Veröffentliche die API mit `npx wrangler deploy`. Die Worker-URL ist HTTPS, z. B. `https://scenekeeper-license.<konto>.workers.dev`.
6. Trage die tatsächliche Worker-Basis-URL in `assets/js/license-config.js` ein. Ein leerer Wert deaktiviert die Lizenzprüfung und ist nur für lokale Entwicklung gedacht; eine veröffentlichte Version darf nicht mit leerem Wert verteilt werden.
7. Führe `npm test` im Ordner `cloudflare/license-server` aus, um die API-Tests auszuführen.

**Schlüssel verwalten**

Die Admin-API benötigt den Cloudflare-Secret-Wert im Authorization-Header als Bearer-Token. `POST /admin/licenses` erstellt einen zufälligen Schlüssel und gibt ihn einmalig zurück. `POST /admin/reset-device` mit JSON `{"licenseKey":"..."}` löst die Gerätebindung, und `POST /admin/revoke` mit demselben JSON-Format widerruft den Schlüssel. Der Admin-Schlüssel wird nur serverseitig geprüft; der Lizenzschlüssel wird in D1 ausschließlich als SHA-256-Hash gespeichert.

Der Discord-Bot kann später diese Admin-Endpunkte über ausgehendes HTTPS aufrufen; dafür muss sein Projekt den geheimen Admin-Token ausschließlich als geschützte Umgebungsvariable verwenden. Die Bot-Integration sowie Verkauf/Zahlungsabwicklung sind noch nicht enthalten. Die Gerätelimitierung ist eine Hürde gegen versehentliches Teilen, kein unknackbarer Kopierschutz: Clientcode und lokal gespeicherte Geräte-ID können von fortgeschrittenen Nutzern verändert oder kopiert werden.

## Aufbau

- `CSXS/manifest.xml`: registriert das Panel in After Effects.
- `index.html`: Einstiegspunkt und Panelstruktur.
- `assets/css/panel.css`: Layout und Darstellung.
- `assets/js/panel.js`: Bibliothek, Suche, Tabs und UI-Aktionen.
- `assets/js/license.js` und `assets/js/license-config.js`: Lizenzaktivierung im Panel und API-Konfiguration.
- `cloudflare/license-server/`: Cloudflare Worker, D1-Schema und API-Tests für die Online-Lizenzierung.
- `jsx/hostscript.jsx`: After-Effects-Aktionen und Clip-/Ordnerspeicherung.

Zum Entfernen den Ordner `SceneKeeper` aus dem CEP-Extensions-Verzeichnis löschen. Debug-Modus bei Bedarf ausschalten:

```sh
defaults write com.adobe.CSXS.11 PlayerDebugMode 0
```
