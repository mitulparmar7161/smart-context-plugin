import express from "express";
import { buildGraph } from "./graphBuilder.js";
import { analyzeImpact } from "./impactAnalyzer.js";
import { generateHTML } from "./visualizer.js";

const app = express();
app.use(express.json());

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

app.post("/build_graph", (req, res) => {
  try {
    buildGraph(".");
    res.json({ ok: true });
  } catch (error) {
    console.error("Error building graph:", error);
    res.status(500).json({ error: "Failed to build graph" });
  }
});

app.post("/impact", (req, res) => {
  try {
    const file = req.body.file;
    if (!file) {
      return res.status(400).json({ error: "File parameter is required" });
    }
    const result = analyzeImpact(file);
    res.json(result);
  } catch (error) {
    console.error("Error analyzing impact:", error);
    res.status(500).json({ error: "Failed to analyze impact" });
  }
});

app.post("/visualize", (req, res) => {
  try {
    generateHTML();
    res.json({ ok: true });
  } catch (error) {
    console.error("Error generating visualization:", error);
    res.status(500).json({ error: "Failed to generate visualization" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Add a route to get all available endpoints
app.get("/endpoints", (req, res) => {
  res.json({
    endpoints: [
      { path: "/build_graph", method: "POST", description: "Build file dependency graph" },
      { path: "/impact", method: "POST", description: "Analyze impact of changes" },
      { path: "/visualize", method: "POST", description: "Generate HTML visualization" },
      { path: "/health", method: "GET", description: "Health check endpoint" }
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Smart Context Plugin server running on port ${PORT}`);
});