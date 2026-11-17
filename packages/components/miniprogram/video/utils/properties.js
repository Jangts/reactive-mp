/** 视频的原生属性与可选展示能力。 */
export const properties = {
  autoObserve: {
    type: Boolean,
    value: true,
  },
  intersectionRatio: {
    type: Number,
    value: 0,
  },
  enableProgressTouch: {
    type: Boolean,
    value: false,
  },
  // 视频资源地址
  src: {
    type: String,
    value: '',
  },
  // 指定视频时长
  duration: {
    type: Number,
    value: 0,
  },
  // 是否显示默认播放控件
  controls: {
    type: Boolean,
    value: false,
  },
  // 弹幕列表
  danmuList: {
    type: Array,
    value: [],
  },
  // 是否显示弹幕按钮
  danmuBtn: {
    type: Boolean,
    value: false,
  },
  // 是否展示弹幕
  enableDanmu: {
    type: Boolean,
    value: false,
  },
  // 是否自动播放
  autoplay: {
    type: Boolean,
    value: false,
  },
  // 是否循环播放
  loop: {
    type: Boolean,
    value: true,
  },
  // 是否因外因暂停，优先级优于可视控制
  paused: {
    type: Boolean,
    value: false,
  },
  // 是否静音播放
  muted: {
    type: Boolean,
    value: true,
  },
  hideSound: {
    type: Boolean,
    value: false,
  },
  showCustomPlayBtn: {
    type: Boolean,
    value: false,
  },
  showCustomProgress: {
    type: Boolean,
    value: false,
  },
  // 指定视频初始播放位置
  initialTime: {
    type: Number,
    value: 0,
  },
  // 在非全屏模式下，是否开启亮度与音量调节手势
  pageGesture: {
    type: Boolean,
    value: false,
  },
  // 设置全屏时视频的方向
  direction: {
    type: Number,
    value: 0,
  },
  // 若不设置，宽度大于240时才会显示
  showProgress: {
    type: Boolean,
    value: false,
  },
  // 是否显示全屏按钮
  showFullscreenBtn: {
    type: Boolean,
    value: false,
  },
  // 是否显示视频底部控制栏的播放按钮
  showPlayBtn: {
    type: Boolean,
    value: false,
  },
  // 是否显示视频中间的播放按钮
  showCenterPlayBtn: {
    type: Boolean,
    value: false,
  },
  // 是否开启控制进度的手势
  enableProgressGesture: {
    type: Boolean,
    value: false,
  },
  // 当视频大小与 video 容器大小不一致时，视频的表现形式
  objectFit: {
    type: String,
    value: 'cover',
  },
  // 视频封面的图片网络资源地址
  poster: {
    type: String,
    value: '',
  },
  stopFrame: {
    type: String,
    value: '',
  },
  // 是否显示静音按钮
  showMuteBtn: {
    type: Boolean,
    value: false,
  },
  // 视频的标题
  title: {
    type: String,
    value: '',
  },
  // 播放按钮的位置
  playBtnPosition: {
    type: String,
    value: 'bottom',
  },
  // 是否开启播放手势
  enablePlayGesture: {
    type: Boolean,
    value: false,
  },
  // 当跳转到其它页面时，是否自动暂停
  autoPauseIfNavigate: {
    type: Boolean,
    value: true,
  },
  // 当跳转到原生页面时，是否自动暂停
  autoPauseIfOpenNative: {
    type: Boolean,
    value: true,
  },
  // 是否开启亮度与音量调节手势（同 page-gesture）
  vslideGesture: {
    type: Boolean,
    value: false,
  },
  // 在全屏模式下，是否开启亮度与音量调节手势
  vslideGestureInFullscreen: {
    type: Boolean,
    value: true,
  },
  // 自定义类名
  customClass: {
    type: String,
    value: '',
  },
  // 自定义样式
  customStyle: {
    type: String,
    value: '',
  },
  soundStyle: {
    type: String,
    value: '',
  },
  playStyle: {
    type: String,
    value: '',
  },
  fixedVisible: {
    type: Boolean,
    value: false,
  },
  canBePaused: {
    type: Boolean,
    value: true,
  },
  replayCanBePaused: {
    type: Boolean,
    value: true,
  },
};
