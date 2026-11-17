# 组合与自定义

## 选择接线层

控制器管理交互意图和纯逻辑，Hooks 连接响应式状态与宿主生命周期，behaviors 用于共享原生关系标记，wrappers 连接原生属性、事件与模板。每个领域根据实际能力提供相应入口，不要求项目采用统一皮肤。

普通 Page 可以直接使用原生 wrappers；Reactive 页面可以使用同一 wrappers，也可以只调用 Hooks 并自行组织 WXML、WXSS。选择 Hook 后，项目需要渲染原生节点并绑定相应事件；只创建状态不等于已经接上原生视图。

## 状态与结构

form 的模型、字段注册和校验属于表单控制器，页面传入业务校验与上传适配器。video 的播放意图与暂停条件分离，项目提供真实视频节点。swiper 管理索引和切换状态，内容由项目组合，不让核心索引逻辑解释业务媒体。

Hooks 在同步 setup 中声明，实例副作用放入生命周期。每个实例拥有自己的监听与资源；原生关系使用共享标记连接，不能复制模块实现来建立另一套身份。

## 原生 wrappers

以下页面 JSON 使用同包的视频与分组 wrappers：

```json
{
  "usingComponents": {
    "rmp-video": "@reactive-mp/components/video/components/video/index",
    "rmp-group": "@reactive-mp/components/video/components/group/index"
  }
}
```

```xml
<rmp-group>
  <view style="height: 400rpx">
    <rmp-video src="{{videoUrl}}" />
  </view>
</rmp-group>
```

页面 data 提供可访问的 videoUrl。wrapper 负责原生接线，项目提供容器尺寸、布局和内容；仅在注册相应 wrapper 时使用其默认结构与样式。插槽和 CSS 变量的具体合同见[视频](video.md)、[轮播](swiper.md)和[表单](form.md)。

## 导入与资源归属

统一入口和领域入口导出同一份逻辑。媒体轮播在包内复用 video 的分组协议，不需要另装 video 包。组件状态不进入应用全局 Store；网络、账号、路由、埋点和业务视觉由消费工程管理。
