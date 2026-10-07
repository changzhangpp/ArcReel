import { useCallback, useSyncExternalStore } from "react";

/**
 * 订阅一条媒体查询并返回是否命中。
 *
 * 用于必须在 JS 层切换渲染结构（而非纯 CSS 断点）的场景，例如移动端把内联侧栏
 * 改成覆盖式抽屉——内联宽度由 style 写死，CSS 断点覆盖不了，只能按视口条件渲染。
 * 纯样式层面的收缩仍优先用 Tailwind 的 sm:/md:/lg: 前缀。
 *
 * 无 window.matchMedia 的环境（SSR、部分测试环境）恒返回 false，即桌面分支。
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return () => {};
      }
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** 工作台折叠到移动布局的断点（Tailwind md 以下）。 */
export const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";

/** 当前视口是否处于移动布局。 */
export function useIsMobileViewport(): boolean {
  return useMediaQuery(MOBILE_VIEWPORT_QUERY);
}
