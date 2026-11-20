# Quick start

Kit ships original ESM JavaScript. Image preloading requires a native WeChat host. Runtime dependencies are @reactive-mp/runtime, @reactive-mp/reactivity and @reactive-mp/store; shared is included through their dependency graph.

## Install delivered archives

Use matching local archives in the consumer's npm project. Public registry availability is not assumed. In the source workspace, create archives using mkdir -p artifacts/packages and npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts.

## Prepare native sources

The reactive-mp development tool copies the selected dependency graph into its owned vendor directory. The commands below first install Kit, then the preparation tool:

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz ./reactive-mp-kit-0.1.0.tgz
```

```sh
npm install --save-dev --ignore-scripts --no-audit ./reactive-mp-1.0.0.tgz
npx reactive-mp-prepare --out ./vendor --package @reactive-mp/kit
```

The output contains kit, store, runtime, reactivity and shared. Do not put application files in this generated directory. In the source workspace, npm run examples:prepare prepares the example hosts directly.

## Choose your first integration

- [WeChat integration](wechat-getting-started.md): request a native login from a user action.
- [Preloader integration](images-preloader-getting-started.md): register a hidden component and read batch results.
- [Store forwarding](store.md): share the independent Store implementation.

Package-aware projects can import @reactive-mp/kit/wechat, /images-preloader or /store. Native prepared projects import the corresponding files under vendor/kit/miniprogram.
