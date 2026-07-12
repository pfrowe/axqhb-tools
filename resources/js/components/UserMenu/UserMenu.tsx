import * as React from "react";
import { Button } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import axios from "../../axios";
import { useAuth } from "../../contexts/AuthContext";

const UserMenu = () => {
  const { setUser, user } = useAuth();
  const { t } = useTranslation("user");
  const onClick_link = React.useCallback((link: string) => () => (window.location.href = `/user/${link}`), []);
  const onClick_logout = React.useCallback(
    () => {
      const logout = () => (axios.post("/logout"));
      const onLogout = (response: Response) => {
        if (response.status === 200) {
          setUser(null);
          window.location.reload();
        }
      };
      logout().then(onLogout);
    },
    [setUser]
  );

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {user ? (
        <>
          <Button appearance="secondary" onClick={onClick_link("profile")}>
            {t("link.profile")}
          </Button>
          <Button appearance="secondary" onClick={onClick_logout}>
            {t("link.logout")}
          </Button>
        </>
      ) : (
        <>
          <Button appearance="secondary" onClick={onClick_link("login")}>
            {t("link.login")}
          </Button>
          <Button appearance="secondary" onClick={onClick_link("register")}>
            {t("link.register")}
          </Button>
        </>
      )}
    </div>
  );
};
UserMenu.displayName = "UserMenu";

export default UserMenu;
