---
description: Re-scan tree and rebuild master context from existing summaries (without generating new AI summaries)
allowed-tools: Bash
---

## Task
Refresh the project context quickly by rescanning the filesystem and rebuilding the master context file using only the summaries that already exist.

## Steps

1. **Generate the tree**
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/generate-tree.js"
   ```

2. **Build Master Context**
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/build-context.js"
   ```

3. **Report Status**
   Read `.claude/project-context/project-context.md` (the bottom footer) and report how many files currently have summaries versus how many are pending.
