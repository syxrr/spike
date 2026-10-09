import { cancelRender, continueRender, delayRender, staticFile } from 'remotion';

// All fonts are self-hosted from public/fonts so renders work offline.
//
// Dy-Mark brand faces (Helvetica Neue LT Std) are licensed and are NOT committed
// (see .gitignore). Run `npm run fonts -- <design-system fonts dir>` to copy them in.
// When they're missing the stacks in theme.ts fall back to Barlow Condensed (OFL).
// Anton (OFL) is the Day 2 headline face.
const FACES: [family: string, file: string, weight: string, optional?: true][] = [
  ['Helvetica Neue LT Std Cn', 'HelveticaNeueLTStd-LtCn.otf', '300', true],
  ['Helvetica Neue LT Std Cn', 'HelveticaNeueLTStd-Cn.otf', '400 500', true],
  ['Helvetica Neue LT Std Cn', 'HelveticaNeueLTStd-HvCn.otf', '600 800', true],
  ['Helvetica Neue LT Std Cn', 'HelveticaNeueLTStd-BlkCn.otf', '900', true],
  ['Helvetica Neue LT Std Ex', 'HelveticaNeueLTStd-LtEx.otf', '300', true],
  ['Helvetica Neue LT Std Ex', 'HelveticaNeueLTStdMdEx.otf', '400 500', true],
  ['Helvetica Neue LT Std Ex', 'HelveticaNeueLTStdBdEx_1.otf', '600 900', true],
  ['Anton', 'oss/anton-latin-400-normal.woff2', '400'],
  ['Barlow Condensed', 'oss/barlow-condensed-latin-300-normal.woff2', '300'],
  ['Barlow Condensed', 'oss/barlow-condensed-latin-400-normal.woff2', '400'],
  ['Barlow Condensed', 'oss/barlow-condensed-latin-500-normal.woff2', '500'],
  ['Barlow Condensed', 'oss/barlow-condensed-latin-700-normal.woff2', '700'],
  ['Barlow Condensed', 'oss/barlow-condensed-latin-800-normal.woff2', '800'],
  ['Barlow Condensed', 'oss/barlow-condensed-latin-900-normal.woff2', '900'],
];

const handle = delayRender('Loading fonts');
Promise.all(
  FACES.map(async ([family, file, weight, optional]) => {
    try {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, { weight });
      await face.load();
      document.fonts.add(face);
    } catch (err) {
      if (!optional) throw err;
      console.warn(`[hbt-showreel] brand font ${file} not installed, using fallback`);
    }
  }),
).then(() => continueRender(handle), (err) => cancelRender(err));
