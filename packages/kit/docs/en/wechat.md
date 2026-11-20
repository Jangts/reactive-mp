# WeChat APIs

Result-based native wrappers and request clients within Kit. Use them in ordinary Pages, Components or Reactive MP. The domain does not require a reactive host. Importing it does not start login, requests, dialogs or listeners.

| Entry | Purpose |
| --- | --- |
| @reactive-mp/kit/wechat | Complete WeChat API |
| @reactive-mp/kit/wechat/wx | Login, permissions, routing, nodes, storage, files and native requests |
| @reactive-mp/kit/wechat/network | Configurable requests, retries and in-flight concurrency |

[Integration](wechat-getting-started.md) shows native wiring. [Results and tasks](wechat-guide.md), [Requests](wechat-network.md) and [API reference](api.md) cover contracts and signatures.

Applications provide AppID, permissions, legal domains, authentication and response protocols. Wrappers do not bypass platform restrictions, show business prompts or refresh identities automatically.
