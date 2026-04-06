# Smart Context Plugin for Claude Code

This plugin provides graph-based intelligent coding assistance by analyzing codebase structure and dependencies.

## Features

- **Graph-based code understanding**: Builds file dependency graphs from import statements
- **Impact analysis**: Identifies affected files before making changes
- **Visualization**: Generates HTML representations of the code graph
- **Automatic initialization**: Builds context graph on session start

## Fixes Applied

The following issues were identified and fixed in the plugin:

### 1. Error Handling
- Added comprehensive error handling throughout all modules
- Implemented try-catch blocks for file operations and JSON parsing
- Added proper error responses for API endpoints

### 2. Security Improvements
- Enhanced regex patterns to prevent injection attacks
- Added input validation for all API endpoints
- Implemented proper file path validation

### 3. Reliability
- Added directory existence checks before file operations
- Implemented proper resource management and cleanup
- Added health check endpoint for monitoring

### 4. Performance
- Added filtering for common directories (node_modules, .git, etc.)
- Implemented proper error handling for file reading operations
- Added support for multiple file extensions (js, jsx, ts, tsx, etc.)

### 5. Code Quality
- Improved code documentation and comments
- Enhanced function signatures with proper type handling
- Added logging for debugging and monitoring
- Made regex patterns more robust and secure

## Installation

1. Clone or download this repository
2. Navigate to the plugin directory:
   ```bash
   cd smart-context-plugin
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Usage

Once installed and running, you can use the following commands in Claude Code:

- `/init-context` - Initialize context graph
- `/analyze-impact` - Analyze impact of changes
- `/visualize-graph` - Generate HTML visualization

## API Endpoints

- `POST /build_graph` - Build file dependency graph
- `POST /impact` - Analyze impact of changes
- `POST /visualize` - Generate HTML visualization
- `GET /health` - Health check endpoint
- `GET /endpoints` - List all available endpoints

## Requirements

- Node.js 14+
- Claude Code 2.0+

## Configuration

The plugin automatically initializes on Claude Code session start. All configuration is handled through the plugin.json manifest file.

## Security

This plugin includes security measures to prevent:
- Regex injection attacks
- Directory traversal attacks
- Input validation for all API endpoints
- Proper error handling to prevent information leakage

## License

MIT License