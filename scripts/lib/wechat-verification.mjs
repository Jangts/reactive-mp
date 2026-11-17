/** 微信模拟器验收统一管理连接、超时和当前回执，失败不能保留历史通过状态。 */
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdirSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import Connection from 'miniprogram-automator/out/Connection.js';
import MP from 'miniprogram-automator/out/MiniProgram.js';
import { sourceDigest } from './verification-evidence.mjs';

// 新版开发者工具不再从 Tool.getInfo 返回 SDKVersion，改查实际运行环境。
(MP.default || MP).prototype.checkVersion = async function () {
  const version = (await this.systemInfo()).SDKVersion;
  const [major, minor, patch] = String(version).split('.').map(Number);
  assert.ok(
    version === 'dev' ||
      (/^\d+\.\d+\.\d+/.test(version) &&
        (major > 2 ||
          (major === 2 && (minor > 7 || (minor === 7 && patch >= 3))))),
    `Automator requires runtime SDKVersion >=2.7.3, received ${version}`,
  );
};

/** 分开创建与就绪检查，避免 automator.connect 在检查失败后遗留无法取得的连接。 */
async function openWechatApp(endpoint) {
  const connection = await (Connection.default || Connection).create(endpoint);
  return new (MP.default || MP)(connection);
}

/** 就绪失败时释放本次连接；成功后将资源所有权交给验收会话。 */
export async function connectReadyWechat(endpoint, open = openWechatApp) {
  const app = await open(endpoint);
  try {
    await app.checkVersion();
    return app;
  } catch (error) {
    await app.disconnect();
    throw error;
  }
}

async function connectWechat() {
  const endpoint = process.env.WECHAT_WS_ENDPOINT || 'ws://127.0.0.1:9420';
  if (!process.env.WECHAT_WS_ENDPOINT) {
    const { stdout, stderr } = await promisify(execFile)(
      process.env.WECHAT_CLI ||
        '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
      [
        'auto',
        '--project',
        path.resolve('examples/integration'),
        '--auto-port',
        '9420',
        '--trust-project',
      ],
      { timeout: 30000 },
    );
    // 部分版本在 preparing 失败（例如登录过期）时仍以 0 退出，不能继续等待端口。
    const output = [stdout, stderr].filter(Boolean).join('\n');
    if (/\[error\]|✖/.test(output)) {
      throw Error(`WeChat CLI could not enable automation:\n${output.trim()}`);
    }
  }
  const deadline = Date.now() + 15000;
  while (true) {
    try {
      return await connectReadyWechat(endpoint);
    } catch (error) {
      if (Date.now() >= deadline) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

export async function runWechatVerification(
  { output, timeout = 90000, connect = connectWechat },
  verify,
) {
  const report = {
    startedAt: new Date().toISOString(),
    environment: null,
    checks: [],
    errors: [],
    passed: false,
  };
  const save = () => {
    mkdirSync(path.dirname(output), { recursive: true });
    const temporary = `${output}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify(report, null, 2));
    renameSync(temporary, output);
  };
  save();
  let app, failure;
  const timer = setTimeout(() => {
    report.failure = `WeChat verification exceeded ${timeout} ms`;
    report.finishedAt = new Date().toISOString();
    report.passed = false;
    console.error(report.failure);
    try {
      save();
    } finally {
      process.exit(2);
    }
  }, timeout);
  try {
    report.sourceDigest = await sourceDigest(process.cwd(), [
      'packages',
      'examples/integration',
      'scripts',
    ]);
    app = await connect();
    app.on('exception', (error) => report.errors.push(error));
    assert.equal(
      await app.evaluate(function () {
        return getApp().globalData.validationHost;
      }),
      'integration',
      'wrong validation host',
    );
    report.environment = await app.systemInfo();
    await verify(app, report);
    assert.ok(
      report.checks.length > 0,
      'verification must run at least one check',
    );
    assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
  } catch (error) {
    failure = error;
  } finally {
    try {
      await Promise.race([
        app?.disconnect(),
        new Promise((resolve) => {
          const cleanupTimer = setTimeout(resolve, 1500);
          cleanupTimer.unref();
        }),
      ]);
    } catch (error) {
      failure ||= error;
    } finally {
      clearTimeout(timer);
      if (!failure && report.errors.length) {
        failure = Error(JSON.stringify(report.errors));
      }
      report.passed = !failure;
      report.failure = failure ? String(failure.stack || failure) : undefined;
      report.finishedAt = new Date().toISOString();
      save();
    }
  }
  if (failure) {
    throw failure;
  }
  return report;
}
