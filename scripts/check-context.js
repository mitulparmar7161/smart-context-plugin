#!/usr/bin/env node

/**
 * Check Context — SessionStart hook script
 * 
 * Checks if project context exists and outputs status for Claude.
 * stdout is injected into Claude's context at session start.
 * 
 * Includes a breakdown of Predictive vs Full summaries to monitor token usage.
 */

import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const contextDir = path.join(rootDir, ".claude", "project-context");
const contextFile = path.join(contextDir, "project-context.md");
const treeFile = path.join(contextDir, "tree.json");

if (fs.existsSync(contextFile)) {
  const content = fs.readFileSync(contextFile, "utf-8");
  const treeData = fs.existsSync(treeFile)
    ? JSON.parse(fs.readFileSync(treeFile, "utf-8"))
    : null;

  const summariesDir = path.join(contextDir, "summaries");
  const filesWithSummaries = fs.existsSync(summariesDir) ? fs.readdirSync(summariesDir) : [];
  
  let fullCount = 0;
  let predictiveCount = 0;

  for (const f of filesWithSummaries) {
    if (!f.endsWith(".md")) continue;
    try {
      const c = fs.readFileSync(path.join(summariesDir, f), "utf-8");
      if (c.includes("[FULL]")) fullCount++;
      else if (c.includes("[PREDICTIVE]")) predictiveCount++;
    } catch {}
  }

  const totalFiles = treeData?.stats?.totalFiles || 0;
  const predictiveRemaining = totalFiles - (fullCount + predictiveCount);

  console.log(`[SMART CONTEXT] Project context loaded (${totalFiles} files).`);
  console.log(`[SMART CONTEXT] Memory depth: ${fullCount} FULL | ${predictiveCount} PREDICTIVE.`);
  
  if (predictiveRemaining > 0 && totalFiles > 0) {
    console.log(`[SMART CONTEXT] ℹ️ ${predictiveRemaining} files have no summary yet. Index required.`);
  }

  // Output the full context so Claude has it
  console.log("");
  console.log(content);
} else {
  console.log("[SMART CONTEXT] ⚠️ No project context found. AUTO-INITIALIZATION REQUIRED.");
  console.log("[SMART CONTEXT] Use your 'project-context' skill to run /project:context-init immediately.");
}
