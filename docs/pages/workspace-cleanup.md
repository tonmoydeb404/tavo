# Workspace Cleanup Script

This repository includes a root-level cleanup script to remove dependency folders, caches, and build artifacts across the monorepo.

## Command

```bash
pnpm run clean:workspace
```

## What it removes

- All `node_modules` directories in the repo
- Common cache/build folders: `.turbo`, `.next`, `.output`, `dist`, `build`, `.cache`, `coverage`
- File caches: `.eslintcache`, `*.tsbuildinfo`

## Source

- Script: `scripts/clean-workspace.sh`
- Package link: root `package.json` script `clean:workspace`
