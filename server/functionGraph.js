import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";

export function buildFunctionGraph(file) {
  try {
    const content = fs.readFileSync(file, "utf-8");

    const ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript"]
    });

    const funcs = [];

    for (const node of ast.program.body) {
      if (node.type === "FunctionDeclaration") {
        if (node.id) {
          funcs.push(node.id.name);
        }
      } else if (node.type === "VariableDeclaration") {
        // Handle const/let function assignments
        for (const decl of node.declarations) {
          if (decl.init && (decl.init.type === "ArrowFunctionExpression" || decl.init.type === "FunctionExpression")) {
            if (decl.id && decl.id.name) {
              funcs.push(decl.id.name);
            }
          }
        }
      }
    }

    // Ensure memory directory exists
    const memoryDir = "memory";
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }

    fs.writeFileSync(path.join(memoryDir, "function_graph.json"), JSON.stringify(funcs, null, 2));
  } catch (error) {
    console.error(`Error building function graph for ${file}: ${error.message}`);
  }
}