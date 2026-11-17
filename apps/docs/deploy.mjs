/** 公开包文档的自建 Pages 发布：按包打包、远端校验替换，并核对公网每个文件。 */
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { documentationSites, siteForPackage } from './navigation.mjs';
import { root } from '../../scripts/lib/workspace.mjs';

const config = JSON.parse(
  readFileSync(new URL('./deploy.config.json', import.meta.url), 'utf8'),
);
const hash = (content) => createHash('sha256').update(content).digest('hex');

/** 执行显式参数数组，远端程序只经 stdin 传送，不拼接任意 shell 命令。 */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    ...options,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw Error(`${command} failed (${result.signal || result.status})`);
  }
}

/** 产物只允许普通目录和文件；每个文件进入校验清单。 */
function manifest(directory, prefix = '') {
  return Object.fromEntries(
    readdirSync(directory).flatMap((name) => {
      const file = path.join(directory, name);
      const relative = prefix + name;
      const stat = lstatSync(file);
      if (stat.isDirectory()) {
        return Object.entries(manifest(file, relative + '/'));
      }
      if (!stat.isFile()) {
        throw Error(`Unsupported build entry: ${relative}`);
      }
      return [[relative, hash(readFileSync(file))]];
    }),
  );
}

/** 公网检验每个静态文件的内容和类型，并确认不存在的路径返回真正的 404。 */
async function verify(sites, files, report) {
  for (const site of sites) {
    const origin = `https://${site.slug}.${config.domain}`;
    const entries = Object.entries(files).filter(([file]) =>
      file.startsWith(`${site.slug}/`),
    );
    const pending = [...entries];
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (pending.length) {
          const [file, digest] = pending.shift();
          const relative = file.slice(site.slug.length + 1);
          const response = await fetch(`${origin}/${relative}`, {
            signal: AbortSignal.timeout(20000),
            redirect: 'error',
          });
          if (response.status !== 200) {
            throw Error(`${origin}/${relative}: HTTP ${response.status}`);
          }
          const type = response.headers.get('content-type') ?? '';
          const expected = relative.endsWith('.html')
            ? /text\/html/
            : relative.endsWith('.js')
              ? /(?:text|application)\/javascript/
              : relative.endsWith('.css')
                ? /text\/css/
                : relative.endsWith('.svg')
                  ? /image\/svg\+xml/
                  : relative.endsWith('.json')
                    ? /application\/json/
                    : /./;
          if (!expected.test(type)) {
            throw Error(
              `${origin}/${relative}: unexpected Content-Type ${type}`,
            );
          }
          if (hash(Buffer.from(await response.arrayBuffer())) !== digest) {
            throw Error(
              `${origin}/${relative}: public content checksum mismatch`,
            );
          }
        }
      }),
    );
    const home = await fetch(`${origin}/`, {
      signal: AbortSignal.timeout(20000),
      redirect: 'error',
    });
    if (
      home.status !== 200 ||
      hash(Buffer.from(await home.arrayBuffer())) !==
        files[`${site.slug}/index.html`]
    ) {
      throw Error(`${origin}/: homepage mismatch`);
    }
    const missing = await fetch(`${origin}/missing-${randomUUID()}.html`, {
      signal: AbortSignal.timeout(20000),
      redirect: 'error',
    });
    if (missing.status !== 404) {
      throw Error(`${origin}: missing page returned HTTP ${missing.status}`);
    }
    report.sites.push({
      package: site.packageName,
      url: `${origin}/`,
      files: entries.length,
      verified: true,
      missingPageStatus: missing.status,
    });
    console.log(
      `Verified ${site.packageName}: ${origin}/ (${entries.length} files)`,
    );
  }
}

/** 默认部署全部公开包，也允许显式选定一个公开包；构建产物与维护站点分离。 */
async function deploy() {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--package')) {
    throw Error('Usage: npm run docs:deploy -- [--package <name-or-folder>]');
  }
  const available = (await documentationSites()).filter(
    (site) => site.packageName,
  );
  if (
    available.length !== Object.keys(config.sites).length ||
    available.some((site) => !config.sites[site.id]) ||
    new Set(Object.values(config.sites)).size !== available.length
  ) {
    throw Error(
      'Deploy configuration must map each public documentation site once',
    );
  }
  const selected = args.length
    ? [siteForPackage(available, args[1])].filter(Boolean)
    : available;
  const sites = selected.map((site) => ({
    ...site,
    slug: config.sites[site.id],
  }));
  if (!sites.length) {
    throw Error(`Unknown public package: ${args[1]}`);
  }
  if (
    !/^[a-z_][a-z0-9_-]*@[a-z0-9][a-z0-9.-]*$/i.test(config.host) ||
    !/^[a-z0-9.-]+$/.test(config.domain) ||
    !path.isAbsolute(config.pagesRoot) ||
    !existsSync(config.identity) ||
    sites.some((site) => !/^reactive-mp(?:-[a-z0-9]+)*-docs$/.test(site.slug))
  ) {
    throw Error('Invalid Pages connection or site configuration');
  }
  run('npm', ['run', 'docs:check']);
  run('npm', ['run', 'docs:build', ...(args.length ? ['--', ...args] : [])]);
  const temporary = mkdtempSync(path.join(tmpdir(), 'reactive-mp-docs-'));
  const upload = `/tmp/reactive-mp-docs-${randomUUID()}.tgz`;
  const ssh = [
    '-i',
    config.identity,
    '-o',
    'IdentitiesOnly=yes',
    '-o',
    'BatchMode=yes',
    '-o',
    'ConnectTimeout=10',
  ];
  let uploaded = false;
  const report = { deployedAt: new Date().toISOString(), sites: [] };
  try {
    const bundle = path.join(temporary, 'sites');
    mkdirSync(bundle);
    for (const site of sites) {
      const directory = path.join(root, 'apps/docs/dist', site.id);
      manifest(directory);
      cpSync(directory, path.join(bundle, site.slug), { recursive: true });
    }
    const files = manifest(bundle);
    const archive = path.join(temporary, 'sites.tgz');
    run('tar', ['-czf', archive, '-C', bundle, '.']);
    uploaded = true;
    run('scp', [...ssh, archive, `${config.host}:${upload}`]);
    const payload = Buffer.from(
      JSON.stringify({
        pagesRoot: config.pagesRoot,
        upload,
        sites: sites.map((site) => site.slug),
        files,
        digest: hash(readFileSync(archive)),
      }),
    ).toString('base64');
    const script =
      `import base64, json\nCONFIG = json.loads(base64.b64decode('${payload}'))\n` +
      readFileSync(new URL('./deploy-remote.py', import.meta.url), 'utf8');
    run('ssh', [...ssh, config.host, 'python3 -'], {
      input: script,
      stdio: ['pipe', 'inherit', 'inherit'],
    });
    uploaded = false;
    await verify(sites, files, report);
    report.complete = true;
  } finally {
    if (uploaded) {
      const cleanup = spawnSync(
        'ssh',
        [...ssh, config.host, `rm -f -- ${upload}`],
        {
          stdio: 'inherit',
        },
      );
      if (cleanup.error || cleanup.status !== 0) {
        console.error(`Remove temporary upload manually: ${upload}`);
      }
    }
    rmSync(temporary, { recursive: true, force: true });
    mkdirSync(path.join(root, 'artifacts'), { recursive: true });
    writeFileSync(
      path.join(root, 'artifacts/docs-deployment.json'),
      JSON.stringify(report, null, 2) + '\n',
    );
  }
}

try {
  await deploy();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
