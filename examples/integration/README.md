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

`assets/video/demo.mp4` 是通过 FFmpeg testsrc2 和 sine 生成的本地 5 秒测试媒体，含 440 Hz 提示音；poster.png 为首帧，不包含外部内容或业务素材。重新生成：

```sh
ffmpeg -f lavfi -i 'testsrc2=size=320x180:rate=24' -f lavfi -i 'sine=frequency=440:sample_rate=44100' -t 5 -c:v libx264 -pix_fmt yuv420p -crf 30 -c:a aac -b:a 48k -movflags +faststart -y examples/integration/assets/video/demo.mp4
ffmpeg -i examples/integration/assets/video/demo.mp4 -frames:v 1 -y examples/integration/assets/video/poster.png
```

自动化检查不能代替开发者工具和真机的视频播放验收。
