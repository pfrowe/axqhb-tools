import * as React from "react";
import { DefaultButton } from "@fluentui/react";
import { useTranslation } from "react-i18next";
import axios from "../../axios";
import { useAuth } from "../../contexts/AuthContext";

const UserMenu = () => {
  const { setUser, user } = useAuth();
  const { t } = useTranslation("user");
  const onClick_link = React.useCallback((link) => () => (window.location.href = `/user/${link}`), []);
  const onClick_logout = React.useCallback(
    async () => {
      const response = await axios.post("/logout");
      if (response.status === 200) {
        setUser(null);
        window.location.reload();
      }
    },
    [setUser]
  );
  const menuItems = React.useMemo(
    () => (
      user
        ? [
          { key: "logout", onClick: onClick_logout, text: t("link.logout") },
          { key: "profile", onClick: onClick_link("profile"), text: t("link.profile") }
        ] : [
          { key: "login", onClick: onClick_link("login"), text: t("link.login") },
          { key: "register", onClick: onClick_link("register"), text: t("link.register") },
          { key: "forgot", onClick: onClick_link("forgot"), text: t("link.forgot") },
          { key: "reset", onClick: onClick_link("reset"), text: t("link.reset") }
        ]
    ),
    [onClick_link, onClick_logout]
  );
  return (
    <DefaultButton iconProps={{ iconName: "Contact" }} menuProps={{ items: menuItems }}>
      {t("label.menu")}
    </DefaultButton>
  );
};
UserMenu.displayName = "UserMenu";

export default UserMenu;