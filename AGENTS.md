# AGENTS.md

## Cursor Cloud specific instructions

This is the Adobe **React Spectrum** monorepo (React Spectrum, React Aria, React Stately, Internationalized). It is a library/component monorepo managed with **Yarn 4** (`packageManager: yarn@4.13.0`, via `.yarnrc.yml` `yarnPath`) and Lerna workspaces. There is no long-running "backend" service — the primary way to run and demo the code is **Storybook**. Standard commands live in `package.json` `scripts` and `CONTRIBUTING.md`; only the non-obvious notes are captured here.

### Node version (important, non-obvious)
- The project requires **Node 24** (`.nvmrc` = `24`; build tooling like Parcel can crash on other versions — see `CONTRIBUTING.md`).
- The Cloud VM's default `node` on `PATH` (`/exec-daemon/node`) is Node 22. To make Node 24 win durably, Node 24 binaries (`node`/`npm`/`npx`/`corepack`) are symlinked into `/usr/local/cargo/bin` (the only `PATH` entry ahead of `/exec-daemon`). This is baked into the VM snapshot, so fresh shells already resolve `node` → v24. If you ever see Node 22, re-point those symlinks at `~/.nvm/versions/node/v24.*/bin`.

### Running the app (dev servers)
- `yarn start` — main Storybook at http://localhost:9003 (this is the primary dev/demo surface).
- `yarn start:s2` — Spectrum 2 Storybook at http://localhost:6006.
- `yarn start:s2-docs` — S2 docs site at http://localhost:1234.
- These are dev servers (run them, not `build:*`). First Storybook build takes ~15-20s to bundle after the manager loads.

### Lint / types
- `yarn lint` runs, in parallel: `oxfmt --check`, `tsgo --noEmit` (type check), `oxlint packages`, `scripts/lint-packages.js`, and Yarn `constraints`. It's the single command for lint + types.

### Tests
- `yarn test` runs the **entire** Jest suite across the monorepo (very slow). To verify quickly, scope it: the positional arg is a **regex matched against test file paths**, e.g. `yarn test react-stately/test/checkbox/useCheckboxGroupState.test.tsx`. Passing a package directory like `packages/@react-spectrum/button` does NOT match (button tests live in `packages/@react-spectrum/s2` etc., and jest matches on the `*.test.[tj]sx` path).
- Always invoke tests through `yarn` (e.g. `yarn test ...`). Running `cross-env`/`jest` directly fails because those binaries aren't on `PATH`.
- Other suites: `yarn test:ssr`, `yarn test:browser` (installs Playwright), `yarn test-storybook` (needs `yarn start` running).

### Build gotchas (from CONTRIBUTING.md)
- `yarn build` emits benign TypeScript errors from `@parcel/transformer-typescript-types` and still completes — that's expected.
- Do NOT run `yarn build` before `yarn start`; stale build artifacts break the dev server. If it happens, run `make clean_all && yarn` (or delete `.parcel-cache`).

### Install
- `yarn install` runs a `postinstall` (`patch-package && yarn build:icons`). Generated icon output is gitignored, so a clean tree after install is normal. Peer-dependency `YN0060/YN0086` warnings during install are expected and non-fatal.
