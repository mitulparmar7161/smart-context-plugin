---
name: project-context
description: Manages AI-driven project context via file summaries and directory trees. Use this to maintain and consult deep project memory within .claude/project-context/.
---

# Project Context Skill

This skill allows you to maintain a deep, AI-powered understanding of any project by managing file summaries and a visual map.

## 🧠 Behavior: Using Context

**Before ANY task** — reading, editing, or creating files — check `.claude/project-context/project-context.md` first.

If the context map does NOT exist at session start:
1. Tell the user: *"I notice this project doesn't have a context map yet. Would you like me to scan the project and build one? This helps me understand your codebase faster."*
2. If they agree, run `/smart-context-plugin:context-init`.

## 📝 Mandatory: Self-Updating Memory

**Every time you change the code**, you MUST update the project memory.

### After EDITING a file:
1. Update the summary at `.claude/project-context/summaries/<encoded-path>.md`.
   - *Encoded path: replace `/` with `__`. e.g., `src/app.js` -> `src__app.js.md`.*
2. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-context.js"` to rebuild the master file.

### After CREATING a new file:
1. Create a new summary in `.claude/project-context/summaries/`.
2. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/generate-tree.js" --quiet` and then `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-context.js"`.

### After DELETING a file:
1. Delete its summary file.
2. Run the tree and build scripts (from `${CLAUDE_PLUGIN_ROOT}/scripts/`) to refresh the context.

## 📋 Summary Format

Use this format for per-file summaries:
- **Purpose**: [What this file does]
- **Key Exports**: [Functions, classes, variables]
- **Key Variables/State**: [Important control variables]
- **Functions**: [Brief list of main functions and their roles]
- **Connections**: [Relationships to other files]

## 🔧 Tools

- `/smart-context-plugin:context-init` — Full scan and initialization.
- `/smart-context-plugin:context-refresh` — Rapid map refresh.
