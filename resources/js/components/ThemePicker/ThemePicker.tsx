import React, { useCallback, useEffect, useMemo } from "react";
import { Icon, Toggle } from "@fluentui/react";
import { themes, TrampCardTheme } from "./ThemePicker.constants";
import { getDefaultThemeName } from "./ThemePicker.helpers";
import { useTranslation } from "react-i18next";

interface IThemePickerProps {
  onChange?: (theme: TrampCardTheme) => void;
  theme?: TrampCardTheme;
}

const ThemePicker = ({ onChange, theme }: IThemePickerProps) => {
  const { t } = useTranslation("app");
  const getIcon = () => (
    <Icon
      aria-label={t(`homepage.theme.${theme?.name ?? "light"}`)}
      iconName={theme?.name === "dark" ? "ClearNight" : "Sunny"} />
  );
  const handleChange = useCallback((name: string): void => (onChange?.({ ...themes[name], name })), [onChange]);
  const icon = useMemo(getIcon, [t, theme?.name]);
  const onMount = () => (void handleChange(getDefaultThemeName()));
  useEffect(onMount, [onChange]);
  const onChange_toggle = useCallback(
    (_: React.MouseEvent<HTMLElement, MouseEvent>, isDark: boolean): void => (handleChange(isDark ? "dark" : "light")),
    [handleChange]
  );
  return (
    <Toggle inlineLabel={true} label={icon} checked={theme?.name === "dark"} onChange={onChange_toggle} />
  );
};
ThemePicker.displayName = "ThemePicker";

export default ThemePicker;
