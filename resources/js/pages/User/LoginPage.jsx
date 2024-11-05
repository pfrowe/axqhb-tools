import * as React from "react";
import { MessageBar, MessageBarType, PrimaryButton, TextField } from "@fluentui/react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../axios";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = () => {
  const { csrfToken, setUser } = useAuth();
  const [errors, setErrors] = React.useState({});
  const navigate = useNavigate();
  const { t } = useTranslation("user");
  const mergeValues = (oldValues, newValues) => ({ ...oldValues, ...newValues });
  const [values, setValue] = React.useReducer(mergeValues, {});
  const onChange_text = React.useCallback(
    (fieldName) => (_, newValue) => (setValue({ [fieldName]: newValue })),
    [setValue]
  );
  const onSubmit = React.useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await csrfToken();
      try {
        const response = await axios.post("/login", values);
        if (response.status === 200) {
          setUser(response.data.user);
          navigate("/");
        }
      } catch (error) {
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
        {errors["*"]
          ? (<MessageBar isMultiline={false} messageBarType={MessageBarType.error}>{errors["*"]}</MessageBar>)
          : (<></>)
        }
        <label>
          {t("label.email")}
          <TextField
            errorMessage={errors.email}
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
            errorMessage={errors.password}
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