# Fintech Dashboard

## Links

- Repository: [GitHub](https://github.com/Artawower/fintech-dashboard)
- Live demo: [GitHub Pages](https://artawower.github.io/fintech-dashboard/)
- Assignment: [Specification](./docs/spec.md)

## Installation

Node.js 24 is required.

```bash
git clone https://github.com/Artawower/fintech-dashboard.git
cd fintech-dashboard
npm ci
```

## Run locally

```bash
npm run web:dev
```

This builds the WebAssembly generator and starts the Angular development server. Open the local URL printed in the terminal.

## Build

```bash
npm run web:build
```

To build with the GitHub Pages base path:

```bash
npm run web:build:pages
```

## Tests and lint

```bash
npm run web:test
npm run wasm:test
npm run web:lint
```

## Technologies

- Client: Angular 22
- WebAssembly module: AssemblyScript
- Tests: Vitest
- AI-assisted development: Pi coding agent; Codex Astra for quality checks
