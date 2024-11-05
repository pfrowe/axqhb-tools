import * as React from "react";
import { useTranslation } from "react-i18next";
import ThemePicker from "../ThemePicker";
import UserMenu from "../UserMenu";

const PageHeader = ({ setTheme, theme }) => {
  const { t } = useTranslation();
  return (
    <header className="div--columns flex-justify--space-between">
      <a href="/">
        <img
          alt={t("app:goHome")}
          className="margin--0_5em max-height--2em"
          height="24"
          src="/images/axqhb_logo.png"
          title={t("app:goHome")}
        />
      </a>
      <div className="div--columns flex-grow flex-justify--end gap--1em" style={{ marginRight: "0.5em" }}>
        <UserMenu />
        <ThemePicker onChange={setTheme} theme={theme} />
      </div>
    </header>
  );
};
PageHeader.displayName = "PageHeader";

export default PageHeader;