import * as React from "react";
import { MessageBar, MessageBarType, PrimaryButton, TextField } from "@fluentui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { useAuth } from "../../contexts/AuthContext";

const ResetPage = () => {
  const { csrfToken, setUser } = useAuth();
  const [errors, setErrors] = React.useState({});
  const navigate = useNavigate();
  const { t } = useTranslation("user");
  const mergeValues = (oldValues, newValues) => ({ ...oldValues, ...newValues });
  const [values, setValue] = React.useReducer(mergeValues, {});
  const getErrors = React.useCallback(
    (fieldName) => {
      const mapLine = (line, index) => (<div key={`${fieldName}-error--${index}`}>{line}</div>);
      return (errors[fieldName] == null)
        ? null
        : (
          (typeof errors[fieldName] === "string")
            ? errors[fieldName]
            : (<div className="div--rows">{errors[fieldName].map(mapLine)}</div>)
        );
    },
    [errors]
  );
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
        const response = await axios.post("/reset", values);
        if (response.status === 200) {
          setUser(response.data.user);
          navigate("/");
        }
      } catch (error) {
        if (error.response.status >= 400) {
          setErrors({ "*": error.response.data.message, ...error.response.data.errors });
        }
      }
    },
    [setErrors, values]
  );
  return (
    <form>
      <section className="div--rows gap--1em margin--2em" id="main">
        <h1>{t("title.reset")}</h1>
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
          {t("label.token")}
          <TextField
            errorMessage={errors.token}
            onChange={onChange_text("token")}
            required={true}
            size={10}
            type="number"
          />
        </label>
        <label>
          {t("label.password")}
          <TextField
            canRevealPassword={true}
            errorMessage={getErrors("password")}
            onChange={onChange_text("password")}
            required={true}
            revealPasswordAriaLabel={t("label.reveal_password")}
            size={64}
            type="password"
          />
        </label>
        <label>
          {t("label.password_confirmation")}
          <TextField
            canRevealPassword={true}
            errorMessage={getErrors("password_confirmation")}
            onChange={onChange_text("password_confirmation")}
            required={true}
            revealPasswordAriaLabel={t("label.reveal_password")}
            size={64}
            type="password"
          />
        </label>
        <div className="div--form-buttons">
          <PrimaryButton onClick={onSubmit} type="submit">{t("submit.reset")}</PrimaryButton>
        </div>
      </section>
    </form>
  );
};
ResetPage.displayName = "ResetPage";

export default ResetPage;