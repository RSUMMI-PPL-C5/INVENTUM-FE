# Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Breaking Changes

Breaking changes should be indicated by:
1. Adding `!` after the type/scope: `feat(api)!: remove deprecated endpoints`
2. Adding `BREAKING CHANGE:` in the footer: 
   ```
   feat(api): change authentication method
   
   BREAKING CHANGE: Authentication now requires API key instead of username/password
   ```

## Examples

```
feat(auth): add ability to login with Google

fix(dashboard): correct calculation in sales chart

docs: update README with new deployment instructions

feat(api)!: remove support for legacy API endpoints

refactor(core): simplify error handling logic
```

## Version Bumping

Following semantic versioning:
- `fix:` commits trigger a PATCH release (1.0.0 → 1.0.1)
- `feat:` commits trigger a MINOR release (1.0.0 → 1.1.0)
- `BREAKING CHANGE:` or `type!:` triggers a MAJOR release (1.0.0 → 2.0.0)