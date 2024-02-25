import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { StrictMode, useCallback, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { I18nContext, useTranslation } from "react-i18next";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ThemePicker from "./components/ThemePicker";
import { HomePage, SingersPage, TrampPage } from "./pages";
import "./i18n";

const container = document.getElementById("app");

const HomepageRouter = () => {
  const { t } = useTranslation(["app"]);
  const [theme, setTheme] = useState({});
  const onChangeLanguage = useCallback((code) => (t.changeLanguage(code)), [t]);
  const i18nContextValue = useMemo(() => ({ onChangeLanguage }), [onChangeLanguage]);
  return (
    <StrictMode>
      <div className={`App theme--${theme.name}`}>
        <ThemeProvider applyTo="body" theme={theme}>
          <I18nContext.Provider value={i18nContextValue}>
            <a className="accessibility" href="#main">{t("app:skipToContent")}</a>
            <header className="div--columns flex-justify--end" style={{ paddingRight: "1rem" }}>
              <ThemePicker onChange={setTheme} theme={theme} />
            </header>
            <Router>
              <Routes>
                <Route exact path="/" element={<HomePage />} />
                <Route path="/singers/*" element={<SingersPage />} />
                <Route path="/card/:unique_id" element={<TrampPage />} />
              </Routes>
            </Router>
          </I18nContext.Provider>
        </ThemeProvider>
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