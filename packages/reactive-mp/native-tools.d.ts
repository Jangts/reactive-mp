/** Node 工具入口，不进入小程序运行时依赖图。 */
export function resolveNativeExport(
  manifest: { name: string; exports: Record<string, unknown> },
  suffix: string,
): string;
export function prepareNativeSources(
  output: string,
  packages?: Map<
    string,
    {
      manifest: { name: string; exports: Record<string, unknown> };
      root: string;
      folder: string;
    }
  >,
): Promise<void>;
