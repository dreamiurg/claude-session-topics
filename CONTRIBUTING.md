# Contributing to Claude Session Topics

Thank you for your interest in contributing! This document provides guidelines
for contributing to the project.

## Development Setup

### Prerequisites

- Bash 4.0+
- Node.js (LTS version)
- Pre-commit (`pip install pre-commit`)
- ShellCheck (`brew install shellcheck` or `apt install shellcheck`)
- shfmt (`brew install shfmt` or `go install mvdan.cc/sh/v3/cmd/shfmt@latest`)
- Gitleaks (`brew install gitleaks`)
- markdownlint-cli2 (`npm install -g markdownlint-cli2`)

### Setup

1. Fork and clone the repository
2. Install pre-commit hooks:

   ```bash
   pre-commit install --install-hooks
   ```

3. Configure git commit template:

   ```bash
   git config commit.template .gitmessage
   ```

## Code Style

### Shell Scripts

- Use Bash with `set -uo pipefail`
- Follow [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- Use 4-space indentation (enforced by shfmt)
- Pass ShellCheck with no warnings

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/fixing tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all pre-commit hooks pass
4. Write clear commit messages
5. Open a Pull Request with:
   - Clear description of changes
   - Link to any related issues
   - Testing instructions if applicable

## Testing

Before submitting:

1. Test scripts manually:

   ```bash
   # Test topic generation
   echo '{"session_id":"00000000-0000-0000-0000-000000000000"}' | ./scripts/topic-generator

   # Test display
   ./scripts/topic-display 00000000-0000-0000-0000-000000000000
   ```

2. Run linters:

   ```bash
   shellcheck -x scripts/* lib/*
   ```

3. Check formatting:

   ```bash
   shfmt -d scripts/* lib/*
   ```

## Security

- Never commit secrets or credentials
- Use Gitleaks to check for accidental secret commits
- Report security vulnerabilities privately via GitHub Security Advisories

## Questions?

Open an issue for questions or discussions about the project.
