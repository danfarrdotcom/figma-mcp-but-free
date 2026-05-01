# Semver Release Strategy Design

## Overview

Replace the existing "release on every push" workflow with an automated semantic versioning (semver) system that:

- Automatically detects releasable conventional commits on every push to `main`
- Bumps `package.json` version according to commit types
- Generates and maintains `CHANGELOG.md`
- Creates and pushes git tags
- Publishes GitHub Releases with changelog content
- Requires zero manual steps beyond pushing to `main`

## Conventional Commit Types → Semver Bump

| Commit prefix | Bump type |
|---|---|
| `feat!:` or body contains `BREAKING CHANGE` | major |
| `feat:` | minor |
| `fix:` | patch |
| `docs:`, `chore:`, `refactor:`, `test:`, `style:`, `ci:`, `perf:`, `build:`, `revert:` | no bump |

The highest precedence bump wins. A single `feat!:` in a batch overrides multiple `fix:` commits.

## CHANGELOG.md Format

```markdown
# Changelog

## [0.2.0] - 2026-05-01

### Features
- refactor prompt and tool registration functions
- add GitHub Actions workflow for automated release

### Bug Fixes
- improve null checks and default values in design context

## [0.1.0] - 2026-04-09

### Initial release
```

On first release, the file is created with the header. Subsequent releases prepend a new section.

## Workflow Architecture

Single workflow: `.github/workflows/release-on-main.yml` (replaces existing).

### Trigger
```yaml
on:
  push:
    branches:
      - main
```

### Steps

1. **Checkout** repo with full history (needed for `git log` diffing)
2. **Identify previous tag** — find latest `v*` tag using `git describe --tags --abbrev=0 2>/dev/null`. If none exists, scan all commits.
3. **Collect commits** — `git log <previous_tag>..HEAD --oneline`
4. **Filter releasable commits** — grep for `^feat:`, `^feat!:`, `^fix:`, and scan for `BREAKING CHANGE` in commit bodies
5. **Early exit** — if no releasable commits, exit with code 0 silently
6. **Calculate bump** — determine major/minor/patch from highest-precedence commit type
7. **Calculate new version** — read current `package.json` version, apply bump
8. **Update `package.json`** — use `node -p` to set the new version field
9. **Generate CHANGELOG section** — format grouped commits by type
10. **Prepend to `CHANGELOG.md`** — create file if first release, otherwise insert after existing `# Changelog` header
11. **Configure git identity** — `git config user.name "dan"` and `git config user.email "hello@danfarr.com"`
12. **Commit changes** — `git commit -m "chore(release): vX.Y.Z [skip ci]"`
13. **Push to main** — use `https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/...` to push past macOS keychain caching
14. **Create tag** — `git tag vX.Y.Z`
15. **Push tag** — `git push origin vX.Y.Z`
16. **Create GitHub Release** — use `softprops/action-gh-release@v2` with the changelog section as the release body

### [skip ci] Strategy

The commit message includes `[skip ci]` which GitHub Actions respects. This prevents the version bump commit from re-triggering the workflow, avoiding infinite loops.

## Token & Auth

The workflow uses `secrets.GITHUB_TOKEN` (auto-provided by GitHub Actions) for:
- Pushing the version bump commit back to `main`
- Pushing the new tag
- Creating the GitHub Release (via `action-gh-release`)

The `GITHUB_TOKEN` has `contents: write` permission, sufficient for all three operations.

## Edge Cases

| Scenario | Behavior |
|---|---|
| No previous `v*` tag exists | Scan all commits on `main` |
| Tag already has a GitHub Release | Workflow fails with error (handled by `action-gh-release`) |
| No releasable commits since last tag | Exit silently (no release, no noise) |
| `package.json` version doesn't match last tag | Workflow uses the `package.json` version as the baseline for bumping, not the tag name |
| Concurrent pushes to main | GitHub serializes workflow runs; last one wins |
| Push contains only non-releasable commits | Exit silently |

## Files Changed

### New files
- `CHANGELOG.md` — created on first release
- `.github/workflows/release-on-main.yml` — replaced with new workflow

### Modified files
- `package.json` — version field updated on each release

### Removed files
- `.github/workflows/release-on-main.yml` (existing non-semver version) — replaced in place

## Success Criteria

1. Pushing releasable commits to `main` automatically creates a GitHub Release with correct semver tag
2. `CHANGELOG.md` is updated and committed back to `main`
3. `package.json` version is kept in sync
4. Pushing non-releasable commits (docs, chore, refactor) does not trigger a release
5. Workflow completes without errors on first release (no prior tags)
6. `[skip ci]` prevents infinite workflow loops
