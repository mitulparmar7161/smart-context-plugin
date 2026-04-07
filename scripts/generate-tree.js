#!/usr/bin/env node

/**
 * Generate Tree — Fast project scanner
 * 
 * Walks the project directory and generates:
 *   .context/tree.json  — Machine-readable file list with metadata
 *   .context/tree.md    — Visual directory tree for embedding
 * 
 * This is the FAST part — no AI, pure filesystem scan.
 * AI-driven summaries are generated separately by Claude via CLAUDE.md instructions.
 * 
 * Usage:
 *   node scripts/generate-tree.js [--root <path>] [--quiet]
 */

import fs from "fs";
import path from "path";

// ─── Configuration ───────────────────────────────────────────────────────────

const IGNORE_DIRS = new Set([
  "node_modules", ".git", ".hg", ".svn", "build", "dist", "out", "coverage",
  "__pycache__", ".tox", ".mypy_cache", ".pytest_cache", ".next", ".nuxt",
  ".output", "target", "vendor", ".venv", "venv", "env",
  ".idea", ".vscode", ".fleet", "project-context"
]);

const IGNORE_FILES = new Set([
  ".DS_Store", "Thumbs.db", "desktop.ini",
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "composer.lock", "Gemfile.lock", "Pipfile.lock", "poetry.lock",
]);

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg", ".webp",
  ".mp3", ".mp4", ".wav", ".avi", ".mov", ".mkv",
  ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".exe", ".dll", ".so", ".dylib", ".o", ".a",
  ".pyc", ".pyo", ".class", ".jar",
  ".db", ".sqlite", ".sqlite3",
]);

const LANGUAGE_MAP = {
  ".js": "JavaScript", ".jsx": "JavaScript (JSX)", ".mjs": "JavaScript",
  ".ts": "TypeScript", ".tsx": "TypeScript (TSX)", ".mts": "TypeScript",
  ".py": "Python", ".pyw": "Python",
  ".go": "Go", ".rs": "Rust", ".rb": "Ruby",
  ".java": "Java", ".kt": "Kotlin", ".kts": "Kotlin",
  ".swift": "Swift", ".dart": "Dart",
  ".c": "C", ".h": "C/C++ Header",
  ".cpp": "C++", ".cc": "C++", ".hpp": "C++ Header",
  ".cs": "C#", ".php": "PHP",
  ".vue": "Vue", ".svelte": "Svelte",
  ".html": "HTML", ".htm": "HTML",
  ".css": "CSS", ".scss": "SCSS", ".sass": "Sass", ".less": "Less",
  ".json": "JSON", ".jsonc": "JSON",
  ".yaml": "YAML", ".yml": "YAML",
  ".toml": "TOML", ".xml": "XML",
  ".md": "Markdown", ".mdx": "MDX",
  ".sh": "Shell", ".bash": "Shell", ".zsh": "Shell",
  ".ps1": "PowerShell", ".bat": "Batch",
  ".sql": "SQL", ".graphql": "GraphQL", ".gql": "GraphQL",
  ".proto": "Protocol Buffers",
  ".tf": "Terraform", ".hcl": "HCL",
  ".lua": "Lua", ".r": "R",
  ".ex": "Elixir", ".exs": "Elixir",
  ".erl": "Erlang", ".zig": "Zig",
  ".env": "Environment",
};

const SPECIAL_FILES = {
  "Dockerfile": "Dockerfile", "Makefile": "Makefile",
  "Rakefile": "Ruby", "Gemfile": "Ruby",
  "Vagrantfile": "Ruby", "Jenkinsfile": "Groovy",
  "CMakeLists.txt": "CMake",
};

// ─── CLI Parsing ─────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { root: ".", quiet: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--root" && args[i + 1]) opts.root = args[++i];
    else if (args[i] === "--quiet") opts.quiet = true;
  }
  return opts;
}

// ─── Gitignore ───────────────────────────────────────────────────────────────

function loadGitignore(rootDir) {
  const p = path.join(rootDir, ".gitignore");
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf-8").split("\n")
    .map(l => l.trim())
    .filter(l => l && !l.startsWith("#"));
}

function isGitignored(relativePath, patterns) {
  const norm = relativePath.replace(/\\/g, "/");
  const basename = path.basename(norm);
  for (const pat of patterns) {
    const p = pat.replace(/\\/g, "/").replace(/\/$/, "");
    if (basename === p || norm.includes(p + "/") || norm.endsWith(p)) return true;
    if (p.includes("*")) {
      const re = new RegExp("^" + p.replace(/\./g, "\\.").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$");
      if (re.test(basename) || re.test(norm)) return true;
    }
  }
  return false;
}

// ─── Walk ────────────────────────────────────────────────────────────────────

function walkProject(rootDir, gitignorePatterns) {
  const files = [];
  const tree = { name: path.basename(rootDir), children: [] };

  function walk(dirPath, treeNode, depth) {
    if (depth > 20) return;
    let entries;
    try { entries = fs.readdirSync(dirPath, { withFileTypes: true }); } catch { return; }

    entries.sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        if (entry.name.startsWith(".") && entry.name !== ".claude") continue;
        if (isGitignored(relPath, gitignorePatterns)) continue;

        const childNode = { name: entry.name, children: [] };
        treeNode.children.push(childNode);
        walk(fullPath, childNode, depth + 1);
        continue;
      }

      if (IGNORE_FILES.has(entry.name)) continue;
      if (isGitignored(relPath, gitignorePatterns)) continue;

      const ext = path.extname(entry.name).toLowerCase();
      const isBinary = BINARY_EXTENSIONS.has(ext) ||
                       entry.name.endsWith(".min.js") ||
                       entry.name.endsWith(".min.css") ||
                       entry.name.endsWith(".map");

      let stats;
      try { stats = fs.statSync(fullPath); } catch { continue; }
      if (stats.size > 500 * 1024) continue; // Skip files > 500KB

      const language = LANGUAGE_MAP[ext] || SPECIAL_FILES[entry.name] || "Other";
      let lineCount = 0;
      if (!isBinary) {
        try {
          lineCount = fs.readFileSync(fullPath, "utf-8").split("\n").length;
        } catch { lineCount = 0; }
      }

      const fileEntry = {
        path: relPath,
        name: entry.name,
        language,
        lines: lineCount,
        size: stats.size,
        isBinary,
        // summaryFile: the expected path for the AI-generated summary
        summaryFile: relPath.replace(/\//g, "__") + ".md",
      };

      files.push(fileEntry);
      treeNode.children.push({ name: entry.name, file: fileEntry });
    }
  }

  walk(rootDir, tree, 0);
  return { files, tree };
}

// ─── Visual Tree ─────────────────────────────────────────────────────────────

function renderTree(node, prefix = "", isLast = true) {
  let result = "";
  const items = node.children || [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const last = i === items.length - 1;
    const connector = last ? "└── " : "├── ";
    const childPrefix = last ? "    " : "│   ";

    if (item.children) {
      // Directory
      result += `${prefix}${connector}${item.name}/\n`;
      result += renderTree(item, prefix + childPrefix, last);
    } else if (item.file) {
      // File
      const f = item.file;
      const info = f.isBinary ? "[binary]" : `${f.lines} lines`;
      result += `${prefix}${connector}${f.name} (${info})\n`;
    }
  }
  return result;
}

// ─── Entry Points ────────────────────────────────────────────────────────────

function detectEntryPoints(rootDir) {
  const eps = [];
  const pkgPath = path.join(rootDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.main) eps.push({ type: "main", value: pkg.main });
      if (pkg.scripts) {
        for (const [k, v] of Object.entries(pkg.scripts)) {
          eps.push({ type: `npm:${k}`, value: v });
        }
      }
    } catch {}
  }
  for (const f of ["index.js", "index.ts", "main.py", "app.py", "main.go", "main.rs", "manage.py"]) {
    if (fs.existsSync(path.join(rootDir, f))) eps.push({ type: "entry", value: f });
    if (fs.existsSync(path.join(rootDir, "src", f))) eps.push({ type: "entry", value: `src/${f}` });
  }
  return eps;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs();
  const rootDir = path.resolve(opts.root);
  const rootName = path.basename(rootDir);

  if (!opts.quiet) console.log(`📦 Scanning project: ${rootDir}\n`);

  const gitignore = loadGitignore(rootDir);
  const { files, tree } = walkProject(rootDir, gitignore);
  const entryPoints = detectEntryPoints(rootDir);

  // ─── Language Stats ──────────────────────────────────────────────────
  const langStats = {};
  let totalLines = 0;
  let totalSize = 0;
  for (const f of files) {
    langStats[f.language] = (langStats[f.language] || 0) + 1;
    totalLines += f.lines;
    totalSize += f.size;
  }

  // ─── Write .claude/project-context/tree.json ──────────────────────
  const contextDir = path.join(rootDir, ".claude", "project-context");
  const summariesDir = path.join(contextDir, "summaries");
  fs.mkdirSync(summariesDir, { recursive: true });

  const treeData = {
    generatedAt: new Date().toISOString(),
    root: rootDir,
    projectName: rootName,
    stats: {
      totalFiles: files.length,
      totalLines,
      totalSize,
      languages: langStats,
    },
    entryPoints,
    files,
  };

  fs.writeFileSync(
    path.join(contextDir, "tree.json"),
    JSON.stringify(treeData, null, 2),
    "utf-8"
  );

  // ─── Write .context/tree.md ──────────────────────────────────────────
  let treeMd = `# ${rootName}\n\n`;
  treeMd += "```\n";
  treeMd += `${rootName}/\n`;
  treeMd += renderTree(tree);
  treeMd += "```\n";

  fs.writeFileSync(path.join(contextDir, "tree.md"), treeMd, "utf-8");

  // ─── Check which files need summaries ────────────────────────────────
  const needsSummary = [];
  const hasSummary = [];
  for (const f of files) {
    if (f.isBinary) continue;
    const summaryPath = path.join(summariesDir, f.summaryFile);
    if (fs.existsSync(summaryPath)) {
      hasSummary.push(f);
    } else {
      needsSummary.push(f);
    }
  }

  // ─── Output ──────────────────────────────────────────────────────────
  if (!opts.quiet) {
    console.log(`✅ Tree generated: .claude/project-context/tree.json & .claude/project-context/tree.md`);
    console.log(`   📊 ${files.length} files | ${totalLines.toLocaleString()} lines`);
    console.log(`   🗂️  ${Object.keys(langStats).length} languages`);
    console.log(`   📝 ${hasSummary.length} files have summaries`);
    console.log(`   ⏳ ${needsSummary.length} files need AI summaries`);
    
    if (needsSummary.length > 0) {
      console.log(`\n   Files needing summaries:`);
      for (const f of needsSummary.slice(0, 20)) {
        console.log(`     - ${f.path}`);
      }
      if (needsSummary.length > 20) {
        console.log(`     ... and ${needsSummary.length - 20} more`);
      }
    }
  } else {
    // Quiet mode: output JSON summary for hooks
    console.log(JSON.stringify({
      totalFiles: files.length,
      needsSummary: needsSummary.length,
      hasSummary: hasSummary.length,
      contextPath: path.join(contextDir, "project-context.md"),
    }));
  }
}

main();
