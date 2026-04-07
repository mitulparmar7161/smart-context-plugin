---
description: Full project scan — generate tree, read all files, write AI summaries, and build master context
allowed-tools: Bash, ReadFile, WriteFile
---

## Task
Initialize or completely rebuild the project context from scratch.
You will scan the tree, read every unsummarized file, write a summary for it, and then build the master context.

## Steps

1. **Generate the tree**
   Run the fast scanner to map the filesystem:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/generate-tree.js"
   ```

2. **Read the tree data**
   Look at the `.claude/project-context/tree.json` file. It contains an array of `files`.
   Identify all files that need summaries (skip binary files and files > 500 lines if there are too many).

3. **Generate Summaries (AI Work)**
   For EACH file that needs a summary (process in batches of 5-10 if there are many):
   - Read the file content
   - Create a summary following the exact format from `CLAUDE.md`
   - Write the summary to `.claude/project-context/summaries/<encoded-path>.md`
     *(The `<encoded-path>` is the relative path with `/` replaced by `__`, plus `.md`. e.g., `src/app.js` -> `src__app.js.md`)*

4. **Build Master Context**
   Once all summaries are written, compile everything into the master context file:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/build-context.js"
   ```

5. **Report Success**
   Tell the user the context is fully initialized and summarize what you found.

## Performance Note
If this is a massive project (>20 source files), prioritize the entry points (`index.js`, `main.py`, etc.), core business logic, and configuration files first. You can do the rest incrementally later.
