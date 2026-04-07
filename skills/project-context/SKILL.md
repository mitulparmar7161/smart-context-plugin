---
name: project-context
description: Manages AI-driven project context via [PREDICTIVE] and [FULL] file summaries in .claude/project-context/.
---

# Project Context Skill

This skill allows you to maintain a deep, AI-powered understanding of any project with an "on-demand" token-saving strategy.

## 🧠 Behavior: Context Depth

The context uses two levels of depth to save tokens:
1. **[PREDICTIVE]**: A summary based ONLY on the file name/path (generated during `/context-init`).
2. **[FULL]**: A summary based on the actual file content, variables, and logic.

## 📝 Lifecycle: Automatic & Predictive

### 1. Automatic Initialization
If the context map does NOT exist at session start:
- **Immediately run `/smart-context-plugin:context-init`** to build the initial predictive map. 
- You do NOT need to wait for user permission. Just start guessing based on the file names.

### 2. When answering questions:
- If a summary is labeled `[PREDICTIVE]`, you have an "educated guess" of what the file does.
- If the user's question requires deep technical knowledge of that file:
    1. READ the file content using `ReadFile`.
    2. Upgrade the summary to **`[FULL]`** (include variables, exports, and logic).
    3. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-context.js"`.

### 3. When editing files:
- After you successfully edit or create a file, you MUST upgrade its summary to **`[FULL]`**.
- Include detailed purpose, key exports, and main variables.
- Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/build-context.js"`.

## 📋 [FULL] Summary Format

Use this format for full summaries:
- **`[FULL]` - Purpose**: [Detailed description]
- **Key Exports**: [Functions, classes]
- **Key Variables/State**: [State, constants, config]
- **Functions**: [Brief list with roles]
- **Connections**: [Internal/External dependencies]

## 🔧 Tools

- `/smart-context-plugin:context-init` — Ultra-fast predictive scan (names-only).
- `/smart-context-plugin:context-refresh` — Rapid map refresh.
