import { createCSSRuleFromTheme, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { StrictMode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { I18nContext, useTranslation } from "react-i18next";
import { BrowserRouter as Router } from "react-router-dom";
import PageHeader from "./components/PageHeader";
import { TrampCardTheme } from "./components/ThemePicker/ThemePicker.constants";
import { AppContext, AuthContext } from "./contexts";
import IndexRouter from "./IndexRouter";
import i18n from "./i18n";

const container = document.getElementById("app");

const HomepageRouter = (): JSX.Element => {
  const { t } = useTranslation("app") as any;
  const [theme, setTheme] = useState<TrampCardTheme>(webLightTheme);
  const onChangeLanguage = useCallback((code: string) => (t.changeLanguage(code)), [t]);
  const i18nContextValue = useMemo(() => ({ i18n, onChangeLanguage }), [onChangeLanguage]);
  const setTitle = useCallback((newTitle: string) => (document.title = `${t("homepage.title")} – ${newTitle}`), [t]);
  useEffect(() => ((document.title = t("homepage.title")) && undefined), [t]);
  useLayoutEffect(() => {
    const themeRule = createCSSRuleFromTheme(`.${theme.name}`, theme);
    const $style = document.createElement("style");
    $style.appendChild(document.createTextNode(themeRule));
    document.body.classList.add(theme.name);
    document.head.appendChild($style);
    return () => {
      document.body.classList.remove(theme.name);
      document.head.removeChild($style);
    };
  }, [theme]);
  return (
    <StrictMode>
      <div className={`App theme--${theme.name}`}>
        <AppContext.Provider value={{ setTitle }}>
          <AuthContext.AuthProvider>
            <FluentProvider theme={theme}>
              <I18nContext.Provider value={i18nContextValue}>
                <a className="accessibility" href="#main">{t("skipToContent")}</a>
                <PageHeader setTheme={setTheme} theme={theme} />
                <Router><IndexRouter /></Router>
              </I18nContext.Provider>
            </FluentProvider>
          </AuthContext.AuthProvider>
        </AppContext.Provider>
      </div>
    </StrictMode>
  );
};
HomepageRouter.displayName = "HomepageRouter";

if (container) {
  const root = createRoot(container);
  root.render(<HomepageRouter />);
}

export default HomepageRouter;
