import * as React from "react";
import { MessageBar, MessageBarType, PrimaryButton, TextField } from "@fluentui/react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axios";
import { AppContext, AuthContext } from "../../contexts";

const LoginPage = () => {
  const { setTitle } = React.useContext(AppContext);
  const { csrfToken, setUser } = AuthContext.useAuth();
  const [errors, setErrors] = React.useState({});
  const navigate = useNavigate();
  const { t } = useTranslation("user");
  const mergeValues = (oldValues: any, newValues: any) => ({ ...oldValues, ...newValues });
  const [values, setValue] = React.useReducer(mergeValues, {});
  React.useEffect(() => (setTitle(t("title.login")), undefined), [setTitle, t]);
  const onChange_text = React.useCallback(
    (fieldName: string) => (_: any, newValue: any) => (setValue({ [fieldName]: newValue })),
    [setValue]
  );
  const onSubmit = React.useCallback(
    async (event: any) => {
      event.preventDefault();
      event.stopPropagation();
      await csrfToken();
      try {
        const response = await axios.post("/login", values);
        if (response.status === 200) {
          setUser(response.data.user);
          navigate("/");
        }
      } catch (error: any) {
        if (error.response.status === 401) {
          setErrors({ "*": error.response.data.message });
        }
      }
    },
    [csrfToken, setErrors, setUser, values]
  );
  return (
    <form>
      <section className="div--rows gap--1em margin--2em" id="main">
        <h1>{t("title.login")}</h1>
        {(errors as any)["*"]
          ? (<MessageBar isMultiline={false} messageBarType={MessageBarType.error}>{(errors as any)["*"]}</MessageBar>)
          : (<></>)
        }
        <label>
          {t("label.email")}
          <TextField
            errorMessage={(errors as any).email}
            onChange={onChange_text("email")}
            required={true}
            size={64}
            type="email"
          />
        </label>
        <label>
          {t("label.password")}
          <TextField
            canRevealPassword={true}
            errorMessage={(errors as any).password}
            onChange={onChange_text("password")}
            required={true}
            revealPasswordAriaLabel={t("label.reveal_password")}
            type="password"
          />
        </label>
        <div className="div--form-buttons">
          <PrimaryButton onClick={onSubmit} type="submit">{t("submit.login")}</PrimaryButton>
        </div>
        <div className="div--columns flex-justify--space-between width--100pct">
          <Link to="/user/forgot">{t("link.forgot")}</Link>
          <Link to="/user/register">{t("link.register")}</Link>
        </div>
      </section>
    </form>
  );
};
LoginPage.displayName = "LoginPage";

export default LoginPage;
