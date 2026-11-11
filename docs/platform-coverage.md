# 小程序能力覆盖清单与实施计划

盘点日期：2026-11-12。以微信原生能力为参照，而非以本库现有 API 为边界。本页是后续实施清单，不代表条目已实现；当前判断来自源码审查，平台验证另见 [验证记录](verification.md)。

## 状态与范围

- 已接入：有相应实现，仍须按场景核验，不等于完整通过平台验收。
- 部分接入：基础路径存在，但原生语义、类型或组合场景存在明确缺口。
- 尚未接入：没有对应运行时机制或组合式入口。
- 原生使用：应保持直接使用或配置透传，不以增加同名包装为完成标准；兼容性仍需验证。

支持同时记录四个维度：原生静态写法、setup 动态声明、类型契约、验证证据。不能用 Record<string, any> 或配置对象可透传证明完整支持。

主要依据：[微信官方 API 类型仓库](https://github.com/wechat-miniprogram/api-typings)、[App 定义](https://github.com/wechat-miniprogram/api-typings/blob/master/types/wx/lib.wx.app.d.ts)、[Page 定义](https://github.com/wechat-miniprogram/api-typings/blob/master/types/wx/lib.wx.page.d.ts)、[Component 定义](https://github.com/wechat-miniprogram/api-typings/blob/master/types/wx/lib.wx.component.d.ts)、[Behavior 定义](https://github.com/wechat-miniprogram/api-typings/blob/master/types/wx/lib.wx.behavior.d.ts)、[官方开发示例](https://github.com/wechat-miniprogram/miniprogram-demo)。部分微信文档页面本次访问受限，使用官方类型和官方源码补充核对；新框架专属能力需记录对应框架和版本，不推断旧基础库也支持。

## 一、应用、页面和注册机制

| ID | 原生能力 | 当前状态与证据 | 后续任务 | 优先级 |
| --- | --- | --- | --- | --- |
| APP-01 | App 注册、globalData、自定义字段/方法 | 部分接入：defineApp 将非函数字段归入 globalData，缺少完整原生配置与组合式 setup 的对等契约 | 明确原生 App options、setup 返回状态及自定义实例字段的合并，兼容传统 getApp 使用方式 | P0 |
| APP-02 | onLaunch / onShow / onHide | 返回式函数能注册；App setup 没有进入页面/组件使用的 Hook 上下文 | 建立 App 专用上下文和组合 Hook，区分 App 的 show/hide 与页面事件，支持复用 Hook | P0 |
| APP-03 | onError / onPageNotFound / onUnhandledRejection / onThemeChange | 返回式可交付原生；没有专门的 App 组合式接入与精确类型 | 接通参数、this、注册范围和多监听规则 | P0 |
| PAGE-01 | Page 生命周期与四类页面事件 | 已接入：生命周期表、页面事件转发、基础 Hook | 全量参数、时序、原生+Hook 同存及重复进出核验 | P0 |
| PAGE-02 | 分享、朋友圈、收藏、退出状态回调 | 部分接入：有直接返回机制；类型局限于同步 Record，未覆盖原生异步分享语义 | 保留 Promise/异步内容、参数与返回契约，不把多返回值广播合并；避免无声明时生成可见分享能力 | P0 |
| PAGE-03 | route / options / exitState / router / pageRouter / renderer 等实例信息 | 原生实例可访问，NativeInstance 主要靠 any；无系统性文档与验证 | 保留原生读取路径，补精确类型，验证退出状态和路由参数在正确时点可用 | P1 |
| PAGE-04 | Component 注册页面 | 部分接入：defineComponentPage、page 标记和 Node 回归存在 | 真实页面 onLoad/onUnload、组件 lifecycle/pageLifetimes 同存、返回值回调及默认事件入口补验 | P0 |
| REG-01 | 全静态、全动态、混合声明 | 部分接入：主配置可收集合并，扩展字段不完整 | 明确所有定义段的静态/动态入口及冲突规则；动态结构保持注册时固定；不通过删动态能力简化 | P0 |

## 二、组件、属性、Behavior 和扩展

| ID | 原生能力 | 当前状态与证据 | 后续任务 | 优先级 |
| --- | --- | --- | --- | --- |
| COMP-01 | created / attached / ready / moved / detached / error | 已接入主要生命周期；平台顺序与错误链仅部分验证 | 原生根字段与 lifetimes 优先级、Behavior 顺序、父子时序和异常转发核验 | P0 |
| COMP-02 | beforeDetach | 尚无 Hook 接入；当前生命周期识别表未列入，原生 lifetimes 写法可透传但未验 | 增加收集/实例分发/类型；按平台要求停止节点操作和视图写入，再在 detached 完成清理 | P0 |
| COMP-03 | pageLifetimes 的 show / hide / resize / routeDone | 已接入；与组件页面自身页面事件的区分未完整验证 | 明确事件来源，验证嵌套、组件页面及多页面返回，防止重放/重复调用 | P0 |
| PROP-01 | 属性类型、默认值和更新 | 部分接入：基本类型和值已接入；简写 null 被跳过，缺省值处理不统一 | 对齐属性 schema 归一化，保留收集默认值与实例真实值的阶段差别 | P0 |
| PROP-02 | optionalTypes、属性 observer、同值/非法值行为 | 原生配置大体可透传，收集取值、响应式同步和类型不完整 | 联合类型、字符串/函数 observer、父级更新/对象路径更新，与原生一致 | P0 |
| PROP-03 | glass-easel 的 default 工厂、comparer、Function 属性 | 尚未完整适配，当前 defineProperties 只显式读取 value | 按组件框架适配收集默认值与实例初始化；保留平台工厂/比较语义，不把它们误当普通业务副作用 | P1 |
| OBS-01 | 路径、多字段、通配数据 observer | 部分接入：静态透传和动态 observe；缺少完整路径与通配场景证据 | 覆盖 a.b、数组索引、a.**、**、混合 Signal、初始触发、重复声明及回调顺序 | P0 |
| BEH-01 | 原生 Behavior、嵌套 Behavior、同名字段与生命周期合并 | 已保留原生 Behavior；混入后的 data/properties/methods 与 setup 的交互未完整适配 | 校验平台合并顺序，确保 Hook 读得到最终实例值，不覆盖或漏掉混入入口 | P0 |
| BEH-02 | 组合式定义可复用 Behavior | 尚无 defineBehavior；当前只支持使用原生 Behavior | 基于统一收集/实例协议设计 defineBehavior，多个宿主独立状态、清理和类型推导；保留原生 Behavior 并存 | P1 |
| EXT-01 | definitionFilter | 原生字段可透传，没有专门动态声明或结果协调 | 验证过滤器修改定义后入口与绑定是否一致，再提供对等的声明入口；不提前执行第三方过滤器模拟平台 | P1 |
| REL-01 | relations 类型、target 与关系回调 | 部分接入；defineRelation 在有 target 的分支丢弃回调，未完整保留关系描述 | 保留合法描述、原生 target 和 linked/linkChanged/unlinked；真实多节点关系场景 | P0 |
| EXP-01 | component-export、自定义导出、组件选择 | 基本 defineExpose 已接入；导出对象与真实实例身份的交互未系统验证 | 同时覆盖 selectComponent、自定义导出、祖先查找及内部作用域定位，不能把导出值误当原始实例 | P0 |
| FORM-01 | 原生表单组件能力与内置 form-field 类 Behavior | 已允许传 Behavior，无表单闭环证据 | 验证继承的 name/value、响应式回写、form submit/reset、分组和按钮；需要时添加能力入口，不另造表单协议 | P1 |
| OPT-01 | slots、样式隔离、externalClasses、virtualHost | options/样式类部分已接入；模板与虚拟节点下未系统验证 | 保持原生模板，验证选项混用、样式和组件树定位 | P1 |
| OPT-02 | pureDataPattern、动态 slots、深拷贝/属性早期初始化等选项 | 静态 options 能透传，不等于响应式/初始化语义兼容 | 将纯逻辑状态与视图提交分离；按框架核验初始化与复制策略；未知合法选项继续透传 | P1 |

## 三、视图、实例与资源

| ID | 原生能力 | 当前状态与证据 | 后续任务 | 优先级 |
| --- | --- | --- | --- | --- |
| DATA-01 | setData 同步逻辑数据、异步渲染回调、路径提交 | 部分接入：已包装回写；当前同步逻辑放在原生回调中，需对齐时序；深层同引用更新有漏通知风险 | 先对齐逻辑数据与响应式同步，再保持原生渲染回调时机；根字段/路径/数组/重复提交验证 | P0 |
| DATA-02 | 可序列化 data、纯数据、大对象和高频更新 | 基础值已验证；不可序列化值、纯逻辑状态、批量提交规则不完整 | 明确数据暴露边界、纯数据处理、可控提交策略；不擅自改变原生 setData 的同步语义 | P0/P1 |
| EVENT-01 | WXML bind/catch/capture/mut-bind、dataset、mark、组件事件选项 | 原生模板直接使用，已有普通 bindtap 验证 | 验证转发后的参数、this、冒泡/捕获及 $emit 选项，无需逐个重写事件系统 | P1 |
| INST-01 | selector query、节点/组件查询、EventChannel、getTabBar 等实例 API | 可经原生实例调用，类型与绑定时机欠缺 | 保持原生 API，补参数与时机文档；对需要清理的连接提供可选组合工具 | P1 |
| RES-01 | wx.on/off 事件对及 observer/disconnect、任务取消 | 尚无通用实例资源桥接；已有 effect scope 与定时 Hook | 提供通用实例副作用/资源登记能力，收集时不运行，销毁时解绑；不为每个 wx API 生成同名包装 | P1 |
| FRAME-01 | WXS、worklet 与跨线程边界 | 无完整兼容说明与专用场景 | 明确普通逻辑线程函数不能自动充当另一线程函数；依平台调用方式验证，禁止假装 Signal 可跨线程直接追踪 | P2 |

## 四、工程、模板与运行环境

| ID | 原生能力 | 当前状态与证据 | 后续任务 | 优先级 |
| --- | --- | --- | --- | --- |
| FILE-01 | app/page/component JSON、usingComponents、泛型组件、占位组件、插槽 | 原生文件保留，后几类缺少宿主验证 | 保持 JSON/WXML/WXSS 管理；制作模板组合场景，不把文件级声明强行塞进 JS setup | P1 |
| PKG-01 | 普通分包、独立分包、按需注入/加载 | 尚无完整适配和验证方案 | 包分发、运行时唯一性、共享状态范围；独立分包明确其独立性及 App 不存在时行为 | P1 |
| NAV-01 | 路由、tabBar、自定义 tabBar、页面恢复 | 基础原生路由可直接使用，组合场景未验 | 多次进出、tab 缓存、返回参数和退出状态；不重写 wx 路由协议 | P1 |
| THIRD-01 | 第三方组件、插件组件及插件包 | 尚无系统性证据 | 优先保证使用第三方组件；插件开发/导出另设验证场景和边界，不把可透传直接标为兼容 | P2 |
| ENV-01 | exparser/glass-easel、WebView/Skyline 组合 | playground 配了 glass-easel，缺少环境矩阵 | 支持组合逐一记录；不能把组件框架和渲染后端混为同一维度；兼容能力按框架/基础库版本标识 | P1/P2 |
| ENV-02 | JS 引擎与基础库最低要求 | 未形成正式兼容下限，依赖 Proxy/WeakMap/WeakRef 等 | 功能检测、实际设备验证及明确版本下限；仅在有必要时做可验证的降级 | P1 |
| TYPE-01 | 原生 options/实例/事件/返回值类型 | 当前多处 Record/any，新增能力无法从类型发现差异 | 以官方类型为参照复用/适配，补泛型、事件和框架专属字段，不为类型检查而限制合法原生配置 | P0/P1 |

## 五、原生直接使用，不另造框架能力

网络、登录、支付、存储、文件、媒体、位置、蓝牙、云调用、原生 UI 组件等，保留原生使用。它们的业务 API 本身不需要经过配置收集；真正需要本库负责的是调用时机、资源寿命、数据如何进入响应式和视图，以及不破坏原生配置。

这不是排除这些能力：为请求/存储/媒体/长连接等选取代表性业务宿主验证。是否增加便利 Hook 由复用价值决定，不以 wx.* 的包装数量衡量覆盖率。

## 六、分批实施

| 批次 | 工作 | 验收 |
| --- | --- | --- |
| P0：原生语义与明确缺口 | APP、页面返回值、beforeDetach、props 基本类型、observer、relations、组件导出、setData、注册混用 | 每个缺口有回归和原生对照；已支持场景无回退；实际平台行为与声明一致 |
| P1：组合式覆盖与常用原生场景 | defineBehavior、definitionFilter、表单、纯数据、实例资源、模板选项、分包、tabBar、精确类型 | 全动态/全静态/混合写法的对应场景可运行；无需为了绕过库而强制退回静态声明 |
| P2：复杂运行环境 | 渲染后端/组件框架矩阵、worklet、插件、复杂装载 | 逐项给出版本、支持范围与实际验证结果；超出范围明确记录 |
| 持续：文档和验证机制 | 平台能力清单、版本基线、场景导航、Node/类型/微信测试、差异检查 | 新增导出不等于新增平台能力；能力状态由声明、类型和验证证据共同更新 |

不估算为“补几个函数”：P0 的 beforeDetach 等入口较小，App 上下文、Behavior、数据时序及独立分包是机制工作，先以场景验证约束实现规模。

## 七、开发宿主安排

沿用三个工程，不为每项能力新建工程：

- playground：最小复现和开发实验，保留当前调试入口。
- integration：按 App/Page、组件生命周期、props/observer、Behavior/扩展、表单/导出、数据/事件分组建立可执行场景。每个场景标出能力 ID、预期、操作及实际结果。
- scenarios：补 tabBar 导航、分包/独立分包、资源监听、第三方组件、框架/渲染组合等场景；独立分包继续在这个工程内验证，必要的环境配置使用独立项目配置。

每项验收分别记录源码已有、Node 通过、类型通过、开发者工具通过、实机通过。未验证保持未验证；通过放宽类型、静态透传或退回原生写法不能代替动态接入的验收。
