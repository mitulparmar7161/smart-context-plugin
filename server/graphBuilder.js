import fs from "fs";
import path from "path";

export function buildGraph(root = ".") {
  const graph = { nodes: [], edges: [] };

  // Common file extensions to process
  const supportedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json']);

  function walk(dir) {
    try {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const full = path.join(dir, file);

        // Skip common directories
        if (file === 'node_modules' || file === '.git' || file === 'build' || file === 'dist' || file === 'coverage') {
          continue;
        }

        const stats = fs.statSync(full);

        if (stats.isDirectory()) {
          walk(full);
        } else if (stats.isFile()) {
          const ext = path.extname(file);

          // Only process supported file types
          if (supportedExtensions.has(ext)) {
            try {
              const content = fs.readFileSync(full, "utf-8");

              graph.nodes.push({
                id: file,
                summary: "Lines: " + content.split("\n").length,
                path: full,
                extension: ext
              });

              // More robust regex for import statements
              const importRegex = /(?:import\s+.*?from\s+['"](.*?)(?:\.js)?['"]|import\s+['"](.*?)(?:\.js)?['"])/g;
              let match;

              while ((match = importRegex.exec(content))) {
                const importedFile = match[1] || match[2];
                // Skip relative paths that are not file references
                if (importedFile && !importedFile.startsWith('.')) {
                  graph.edges.push({
                    from: file,
                    to: path.basename(importedFile)
                  });
                }
              }
            } catch (readError) {
              // Skip files that can't be read
              console.warn(`Warning: Could not read file ${full}: ${readError.message}`);
            }
          }
        }
      }
    } catch (readError) {
      console.error(`Error reading directory ${dir}: ${readError.message}`);
      throw readError;
    }
  }

  walk(root);

  // Ensure memory directory exists
  const memoryDir = "memory";
  if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
  }

  fs.writeFileSync(path.join(memoryDir, "graph.json"), JSON.stringify(graph, null, 2));
}