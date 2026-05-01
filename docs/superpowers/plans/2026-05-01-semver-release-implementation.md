# Semver Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing non-semver release workflow with an automated semantic versioning system that bumps versions, generates CHANGELOG.md, creates git tags, and publishes GitHub Releases on every push to `main` with releasable commits.

**Architecture:** A single GitHub Actions workflow that scans commits since the last `v*` tag, calculates semver bumps from conventional commit types, updates `package.json`, generates a `CHANGELOG.md` section, commits with `[skip ci]` to prevent loops, pushes the tag, and creates a GitHub Release.

**Tech Stack:** GitHub Actions (bash shell steps), `softprops/action-gh-release@v2`, `actions/checkout@v4`

---

### File Map

| File | Action | Responsibility |
|---|---|---|
| `.github/workflows/release-on-main.yml` | Replace | Entire new semver workflow (replaces existing non-semver version) |
| `CHANGELOG.md` | Created by workflow | Auto-generated changelog, not manually created |
| `package.json` | Modified by workflow | Version field auto-updated |

---

### Task 1: Replace `release-on-main.yml` with Semver Workflow

**Files:**
- Modify: `.github/workflows/release-on-main.yml` (replace entire file)

- [ ] **Step 1: Replace workflow content**

Replace the entire `.github/workflows/release-on-main.yml` with:

```yaml
name: Semver Release

on:
  push:
    branches:
      - main

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: true

      - name: Calculate version bump and changelog
        id: bump
        shell: bash
        run: |
          # Find previous tag
          PREV_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

          # Collect commits since last tag
          if [ -z "$PREV_TAG" ]; then
            COMMITS=$(git log --format="%H %s" --no-merges)
          else
            COMMITS=$(git log ${PREV_TAG}..HEAD --format="%H %s" --no-merges)
          fi

          if [ -z "$COMMITS" ]; then
            echo "No new commits since last tag"
            echo "skip=true" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          echo "skip=false" >> "$GITHUB_OUTPUT"

          # Filter releasable commits (feat, fix, feat!, BREAKING CHANGE)
          RELEASABLE=""
          BREAKING=""
          FEATURES=""
          FIXES=""
          HAS_BREAKING=false
          HAS_FEAT=false
          HAS_FIX=false

          while IFS= read -r line; do
            HASH=$(echo "$line" | awk '{print $1}')
            SUBJECT=$(echo "$line" | cut -d' ' -f2-)
            BODY=$(git log -1 --format="%b" "$HASH")

            if echo "$SUBJECT" | grep -q "^feat!:"; then
              HAS_BREAKING=true
              HAS_FEAT=true
              DESC=$(echo "$SUBJECT" | sed 's/^feat![: ]*//')
              BREAKING="${BREAKING}- ${DESC}
          "
              continue
            fi

            if echo "$BODY" | grep -q "BREAKING CHANGE"; then
              HAS_BREAKING=true
              DESC=$(echo "$SUBJECT" | sed 's/^fix\!\{0,1\}[: ]*//;s/^feat\!\{0,1\}[: ]*//;s/^.*: *//')
              BREAKING="${BREAKING}- ${DESC}
          "
              continue
            fi

            if echo "$SUBJECT" | grep -q "^feat:"; then
              HAS_FEAT=true
              DESC=$(echo "$SUBJECT" | sed 's/^feat[: ]*//')
              FEATURES="${FEATURES}- ${DESC}
          "
              continue
            fi

            if echo "$SUBJECT" | grep -q "^fix:"; then
              HAS_FIX=true
              DESC=$(echo "$SUBJECT" | sed 's/^fix[: ]*//')
              FIXES="${FIXES}- ${DESC}
          "
              continue
            fi
          done <<< "$COMMITS"

          if [ "$HAS_BREAKING" = false ] && [ "$HAS_FEAT" = false ] && [ "$HAS_FIX" = false ]; then
            echo "No releasable commits"
            echo "skip=true" >> "$GITHUB_OUTPUT"
            exit 0
          fi

          # Calculate bump
          CURRENT_VERSION=$(node -p "require('./package.json').version")
          IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

          if [ "$HAS_BREAKING" = true ]; then
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
          elif [ "$HAS_FEAT" = true ]; then
            MINOR=$((MINOR + 1))
            PATCH=0
          elif [ "$HAS_FIX" = true ]; then
            PATCH=$((PATCH + 1))
          fi

          NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
          echo "version=${NEW_VERSION}" >> "$GITHUB_OUTPUT"
          echo "current_version=${CURRENT_VERSION}" >> "$GITHUB_OUTPUT"

          # Generate changelog section
          CHANGELOG=""
          if [ "$HAS_BREAKING" = true ]; then
            CHANGELOG="${CHANGELOG}### Breaking Changes
          ${BREAKING}
          "
          fi
          if [ "$HAS_FEAT" = true ]; then
            CHANGELOG="${CHANGELOG}### Features
          ${FEATURES}
          "
          fi
          if [ "$HAS_FIX" = true ]; then
            CHANGELOG="${CHANGELOG}### Bug Fixes
          ${FIXES}
          "
          fi

          # Write changelog section to temp file (for multi-line output)
          RELEASE_DATE=$(date -u +"%Y-%m-%d")
          CHANGELOG_SECTION="## [${NEW_VERSION}] - ${RELEASE_DATE}

          ${CHANGELOG}"
          echo "$CHANGELOG_SECTION" > /tmp/changelog_section.md

          # Write multiline body using a file (GITHUB_OUTPUT struggles with newlines)
          echo "body_file=/tmp/changelog_section.md" >> "$GITHUB_OUTPUT"

      - name: Update package.json and CHANGELOG.md
        if: steps.bump.outputs.skip != 'true'
        shell: bash
        run: |
          NEW_VERSION="${{ steps.bump.outputs.version }}"

          # Update package.json
          node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
            pkg.version = '${NEW_VERSION}';
            fs.writeFileSync('./package.json', JSON.stringify(pkg, null, '\t') + '\n');
          "

          # Prepend to CHANGELOG.md
          if [ -f CHANGELOG.md ]; then
            CONTENT=$(cat CHANGELOG.md)
            echo "$CONTENT" > /tmp/changelog_rest.md
          else
            echo "# Changelog" > /tmp/changelog_rest.md
            echo "" >> /tmp/changelog_rest.md
          fi

          cat /tmp/changelog_section.md /tmp/changelog_rest.md > CHANGELOG.md

          # Configure git
          git config user.name "dan"
          git config user.email "hello@danfarr.com"

          # Commit
          git add package.json CHANGELOG.md
          git commit -m "chore(release): v${NEW_VERSION} [skip ci]"

          # Push to main
          git push origin main

          # Create and push tag
          git tag "v${NEW_VERSION}"
          git push origin "v${NEW_VERSION}"

          echo "Released v${NEW_VERSION}"

      - name: Create GitHub Release
        if: steps.bump.outputs.skip != 'true'
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ steps.bump.outputs.version }}
          name: Release v${{ steps.bump.outputs.version }}
          body_path: /tmp/changelog_section.md
          make_latest: true
          generate_release_notes: false
```

- [ ] **Step 2: Verify YAML is valid**

Run a quick syntax check:
```bash
node -e "
const fs = require('fs');
const yaml = fs.readFileSync('.github/workflows/release-on-main.yml', 'utf8');
// Basic check - file is non-empty and starts with 'name:'
if (!yaml.startsWith('name:') || yaml.length < 100) {
  console.error('Invalid YAML: file does not start with name: or is too short');
  process.exit(1);
}
console.log('YAML looks valid (basic check passed)');
"
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release-on-main.yml
git commit -m "feat: replace release workflow with automated semver system"
```

---

### Task 2: Push to Trigger First Release

**Note:** After Task 1 commits, pushing to main will trigger the new workflow. Since there are `feat:` commits between the current state and the (non-existent) first `v*` tag, it should create `v0.2.0` (current version is `0.1.0`, `feat:` triggers minor bump).

- [ ] **Step 1: Push workflow change to main**

Use the `gh` token for auth:
```bash
git remote set-url origin "https://x-access-token:$(gh auth token)@github.com/danfarrdotcom/figma-mcp-but-free.git"
git push origin main
```

- [ ] **Step 2: Monitor workflow run**

```bash
gh run list --limit 3
```

Check the most recent run:
```bash
gh run view --log-failed $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
```

- [ ] **Step 3: Verify results**

After workflow completes (takes ~30 seconds):
```bash
# Check git tags
git fetch --tags
git tag -l

# Check GitHub releases
gh release list --limit 3

# Check CHANGELOG.md was created
git pull
cat CHANGELOG.md

# Check package.json version
node -p "require('./package.json').version"
```

Expected:
- Tag `v0.2.0` exists
- GitHub Release "Release v0.2.0" exists with changelog body
- `CHANGELOG.md` exists with `## [0.2.0]` section
- `package.json` version is `0.2.0`
- `CHANGELOG.md` and updated `package.json` are committed to main

---

### Task 3: Verify `[skip ci]` Prevents Loops

- [ ] **Step 1: Check workflow runs**

The `[skip ci]` in the release commit message should prevent a second workflow run:
```bash
gh run list --limit 5 --json headBranch,conclusion,status
```

Expected: Only one workflow run from the initial push, not a second one from the `[skip ci]` commit.

- [ ] **Step 2: Verify no duplicate releases**

```bash
gh release list --limit 5
```

Expected: Only one release (v0.2.0), not duplicates.
