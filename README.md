```markdown
# Adobe RPC

Shows in Discord which Adobe app you're using (Rich Presence).

## 1. Download & Install

Grab the latest installer from **[Releases](https://github.com/fakersl/Adobe-rich-presence/releases/latest)**.

1. Run `Adobe RPC-Setup-x.x.x.exe` — installs silently, no UAC, no wizard
2. Restart your Adobe app (Photoshop, Illustrator, Premiere, After Effects, InDesign)
3. Open **Window → Extensions → Adobe RPC** (Photoshop: *Extensions (Legacy)*)
4. Leave the panel open

The app runs **invisible** in the background (a small 16×16 tray icon only) and auto-installs the CEP extension into all 5 Adobe apps on first launch. The Discord Client ID is **hardcoded** — no setup needed.

## What the panel does

All RPC controls live **inside the Adobe panel**:

| Control | Options |
|---------|---------|
| Rich Presence | ON / OFF |
| Private mode | Hide project and activity |
| Timer | Per app / Per project / Hidden |
| Title | Project name / App only |
| Activity | Dynamic / Fixed text / None |

Changes take effect within ~2s — no app restart needed.

## Supported apps

| App | What's shown |
|-----|--------------|
| Photoshop | Document, active layer, tool |
| Illustrator | Artboard, selected objects |
| Premiere | Project, sequence |
| After Effects | Project, comp, layer count |
| InDesign | Document, page |
| Lightroom / Acrobat | Window title only |

## Requirements

- Windows 10/11 x64
- Adobe CC 2018+ (CEP 9)
- Discord **desktop** app open

## Notes

- Discord rate-limits presence updates to 1 per 15s
- The panel must stay open — if closed, the app falls back to the window title
- CEP is being deprecated by Adobe; recent versions may require a UXP port

## Build from source

```bash
npm install
npm run dev        # development
npm run build:win  # NSIS installer in dist/
npm run typecheck
```

## How it works

```
┌─────────────────┐        HTTP 127.0.0.1:47321        ┌──────────────┐
│  Adobe app      │  ──── snapshot (project/action) ───▶ │  Electron    │
│  (CEP panel)    │                                     │  (invisible) │
└─────────────────┘                                     └──────┬───────┘
                                                               │ IPC
                                                               ▼
                                                        ┌──────────────┐
                                                        │   Discord    │
                                                        └──────────────┘
```

- The CEP extension reads the active document/layer/tool via ExtendScript
- It sends a JSON snapshot to `127.0.0.1:47321/ext` with a local token
- The Electron app pushes the presence to Discord via IPC
- The panel can also read/write config via `/config` (token-protected)
- Without the extension, the app falls back to detecting the window title

## License

MIT — see [LICENSE](LICENSE).
```