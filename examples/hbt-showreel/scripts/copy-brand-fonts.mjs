// Copies the licensed Dy-Mark brand fonts into public/fonts.
// Usage: npm run fonts -- <path to the design system's fonts/ directory>
import { copyFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FILES = [
  'HelveticaNeueLTStd-LtCn.otf',
  'HelveticaNeueLTStd-Cn.otf',
  'HelveticaNeueLTStd-HvCn.otf',
  'HelveticaNeueLTStd-BlkCn.otf',
  'HelveticaNeueLTStd-LtEx.otf',
  'HelveticaNeueLTStdMdEx.otf',
  'HelveticaNeueLTStdBdEx_1.otf',
];

const src = process.argv[2];
if (!src) {
  console.error('Usage: npm run fonts -- <design-system fonts dir>');
  process.exit(1);
}
const dest = resolve(import.meta.dirname, '..', 'public', 'fonts');
let missing = 0;
for (const f of FILES) {
  const from = join(resolve(src), f);
  if (!existsSync(from)) {
    console.warn(`missing: ${from}`);
    missing++;
    continue;
  }
  copyFileSync(from, join(dest, f));
  console.log(`copied ${f}`);
}
process.exit(missing ? 1 : 0);
