/** 包级公开类型合同；参数、只读及生命周期语义与同包实现保持一致。 */
interface AppDataAndMethod {
  userInfo: null;
  onLaunch: () => void;
}

type UseSetupApp<T = Record<string, any>> = T;
