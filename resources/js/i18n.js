import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-xhr-backend";

i18n.use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json"
    },
    debug: true,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    keySeparator: ".",
    lng: "en",
    react: {
      bindI18n: "languageChanged loaded",
      bindI18nStore: "added removed",
      nsMode: "default",
      useSuspense: true
    },
  });

export default i18n;
