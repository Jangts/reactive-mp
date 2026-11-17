# Integration 示例

## 微信 API 封装示例

首页进入「微信 API 封装示例」，启动页为 `pages/wechat/index`。普通 Page 直接消费独立包：缓存检查应显示 0、false、空串均通过；节点查询应得到 probe 的非零矩形；提示、登录和选图通过点击触发。登录仅显示已获取 code，不在界面展示凭证。

请求区需输入测试 URL 并配置对应合法域名。请求按钮等待异步响应解析；取消按钮通过原生 task.abort 取消并显示原生结果。订阅模板与上传接口由消费工程提供，不使用业务工程的私有配置。

运行 `npm run verify:wechat-api` 验证真实缓存、页面节点上下文与提示回调；需要开发者工具已登录并开启服务端口，回执为 `artifacts/wechat-api-live-verification.json`。

在仓库根目录运行 `npm run examples:prepare`，然后用微信开发者工具打开 `examples/integration`。

首页进入「Video 组件与 Hooks 示例」，或使用编译启动页 `pages/video/index`。

四个独立场景：

| 场景 | 启动页 | 实现方式 |
| --- | --- | --- |
| 传统页面使用组件 | `pages/video-native/index` | 原生 Page + rmp video，通过组件方法控制播放 |
| Reactive 页面使用组件 | `pages/video-reactive/index` | definePage + rmp video，通过 Signal 更新属性和展示事件 |
| Reactive 页面直接使用 Hook | `pages/video-hooks/index` | definePage 中调用 useVideo，直接绑定页面的原生 video |
| 多视频分组 | `pages/video-group/index` | rmp group 包含三个独立 rmp video，声音互斥、统一静音 |

前两个页面使用相同的视频组件和公开接口，对照原生页面状态与响应式状态的组织方式。第三个页面没有中间视频组件，`useVideo` 设置 `group: false`，并通过 `emit` 接收事件。第四个页面只组合包内的 group 和 video 组件。

验证步骤：

1. 在传统页面和 Reactive 页面分别播放、暂停、停止，修改外部暂停属性并卸载重建，检查 playbacksummary。
2. 在 Hook 页面操作原生控件和页面按钮，确认播放状态、位置和汇总同步；主动暂停后滚出再滚回，应保持暂停。
3. 在分组页播放视频 A、B，依次开启声音，确认前一个自动静音；「分组全部静音」应关闭全部声音；外部暂停后解除，仅恢复仍有播放意图的视频。

## 示例素材与播放路径

三个原创动效分别为轨道、弹跳、波浪，各 12 秒、960×540、30 fps，使用 H.264 Constrained Baseline / YUV420P 和 AAC-LC。每段都有明显的连续动作、画面时间和进度条，以及不同的轻提示旋律，方便判断暂停、续播和声音互斥。

示例不会将 `/assets/*.mp4` 直接交给 video。`assets/video/clips.js` 保存生成的编码数据，页面 onLoad 将它写入 `wx.env.USER_DATA_PATH` 下的版本化文件，再使用实际沙盒文件地址。相同版本已有缓存时不重复写入。封面是正常的代码包 JPEG 图片。

这只属于 examples 的自包含素材准备方式，不进入 video/swiper 包，也不需要新增云存储或放宽域名校验。正式项目可直接给组件传 HTTPS 视频地址，或相册/下载得到的本地文件地址。[微信官方示例](https://github.com/wechat-miniprogram/miniprogram-demo/blob/master/miniprogram/packageComponent/pages/media/video/video.js) 也演示了将 chooseVideo 返回的临时路径赋给 src。

重新生成需要 Python 3、Pillow、FFmpeg，以及已安装的仓库 npm 开发依赖：

```sh
npm run examples:media
```

原始 MP4 和素材清单输出到 `artifacts/demo-media`，小程序内仅更新 clips.js 和三张封面。不要把代码包文件路径与小程序运行时的沙盒文件路径混用。

自动化检查不能代替开发者工具和真机的视频播放验收。

## Swiper 示例

首页进入「Swiper 使用示例」，启动页为 `pages/swiper/index`。四个独立页面分别演示普通 Page 使用图片组件、Reactive Page 使用自定义卡片、Page 直接使用 useSwiper，以及图片视频混排配合 rmp group。版式对照包含平铺、中心突出和侧翼旋转；事件面板用于检查翻页、动画完成与媒体通知。

轮播的实际模拟器验收可在仓库根目录运行 `npm run verify:swiper`，需要开发者工具已登录并开启服务端口。脚本检查四个页面的渲染、初始索引、程序翻页、有效 transform、列表缩短以及媒体声音互斥；回执与截图保存在 `artifacts`。已有自动化会话时可通过 `WECHAT_WS_ENDPOINT` 指定端口。

视频与素材的模拟器验收运行 `npm run verify:media`，检查真实沙盒文件、播放进度、暂停、续播与三段不同素材。回执和分时截图写入 `artifacts/media-verification`。

## 图片预加载示例

首页进入「图片预加载示例」，启动页为 `pages/images-preloader/index`。普通 Page 通过 selectComponent 调用通用组件，重复 URL 按输入计数，实际节点复用。可以加入缺失图片检查失败结果，清除成功记录后重试，以及在加载期间卸载组件检查 cancelled 结果。图片使用宿主现有的本地封面。

运行 `npm run verify:images-preloader` 在已登录并开启服务端口的微信开发者工具中验收隐藏图片加载、尺寸查询、成功记录复用、原生 error、跨实例共享与卸载接手；回执保存到 `artifacts/images-preloader-live-verification.json`。追加 `-- --screenshot` 可另取页面截图；截图接口不可用时，该选项会使验收失败，功能场景的结果仍保存在回执中。

Form 示例入口：`pages/form/index`。包含普通 Page、Reactive Page、Hooks 加原生控件、完整字段、自定义复合字段与多表单隔离。

表单、视频、轮播统一消费 `@reactive-mp/components`，准备后的逻辑与 wrappers 位于 `vendor/components/miniprogram/<领域>/`。各领域仍可分别使用 Hooks 或原生 wrappers；图片预加载、微信 API 和共享 Store 保持各自入口。
