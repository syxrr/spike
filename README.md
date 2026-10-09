# spike

Scratch repository for spikes and experiments.

## Docs

- [React avatar usage guide](docs/react-avatar-guide.md) — installing
  `@bible-strong/avatar-react`, the `createAvatar` and generic `Avatar`
  components, the full prop reference and the imperative controller API.

## Portfolio companion

[`packages/spike-avatar`](packages/spike-avatar) builds the avatar into a
single self-contained file that drops into any site with one script tag — no
React or build step required on the host page. It follows the cursor, reacts to
clicks and stays across page navigations.
[`examples/plain-site`](examples/plain-site) is a framework-free site that
exercises it, and [`docs/migrate-to-portfolio.md`](docs/migrate-to-portfolio.md)
covers dropping it into a Vite site.

## Demo

A runnable Vite + React 19 app lives in
[`examples/avatar-demo`](examples/avatar-demo):

```bash
cd examples/avatar-demo
npm install
npm run dev     # http://localhost:5173
```

## HBT Conference showreel

[`examples/hbt-showreel`](examples/hbt-showreel) is a Remotion project for Dy-Mark's
HBT Conference 2026 trade-show loop (43s, 4K, silent). `npm run dev` opens Studio;
`npm run render` writes the 4K master.
