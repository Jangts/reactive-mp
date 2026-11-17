/** 按包声明的发布角色计算版本归属与依赖更新，不改写公开包的自主版本。 */
const releaseRoles = {
  public: () => undefined,
  internal: (release) => release.owner,
  'shared-internal': (_, mainPackage) => mainPackage,
};
export const dependencyFields = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
];

/** 从单一包清单计算同步计划；先验证完整归属关系，再允许调用方写入。 */
export function planPackageVersions(packages, mainPackage) {
  const byName = new Map(packages.map((pkg) => [pkg.manifest.name, pkg]));
  const owners = new Map();
  const versions = new Map();
  const resolving = new Set();
  for (const { manifest } of packages) {
    const release = manifest.reactiveMp?.release;
    if (!release || !Object.hasOwn(releaseRoles, release.type)) {
      throw Error(`${manifest.name}: declare reactiveMp.release.type`);
    }
    if (release.type !== 'internal' && release.owner !== undefined) {
      throw Error(`${manifest.name}: only internal packages declare an owner`);
    }
    const owner = releaseRoles[release.type](release, mainPackage);
    if (release.type !== 'public') {
      if (typeof owner !== 'string' || !byName.has(owner)) {
        throw Error(`${manifest.name}: missing version owner ${owner ?? ''}`);
      }
      if (
        release.type === 'internal' &&
        !dependencyFields.some((field) =>
          Object.hasOwn(byName.get(owner).manifest[field] ?? {}, manifest.name),
        )
      ) {
        throw Error(`${manifest.name}: owner ${owner} must depend on it`);
      }
    }
    owners.set(manifest.name, owner);
  }
  if (byName.get(mainPackage)?.manifest.reactiveMp.release.type !== 'public') {
    throw Error('reactiveMp.mainPackage must name a public workspace package');
  }
  function resolve(name) {
    if (versions.has(name)) {
      return versions.get(name);
    }
    if (resolving.has(name)) {
      throw Error(`cyclic version ownership: ${name}`);
    }
    resolving.add(name);
    const owner = owners.get(name);
    const version = owner ? resolve(owner) : byName.get(name).manifest.version;
    if (typeof version !== 'string' || !version) {
      throw Error(`${name}: missing package version`);
    }
    resolving.delete(name);
    versions.set(name, version);
    return version;
  }
  for (const name of byName.keys()) {
    resolve(name);
  }
  return packages.map((pkg) => {
    const manifest = structuredClone(pkg.manifest);
    const changes = [];
    const version = versions.get(manifest.name);
    if (manifest.version !== version) {
      changes.push(
        `${manifest.name}: version ${manifest.version} -> ${version}`,
      );
      manifest.version = version;
    }
    for (const field of dependencyFields) {
      for (const [dependency, current] of Object.entries(
        manifest[field] ?? {},
      )) {
        const target = versions.get(dependency);
        if (target && current !== target) {
          changes.push(
            `${manifest.name}: ${field}.${dependency} ${current} -> ${target}`,
          );
          manifest[field][dependency] = target;
        }
      }
    }
    return { ...pkg, manifest, changes };
  });
}

/** 核对锁文件中的包版本及依赖，包含手动升级但尚未被其他包引用的公开包。 */
export function packageLockVersionIssues(plan, lock) {
  const issues = [];
  for (const { folder, manifest } of plan) {
    const record = lock.packages?.[`packages/${folder}`];
    if (record?.version !== manifest.version) {
      issues.push(
        `${manifest.name}: lockfile version must be ${manifest.version}`,
      );
    }
    for (const field of dependencyFields) {
      const expected = manifest[field] ?? {};
      const actual = record?.[field] ?? {};
      for (const dependency of new Set([
        ...Object.keys(expected),
        ...Object.keys(actual),
      ])) {
        if (actual[dependency] !== expected[dependency]) {
          issues.push(
            `${manifest.name}: lockfile ${field}.${dependency} is stale`,
          );
        }
      }
    }
  }
  return issues;
}
