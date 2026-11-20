# Quick start

## Install and prepare

Use a native WeChat Mini Program and Node.js 22+. Obtain matching local archives, then run these commands in the consumer project:

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-components-0.1.0.tgz
npm install --save-dev --ignore-scripts --no-audit ./reactive-mp-store-1.0.0.tgz ./reactive-mp-1.0.0.tgz
npx reactive-mp-prepare --out ./vendor --package @reactive-mp/components
```

No public registry release is assumed. In the source workspace, run mkdir -p artifacts/packages followed by npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts. Store is a dependency of the reactive-mp development tool, not a runtime dependency of components.

vendor belongs to the preparation tool. Keep application files elsewhere. Here vendor and pages share the same Mini Program root. Source hosts can use npm run examples:prepare.

## Your first complete page

Create these files under pages/profile and register pages/profile/index in app.json:

### index.json

<<< packages/components/docs/examples/input/index.json

### index.wxml

<<< packages/components/docs/examples/input/index.wxml

### index.js

Use either script as index.js. Both use the JSON and WXML above.

::: code-group

<<< packages/components/docs/examples/input/index.js [Native configuration]

<<< packages/components/docs/examples/input/index.reactive.js [Reactive composition]

:::

index.wxss may be empty. Enter a name and choose Submit to display the model. Reset restores initial values.

## Continue

- [Catalog](catalog.md): individual properties, events, slots, methods and boundaries.
- [Models and validation](form-guide.md): ownership, asynchronous rules and upload adapters.
- [Hooks](hooks.md): reuse interactions while owning native structure.
- [Styling](styling.md): customize the optional wrapper appearance.
