# Choose an entry

## WeChat APIs and requests

@reactive-mp/kit/wechat exports the WeChat wrappers. /wechat/wx and /wechat/network are narrower entries. They preserve result tuples, native responses and task controls without starting platform work at import. This domain does not require reactive pages. See [Results and native tasks](wechat-guide.md) and [Requests](wechat-network.md).

## Image preloading

@reactive-mp/kit/images-preloader exports a hook, size lookup and cache clearing. Ordinary Pages use the native component; reactive pages may use that component or render the hook's jobs themselves. Shared requests, batch results and disposal belong to one implementation. See [Batches and lifecycle](images-preloader-guide.md).

## Store

@reactive-mp/kit/store directly forwards @reactive-mp/store. The Kit root also exports defineStore and storeToRefs. Store retains its independent package, version and [documentation site](https://reactive-mp-store-docs.pages.jangts.cafe/en/). Kit does not duplicate its code or shared instance definitions. See [Store forwarding](store.md).

## Imports and versions

Root and domain entries expose identical named functions. Importing logic does not register a component; native wrappers are registered through page JSON.

Kit owns its public version. Its WeChat and Images Preloader domains follow that version. Store's exact dependency version is declared separately in Kit package.json.
