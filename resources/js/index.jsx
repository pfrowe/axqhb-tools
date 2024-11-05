import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { StrictMode, useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { I18nContext, useTranslation } from "react-i18next";
import { BrowserRouter as Router } from "react-router-dom";
import ThemePicker from "./components/ThemePicker";
import { AuthContext } from "./contexts";
import IndexRouter from "./IndexRouter";
import "./i18n";
import PageHeader from "./components/PageHeader/PageHeader";

const container = document.getElementById("app");

const HomepageRouter = () => {
  const { t } = useTranslation(["app"]);
  const [theme, setTheme] = useState({});
  const onChangeLanguage = useCallback((code) => (t.changeLanguage(code)), [t]);
  const i18nContextValue = useMemo(() => ({ onChangeLanguage }), [onChangeLanguage]);
  return (
    <StrictMode>
      <div className={`App theme--${theme.name}`}>
        <AuthContext.AuthProvider>
          <ThemeProvider applyTo="body" theme={theme}>
            <I18nContext.Provider value={i18nContextValue}>
              <a className="accessibility" href="#main">{t("app:skipToContent")}</a>
              <PageHeader setTheme={setTheme} theme={theme} />
              <Router><IndexRouter /></Router>
            </I18nContext.Provider>
          </ThemeProvider>
        </AuthContext.AuthProvider>
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