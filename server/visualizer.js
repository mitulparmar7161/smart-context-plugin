import fs from "fs";
import path from "path";

export function generateHTML() {
  const memoryDir = "memory";
  const graphPath = path.join(memoryDir, "graph.json");
  const htmlPath = path.join(memoryDir, "graph.html");

  // Check if graph file exists
  if (!fs.existsSync(graphPath)) {
    return;
  }

  try {
    const graphContent = fs.readFileSync(graphPath, "utf-8");
    const graph = JSON.parse(graphContent);

    let html = "<!DOCTYPE html><html><head><title>Code Graph</title></head><body>";
    html += "<h2>Graph</h2><ul>";

    graph.edges.forEach(e => {
      html += "<li>" + e.from + " → " + e.to + "</li>";
    });

    html += "</ul></body></html>";

    // Ensure memory directory exists
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }

    fs.writeFileSync(htmlPath, html);
  } catch (error) {
    console.error(`Error generating HTML: ${error.message}`);
  }
}