# Adobe RPC

Displays the Adobe application you're currently using as your Discord Rich Presence.

## 1. Download & Install

Download the latest installer from Releases:
https://github.com/fakersl/Adobe-rich-presence/releases/latest

1. Run `Adobe RPC-Setup-x.x.x.exe` — installs silently, with no UAC prompt or setup wizard.
2. Restart your Adobe application (Photoshop, Illustrator, Premiere Pro, After Effects, or InDesign).
3. Open Window → Extensions → Adobe RPC (Photoshop: Extensions (Legacy)).
4. Keep the panel open.

The application runs silently in the background, with only a small 16×16 tray icon visible. On first launch, it automatically installs the CEP extension into all 5 supported Adobe applications.

The Discord Client ID is hardcoded — no additional configuration required.

## What the panel does

All Rich Presence settings are managed directly inside the Adobe panel:

| Control | Options |
|---------|---------|
| Rich Presence | ON / OFF |
| Private mode | Hide project and activity |
| Timer | Per app / Per project / Hidden |
| Title | Project name / App only |
| Activity | Dynamic / Fixed text / None |

Changes take effect within approximately 2 seconds — no application restart required.

## Supported apps

| App | What's displayed |
|-----|------------------|
| Photoshop | Document, active layer, tool |
| Illustrator | Artboard, selected objects |
| Premiere Pro | Project, sequence |
| After Effects | Project, composition, layer count |
| InDesign | Document, page |
| Lightroom / Acrobat | Window title only |

## Requirements

- Windows 10/11 (x64)
- Adobe Creative Cloud 2018+ (CEP 9)
- Discord desktop application running

## Notes

- Discord rate-limits Rich Presence updates to one update every 15 seconds.
- The Adobe panel must remain open. If closed, the application falls back to window title detection.
- Adobe is deprecating CEP. Recent versions may eventually require a migration to UXP.

## Build from source

    npm install
    npm run dev        # Development
    npm run build:win  # Generates the NSIS installer in dist/
    npm run typecheck

## How it works

    ┌─────────────────┐        HTTP 127.0.0.1:47321        ┌──────────────┐
    │  Adobe app      │  ──── snapshot (project/action) ───▶ │  Electron    │
    │  (CEP panel)    │                                     │  (invisible) │
    └─────────────────┘                                     └──────┬───────┘
                                                                   │ IPC
                                                                   ▼
                                                            ┌──────────────┐
                                                            │   Discord    │
                                                            └──────────────┘

- The CEP extension reads the active document, layer, and tool using ExtendScript.
- It sends a JSON snapshot to 127.0.0.1:47321/ext using a local authentication token.
- The Electron application updates Discord Rich Presence through IPC.
- The panel can also read and write configuration through the token-protected /config endpoint.
- If the extension is unavailable, the application falls back to detecting the active window title.

## License

MIT — see LICENSE.