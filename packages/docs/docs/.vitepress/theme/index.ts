import DefaultTheme from "vitepress/theme";
import CopyPageButton from "./components/CopyPageButton.vue";
import { h } from "vue";
import type { Theme } from "vitepress";

export default {
  extends: DefaultTheme,
  Layout() {
    // @ts-ignore
    return h(DefaultTheme.Layout, null, {
      "doc-top": () => h(CopyPageButton),
    });
  },
} satisfies Theme;
