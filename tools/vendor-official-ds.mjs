// tools/vendor-official-ds.mjs
import { execSync } from 'node:child_process';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const VERSION = '0.4.0';
const root = join(dirname(fileURLToPath(import.meta.url)), '.official-ds-ref');
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
execSync(`npm pack @hubex/design-system@${VERSION}`, { cwd: root, stdio: 'inherit' });
const tgz = readdirSync(root).find((f) => f.endsWith('.tgz'));
execSync(`tar -xzf ${tgz}`, { cwd: root, stdio: 'inherit' });
console.log('Vendored @hubex/design-system@' + VERSION + ' into', root);
