import fs from "fs";
import path from "path";

export function analyzeImpact(file) {
  const memoryDir = "memory";
  const graphPath = path.join(memoryDir, "graph.json");

  // Check if graph file exists
  if (!fs.existsSync(graphPath)) {
    return [];
  }

  try {
    const graphContent = fs.readFileSync(graphPath, "utf-8");
    const graph = JSON.parse(graphContent);

    return graph.edges
      .filter(e => e.to === file)
      .map(e => e.from);
  } catch (error) {
    console.error(`Error analyzing impact for ${file}: ${error.message}`);
    return [];
  }
}