/** 检查或同步公开包、专属内部包及共用内部包的版本；不创建版本或执行发布。 */
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { root, workspacePackages } from './lib/workspace.mjs';
import {
  planPackageVersions,
  packageLockVersionIssues,
} from './lib/package-versions.mjs';

const manifest = JSON.parse(
  await readFile(path.join(root, 'package.json'), 'utf8'),
);
const plan = planPackageVersions(
  await workspacePackages(),
  manifest.reactiveMp?.mainPackage,
);
if (process.argv.includes('--write')) {
  for (const pkg of plan) {
    if (pkg.changes.length) {
      await writeFile(
        path.join(root, 'packages', pkg.folder, 'package.json'),
        JSON.stringify(pkg.manifest, null, 2) + '\n',
      );
      console.log(pkg.changes.join('\n'));
    }
  }
  await promisify(execFile)(
    'npm',
    [
      'install',
      '--package-lock-only',
      '--offline',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
    ],
    { cwd: root },
  );
}
const lock = JSON.parse(
  await readFile(path.join(root, 'package-lock.json'), 'utf8'),
);
const drift = process.argv.includes('--write')
  ? []
  : plan.flatMap((pkg) => pkg.changes);
const issues = [...drift, ...packageLockVersionIssues(plan, lock)];
if (issues.length) {
  throw Error(
    issues.join('\n') +
      '\nRun npm run versions:sync after updating public package versions.',
  );
}
console.log(
  'Package version ownership, dependency versions and lockfile verified',
);
