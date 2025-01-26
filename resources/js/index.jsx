import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { StrictMode, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { I18nContext, useTranslation } from "react-i18next";
import { BrowserRouter as Router } from "react-router-dom";
import PageHeader from "./components/PageHeader/PageHeader";
import { AppContext, AuthContext } from "./contexts";
import IndexRouter from "./IndexRouter";
import "./i18n";

const container = document.getElementById("app");

const HomepageRouter = () => {
  const { t } = useTranslation("app");
  const [theme, setTheme] = useState({});
  const onChangeLanguage = useCallback((code) => (t.changeLanguage(code)), [t]);
  const i18nContextValue = useMemo(() => ({ onChangeLanguage }), [onChangeLanguage]);
  const setTitle = useCallback((newTitle) => (document.title = `${t("homepage.title")} – ${newTitle}`), [t]);
  useEffect(() => ((document.title = t("homepage.title")) && undefined), [t]);
  return (
    <StrictMode>
      <div className={`App theme--${theme.name}`}>
        <AppContext.Provider value={{ setTitle }}>
          <AuthContext.AuthProvider>
            <ThemeProvider applyTo="body" theme={theme}>
              <I18nContext.Provider value={i18nContextValue}>
                <a className="accessibility" href="#main">{t("skipToContent")}</a>
                <PageHeader setTheme={setTheme} theme={theme} />
                <Router><IndexRouter /></Router>
              </I18nContext.Provider>
            </ThemeProvider>
          </AuthContext.AuthProvider>
        </AppContext.Provider>
      </div>
    </StrictMode>
  );
};
HomepageRouter.displayName = "HomepageRouter";

if (container) {
  initializeIcons();
  const root = createRoot(container);
  root.render(<HomepageRouter />);
}

export default HomepageRouter;