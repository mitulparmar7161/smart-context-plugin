---
description: Predictive project indexing — generate tree, and let AI predict file purposes based on name/path (Zero-Token-Cost)
allowed-tools: Bash, ReadFile, WriteFile
---

## Task
Perform a "Predictive" index of the project. This is designed to be highly cost-effective by mapping the project map WITHOUT reading the contents of every file.

## Steps

1. **Generate the tree**
   Run the fast scanner to map the filesystem:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/generate-tree.js"
   ```

2. **Read the tree data**
   Open the `.claude/project-context/tree.json` file. It contains the list of all files in the project.

3. **Predictive Summarization (AI Work)**
   For EACH file in the tree (process in batches of 10-20 to save input tokens):
   - **DO NOT read the file content.**
   - Instead, look at the file's **path** and **name** (e.g., `src/auth/login.py`).
   - Create a brief, 1-2 line prediction of what this file likely does.
   - Use the format: `[PREDICTIVE] - Purpose: [Your prediction based on name/path]`
   - Write this prediction to `.claude/project-context/summaries/<encoded-path>.md`.

4. **Build Master Context**
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/build-context.js"
   ```

5. **Report Success**
   Tell the user the predictive map is complete. Advise them that you will perform a "Full Deep Scan" for specific files when they ask detailed questions about them.

## Notes
- This is the fastest and cheapest way to index.
- If a file name is ambiguous (e.g., `utils.js`), make your best guess based on the folder it's in.
