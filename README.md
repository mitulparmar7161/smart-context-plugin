# Smart Context Plugin for Claude Code (AI-Driven)

> **Intelligent, AI-powered project context management.** This plugin doesn't just scan files; it uses Claude to understand what every file does and how they work together.

## How it works

Unlike static scanners, this plugin uses a two-phase approach:

1.  **Fast Scan**: A Node.js script rapidly maps your directory structure into `.context/tree.json`.
2.  **AI Analysis**: Claude reads each file and generates a concise, high-level summary (`.context/summaries/*.md`) explaining the file's purpose, key variables, and exports.
3.  **Master Context**: All summaries are combined with the file tree into `.context/project-context.md`, which Claude reads at the start of every session.

### The AI Advantage
- **Automatic Updates**: When you change a file, Claude automatically updates that file's specific summary.
- **Deep Understanding**: The context includes *why* a file exists and how its main variables function.
- **Smart Onboarding**: If a project has no context, Claude will notice and ask if you want to initialize it.

## Features

- **Tree-based mapping**: Visual representation of your project structure.
- **Per-file summaries**: AI-generated context for every source file.
- **Self-healing context**: Automatically updates when files are created, modified, or deleted.
- **Language-agnostic**: Works with any language Claude understands.

## Installation

### 1. Copy to your project
Copy these three items into your project root:
- `scripts/` folder
- `.claude/` folder
- `CLAUDE.md` file

### 2. Basic Configuration
Ensure you have Node.js installed. No extra `npm install` is required as it uses built-in modules.

## Commands

| Command | Description |
| :--- | :--- |
| `/project:context-init` | Performs a full project scan, reads every file, and generates AI summaries. |
| `/project:context-refresh` | Quickly rebuilds the master context from existing summaries and tree data. |

## Automation

- **Session Start**: Whenever you start a Claude Code session, the plugin checks for context and loads it.
- **File Changes**: Claude is instructed (via `CLAUDE.md`) to update the relevant `.context/summaries/*.md` file whenever a change is made.

## Directory Structure

```
your-project/
├── .claude/
│   ├── settings.json          # Hook configuration
│   └── commands/              # Slash commands
├── .context/                  # [GENERATED]
│   ├── tree.json              # Filesystem map
│   ├── tree.md                # Visual tree
│   ├── summaries/             # Individual AI summaries
│   └── project-context.md     # The master context Claude reads
├── scripts/                   # Plugin logic
└── CLAUDE.md                  # Brain instructions for Claude
```

## Requirements

- Node.js 16+
- Claude Code

## License

MIT