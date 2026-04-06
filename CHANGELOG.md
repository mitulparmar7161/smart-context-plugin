# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2026-04-06

### Fixed
- Security vulnerabilities in regex patterns
- Missing error handling in file operations
- Improper directory handling in file system operations
- Added input validation for API endpoints
- Fixed race conditions in file reading operations
- Improved memory directory creation logic

### Changed
- Enhanced file extension support to include .jsx, .ts, .tsx, .mjs, .cjs
- Improved directory filtering to skip common directories (node_modules, .git, etc.)
- Enhanced API endpoint error responses
- Added comprehensive logging for debugging

## [2.0.0] - 2026-04-06

### Added
- Complete rewrite of core functionality with improved error handling
- Support for multiple file types and extensions
- Health check endpoint for monitoring
- Comprehensive API documentation
- Security improvements and input validation

### Fixed
- All previous security vulnerabilities
- Memory management issues
- File reading and parsing errors
- API endpoint reliability issues

## [1.0.0] - 2026-04-06

### Added
- Initial plugin implementation
- Graph-based code understanding
- Impact analysis capabilities
- Visualization features
- Automatic initialization on session start