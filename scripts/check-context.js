#!/usr/bin/env node

/**
 * Check Context — SessionStart hook script
 * 
 * Checks if project context exists and outputs status for Claude.
 * stdout is injected into Claude's context at session start.
 * 
 * Usage: (called automatically by SessionStart hook)
 *   node scripts/check-context.js
 */

import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const contextDir = path.join(rootDir, ".claude", "project-context");
const contextFile = path.join(contextDir, "project-context.md");
const treeFile = path.join(contextDir, "tree.json");

if (fs.existsSync(contextFile)) {
  // Context exists — output it for Claude to read
  const content = fs.readFileSync(contextFile, "utf-8");
  const treeData = fs.existsSync(treeFile)
    ? JSON.parse(fs.readFileSync(treeFile, "utf-8"))
    : null;

  const pendingCount = treeData
    ? treeData.files.filter(f => {
        if (f.isBinary) return false;
        return !fs.existsSync(path.join(contextDir, "summaries", f.summaryFile));
      }).length
    : 0;

  console.log(`[SMART CONTEXT] Project context loaded (${treeData?.stats?.totalFiles || "?"} files mapped).`);
  
  if (pendingCount > 0) {
    console.log(`[SMART CONTEXT] ⚠️ ${pendingCount} files still need AI summaries. Run /project:context-init to complete.`);
  }

  // Output the full context so Claude has it
  console.log("");
  console.log(content);
} else {
  // No context yet
  console.log("[SMART CONTEXT] ⚠️ No project context found.");
  console.log("[SMART CONTEXT] This project has not been analyzed yet.");
  console.log("[SMART CONTEXT] Ask the user: 'I notice this project doesn't have a context map yet. Would you like me to scan the project and build one? This helps me understand your codebase faster.'");
  console.log("[SMART CONTEXT] If user agrees, run /project:context-init");
}
