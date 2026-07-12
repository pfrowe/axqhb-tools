import React, { useCallback, useEffect, useMemo } from "react";
import { Switch } from "@fluentui/react-components";
import { themes, TrampCardTheme } from "./ThemePicker.constants";
import { getDefaultThemeName } from "./ThemePicker.helpers";
import { useTranslation } from "react-i18next";
import { WeatherMoon24Regular, WeatherSunny24Regular } from "@fluentui/react-icons";

interface IThemePickerProps {
  onChange?: (theme: TrampCardTheme) => void;
  theme?: TrampCardTheme;
}

const ThemePicker = ({ onChange, theme }: IThemePickerProps) => {
  const { t } = useTranslation("app");
  const getIcon = () => (theme?.name === "dark" ? (<WeatherMoon24Regular />) : (<WeatherSunny24Regular />));
  const handleChange = useCallback((name: string): void => (onChange?.({ ...themes[name], name })), [onChange]);
  const icon = useMemo(getIcon, [t, theme?.name]);
  const onMount = () => (void handleChange(getDefaultThemeName()));
  useEffect(onMount, [onChange]);
  const onChange_toggle = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, data: any): void => (handleChange(data.checked ? "dark" : "light")),
    [handleChange]
  );
  return (
    <Switch label={icon} checked={theme?.name === "dark"} onChange={onChange_toggle} />
  );
};
ThemePicker.displayName = "ThemePicker";

export default ThemePicker;
