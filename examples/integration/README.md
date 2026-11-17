# Integration 示例

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
