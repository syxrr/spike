# plain-site

A three-page plain HTML site with no framework and no build step, used to verify
the companion mounts, tracks the pointer, reacts to clicks and survives real
full page navigations.

```bash
cd examples/plain-site
python3 -m http.server 8099   # http://localhost:8099/index.html
```

`spike-avatar.js` here is a build artifact copied from
`packages/spike-avatar/dist/`. Rebuild it with `npm run build` in that package.
