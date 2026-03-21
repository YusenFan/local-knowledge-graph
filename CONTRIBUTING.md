# Contributing to Local Knowledge Graph

Thank you for your interest in contributing! This document provides guidelines and information for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report:

1. Use a clear and descriptive title
2. Describe the exact steps to reproduce the issue
3. Provide environment details (OS, Node.js version, etc.)
4. Include relevant error messages or logs

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

1. Use a clear and descriptive title
2. Provide a detailed description of the proposed enhancement
3. Explain why the enhancement would be useful
4. Consider providing examples or mockups

### Pull Requests

We welcome pull requests! To contribute:

1. Fork the repository
2. Create a branch for your changes (`git checkout -b feature/amazing-feature`)
3. Commit your changes with clear messages
4. Push to your fork
5. Open a pull request with a clear description of your changes

## Development Setup

### Prerequisites

- Node.js 18+
- Docker (for Memgraph)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YusenFan/local-knowledge-graph.git
cd local-knowledge-graph

# Install dependencies
npm install

# Start Memgraph (Docker)
docker run -d -p 7687:7687 -p 7444:7444 memgraph/memgraph-platform

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development
npm run dev
```

### Project Structure

```
local-knowledge-graph/
├── src/
│   ├── backend/        # Backend API
│   │   ├── scanner/    # File system scanning
│   │   ├── graph/      # Graph database operations
│   │   ├── llm/        # LLM integration
│   │   ├── api/        # API handlers
│   │   └── routes/     # API routes
│   ├── shared/        # Shared types
│   └── frontend/       # Frontend UI
├── markdown-nodes/     # Generated Markdown files
└── public/             # Public assets
```

### Coding Standards

- Use TypeScript with strict mode
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

### Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## Documentation

If you're adding new features, please update:

- README.md (for user-facing changes)
- API documentation (Swagger docs)
- Comments in code (for complex logic)

## Questions?

Feel free to open an issue for questions or discussions.

---

Thank you for contributing! 🐤
