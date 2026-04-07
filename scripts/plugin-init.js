#!/usr/bin/env node

/**
 * Plugin Init — Wrapper for SessionStart
 * 
 * Runs the tree generator first, then the context status checker.
 * This ensures the status is based on a fresh scan.
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  // 1. Run Tree Scan (Quiet mode)
  execSync(`node "${path.join(__dirname, "generate-tree.js")}" --quiet`, { stdio: "inherit" });

  // 2. Run Context Check
  execSync(`node "${path.join(__dirname, "check-context.js")}"`, { stdio: "inherit" });
} catch (error) {
  // Silently fail to avoid breaking the Claude Code session startup
}
