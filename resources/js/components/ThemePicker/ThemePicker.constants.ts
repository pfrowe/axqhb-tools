import { PartialTheme } from "@fluentui/react";

export interface TrampCardTheme extends PartialTheme {
  name?: string;
}

const themes: Record<string, TrampCardTheme> = {
  light: {
    name: "light",
    palette: {
      themePrimary: "#7a6e1e",
      themeLighterAlt: "#faf9f2",
      themeLighter: "#eae6ce",
      themeLight: "#d7d1a7",
      themeTertiary: "#4444cc",
      themeSecondary: "#b25f00",
      themeDarkAlt: "#6e631c",
      themeDark: "#5d5417",
      themeDarker: "#453e11",
      neutralLighterAlt: "#f8f8f8",
      neutralLighter: "#f4f4f4",
      neutralLight: "#eaeaea",
      neutralQuaternaryAlt: "#dadada",
      neutralQuaternary: "#d0d0d0",
      neutralTertiaryAlt: "#c8c8c8",
      neutralTertiary: "#060606",
      neutralSecondary: "#080808",
      neutralSecondaryAlt: "#080808",
      neutralPrimaryAlt: "#0a0a0a",
      neutralPrimary: "#111111",
      neutralDark: "#0e0e0e",
      black: "#101010",
      white: "#ffffff",
    },
  },
  dark: {
    name: "dark",
    palette: {
      themePrimary: "#fbec89",
      themeLighterAlt: "#0a0905",
      themeLighter: "#282616",
      themeLight: "#4b4629",
      themeTertiary: "#8888ff",
      themeSecondary: "#ffcc88",
      themeDarkAlt: "#faed95",
      themeDark: "#fbf0a5",
      themeDarker: "#fcf4bd",
      neutralLighterAlt: "#1c1c1c",
      neutralLighter: "#252525",
      neutralLight: "#343434",
      neutralQuaternaryAlt: "#3d3d3d",
      neutralQuaternary: "#454545",
      neutralTertiaryAlt: "#656565",
      neutralTertiary: "#e9e9e9",
      neutralSecondary: "#ececec",
      neutralSecondaryAlt: "#ececec",
      neutralPrimaryAlt: "#f0f0f0",
      neutralPrimary: "#dddddd",
      neutralDark: "#f7f7f7",
      black: "#fbfbfb",
      white: "#111111",
    },
  },
};

export { themes };