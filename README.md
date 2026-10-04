# Godot MCP Pro

Build Godot games by talking to Claude. This repo connects [Claude Code](https://claude.com/claude-code) directly to the Godot 4 editor, so you can say things like:

> "Create a player scene with a sprite and collision, add WASD movement, then playtest it and show me a screenshot."

...and Claude will do it — creating scenes, writing scripts, running the game, pressing keys, and looking at screenshots to verify its own work. Every change goes through Godot's undo system, so **Ctrl+Z always works**.

## What's in this repo

| Folder | What it is | Where it goes |
|---|---|---|
| `mcp-server/` | A small Node.js program that Claude Code talks to | Stays in this repo — you just build it once |
| `mcp-addon/` | A Godot editor plugin (177 tools) | Copied into **your Godot project** as `addons/godot_mcp/` |

How the pieces connect:

```
Claude Code  ──▶  mcp-server (Node.js)  ◀──WebSocket──  Godot editor (with addon enabled)
```

You don't need to understand this — just follow the setup below.

## What you need first

- **Godot 4.4 or newer** — [download here](https://godotengine.org/download)
- **Node.js 20 or newer** — [download here](https://nodejs.org) (check with `node --version` in a terminal)
- **Claude Code** — [install guide](https://code.claude.com/docs/en/overview)
- A Godot project (an empty new project is fine)

## Setup (one time, ~5 minutes)

All terminal commands below are run from the folder where you cloned this repo.

### Step 1 — Build the server

```bash
cd mcp-server
npm install
npm run build
cd ..
```

You only need to redo this if you pull an update to the repo.

### Step 2 — Put the addon into your Godot project

Copy the `mcp-addon` folder into your Godot project so it ends up at `addons/godot_mcp` (the folder name **must** be `godot_mcp`):

```bash
mkdir -p /path/to/your-godot-project/addons
cp -R mcp-addon /path/to/your-godot-project/addons/godot_mcp
```

### Step 3 — Enable the plugin in Godot

1. Open your project in the Godot editor.
2. Go to **Project ▸ Project Settings ▸ Plugins**.
3. Find **Godot MCP Pro** and check **Enable**.
4. A new **MCP Pro** panel appears at the bottom of the editor. It will say something like `Port 6505 — Waiting...` — that's expected until Claude connects.

### Step 4 — Tell Claude Code about the server

Create a file named `.mcp.json` **in the root of your Godot project** (next to `project.godot`) with this content, replacing the path with wherever you cloned this repo:

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/absolute/path/to/godot-mcp-pro/mcp-server/build/index.js"]
    }
  }
}
```

### Step 5 — (Recommended) Give Claude the cheat sheet

Copy the skills file into your Godot project so Claude knows how to use the tools well:

```bash
mkdir -p /path/to/your-godot-project/.claude
cp mcp-addon/skills.md /path/to/your-godot-project/.claude/skills.md
```

(Translations available: `skills.ja.md`, `skills.es.md`, `skills.pt-br.md`, `skills.ru.md`, `skills.zh.md`, `skills.hi.md`.)

### Step 6 — Check it works

1. Keep the Godot editor open with the plugin enabled.
2. In a terminal, go to your Godot project folder and start Claude Code:
   ```bash
   cd /path/to/your-godot-project
   claude
   ```
   The first time, Claude Code will ask you to approve the `godot` MCP server — say yes.
3. The **MCP Pro** panel in Godot should switch to `Connected` within a few seconds.
4. Ask Claude: **"What Godot project am I in? Use get_project_info."** If it answers with your project name, you're done. 🎉

## Everyday use

Open your Godot project in the editor, then run `claude` in the project folder. Just describe what you want in plain language:

- *"Show me the scene tree of the current scene."*
- *"Create a main menu with a title label and a Start button, centered."*
- *"Add an enemy that patrols left and right on a Path2D."*
- *"Run the game, hold D for 2 seconds, and show me a screenshot."*
- *"The player falls through the floor — find out why and fix it."*
- *"Add a bounce animation to the coin sprite."*

Tips:

- **Keep the Godot editor open.** Claude works through the editor — if it's closed, the tools can't connect.
- **Watch the editor while Claude works.** You'll see scenes and nodes appear live.
- **Undo works.** If Claude does something you don't like, press Ctrl+Z (Cmd+Z on Mac) in Godot, or just tell Claude to undo/change it.
- **Save often.** Ask Claude to save the scene, or save yourself as usual.

## Troubleshooting

**The MCP Pro panel says "Waiting" and never connects.**
Make sure a Claude Code session is actually running in your project folder (`claude`), and that Step 4's `.mcp.json` path points at `mcp-server/build/index.js` (Step 1 must have been run). Check with `claude mcp list` — it should show `godot ... ✔ Connected`.

**Claude says the godot tools aren't available.**
The `.mcp.json` file must be in the folder where you run `claude` (your Godot project root). Restart Claude Code after creating it.

**"Godot MCP Pro" doesn't show up under Plugins.**
The addon folder must be exactly `your-project/addons/godot_mcp/` with `plugin.cfg` directly inside it (not nested one folder deeper).

**Port conflicts / running two projects at once.**
The server picks the first free port in 6505–6509 automatically. To pin one, set `GODOT_MCP_PORT` in the `.mcp.json` `env` block.

**Something else is broken.**
Ask Claude! e.g. *"Run godot_status and tell me what's wrong with the MCP connection."*

## Going deeper

- [`mcp-server/README.md`](mcp-server/README.md) — server internals, environment variables (`GODOT_MCP_TOOLSET`, connection tokens), and a debug CLI.
- [`mcp-addon/skills.md`](mcp-addon/skills.md) — the full workflow guide covering all tool categories: 2D/3D scenes, scripts, playtesting, animation, UI, tilemaps, shaders, audio, physics, exports, and more.

## License

MIT.
